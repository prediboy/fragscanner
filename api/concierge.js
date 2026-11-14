export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const key = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!key) {
    return new Response(JSON.stringify({ error: 'No GEMINI_API_KEY configured' }), { status: 500 });
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

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:batchEmbedContents?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requests })
      });

      const data = await res.json();
      return new Response(JSON.stringify(data), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. Chat / Reasoning Generation Endpoint (Gemini Flash)
    const { systemInstruction } = body;
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemInstruction }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
