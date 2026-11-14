export const config = {
  runtime: 'edge',
};

// Gather all available Gemini API keys for seamless automatic failover
function getApiKeys() {
  const candidateKeys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_KEY2,
    process.env.GEMINI_API_KEY_2,
    process.env.VITE_GEMINI_API_KEY,
    process.env.VITE_GEMINI_KEY2
  ];
  return [...new Set(candidateKeys.filter(Boolean))];
}

async function fetchWithKeyFailover(buildUrl, buildOptions) {
  const keys = getApiKeys();
  if (keys.length === 0) {
    throw new Error('No GEMINI_API_KEY configured');
  }

  let lastResponse = null;
  let lastError = null;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    try {
      const url = buildUrl(key);
      const res = await fetch(url, buildOptions());
      if (res.ok) {
        return res;
      }

      // If rate limited (429) or forbidden (403) or 5xx server error, failover to next key immediately
      if (res.status === 429 || res.status === 403 || res.status >= 500) {
        console.warn(`[Concierge] Gemini API key index ${i} returned status ${res.status}. Attempting next available key...`);
        lastResponse = res;
        continue;
      }

      // Other 4xx client errors (e.g. 400 Bad Request) - return directly
      return res;
    } catch (err) {
      lastError = err;
      console.warn(`[Concierge] Gemini network error on key index ${i}:`, err.message);
    }
  }

  if (lastResponse) return lastResponse;
  throw lastError || new Error('All Gemini API keys failed');
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const body = await req.json();

    // 1. Semantic Vector Embedding Endpoint (Gemini gemini-embedding-001)
    if (body.type === 'embed') {
      const texts = Array.isArray(body.texts) ? body.texts : [body.text || ''];
      const requests = texts.map(t => ({
        model: 'models/gemini-embedding-001',
        content: { parts: [{ text: String(t).slice(0, 1500) }] }
      }));

      const res = await fetchWithKeyFailover(
        (key) => `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:batchEmbedContents?key=${key}`,
        () => ({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ requests })
        })
      );

      const data = await res.json();
      return new Response(JSON.stringify(data), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. Chat / Reasoning Generation Endpoint (Gemini Flash with multi-model failover)
    const { systemInstruction } = body;
    const candidateModels = ['gemini-3.5-flash-lite', 'gemini-flash-latest'];
    let lastRes = null;
    let lastErr = null;

    for (const model of candidateModels) {
      try {
        const res = await fetchWithKeyFailover(
          (key) => `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
          () => ({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: systemInstruction }] }],
              generationConfig: { responseMimeType: 'application/json' }
            })
          })
        );

        if (res.ok) {
          const data = await res.json();
          return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        lastRes = res;
      } catch (err) {
        lastErr = err;
      }
    }

    if (lastRes) {
      const data = await lastRes.json().catch(() => ({}));
      return new Response(JSON.stringify(data), {
        status: lastRes.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    throw lastErr || new Error('All candidate models failed');
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
