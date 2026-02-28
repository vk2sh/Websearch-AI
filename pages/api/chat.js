import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Simple web search using Tavily (free tier: 1000 searches/month)
async function searchWeb(query) {
  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query,
        max_results: 5,
        search_depth: "basic",
      }),
    });
    const data = await res.json();
    return data.results?.map(r => `${r.title}\n${r.url}\n${r.content}`).join("\n\n") || "No results found.";
  } catch (e) {
    return "Web search failed.";
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { messages } = req.body;
  const lastUserMessage = messages.filter(m => m.role === "user").pop()?.content || "";

  try {
    // Step 1: Search the web for the user's question
    const searchResults = await searchWeb(lastUserMessage);

    // Step 2: Ask Groq to answer using search results
    const systemPrompt = `You are a helpful AI assistant with web search capability.
Use the following real-time web search results to answer the user's question accurately.
Always mention sources (URLs) when relevant.

WEB SEARCH RESULTS:
${searchResults}

Answer based on the search results above. Be concise and helpful.`;

    const history = messages.map(m => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...history,
      ],
      max_tokens: 1024,
    });

    const text = completion.choices[0]?.message?.content || "I couldn't find an answer.";

    res.status(200).json({ text, usedSearch: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Server error" });
  }
}
