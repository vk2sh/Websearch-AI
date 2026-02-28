import { useState, useRef, useEffect } from "react";
import Head from "next/head";

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "14px 18px" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: "50%",
          background: "#F55036",
          animation: "bounce 1.2s infinite",
          animationDelay: `${i * 0.2}s`,
        }} />
      ))}
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: 16,
      animation: "slideIn 0.3s ease",
    }}>
      {!isUser && (
        <div style={{
          width: 34, height: 34, borderRadius: "50%",
          background: "linear-gradient(135deg, #F55036, #FF8C00)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, fontWeight: 700, color: "#fff",
          marginRight: 10, flexShrink: 0, marginTop: 4,
        }}>AI</div>
      )}
      <div style={{
        maxWidth: "75%",
        background: isUser ? "linear-gradient(135deg, #F55036, #c0392b)" : "#141420",
        border: isUser ? "none" : "1px solid #1E1E30",
        borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        padding: "12px 16px",
        fontSize: 14,
        lineHeight: 1.7,
        color: isUser ? "#fff" : "#C8C8D8",
        boxShadow: isUser ? "0 4px 20px #F5503630" : "none",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}>
        {msg.content}
        {msg.isSearch && (
          <div style={{
            marginTop: 8, paddingTop: 8,
            borderTop: "1px solid #2A2A3A",
            fontSize: 11, color: "#555",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            🔍 <span>Searched the web</span>
          </div>
        )}
      </div>
    </div>
  );
}

const SUGGESTIONS = [
  "What's the latest AI news today?",
  "Current Bitcoin price?",
  "Best programming language in 2025?",
  "Who won the last Cricket World Cup?",
];

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm your AI assistant powered by Groq + Llama 3 with live web search — 100% free! Ask me anything. 🔍",
      isSearch: false,
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setError("");
    const userMsg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages
            .filter(m => m.role === "user" || m.role === "assistant")
            .map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: data.text || "I couldn't find a good answer.",
          isSearch: data.usedSearch,
        }]);
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }

    setLoading(false);
    inputRef.current?.focus();
  }

  return (
    <>
      <Head>
        <title>WebSearch AI — Groq + Llama 3</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </Head>

      <div style={{
        minHeight: "100vh",
        background: "#080810",
        fontFamily: "'JetBrains Mono', monospace",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "24px 16px",
      }}>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          @keyframes bounce { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }
          @keyframes slideIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
          @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
          textarea { resize: none; }
          textarea:focus { outline: none; }
          ::-webkit-scrollbar { width: 4px; }
          ::-webkit-scrollbar-thumb { background: #2A2A3A; border-radius: 2px; }
        `}</style>

        {/* Header */}
        <div style={{ width: "100%", maxWidth: 700, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: "linear-gradient(135deg, #F5503622, #FF8C0022)",
              border: "1px solid #F5503640",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 700, color: "#F55036",
            }}>AI</div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: "#E8E8F0", letterSpacing: "-0.02em" }}>
                WebSearch AI
              </h1>
              <div style={{ fontSize: 11, color: "#F55036", letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#F55036", animation: "pulse 2s infinite" }} />
                GROQ · LLAMA 3 · FREE · LIVE WEB SEARCH
              </div>
            </div>
          </div>
        </div>

        {/* Chat Window */}
        <div style={{
          width: "100%", maxWidth: 700,
          background: "#0C0C18",
          border: "1px solid #1A1A28",
          borderRadius: 20,
          display: "flex",
          flexDirection: "column",
          height: "65vh",
          overflow: "hidden",
          boxShadow: "0 0 60px #F5503610",
        }}>
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 8px" }}>
            {messages.map((msg, i) => <Message key={i} msg={msg} />)}
            {loading && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: "linear-gradient(135deg, #F55036, #FF8C00)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 700, color: "#fff", flexShrink: 0,
                }}>AI</div>
                <div style={{ background: "#141420", border: "1px solid #1E1E30", borderRadius: "18px 18px 18px 4px" }}>
                  <TypingDots />
                </div>
                <span style={{ fontSize: 11, color: "#444", animation: "pulse 1.5s infinite" }}>searching the web...</span>
              </div>
            )}
            {error && (
              <div style={{
                padding: "10px 14px", background: "#FF444420", border: "1px solid #FF444440",
                borderRadius: 10, fontSize: 13, color: "#FF8888", marginBottom: 12,
              }}>⚠️ {error}</div>
            )}
            <div ref={bottomRef} />
          </div>

          {messages.length === 1 && (
            <div style={{ padding: "0 16px 12px", display: "flex", gap: 8, flexWrap: "wrap" }}>
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => setInput(s)} style={{
                  background: "#141420", border: "1px solid #1E1E30",
                  borderRadius: 20, padding: "6px 12px",
                  fontSize: 12, color: "#777", cursor: "pointer",
                  fontFamily: "'JetBrains Mono', monospace",
                  transition: "all 0.2s",
                }}
                  onMouseEnter={e => { e.target.style.borderColor = "#F5503650"; e.target.style.color = "#AAA"; }}
                  onMouseLeave={e => { e.target.style.borderColor = "#1E1E30"; e.target.style.color = "#777"; }}
                >{s}</button>
              ))}
            </div>
          )}

          <div style={{
            padding: "12px 16px",
            borderTop: "1px solid #1A1A28",
            display: "flex", gap: 10, alignItems: "flex-end",
            background: "#0A0A16",
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Ask anything... (Enter to send)"
              rows={1}
              style={{
                flex: 1, background: "#141420",
                border: "1px solid #1E1E30",
                borderRadius: 12, padding: "11px 14px",
                color: "#E0E0F0", fontSize: 14,
                fontFamily: "'JetBrains Mono', monospace",
                lineHeight: 1.5,
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "#F5503640"}
              onBlur={e => e.target.style.borderColor = "#1E1E30"}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              style={{
                width: 44, height: 44, borderRadius: 12,
                background: input.trim() && !loading
                  ? "linear-gradient(135deg, #F55036, #FF8C00)"
                  : "#1A1A28",
                border: "none",
                color: input.trim() && !loading ? "#fff" : "#444",
                fontSize: 18, cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                transition: "all 0.2s",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >↑</button>
          </div>
        </div>

        <div style={{ marginTop: 16, fontSize: 11, color: "#333", textAlign: "center" }}>
          Powered by Groq + Llama 3.3 70B + Tavily Search · 100% Free
        </div>
      </div>
    </>
  );
}
