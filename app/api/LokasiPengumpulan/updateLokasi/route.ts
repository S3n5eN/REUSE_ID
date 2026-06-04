import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import { lokasiPengumpulan } from "@/types/lokasiPengumpulan";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

async function updateLokasi(req: NextRequest) {
  try {
    const body: lokasiPengumpulan = await req.json();

    if (
      !body.id ||
      !body.locationName ||
      !body.address ||
      !body.managerName ||
      !body.managerPhone ||
      !body.operationalJam ||
      body.latitude === undefined ||
      body.latitude === null ||
      body.longitude === undefined ||
      body.longitude === null
    ) {
      return NextResponse.json(
        { message: "Semua field harus diisi" },
        { status: 400 },
      );
    }

    // ==== Validasi karakter & emoji ====
    const containsEmoji = (str: string) =>
      /\p{Extended_Pictographic}/u.test(str);

    // Validasi nama lokasi / gudang
    // Ini kalau nama lokasi mengandung emoji
    if (containsEmoji(body.locationName)) {
      return NextResponse.json(
        { message: "Nama lokasi tidak boleh mengandung emoji" },
        { status: 400 },
      );
    }

    // Ini kalau nama lokasi kurang dari 4 karakter
    if (body.locationName.length < 4) {
      return NextResponse.json(
        { message: "Nama lokasi minimal terdiri dari 4 karakter" },
        { status: 400 },
      );
    }

    // Ini kalau nama lokasi lebih dari 50 karakter
    if (body.locationName.length > 50) {
      return NextResponse.json(
        { message: "Nama lokasi maksimal terdiri dari 50 karakter" },
        { status: 400 },
      );
    }

    // Validasi alamat
    // Ini kalau alamat mengandung emoji
    if (containsEmoji(body.address)) {
      return NextResponse.json(
        { message: "Alamat tidak boleh mengandung emoji" },
        { status: 400 },
      );
    }

    // Ini kalau alamat kurang dari 10 karakter
    if (body.address.length < 10) {
      return NextResponse.json(
        { message: "Alamat minimal terdiri dari 10 karakter" },
        { status: 400 },
      );
    }

    // Ini kalau alamat lebih dari 200 karakter
    if (body.address.length > 200) {
      return NextResponse.json(
        { message: "Alamat maksimal terdiri dari 200 karakter" },
        { status: 400 },
      );
    }

    // Validasi nama manajer
    // Ini kalau nama manajer mengandung emoji
    if (containsEmoji(body.managerName)) {
      return NextResponse.json(
        { message: "Nama manajer tidak boleh mengandung emoji" },
        { status: 400 },
      );
    }

    // Ini kalau nama manajer tidak mengandung huruf alfabet
    if (!/^[A-Za-z\s]+$/.test(body.managerName)) {
      return NextResponse.json(
        { message: "Nama manajer hanya boleh berisi huruf alfabet" },
        { status: 400 },
      );
    }

    // Ini kalau nama manajer kurang dari 4 karakter
    if (body.managerName.length < 4) {
      return NextResponse.json(
        { message: "Nama manajer minimal terdiri dari 4 karakter" },
        { status: 400 },
      );
    }

    // Ini kalau nama manajer lebih dari 30 karakter
    if (body.managerName.length > 30) {
      return NextResponse.json(
        { message: "Nama manajer maksimal terdiri dari 30 karakter" },
        { status: 400 },
      );
    }

    // Validasi managerPhone
    // Ini kalau nomor telepon manajer tidak mengandung angka
    if (!/^\d+$/.test(body.managerPhone)) {
      return NextResponse.json(
        { message: "Nomor telepon manajer hanya boleh berisi angka" },
        { status: 400 },
      );
    }

    // Ini kalau nomor telepon manajer kurang dari 9 digit
    if (body.managerPhone.length < 9) {
      return NextResponse.json(
        { message: "Nomor telepon manajer minimal terdiri dari 9 digit" },
        { status: 400 },
      );
    }

    // Ini kalau nomor telepon manajer lebih dari 15 digit
    if (body.managerPhone.length > 15) {
      return NextResponse.json(
        { message: "Nomor telepon manajer maksimal terdiri dari 15 digit" },
        { status: 400 },
      );
    }

    // Validasi Jam Operasional
    const timeRangeRegex = /^\d{2}:\d{2} - \d{2}:\d{2}$/;

    // Ini kalau format jam operasional tidak valid
    if (!timeRangeRegex.test(body.operationalJam)) {
      return NextResponse.json(
        { message: "Format jam operasional tidak valid (harus HH:MM - HH:MM)" },
        { status: 400 },
      );
    }

    let hashKey = undefined;
    if (body.keyLocation && body.keyLocation.trim() !== "") {
      if (containsEmoji(body.keyLocation)) {
        return NextResponse.json(
          { message: "Key Location tidak boleh mengandung emoji" },
          { status: 400 },
        );
      }
      if (body.keyLocation.length < 4) {
        return NextResponse.json(
          { message: "Key Location minimal terdiri dari 4 karakter" },
          { status: 400 },
        );
      }
      if (body.keyLocation.length > 12) {
        return NextResponse.json(
          { message: "Key Location maksimal terdiri dari 12 karakter" },
          { status: 400 },
        );
      }
      const GENERAL_PASSCODE = process.env.GENERAL_PASSCODE;
      if (body.keyLocation === GENERAL_PASSCODE) {
        return NextResponse.json(
          { message: "Passcode yang digunakan adalah Passcode Admin Pusat" },
          { status: 400 },
        );
      }
      hashKey = await bcrypt.hash(body.keyLocation, 10);
    }

    const isExist = await prisma.place.findFirst({
      where: { id: Number(body.id) },
    });

    if (!isExist) {
      return NextResponse.json(
        { message: "Lokasi tidak ditemukan" },
        { status: 404 },
      );
    }

    const isDuplicate = await prisma.place.findFirst({
      where: {
        name: body.locationName,
        NOT: { id: Number(body.id) },
      },
    });

    if (isDuplicate) {
      return NextResponse.json(
        { message: "Nama lokasi sudah digunakan" },
        { status: 400 },
      );
    }

    await prisma.place.update({
      where: { id: Number(body.id) },
      data: {
        name: body.locationName,
        address: body.address,
        managerName: body.managerName,
        managerPhone: body.managerPhone,
        operationalJam: body.operationalJam,
        latitude: body.latitude,
        longitude: body.longitude,
        ...(hashKey && { keyLocation: hashKey }),
      },
    });

    return NextResponse.json(
      { message: "Lokasi berhasil diupdate" },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Gagal mengupdate lokasi" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  return (await protect(updateLokasi, ["admin"]))(req);
}
