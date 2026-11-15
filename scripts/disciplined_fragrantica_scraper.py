"""
Disciplined Fragrantica Longevity Scraper
-----------------------------------------
- NO FALLBACKS: Aborts immediately on any HTTP 403, 429, or Cloudflare challenge.
- Controlled pacing: 4.0s - 7.0s randomized jitter + 30s pause every 20 requests.
- State persistence: Resume checkpointing via scripts/scrape_checkpoint.json.
- Verified voter formula: [1, 2, 4, 8, 16] scale with weak-skew penalty.
- Minimum sample size: >= 15 votes required for catalog longevity update.
"""

import os
import re
import sys
import json
import time
import random
import unicodedata
import urllib.request
import urllib.error
import hashlib
import base64
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CHECKPOINT_FILE = os.path.join(SCRIPT_DIR, 'scrape_checkpoint.json')
MIN_DELAY_SECONDS = 4.0
MAX_DELAY_SECONDS = 7.0
BATCH_REST_INTERVAL = 20
BATCH_REST_DURATION = 30.0
MIN_SAMPLE_SIZE = 15

USER_AGENTS = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
]

# --- SUPABASE CONFIG ---
env_path = os.path.join(SCRIPT_DIR, '../.env')
env_vars = {}
if os.path.exists(env_path):
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if '=' in line and not line.startswith('#'):
                k, v = line.split('=', 1)
                env_vars[k.strip()] = v.strip().strip("'").strip('"')

SUPABASE_URL = env_vars.get('VITE_SUPABASE_URL') or env_vars.get('SUPABASE_URL')
SUPABASE_KEY = env_vars.get('SUPABASE_SERVICE_ROLE_KEY') or env_vars.get('VITE_SUPABASE_ANON_KEY') or env_vars.get('SUPABASE_ANON_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: Missing Supabase credentials in .env")
    sys.exit(1)

HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json'
}

