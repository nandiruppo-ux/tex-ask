"use client";

import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are TextileGPT — a world-class expert chatbot specializing in the textile industry. You have deep knowledge across all the following domains:

1. **Fabrics & Materials**: Natural fibers (cotton, wool, silk, linen, jute, hemp), synthetic fibers (polyester, nylon, acrylic, spandex, rayon/viscose), technical and performance fabrics, fabric weights, thread counts, GSM (grams per square meter), fabric construction types (woven, knit, non-woven), and fabric properties (breathability, moisture-wicking, durability, elasticity).

2. **Yarn**: Yarn count systems (Ne, Nm, Tex, Denier), yarn types (spun, filament, textured, core-spun, fancy/novelty), twist direction (S-twist, Z-twist), ply and folded yarns, yarn strength and elongation, slub yarn, chenille, bouclé, and other specialty yarns. Raw material sourcing and quality grading.

3. **Weaving & Manufacturing**: Loom types (shuttle, shuttleless — rapier, air-jet, water-jet, projectile), weave structures (plain, twill, satin, dobby, jacquard, pile, leno), knitting (weft knitting, warp knitting, circular knitting, flat knitting), fabric defects and quality control, production efficiency, machine settings, and technical troubleshooting.

4. **Dyeing & Finishing**: Dye classes (reactive, disperse, acid, vat, direct, pigment), dyeing methods (exhaust dyeing, pad-batch, continuous dyeing), color fastness standards (wash, light, rubbing), finishing processes (mercerization, sanforizing, calendering, softening, anti-wrinkle, flame retardant, water repellent, antimicrobial), and sustainable dyeing practices.

5. **Textile Business & Trade**: Industry standards and certifications (OEKO-TEX, GOTS, BCI, Bluesign, ISO), Incoterms for global trade, HS codes for textile imports/exports, sourcing hubs (China, Bangladesh, India, Turkey, Vietnam, Indonesia), costing and pricing structures, MOQ (minimum order quantities), lead times, quality inspection protocols (AQL), sustainability regulations (REACH, ZDHC), and textile trade shows.

