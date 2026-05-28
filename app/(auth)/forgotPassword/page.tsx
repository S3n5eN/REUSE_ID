"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [focused, setFocused] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      setStatus("loading");
      setErrorMessage("");
      const res = await fetch("/api/Pengguna/forgotPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengirim email");
      
      await new Promise((r) => setTimeout(r, 1800));
      setStatus("success");
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal mengirim email");
      setStatus("error");
    } 
  };

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <div className="h-screen relative w-full overflow-hidden flex items-center justify-center">
      {/* Background */}
      <Image
        src="/forgotBG.webp"
        alt="Background"
        layout="fill"
        objectFit="cover"
        priority
      />

      {/* Overlay dengan grain texture */}
      <div className="absolute inset-0 bg-[#003d44]/85 z-10" />

      {/* Decorative soft blobs */}
      <div
        className="absolute z-10 rounded-full pointer-events-none"
        style={{
          width: "500px",
          height: "500px",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)",
          top: "-100px",
          right: "-100px",
          filter: "blur(50px)",
        }}
      />
      <div
        className="absolute z-10 rounded-full pointer-events-none"
        style={{
          width: "400px",
          height: "400px",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)",
          bottom: "-80px",
          left: "-80px",
          filter: "blur(60px)",
        }}
      />

      {/* Main card */}
      <div
        className={`relative z-20 w-full max-w-md mx-4 transition-all duration-700 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        {/* Card body */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "#ffffff",
            boxShadow:
              "0 25px 60px rgba(0,0,0,0.25), 0 8px 20px rgba(0,0,0,0.12)",
          }}
        >
          <div className="px-8 py-10">
            {/* Conditional content — idle/loading vs success */}
            {status !== "success" ? (
              <>
                {/* Header text */}
                <div className="mb-8 text-center">
                  <h1
                    className="text-2xl font-bold mb-2 leading-tight"
                    style={{ color: "#1a2e35" }}
                  >
                    Lupa Password?
                  </h1>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "#6b8a90" }}
                  >
                    Masukkan email yang terdaftar dan kami akan kirimkan tautan
                    untuk membuat password baru.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email input */}
                  <div className="space-y-1.5">
                    <label
                      className="text-xs font-semibold tracking-wider uppercase block"
                      style={{ color: "#8aa6ac" }}
                      htmlFor="email"
                    >
                      Alamat Email
                    </label>
                    <div className="relative">
                      {/* Input left icon */}
                      <div
                        className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300"
                        style={{ color: focused ? "#00939f" : "#aac5ca" }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                      </div>

                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        placeholder="nama@email.com"
                        autoComplete="email"
                        className="w-full pl-11 pr-10 py-3.5 rounded-xl text-sm outline-none transition-all duration-300"
                        style={{
                          background: focused ? "#f0f9fa" : "#f7fbfc",
                          border: focused
                            ? "1.5px solid #00939f"
                            : "1.5px solid #dcedef",
                          color: "#1a2e35",
                          boxShadow: focused
                            ? "0 0 0 3px rgba(0,147,159,0.1)"
                            : "none",
                        }}
                      />

                      {/* Validation tick */}
                      {isValidEmail && (
                        <div
                          className="absolute right-4 top-1/2 -translate-y-1/2"
                          style={{ color: "#00c48c" }}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {errorMessage && (
                      <p className="text-xs text-red-500 mt-1.5 font-medium">
                        {errorMessage}
                      </p>
                    )}
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={!isValidEmail || status === "loading"}
                    className={`relative w-full py-3.5 rounded-xl font-semibold text-sm overflow-hidden transition-all duration-300 group ${isValidEmail ? "bg-[#00939f] text-white" : "bg-[#e8f2f3] text-[#aac5ca]"}`}
                    style={{
                      boxShadow: isValidEmail
                        ? "0 6px 20px rgba(0,147,159,0.3)"
                        : "none",
                      cursor: isValidEmail ? "pointer" : "not-allowed",
                    }}
                  >
                    {/* Shine effect */}
                    {isValidEmail && (
                      <span
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(255,255,255,0.12), transparent)",
                        }}
                      />
                    )}

                    {status === "loading" ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray="60"
                            strokeDashoffset="15"
                          />
                        </svg>
                        Mengirim...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Kirim Tautan Reset
                        <svg
                          className="transition-transform duration-300 group-hover:translate-x-0.5"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </span>
                    )}
                  </button>
                </form>
              </>
            ) : (
              /* Success state */
              <div className="text-center py-4">
                <div
                  className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #e6f7f0, #ccf0e3)",
                    border: "1px solid #a3e0c8",
                  }}
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1a9e6e"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <h2
                  className="text-xl font-bold mb-2"
                  style={{ color: "#1a2e35" }}
                >
                  Email terkirim!
                </h2>
                <p
                  className="text-sm leading-relaxed mb-2"
                  style={{ color: "#6b8a90" }}
                >
                  Kami telah mengirim tautan reset ke
                </p>
                <p
                  className="text-sm font-semibold mb-6"
                  style={{ color: "#00939f" }}
                >
                  {email}
                </p>
                <p className="text-xs" style={{ color: "#aac5ca" }}>
                  Tidak ada email masuk? Cek folder spam atau{" "}
                  <button
                    onClick={() => setStatus("idle")}
                    className="underline underline-offset-2 transition-colors duration-200"
                    style={{ color: "#00939f" }}
                  >
                    coba lagi
                  </button>
                  .
                </p>
              </div>
            )}

            {/* Divider */}
            <div className="my-4 flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: "#e8f0f1" }} />
              <span className="text-xs" style={{ color: "#aac5ca" }}>
                atau
              </span>
              <div className="flex-1 h-px" style={{ background: "#e8f0f1" }} />
            </div>

            {/* Back to login */}
            <p className="text-center text-sm" style={{ color: "#6b8a90" }}>
              Ingat password kamu?{" "}
              <Link
                href="/login"
                className="font-semibold transition-colors duration-200 underline underline-offset-2"
                style={{ color: "#00939f" }}
              >
                Masuk sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        input::placeholder {
          color: #b0cfd4;
        }
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}
