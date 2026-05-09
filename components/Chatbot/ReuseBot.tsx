"use client";

import { useState, useRef, useEffect } from "react";
import { Bot } from 'lucide-react';

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ReuseBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Halo! Saya ReuseBot Saya siap membantu kamu seputar cara donasi, syarat penerima, dan cara klaim barang di ReuseID. Ada yang bisa saya bantu?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage: Message = { role: "user", content: trimmed };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await res.json();
      const botReply: Message = {
        role: "assistant",
        content: data.reply || "Maaf, saya tidak bisa menjawab saat ini.",
      };
      setMessages((prev) => [...prev, botReply]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Maaf, terjadi kesalahan. Coba lagi ya! 🙏",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  const suggestedQuestions = [
    "Bagaimana cara donasi barang?",
    "Apa syarat menjadi penerima?",
    "Bagaimana cara klaim barang?",
    "Kenapa harus verifikasi dulu?",
  ];

  return (
    <>
      {/* Floating Chat Window */}
      <div
        className={`fixed bottom-24 right-6 z-50 flex flex-col transition-all duration-300 ease-in-out ${
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        style={{ width: "360px", maxHeight: "520px" }}
      >
        <div
          className="flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-gray-200"
          style={{ background: "#ffffff", height: "520px" }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3"
            style={{
              background: "linear-gradient(135deg, #0d9488, #0f766e)",
            }}
          >
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm leading-tight">
                ReuseBot
              </p>
              <p className="text-teal-100 text-xs">Asisten Virtual ReuseID</p>
            </div>
            {/* Online indicator */}
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-teal-100 text-xs">Online</span>
            </div>
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="ml-2 text-white/70 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-end gap-2 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0 mb-0.5">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-teal-600 text-white rounded-br-sm"
                      : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex items-end gap-2 justify-start">
                <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 5.58 2 10c0 2.39 1.19 4.53 3.07 6.01L4 20l4.3-1.43C9.41 19.18 10.68 19.5 12 19.5c5.52 0 10-3.58 10-8S17.52 2 12 2z" />
                  </svg>
                </div>
                <div className="bg-white border border-gray-100 shadow-sm px-4 py-2.5 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            {/* Suggested questions (only at start) */}
            {messages.length === 1 && !loading && (
              <div className="space-y-1.5 mt-1">
                <p className="text-xs text-gray-400 text-center">Pertanyaan umum:</p>
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInput(q);
                      setTimeout(() => inputRef.current?.focus(), 50);
                    }}
                    className="w-full text-left text-xs px-3 py-2 rounded-xl border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ketik pesan..."
                disabled={loading}
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="w-8 h-8 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 transition-colors flex items-center justify-center flex-shrink-0"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-center text-gray-300 text-[10px] mt-1.5">
              Powered by ReuseID · Gemini AI
            </p>
          </div>
        </div>
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 flex items-center justify-center group"
        style={{ background: "linear-gradient(135deg, #0d9488, #0f766e)" }}
        title="ReuseBot - Asisten Virtual"
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        ) : (
          <Bot className="w-6 h-6 text-white" />
        )}
        
      </button>
    </>
  );
}
