export async function POST(request) {
  try {
    const { messages, system } = await request.json();

    // Build Gemini contents array from message history
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: system }],
          },
          contents,
          generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.7,
          },
        }),
      }
    );

    const data = await response.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I could not generate a response. Please try again.";

    return Response.json({ text });
  } catch (error) {
    return Response.json({ error: "Failed to connect to AI" }, { status: 500 });
  }
}
