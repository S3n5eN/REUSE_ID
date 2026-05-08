"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";

import Logo from "@/public/Logo/Logo.svg";

import SuccessPopup from "@/components/SuccessPopup";
import ErrorPopup from "@/components/ErrorPopup";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  // popup state
  const [successPopup, setSuccessPopup] = useState(false);
  const [errorPopup, setErrorPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const validateEmail = (value: string) => {
    if (!value) return "Email tidak boleh kosong";

    if (!value.endsWith("@gmail.com")) {
      return "Email harus menggunakan domain @gmail.com";
    }

    return "";
  };

  const validatePassword = (value: string) => {
    if (!value) return "Password tidak boleh kosong";

    if (value.length < 8) {
      return "Password minimal 8 karakter";
    }

    if (!/[A-Z]/.test(value)) {
      return "Password harus mengandung minimal 1 huruf besar";
    }

    return "";
  };

  const handleEmailChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const val = e.target.value;

    setEmail(val);

    if (touched.email) {
      setEmailError(validateEmail(val));
    }
  };

  const handlePasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const val = e.target.value;

    setPassword(val);

    if (touched.password) {
      setPasswordError(validatePassword(val));
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setTouched({
      email: true,
      password: true,
    });

    const eErr = validateEmail(email);
    const pErr = validatePassword(password);

    setEmailError(eErr);
    setPasswordError(pErr);

    if (eErr || pErr) return;

    try {
      const res = await fetch("/api/Pengguna/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      // LOGIN GAGAL
      if (!res.ok) {
        setPopupMessage(data.error || "Login gagal");
        setErrorPopup(true);
        return;
      }

      // LOGIN BERHASIL
      setPopupMessage("Login berhasil");
      setSuccessPopup(true);

      setTimeout(() => {
        if (data.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/dashboard");
        }
      }, 1500);

    } catch (error) {
      console.error("Login error:", error);

      setPopupMessage("Terjadi kesalahan pada server");
      setErrorPopup(true);
    }
  };

  return (
    <>
      {/* SUCCESS POPUP */}
      {successPopup && (
        <SuccessPopup
          message={popupMessage}
          onClose={() => setSuccessPopup(false)}
        />
      )}

      {/* ERROR POPUP */}
      {errorPopup && (
        <ErrorPopup
          message={popupMessage}
          onClose={() => setErrorPopup(false)}
        />
      )}

      <div className="flex h-screen">

        {/* panel kiri */}
        <div className="hidden md:flex flex-1 relative overflow-hidden">
          <Image
            src="/Login_BG.png"
            alt="Login Background"
            fill
            quality={100}
            sizes="100vh"
            className="object-cover"
          />

          <div className="absolute inset-0 bg-[#007582]/40" />

          <div className="relative z-10 flex h-full flex-col justify-end items-start w-full text-white p-10">

            <h1 className="text-4xl font-bold tracking-wide mb-3">
              ReuseID
            </h1>

            <p className="text-lg 3xl:text-xl text-white/80 max-w-lg 3xl:max-w-2xl leading-relaxed font-semibold">
              Platform daur ulang barang bekas terpercaya di Indonesia
            </p>

            <p className="text-md 3xl:text-lg text-white/70 max-w-2xl mt-2 3xl:max-w-4xl leading-relaxed">
              Barang tak terpakai di rumahmu bisa jadi kebahagiaan
              bagi orang lain. Bersama ReuseID, kamu bisa
              mendonasikan barang layak pakai secara gratis,
              aman, dan terverifikasi — karena setiap langkah
              kecilmu berarti bagi bumi dan sesama.
            </p>

          </div>
        </div>

        {/* panel kanan */}
        <div className="flex-1 flex flex-col bg-white">

          {/* Logo */}
          <div className="px-5 pt-2">
            <Image
              src={Logo}
              alt="Logo ReuseID"
              width={150}
            />
          </div>

          {/* Form Login */}
          <div className="flex-1 flex items-center justify-center px-8">

            <div className="w-full max-w-sm">

              <div className="mb-8 text-center">

                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                  Selamat Datang !
                </h2>

                <p className="text-sm text-gray-500">
                  Silahkan isi informasi akun yang telah terdaftar
                </p>

              </div>

              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-5"
              >

                {/* Email */}
                <div className="flex flex-col gap-1">

                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={() => {
                      setTouched((t) => ({
                        ...t,
                        email: true,
                      }));

                      setEmailError(validateEmail(email));
                    }}
                    placeholder="example12@gmail.com"
                    className={`px-4 py-2.5 rounded-lg border text-sm bg-gray-50 outline-none transition
                    focus:ring-2 focus:ring-[#007582]/30 focus:border-[#007582]
                    ${
                      emailError
                        ? "border-red-400 bg-red-50"
                        : "border-gray-200"
                    }`}
                  />

                  {emailError && (
                    <p className="text-xs text-red-500 mt-0.5">
                      {emailError}
                    </p>
                  )}

                </div>

                {/* Password */}
                <div className="flex flex-col gap-1">

                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>

                  <div className="relative">

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={handlePasswordChange}
                      onBlur={() => {
                        setTouched((t) => ({
                          ...t,
                          password: true,
                        }));

                        setPasswordError(
                          validatePassword(password)
                        );
                      }}
                      placeholder="Masukkan password"
                      className={`w-full px-4 py-2.5 pr-10 rounded-lg border text-sm bg-gray-50 outline-none transition
                      focus:ring-2 focus:ring-[#007582]/30 focus:border-[#007582]
                      ${
                        passwordError
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200"
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((s) => !s)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>

                  {passwordError && (
                    <p className="text-xs text-red-500 mt-0.5">
                      {passwordError}
                    </p>
                  )}

                  <div className="flex justify-end mt-1">
                    <Link
                      href="/forgot-password"
                      className="text-xs text-[#007582] hover:underline"
                    >
                      Lupa Password?
                    </Link>
                  </div>

                </div>

                {/* Button */}
                <button
                  type="submit"
                  className="bg-[#007582] hover:bg-[#005f6a] active:scale-95 text-white font-bold py-2.5 rounded-lg transition duration-200 text-sm"
                >
                  Login
                </button>

                <p className="text-center text-xs text-gray-500">
                  Belum punya akun?{" "}

                  <Link
                    href="/register"
                    className="text-[#007582] font-medium hover:underline"
                  >
                    Daftar Sekarang
                  </Link>

                </p>

              </form>

            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center px-8 pb-6 text-xs text-gray-400">

            <p>
              Copyright © 2025 ReuseID.
              All rights reserved.
            </p>

            <p>Privacy Policy</p>

          </div>
        </div>
      </div>
    </>
  );
}