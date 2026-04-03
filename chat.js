// Vercel Serverless Function — Groq API Proxy (FREE)
// Groq gives 14,400 free requests/day — more than enough!

export default async function handler(req, res) {

  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Check API key
  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({
      error: "GROQ_API_KEY not set. Go to Vercel Dashboard → Your Project → Settings → Environment Variables → Add GROQ_API_KEY"
    });
  }

  try {
    const { messages, system, max_tokens } = req.body;

    // Build Groq messages array (Groq uses OpenAI-compatible format)
    const groqMessages = [];

    // Add system message if provided
    if (system) {
      groqMessages.push({ role: "system", content: system });
    }

    // Add conversation messages
    if (messages && Array.isArray(messages)) {
      groqMessages.push(...messages);
    }

    // Call Groq API (free, fast, OpenAI-compatible)
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", // Best free model on Groq
        max_tokens: max_tokens || 2000,
        messages: groqMessages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: `Groq API error: ${response.status}`,
        details: errorText
      });
    }

    const data = await response.json();

    // Return in Anthropic-compatible format so the frontend works unchanged
    const text = data.choices?.[0]?.message?.content || "No response";
    return res.status(200).json({
      content: [{ type: "text", text }]
    });

  } catch (error) {
    return res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
}
