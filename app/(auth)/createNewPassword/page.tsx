"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Lock, Shield } from "lucide-react";
import { FaArrowRight } from "react-icons/fa6";

export default function CreateNewPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [focusedField, setFocusedField] = useState<
    "password" | "confirm" | null
  >(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Validation rules
  const rules = {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };
  const passedRules = Object.values(rules).filter(Boolean).length;
  const isStrongPassword = Object.values(rules).every(Boolean);
  const isMatching = password === confirm && confirm.length > 0;
  const canSubmit = isStrongPassword && isMatching;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      setStatus("loading");
      const res = await fetch("/api/Pengguna/createNewPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: new URLSearchParams(window.location.search).get("token"),
          newPassword: password,
        }),
      })

      if (res.ok) {
        setStatus("success");
      }

      await new Promise((r) => setTimeout(r, 1800));
    } catch {
      setStatus("idle");
    } 
  };

  const strengthColor =
    passedRules <= 1
      ? "#e05c5c"
      : passedRules === 2
        ? "#e0a85c"
        : passedRules === 3
          ? "#e0a85c"
          : "#1a9e6e";

  return (
    <div className="h-screen relative w-full overflow-hidden flex items-center justify-center">
      {/* Background */}
      <Image
        src="/createNewBG.webp"
        alt="Background"
        layout="fill"
        objectFit="cover"
        priority
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-[#007582]/50 z-10" />

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
        <div
          className="rounded-2xl overflow-hidden bg-white"
          style={{
            boxShadow:
              "0 25px 60px rgba(0,0,0,0.25), 0 8px 20px rgba(0,0,0,0.12)",
          }}
        >
          <div className="px-8 py-10">
            {status !== "success" ? (
              <>
                {/* Header */}
                <div className="mb-8 text-center">
                  <h1 className="text-2xl font-bold mb-2 leading-tight text-[#1a2e35]">
                    Buat Kata Sandi Baru
                  </h1>
                  <p className="text-sm leading-relaxed text-[#6b8a90]">
                    Pastikan kata sandi baru kamu kuat dan mudah diingat.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Password input */}
                  <div className="space-y-1.5">
                    <label
                      className="text-xs font-semibold tracking-wider uppercase block text-[#8aa6ac]"
                      htmlFor="password"
                    >
                      Kata Sandi Baru
                    </label>
                    <div className="relative">
                      <div
                        className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300"
                        style={{
                          color:
                            focusedField === "password" ? "#00939f" : "#aac5ca",
                        }}
                      >
                        <Lock size={16} />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Min. 8 karakter"
                        className="w-full pl-11 pr-11 py-3.5 rounded-xl text-sm outline-none transition-all duration-300 text-[#1a2e35]"
                        style={{
                          background:
                            focusedField === "password" ? "#f0f9fa" : "#f7fbfc",
                          border:
                            focusedField === "password"
                              ? "1.5px solid #00939f"
                              : "1.5px solid #dcedef",
                          boxShadow:
                            focusedField === "password"
                              ? "0 0 0 3px rgba(0,147,159,0.1)"
                              : "none",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-300"
                        style={{
                          color:
                            focusedField === "password" ? "#00939f" : "#aac5ca",
                        }}
                      >
                        {showPassword ? (
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
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
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
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>

                    {/* Strength bar */}
                    {password.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className="h-1 flex-1 rounded-full transition-all duration-300"
                              style={{
                                background:
                                  i <= passedRules ? strengthColor : "#e8f0f1",
                              }}
                            />
                          ))}
                        </div>
                        {/* Requirement checklist */}
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-0.5">
                          {[
                            { key: "minLength", label: "Min. 8 karakter" },
                            { key: "hasUpper", label: "Huruf besar (A-Z)" },
                            { key: "hasLower", label: "Huruf kecil (a-z)" },
                            { key: "hasNumber", label: "Angka (0-9)" },
                          ].map(({ key, label }) => {
                            const passed = rules[key as keyof typeof rules];
                            return (
                              <div
                                key={key}
                                className="flex items-center gap-1.5"
                              >
                                <div
                                  className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
                                  style={{
                                    background: passed ? "#1a9e6e" : "#e8f0f1",
                                  }}
                                >
                                  {passed ? (
                                    <svg
                                      width="8"
                                      height="8"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="white"
                                      strokeWidth="3.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                  ) : (
                                    <div className="w-1 h-1 rounded-full bg-[#aac5ca]" />
                                  )}
                                </div>
                                <span
                                  className="text-xs transition-colors duration-300"
                                  style={{
                                    color: passed ? "#1a9e6e" : "#8aa6ac",
                                  }}
                                >
                                  {label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm password input */}
                  <div className="space-y-1.5">
                    <label
                      className="text-xs font-semibold tracking-wider uppercase block text-[#8aa6ac]"
                      htmlFor="confirm"
                    >
                      Konfirmasi Kata Sandi
                    </label>
                    <div className="relative">
                      <div
                        className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300"
                        style={{
                          color:
                            focusedField === "confirm" ? "#00939f" : "#aac5ca",
                        }}
                      >
                        <Shield size={16} />
                      </div>
                      <input
                        id="confirm"
                        type={showConfirm ? "text" : "password"}
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        onFocus={() => setFocusedField("confirm")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Ulangi kata sandi"
                        className="w-full pl-11 pr-11 py-3.5 rounded-xl text-sm outline-none transition-all duration-300 text-[#1a2e35]"
                        style={{
                          background:
                            focusedField === "confirm" ? "#f0f9fa" : "#f7fbfc",
                          border:
                            focusedField === "confirm"
                              ? `1.5px solid ${confirm.length > 0 && !isMatching ? "#e05c5c" : "#00939f"}`
                              : `1.5px solid ${confirm.length > 0 && !isMatching ? "#f5c0c0" : "#dcedef"}`,
                          boxShadow:
                            focusedField === "confirm"
                              ? `0 0 0 3px ${confirm.length > 0 && !isMatching ? "rgba(224,92,92,0.1)" : "rgba(0,147,159,0.1)"}`
                              : "none",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-300"
                        style={{
                          color:
                            focusedField === "confirm" ? "#00939f" : "#aac5ca",
                        }}
                      >
                        {showConfirm ? (
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
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
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
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>

                      {/* Match indicator */}
                      {confirm.length > 0 && (
                        <div
                          className="absolute right-11 top-1/2 -translate-y-1/2"
                          style={{ color: isMatching ? "#1a9e6e" : "#e05c5c" }}
                        >
                          {isMatching ? (
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          ) : (
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Mismatch hint */}
                    {confirm.length > 0 && !isMatching && (
                      <p className="text-xs text-[#e05c5c]">
                        Kata sandi tidak cocok
                      </p>
                    )}
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={!canSubmit || status === "loading"}
                    className={`relative w-full py-3.5 rounded-xl font-semibold text-sm overflow-hidden transition-all duration-300 group mt-1 ${canSubmit ? "bg-[#00939f] text-white" : "bg-[#e8f2f3] text-[#aac5ca]"}`}
                    style={{
                      boxShadow: canSubmit
                        ? "0 6px 20px rgba(0,147,159,0.3)"
                        : "none",
                      cursor: canSubmit ? "pointer" : "not-allowed",
                    }}
                  >
                    {canSubmit && (
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
                        Menyimpan...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Simpan Kata Sandi
                        <FaArrowRight size={14} />
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
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold mb-2 text-[#1a2e35]">
                  Kata sandi berhasil diubah!
                </h2>
                <p className="text-sm leading-relaxed mb-6 text-[#6b8a90]">
                  Kata sandi baru kamu sudah aktif. Silakan masuk dengan kata
                  sandi yang baru.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-300"
                  style={{
                    background: "linear-gradient(135deg, #00939f, #005f6b)",
                    boxShadow: "0 6px 20px rgba(0,147,159,0.3)",
                  }}
                >
                  Masuk Sekarang
                  <svg
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
                </Link>
              </div>
            )}
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
