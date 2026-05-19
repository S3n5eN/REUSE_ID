"use client";

import { useState } from "react";
import Image from "next/image";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import SuccessPopup from "@/components/SuccessPopup";
import ErrorPopup from "@/components/ErrorPopup";
import ConfirmPopup from "@/components/ConfirmPopup";
import { useRouter } from "next/navigation";
import Logo from "@/public/Logo/Logo.svg";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [nameError, setNameError] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showConfirmRegister, setShowConfirmRegister] = useState(false);
  const router = useRouter();

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi nama
    if (!username.trim()) {
      setNameError("Nama tidak boleh kosong");
      return;
    } else if (!/^[A-Za-z\s]+$/.test(username)) {
      setNameError("Nama hanya boleh huruf alfabet (A-Z)");
      return;
    } else if (username.length < 4) {
      setNameError("Nama minimal terdiri dari 4 karakter");
      return;
    } else {
      setNameError("");
    }

    // Validasi email
    if (!email.endsWith("@gmail.com")) {
      setEmailError("Email harus mengandung @gmail.com");
      return;
    } else {
      setEmailError("");
    }

    // Validasi password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
    if (password.length < 8 || !passwordRegex.test(password)) {
      setPasswordError(
        "Password harus minimal 8 karakter dan harus mengandung huruf kecil, huruf besar, dan angka"
      );
      return;
    } else {
      setPasswordError("");
    }

    // Tampilkan konfirmasi
    setShowConfirmRegister(true);
  };

  const handleExecuteRegister = async () => {
    setShowConfirmRegister(false);
    try {
      const res = await fetch("/api/Pengguna/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: username, email, password }),
      });

      const data = await res.json();
      console.log("Response:", res.status, data);

      if (res.ok) {
        setSuccessMessage("REGISTER BERHASIL!");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setErrorMessage(data.message);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setErrorMessage("Terjadi kesalahan server");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-white relative">
      {/*Container kiri: form */}
      <div className="hidden md:flex flex-1 relative h-screen">
        <div className="flex-1 flex items-center justify-center px-0">
          <div className="w-full max-w-sm">
             {/* Logo ReuseID */}
            <div className="flex items-center justify-center h-full">
              <Image src={Logo} alt="Logo ReuseID" width={150} />
            </div>
            {/* Form Register */}
            <div className="mb-0.5 text-center">
              {/*<h2 className="text-4xl font-bold text-center text-[#007582]">ReuseID</h2>*/}
              <h2 className="text-xl font-bold text-center text-black">Buat Akun</h2>
              <p className="text-sm text-center text-black">
                Masukkan informasi kamu untuk membuat akun
              </p>
            </div>

            <form
              onSubmit={handleRequestSubmit}
              className="bg-white p-8 rounded max-w-4xl flex flex-col gap-4"
            >

              {/* Input Name */}
              <div className="flex flex-col gap-0">
                <label className="text-black text-medium p-2">Name:</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-gray-300 text-black p-2 rounded outline-none focus:ring-2 focus:ring-[#007582] focus:shadow-lg transition"
                  required
                />
                {nameError && <p className="text-red-500 text-sm max-w-sm">{nameError}</p>}
              </div>

              {/* Input Email */}
              <div className="flex flex-col gap-0">
                <label className="text-black text-medium p-2">Email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (!e.target.value.endsWith("@gmail.com")) {
                      setEmailError("Email harus mengandung @gmail.com");
                    } else {
                      setEmailError("");
                    }
                  }
                  }
                  className="bg-gray-300 text-black p-2 rounded outline-none focus:ring-2 focus:ring-[#007582] focus:shadow-lg transition"
                  required
                />
                {emailError && <p className="text-red-500 text-sm max-w-sm">{emailError}</p>}
              </div>

              {/* Input Password */}
              <div className="flex flex-col gap-0">
                <label className="text-black text-medium p-2">Password:</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
                      if (e.target.value.length >= 8 && passwordRegex.test(e.target.value)) {
                        setPasswordError("");
                      }
                    }}
                    
                    className="bg-gray-300 text-black p-2 rounded outline-none focus:ring-2 focus:ring-[#007582] focus:shadow-lg transition rounded outline-none w-full"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-600 hover:text-black cursor-pointer"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-red-500 text-sm max-w-sm">{passwordError}</p>
                )}
              </div>

              {/*Tombol Register */}
              <button
                type="submit"
                 className="bg-[#007582] hover:bg-[#006060] active:scale-95 text-white font-semibold py-2 rounded transition cursor-pointer w-full"
              >
                Register
              </button>

              <p className="text-sm text-center">
                Sudah punya akun?{" "}
                <a href="/login" className="text-gray-500 hover:underline">
                  Login
                </a>
              </p>

            </form>
          </div>
        </div>

        {/*Footer */}
        <div className="absolute bottom-0 w-full flex justify-between items-center px-8 pb-6 text-xs text-gray-400">
          <p>Copyright © 2025 ReuseID. All rights reserved.</p>
          <p>Privacy Policy</p>
        </div>
      </div>

      {/* Container kanan: Gambar ilustrasi */}
      <div className="hidden md:flex flex-1 relative h-screen">
        <Image
          src="/reuse_id.jpeg"
          alt="ReuseID"
          fill
          quality={100}
          sizes="100vh"
          className="rounded shadow-md"
        />
      </div>

      {/* Popup sukses */}
      {successMessage && (
        <SuccessPopup
          message={successMessage}
          onClose={() => setSuccessMessage("")}
        />
      )}

      {/* popup user sudah terdaftar*/}
      {errorMessage && (
        <ErrorPopup
          message={errorMessage}
          onClose={() => setErrorMessage("")}
        />
      )}

      {/* popup konfirmasi registrasi */}
      {showConfirmRegister && (
        <ConfirmPopup
          message="Apakah Anda yakin informasi pendaftaran sudah benar dan ingin membuat akun sekarang?"
          confirmText="Ya, Buat Akun"
          cancelText="Batal"
          type="info"
          onConfirm={handleExecuteRegister}
          onCancel={() => setShowConfirmRegister(false)}
        />
      )}
    </div>
  );
}
