export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1];
    const userPrompt = lastMessage?.content || '';

    // Check if an AI provider key is configured
    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (geminiKey) {
      // Use Vercel AI SDK with Google Gemini
      const { createGoogleGenerativeAI } = await import('@ai-sdk/google');
      const { streamText } = await import('ai');

      const google = createGoogleGenerativeAI({ apiKey: geminiKey });
      const result = await streamText({
        model: google('gemini-1.5-flash'),
        system: `You are the FragScanner AI Sommelier. You assist users in finding fragrance clones, scent twins, and analyzing prices across Indian community sellers (Second Theory, FragFever). Give concise, authoritative advice focusing on olfactory accords, notes, performance, and best deals.`,
        messages,
      });

      return result.toDataStreamResponse();
    }

    if (openaiKey) {
      const { createOpenAI } = await import('@ai-sdk/openai');
      const { streamText } = await import('ai');

      const openai = createOpenAI({ apiKey: openaiKey });
      const result = await streamText({
        model: openai('gpt-4o-mini'),
        system: `You are the FragScanner AI Sommelier. You assist users in finding fragrance clones, scent twins, and analyzing prices across Indian community sellers (Second Theory, FragFever). Give concise, authoritative advice focusing on olfactory accords, notes, performance, and best deals.`,
        messages,
      });

      return result.toDataStreamResponse();
    }

    // Default: Respond with a 204 or fallback flag indicating local sommelier engine should take over
    return new Response(JSON.stringify({ 
      fallback: true, 
      message: 'No server-side LLM key detected. Switching to local FragScanner Sommelier engine.' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message, fallback: true }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
