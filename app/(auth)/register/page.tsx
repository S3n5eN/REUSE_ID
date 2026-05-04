"use client";

import { useState } from "react";
import Image from "next/image";
import { FaEye, FaEyeSlash } from "react-icons/fa";
export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [nameError, setNameError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    //validasi nama harus minimal 4 karakter

    if (!username.trim() || username.length < 4) {
      setNameError("Nama harus minimal 4 karakter dan tidak boleh kosong");
      return;
    } else if (!/^[A-Za-z\s]+$/.test(username)) {
      setNameError("Nama hanya boleh huruf alfabet (A-Z)");
      return;
    } else {
      setNameError("");
    }

    // Validasi email harus @gmail.com
    if (!email.endsWith("@gmail.com")) {
      setEmailError("Email harus mengandung @gmail.com");
      return;
    } else {
      setEmailError("");
    }

    // Validasi password: huruf kecil, huruf besar, angka
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
    if (password.length < 8 || !passwordRegex.test(password)) {
      setPasswordError("Password harus minimal 8 karakter dan harus mengandung huruf kecil, huruf besar, dan angka");
      return;
    } else {
      setPasswordError("");
    }

    const res = await fetch("/api/Pengguna/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: username, email, password }),
    });

    const data = await res.json();
    alert(data.message);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      {/* Container kiri: form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded  w-100 max-w-4xl flex flex-col gap-4"
      >
        {/* Judul utama */}
        <h1 className="text-4xl font-bold text-center text-[#007582]">
          ReuseID
        </h1>

        {/* Subjudul */}
        <h2 className="text-xl font-bold text-center text-black">
          Buat Akun
        </h2>

        {/* Deskripsi */}
        <p className="text-sm text-center text-black">
          Masukkan informasi kamu untuk membuat akun
        </p>

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

        <div className="flex flex-col gap-0">
          <label className="text-black text-medium">Email:</label>
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
            className="bg-gray-300 text-black p-2 rounded outline-none"
            required
          />
          {emailError && (<p className="text-red-500 text-sm">{emailError}</p>)}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-black text-medium">Password:</label>
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
          {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
        </div>


        {/* Tombol Register */}
        <button
          type="submit"
          className="bg-[#007582] text-white font-semibold py-2 rounded transition cursor-pointer"
        >
          Register
        </button>

        <p className="text-sm text-center">
          Sudah punya akun?{" "}
          <a href="/login" className="text-blue-500 hover:underline">
            Login
          </a>
        </p>

        <p className="text-xs text-center text-gray-400 mt-4">
          © 2025 ReuseID. Privacy Policy
        </p>
      </form>

      {/* Container kanan: gambar ilustrasi */}
      <div className="ml-10">
        <Image
          src="/reuse_id.jpeg"
          alt="ReuseID"
          width={400}
          height={300}
          className="rounded shadow-md"
        />
      </div>
    </div>
  );
}

function setNameError(arg0: string) {
  throw new Error("Function not implemented.");
}