Respond in a clear, professional, and helpful tone. When relevant, use industry-specific terminology. Provide structured answers for complex questions. If a question is outside textile expertise, politely redirect to your specialization. Always be accurate and practical.`;

const SUGGESTED_QUESTIONS = [
  "What is the difference between GSM 180 and GSM 300 fabric?",
  "How does reactive dyeing work on cotton?",
  "Explain Ne count vs Denier for yarn",
  "What is the AQL inspection standard in textile?",
  "How to improve color fastness after dyeing?",
  "What certifications are needed for organic cotton export?",
];

const TOPIC_TAGS = ["Fabrics", "Yarn", "Weaving", "Dyeing", "Trade"];

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "10px 0" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#b5803a",
            display: "inline-block",
            animation: `bounce 1.2s infinite`,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function TextileChatbot() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Welcome! I'm **TextileGPT** — your expert on fabrics, yarn, weaving, dyeing & finishing, and textile trade.\n\nAsk me anything about the textile industry. Try a suggested question below or type your own.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTag, setActiveTag] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput("");

    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const apiMessages = newMessages
        .filter((m) => m.role !== "system")
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: SYSTEM_PROMPT,
          messages: apiMessages,
        }),
      });

      const data = await response.json();
      const reply =
        data?.text ||
        "Sorry, I couldn't generate a response. Please try again.";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ Something went wrong connecting to the AI. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderMessage = (content) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br/>");
  };

  const filteredSuggestions = activeTag
    ? SUGGESTED_QUESTIONS.filter((q) => {
        const map = {
          Fabrics: ["GSM", "fabric", "cotton", "wool"],
          Yarn: ["yarn", "count", "Denier", "Ne"],
          Weaving: ["loom", "weave", "knit", "warp"],
          Dyeing: ["dye", "color", "fastness", "dyeing"],
          Trade: ["AQL", "certif", "organic", "export", "inspection"],
        };
        return map[activeTag]?.some((kw) =>
          q.toLowerCase().includes(kw.toLowerCase())
        );
      })
    : SUGGESTED_QUESTIONS;

  return (
    <div
      style={{
        fontFamily: "'Georgia', serif",
        minHeight: "100vh",
        background: "#f5f0e8",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; }
        body { margin: 0; }
        .msg-in { animation: fadeUp 0.3s ease; }
        .send-btn:hover { background: #8a5e20 !important; }
        .suggest-btn:hover { background: #e8d9c0 !important; border-color: #b5803a !important; color: #5c3a10 !important; }
        .tag-btn:hover { background: #b5803a !important; color: white !important; }
        textarea:focus { outline: none; }
        textarea { font-family: 'Georgia', serif; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f0e8d8; }
        ::-webkit-scrollbar-thumb { background: #c8a96e; border-radius: 3px; }
      `}</style>

      {/* Header */}
      <div
        style={{
          width: "100%",
          background: "linear-gradient(135deg, #3b2007 0%, #6b3f12 60%, #9a6025 100%)",
          padding: "28px 24px 22px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          boxShadow: "0 4px 20px rgba(60,20,0,0.25)",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            border: "2px solid rgba(255,200,100,0.4)",
            flexShrink: 0,
          }}
        >
          🧵
        </div>
        <div>
          <div
            style={{
              color: "#ffe0a0",
              fontFamily: "'Georgia', serif",
              fontSize: 22,
              fontWeight: "bold",
              letterSpacing: 1,
            }}
          >
            TextileGPT
          </div>
          <div
            style={{
              color: "rgba(255,220,150,0.75)",
              fontSize: 12,
              letterSpacing: 2,
              textTransform: "uppercase",
              marginTop: 2,
            }}
          >
            Expert Textile Knowledge Assistant
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {TOPIC_TAGS.map((tag) => (
            <button
              key={tag}
              className="tag-btn"
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              style={{
                padding: "4px 12px",
                borderRadius: 20,
                border: "1px solid rgba(255,200,100,0.4)",
                background: activeTag === tag ? "#b5803a" : "rgba(255,255,255,0.1)",
                color: activeTag === tag ? "white" : "rgba(255,220,150,0.85)",
                fontSize: 11,
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily: "Georgia, serif",
                letterSpacing: 0.5,
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Main container */}
      <div
        style={{
          width: "100%",
          maxWidth: 780,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "0 16px 40px",
        }}
      >
        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px 0 16px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            minHeight: 320,
            maxHeight: "60vh",
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className="msg-in"
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                alignItems: "flex-end",
                gap: 10,
              }}
            >
              {msg.role === "assistant" && (
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #6b3f12, #b5803a)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    flexShrink: 0,
                    boxShadow: "0 2px 8px rgba(100,50,0,0.2)",
                  }}
                >
                  🧵
                </div>
              )}
              <div
                style={{
                  maxWidth: "75%",
                  padding: "12px 16px",
                  borderRadius:
                    msg.role === "user"
                      ? "18px 18px 4px 18px"
                      : "4px 18px 18px 18px",
                  background:
                    msg.role === "user"
                      ? "linear-gradient(135deg, #7a4a18, #a8631f)"
                      : "white",
                  color: msg.role === "user" ? "white" : "#2d1a06",
                  fontSize: 14.5,
                  lineHeight: 1.65,
                  boxShadow:
                    msg.role === "user"
                      ? "0 3px 12px rgba(100,50,0,0.25)"
                      : "0 2px 12px rgba(0,0,0,0.08)",
                  border: msg.role === "assistant" ? "1px solid #e8d9c0" : "none",
                }}
                dangerouslySetInnerHTML={{ __html: renderMessage(msg.content) }}
              />
              {msg.role === "user" && (
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #c9963e, #e8b860)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 15,
                    flexShrink: 0,
                    boxShadow: "0 2px 8px rgba(100,50,0,0.2)",
                  }}
                >
                  👤
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #6b3f12, #b5803a)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                }}
              >
                🧵
              </div>
              <div
                style={{
                  background: "white",
                  borderRadius: "4px 18px 18px 18px",
                  padding: "8px 16px",
                  border: "1px solid #e8d9c0",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                }}
              >
                <TypingDots />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested questions */}
        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              fontSize: 11,
              color: "#9a7040",
              textTransform: "uppercase",
              letterSpacing: 1.5,
              marginBottom: 8,
            }}
          >
            {activeTag ? `${activeTag} questions` : "Suggested questions"}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {filteredSuggestions.slice(0, 4).map((q, i) => (
              <button
                key={i}
                className="suggest-btn"
                onClick={() => sendMessage(q)}
                disabled={loading}
                style={{
                  padding: "7px 13px",
                  borderRadius: 20,
                  border: "1px solid #d4b07a",
                  background: "#fdf6ea",
                  color: "#7a4a18",
                  fontSize: 12,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontFamily: "Georgia, serif",
                  lineHeight: 1.4,
                  opacity: loading ? 0.5 : 1,
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input area */}
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-end",
            background: "white",
            borderRadius: 16,
            padding: "10px 10px 10px 16px",
            border: "1.5px solid #d4b07a",
            boxShadow: "0 4px 20px rgba(100,60,0,0.1)",
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about fabrics, yarn, weaving, dyeing, trade…"
            rows={2}
            disabled={loading}
            style={{
              flex: 1,
              border: "none",
              resize: "none",
              fontFamily: "Georgia, serif",
              fontSize: 14.5,
              color: "#2d1a06",
              background: "transparent",
              lineHeight: 1.6,
              padding: "2px 0",
            }}
          />
          <button
            className="send-btn"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              border: "none",
              background: input.trim() && !loading ? "#a8631f" : "#d4b07a",
              color: "white",
              fontSize: 20,
              cursor: input.trim() && !loading ? "pointer" : "default",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            ↑
          </button>
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: 12,
            fontSize: 11,
            color: "#b89060",
            letterSpacing: 0.5,
          }}
        >
          Powered by Claude · Fabrics · Yarn · Weaving · Dyeing · Trade
        </div>
      </div>
    </div>
  );
}