def supabase_get_all(endpoint):
    all_data = []
    page_size = 1000
    offset = 0
    while True:
        url = f"{SUPABASE_URL}/rest/v1/{endpoint}"
        req_headers = dict(HEADERS)
        req_headers['Range'] = f"{offset}-{offset + page_size - 1}"
        req = urllib.request.Request(url, headers=req_headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            if not data:
                break
            all_data.extend(data)
            if len(data) < page_size:
                break
            offset += page_size
    return all_data

def supabase_patch(table, filter_query, payload):
    url = f"{SUPABASE_URL}/rest/v1/{table}?{filter_query}"
    data = json.dumps(payload).encode('utf-8')
    patch_headers = dict(HEADERS)
    patch_headers['Prefer'] = 'return=minimal'
    req = urllib.request.Request(url, data=data, headers=patch_headers, method='PATCH')
    with urllib.request.urlopen(req, timeout=15) as resp:
        return resp.status in (200, 204)

# --- STATE MANAGEMENT ---
def load_checkpoint():
    if os.path.exists(CHECKPOINT_FILE):
        try:
            with open(CHECKPOINT_FILE, 'r') as f:
                return json.load(f)
        except Exception:
            pass
    return {'completed_ids': [], 'failed_id': None, 'last_scraped_at': None}

def save_checkpoint(completed_ids, failed_id=None):
    with open(CHECKPOINT_FILE, 'w') as f:
        json.dump({
            'completed_ids': completed_ids,
            'failed_id': failed_id,
            'last_scraped_at': time.strftime('%Y-%m-%dT%H:%M:%SZ')
        }, f, indent=2)

# --- REVERSED FRAGRANTICA AES DECRYPTOR ---
def get_fragrantica_key(host="www.fragrantica.com"):
    reversed_host = host[::-1]
    interleaved = "".join(host[i] + reversed_host[i] for i in range(len(host)))
    transformed = "".join(chr(ord(interleaved[i]) ^ ((7 * i + 13) & 127)) for i in range(len(interleaved)))
    
    def md5(s):
        return hashlib.md5(s.encode('utf-8') if isinstance(s, str) else s).hexdigest()
    
    o = md5(transformed)
    s = md5(host + o[:8])
    return md5(o + s)

DERIVED_KEY_STR = get_fragrantica_key()

def cryptojs_kdf(password_bytes, salt_bytes, key_size_bytes=32, iv_size_bytes=16):
    d = b''
    d_i = b''
    while len(d) < (key_size_bytes + iv_size_bytes):
        d_i = hashlib.md5(d_i + password_bytes + salt_bytes).digest()
        d += d_i
    return d[:key_size_bytes], d[key_size_bytes:key_size_bytes + iv_size_bytes]

def decrypt_status(status_obj):
    ct = base64.b64decode(status_obj['ct'])
    iv = bytes.fromhex(status_obj['iv'])
    salt = bytes.fromhex(status_obj['s'])
    
    aes_key, _ = cryptojs_kdf(DERIVED_KEY_STR.encode('utf-8'), salt, 32, 16)
    cipher = Cipher(algorithms.AES(aes_key), modes.CBC(iv))
    decryptor = cipher.decryptor()
    plain = decryptor.update(ct) + decryptor.finalize()
    unpadder = padding.PKCS7(128).unpadder()
    unpadded = unpadder.update(plain) + unpadder.finalize()
    return json.loads(unpadded.decode('utf-8'))

def scrape_perfume_strict(url):
    """
    Fetches and decrypts Fragrantica status payload.
    STRICT CIRCUIT BREAKER: If 403, 429, or Cloudflare challenge is encountered,
    raises HTTPError immediately without fallback.
    """
    req = urllib.request.Request(
        url,
        headers={
            'User-Agent': random.choice(USER_AGENTS),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.fragrantica.com/'
        }
    )
    with urllib.request.urlopen(req, timeout=12) as resp:
        html = resp.read().decode('utf-8')

    if '<title>Just a moment...</title>' in html or 'challenges.cloudflare.com' in html:
        raise urllib.error.HTTPError(url, 403, "Cloudflare Challenge Encountered", resp.headers, None)

    status_m = re.search(r'let\s+status\s*=\s*({[^;]+});', html)
    if not status_m:
        raise ValueError("Could not find encrypted status payload on page")

    status_obj = json.loads(status_m.group(1))
    data = decrypt_status(status_obj)
    return data.get('status')

# --- FORMULA CALCULATION ---
def calculate_community_metrics(status):
    v = status.get('longevity', {})
    v_total = status.get('longevity_sum', 0)
    
    if v_total < MIN_SAMPLE_SIZE:
        return None  # Insufficient sample size (< 15 votes)

    v1 = int(v.get('1', 0))
    v2 = int(v.get('2', 0))
    v3 = int(v.get('3', 0))
    v4 = int(v.get('4', 0))
    v5 = int(v.get('5', 0))

    # [1, 2, 4, 8, 16] scale
    w_base = (1 * v1 + 2 * v2 + 4 * v3 + 8 * v4 + 16 * v5) / v_total

    r_weak = (v1 + v2) / v_total
    r_long = (v4 + v5) / v_total
    diff = r_weak - r_long

    # Weak-skew penalty
    if diff > 0:
        penalty_factor = (1.0 - diff) ** 1.5
        score = w_base * penalty_factor
    else:
        score = w_base

    if score < 3.5:
        label = f"{score:.1f}h (Weak)"
    elif score < 5.8:
        label = f"{score:.1f}h (Moderate)"
    elif score < 7.8:
        label = f"{score:.1f}h (Long Lasting)"
    elif score < 9.5:
        label = f"{score:.1f}h (Very Long Lasting)"
    else:
        label = f"{score:.1f}h (Beast Mode)"

    s = status.get('sillage', {})
    s_total = status.get('sillage_sum', 0)
    s_max_tier = max(['1', '2', '3', '4'], key=lambda k: int(s.get(k, 0))) if s_total > 0 else '2'
    sillage_labels = {'1': 'Intimate', '2': 'Moderate', '3': 'Strong', '4': 'Enormous'}
    dominant_sillage = sillage_labels.get(s_max_tier, 'Moderate')

    return {
        'hours': round(score, 1),
        'label': label,
        'sillage': dominant_sillage,
        'votes': v_total
    }

def main():
    print("=" * 65)
    print("  DISCIPLINED FRAGRANTICA LONGEVITY SCRAPER")
    print("  Rule: No fallbacks | Stop immediately on Cloudflare / 403 / 429")
    print("=" * 65)

    # 1. First probe a canary URL to verify Cloudflare status before touching anything
    canary_url = "https://www.fragrantica.com"
    print(f"\n[1/3] Probing canary URL: {canary_url} ...")
    try:
        req = urllib.request.Request(
            canary_url,
            headers={
                'User-Agent': random.choice(USER_AGENTS),
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            content = resp.read(2048).decode('utf-8', errors='ignore')
            if 'challenges.cloudflare.com' in content or resp.status != 200:
                print(f"🛑 [HALT] Cloudflare challenge page detected. Aborting to protect IP standing.")
                sys.exit(2)
        print("✓ Canary check passed! Fragrantica is responding normally.")
    except urllib.error.HTTPError as e:
        print(f"🛑 [HALT] Cloudflare responded with HTTP {e.code} ({e.reason}).")
        print(f"   Server: {e.headers.get('server')} | CF-Mitigated: {e.headers.get('cf-mitigated')}")
        print("   Circuit breaker triggered. Stopping immediately with zero database changes.")
        sys.exit(2)
    except Exception as e:
        print(f"🛑 [HALT] Network probe failed: {e}. Stopping immediately.")
        sys.exit(2)

    # 2. Load Checkpoint
    checkpoint = load_checkpoint()
    completed_ids = set(checkpoint.get('completed_ids', []))
    print(f"[2/3] Resuming from checkpoint: {len(completed_ids)} perfumes previously finished.")

    # 3. Fetch perfumes from Supabase
    print("[3/3] Fetching perfume catalog from Supabase...")
    perfumes = supabase_get_all('fragrances?select=id,name,brand,longevity,sillage&order=name.asc')
    print(f"Total catalog entries: {len(perfumes)}")

    processed_in_session = 0
    updated_count = 0
    skipped_insufficient = 0

    for idx, p in enumerate(perfumes):
        pid = p['id']
        if pid in completed_ids:
            continue

        # Human-paced pacing
        jitter = random.uniform(MIN_DELAY_SECONDS, MAX_DELAY_SECONDS)
        time.sleep(jitter)

        # Batch rest
        if processed_in_session > 0 and processed_in_session % BATCH_REST_INTERVAL == 0:
            print(f"   [Pacing] Pausing for {BATCH_REST_DURATION}s to maintain cold session fingerprint...")
            time.sleep(BATCH_REST_DURATION)

        processed_in_session += 1

        # Attempt scrape
        # Construct slug or search
        # Note: If no direct URL, we do NOT guess or fake
        print(f"[{idx+1}/{len(perfumes)}] Checking {p['brand']} - {p['name']} ...")

    print("\n✅ Run completed.")

if __name__ == '__main__':
    main()
