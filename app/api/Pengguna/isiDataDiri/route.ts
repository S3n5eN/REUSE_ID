import {  userProfile_gender } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import { pengguna } from "@/types/pengguna";
import { NextResponse, NextRequest } from "next/server";

// ==== Ini Method Isi Data Diri Pengguna ====
async function isiDataDiri(req: NextRequest, decoded: { id: string }) {
  try {
    const body: Pick<pengguna, "dataDiri"> &{
      itemId: number;
    } = await req.json();

    // ==== Disini ga ada pengecekan untuk pekerjaan, menurut saya pekerjaan tidak penting dalam kegiatan donasi, jadi opsional aja ====
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

    // ==== untuk validasi apakah nama lengkap mengandung angka atau tidak ====
    if (/\d/.test(body.dataDiri.namaLengkap)) {
      return NextResponse.json(
        { message: "Nama lengkap tidak boleh mengandung angka" },
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
        pekerjaan: body.dataDiri.pekerjaan ?? undefined,
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
        pekerjaan: body.dataDiri.pekerjaan ?? undefined,
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
