import { userProfile_gender } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import { pengguna } from "@/types/pengguna";
import { NextResponse, NextRequest } from "next/server";

// ==== Ini Method Isi Data Diri Pengguna ====
async function isiDataDiri(req: NextRequest, decoded: { id: string }) {
  try {
    const body: Pick<pengguna, "dataDiri"> & {
      itemId: number;
    } = await req.json();

    if (
      !body.dataDiri.namaLengkap ||
      !body.dataDiri.usia ||
      !body.dataDiri.nomorTelpon ||
      !body.dataDiri.alamat ||
      !body.dataDiri.gender ||
      !body.dataDiri.longitude ||
      !body.dataDiri.latitude ||
      !body.dataDiri.NIK
    ) {
      return new Response(JSON.stringify({ message: "Data tidak lengkap" }), {
        status: 400,
      });
    }

    const containsEmoji = (str: string) =>
      /\p{Extended_Pictographic}/u.test(str);

    // ==== validasi nama lengkap ====
    // Ini jika nama lengkap ada emoji
    if (containsEmoji(body.dataDiri.namaLengkap)) {
      return NextResponse.json(
        { message: "Nama lengkap tidak boleh mengandung emoji" },
        { status: 400 },
      );
    }

    // Ini jika nama lengkap ada angka
    if (!/^[A-Za-z\s]+$/.test(body.dataDiri.namaLengkap)) {
      return NextResponse.json(
        { message: "Nama lengkap hanya boleh berisi huruf alfabet" },
        { status: 400 },
      );
    }

    // Ini jika nama lengkap kurang dari 4 karakter
    if (body.dataDiri.namaLengkap.length < 4) {
      return NextResponse.json(
        { message: "Nama lengkap minimal terdiri dari 4 karakter" },
        { status: 400 },
      );
    }

    // Ini jika nama lengkap lebih dari 30 karakter
    if (body.dataDiri.namaLengkap.length > 30) {
      return NextResponse.json(
        { message: "Nama lengkap maksimal terdiri dari 30 karakter" },
        { status: 400 },
      );
    }

    // ==== validasi usia ====
    // Ini jika usia dibawah 17 tahun
    if (Number(body.dataDiri.usia) < 17) {
      return NextResponse.json(
        { message: "Usia minimal 17 tahun" },
        { status: 400 },
      );
    }

    // Ini jika usia diatas 120 tahun
    if (Number(body.dataDiri.usia) > 120) {
      return NextResponse.json(
        { message: "Usia maksimal 120 tahun" },
        { status: 400 },
      );
    }

    // ==== validasi gender ====
    // Ini jika gender bukan Pria atau Wanita
    if (!["Pria", "Wanita"].includes(body.dataDiri.gender)) {
      return NextResponse.json(
        { message: "Gender harus berupa Pria atau Wanita" },
        { status: 400 },
      );
    }

    // ==== validasi nomor telepon ====
    // Ini jika nomor telepon ada huruf
    if (!/^\d+$/.test(body.dataDiri.nomorTelpon)) {
      return NextResponse.json(
        { message: "Nomor telepon hanya boleh berisi angka" },
        { status: 400 },
      );
    }

    // Ini jika nomor telepon kurang dari 9 digit
    if (body.dataDiri.nomorTelpon.length < 9) {
      return NextResponse.json(
        { message: "Nomor telepon minimal terdiri dari 9 digit" },
        { status: 400 },
      );
    }

    // Ini jika nomor telepon lebih dari 15 digit
    if (body.dataDiri.nomorTelpon.length > 15) {
      return NextResponse.json(
        { message: "Nomor telepon maksimal terdiri dari 15 digit" },
        { status: 400 },
      );
    }

    // ==== validasi alamat ====
    // Ini jika alamat ada emoji
    if (containsEmoji(body.dataDiri.alamat)) {
      return NextResponse.json(
        { message: "Alamat tidak boleh mengandung emoji" },
        { status: 400 },
      );
    }

    // Ini jika alamat kurang dari 10 karakter
    if (body.dataDiri.alamat.length < 10) {
      return NextResponse.json(
        { message: "Alamat minimal terdiri dari 10 karakter" },
        { status: 400 },
      );
    }

    // Ini jika alamat lebih dari 200 karakter
    if (body.dataDiri.alamat.length > 200) {
      return NextResponse.json(
        { message: "Alamat maksimal terdiri dari 200 karakter" },
        { status: 400 },
      );
    }

    // ==== validasi NIK ====
    // Ini jika NIK ada huruf
    if (!/^\d+$/.test(body.dataDiri.NIK)) {
      return NextResponse.json(
        { message: "NIK hanya boleh berisi angka" },
        { status: 400 },
      );
    }

    // Ini jika NIK tidak 16 digit
    if (body.dataDiri.NIK.length !== 16) {
      return NextResponse.json(
        { message: "NIK harus terdiri dari 16 digit" },
        { status: 400 },
      );
    }

    // ==== pakai upsert biar kalau udah diupdate, kalau belum ada maka ada ====
    await prisma.userProfile.upsert({
      where: { userId: Number(decoded.id) },
      update: {
        namaLengkap: body.dataDiri.namaLengkap,
        usia: body.dataDiri.usia,
        phone: body.dataDiri.nomorTelpon,
        gender: body.dataDiri.gender as userProfile_gender,
        address: body.dataDiri.alamat,
        identityId: body.dataDiri.NIK,
        longitude: body.dataDiri.longitude,
        latitude: body.dataDiri.latitude,
      },
      create: {
        userId: Number(decoded.id),
        namaLengkap: body.dataDiri.namaLengkap,
        usia: body.dataDiri.usia,
        gender: body.dataDiri.gender as userProfile_gender,
        phone: body.dataDiri.nomorTelpon,
        address: body.dataDiri.alamat,
        identityId: body.dataDiri.NIK,
        longitude: body.dataDiri.longitude,
        latitude: body.dataDiri.latitude,
      },
    });

    return NextResponse.json(
      { message: "Berhasil Update datadiri pengguna" },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { message: "Gagal Update datadiri pengguna" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  return (await protect(isiDataDiri, ["user"]))(req);
}
