"use client";

import { useState } from "react";
import Image from "next/image";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import SuccessPopup from "@/components/SuccessPopup";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [nameError, setNameError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi nama
    if (!username.trim() || username.length < 4) {
      setNameError("Nama harus minimal 4 karakter dan tidak boleh kosong");
      return;
    } else if (!/^[A-Za-z\s]+$/.test(username)) {
      setNameError("Nama hanya boleh huruf alfabet (A-Z)");
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
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Terjadi kesalahan server");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white relative">
      {/* Form Register */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded max-w-4xl flex flex-col gap-4"
      >
        <h1 className="text-4xl font-bold text-center text-[#007582]">ReuseID</h1>
        <h2 className="text-xl font-bold text-center text-black">Buat Akun</h2>
        <p className="text-sm text-center text-black">
          Masukkan informasi kamu untuk membuat akun
        </p>

        {/* Input Name */}
        <div className="flex flex-col gap-0">
          <label className="text-black text-medium">Name:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-gray-300 text-black p-2 rounded outline-none"
            required
          />
          {nameError && <p className="text-red-500 text-sm">{nameError}</p>}
        </div>

        {/* Input Email */}
        <div className="flex flex-col gap-0">
          <label className="text-black text-medium">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-gray-300 text-black p-2 rounded outline-none"
            required
          />
          {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
        </div>

        {/* Input Password */}
        <div className="flex flex-col gap-2">
          <label className="text-black text-medium">Password:</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-300 text-black p-2 rounded outline-none w-full"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2 text-gray-600 hover:text-black cursor-pointer"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {passwordError && (
            <p className="text-red-500 text-sm">{passwordError}</p>
          )}
        </div>

        <button
          type="submit"
          className="bg-[#007582] text-white font-semibold py-2 rounded transition cursor-pointer"
        >
          Register
        </button>
      </form>

      {/* Gambar ilustrasi */}
      <div className="ml-10">
        <Image
          src="/reuse_id.jpeg"
          alt="ReuseID"
          width={400}
          height={300}
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
    </div>
  );
}
