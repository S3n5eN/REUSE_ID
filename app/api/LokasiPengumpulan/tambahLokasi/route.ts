import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import { lokasiPengumpulan } from "@/types/lokasiPengumpulan";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

async function tambahLokasi(req: NextRequest) {
  try {
    const body: lokasiPengumpulan = await req.json();
    // ==== Cek apakah semua data yang diminta sudah terisi ====
    if (
      !body.locationName ||
      !body.address ||
      !body.managerName ||
      !body.keyLocation ||
      !body.managerPhone ||
      !body.operationalJam ||
      !body.latitude ||
      !body.longitude
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
    // Ini kalau    nama lokasi mengandung emoji
    if (containsEmoji(body.locationName)) {
      return NextResponse.json(
        { message: "Nama lokasi tidak boleh mengandung emoji" },
        { status: 400 },
      );
    }

    // Ini kalau nama lokasi panjangnya kurang dari 4 karakter
    if (body.locationName.length < 4) {
      return NextResponse.json(
        { message: "Nama lokasi minimal terdiri dari 4 karakter" },
        { status: 400 },
      );
    }

    // Ini kalau nama lokasi panjangnya lebih dari 50 karakter
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

    // Ini kalau alamat panjangnya kurang dari 10 karakter
    if (body.address.length < 10) {
      return NextResponse.json(
        { message: "Alamat minimal terdiri dari 10 karakter" },
        { status: 400 },
      );
    }

    // Ini kalau alamat panjangnya lebih dari 200 karakter
    if (body.address.length > 200) {
      return NextResponse.json(
        { message: "Alamat maksimal terdiri dari 200 karakter" },
        { status: 400 },
      );
    }

    // Validasi manager name
    // Ini kalau nama manajer mengandung emoji
    if (containsEmoji(body.managerName)) {
      return NextResponse.json(
        { message: "Nama manajer tidak boleh mengandung emoji" },
        { status: 400 },
      );
    }

    // Ini kalau nama manajer mengandung karakter selain huruf alfabet
    if (!/^[A-Za-z\s]+$/.test(body.managerName)) {
      return NextResponse.json(
        { message: "Nama manajer hanya boleh berisi huruf alfabet" },
        { status: 400 },
      );
    }

    // Ini kalau nama manajer panjangnya kurang dari 4 karakter
    if (body.managerName.length < 4) {
      return NextResponse.json(
        { message: "Nama manajer minimal terdiri dari 4 karakter" },
        { status: 400 },
      );
    }

    // Ini kalau nama manajer panjangnya lebih dari 30 karakter
    if (body.managerName.length > 30) {
      return NextResponse.json(
        { message: "Nama manajer maksimal terdiri dari 30 karakter" },
        { status: 400 },
      );
    }

    // Validasi managerPhone
    if (!/^\+?\d{9,15}$/.test(body.managerPhone)) {
      return NextResponse.json(
        {
          message:
            "Nomor telepon manajer tidak valid (hanya boleh angka 9-15 digit)",
        },
        { status: 400 },
      );
    }

    // ==== Validasi Jam Operasional ====
    const timeRangeRegex = /^\d{2}:\d{2} - \d{2}:\d{2}$/;
    if (!timeRangeRegex.test(body.operationalJam)) {
      return NextResponse.json(
        { message: "Format jam operasional tidak valid (harus HH:MM - HH:MM)" },
        { status: 400 },
      );
    }

    // Validasi KeyLocation
    if (containsEmoji(body.keyLocation)) {
      return NextResponse.json(
        { message: "Passkey tidak boleh mengandung emoji" },
        { status: 400 },
      );
    }
    if (body.keyLocation.length < 4) {
      return NextResponse.json(
        { message: "Passkey minimal terdiri dari 4 karakter" },
        { status: 400 },
      );
    }
    if (body.keyLocation.length > 12) {
      return NextResponse.json(
        { message: "Passkey maksimal terdiri dari 12 karakter" },
        { status: 400 },
      );
    }

    const isExist = await prisma.place.findFirst({
      where: { name: body.locationName },
    });

    if (isExist) {
      return NextResponse.json(
        { message: "Nama lokasi pengumpulan sudah ada" },
        { status: 400 },
      );
    }

    const allPlaces = await prisma.place.findMany({
      select: { id: true, keyLocation: true },
    });

    const isDuplicateKey = await Promise.all(
      allPlaces.map(async (p) => {
        return await bcrypt.compare(body.keyLocation, p.keyLocation);
      }),
    ).then((results) => results.some((r) => r === true));

    if (isDuplicateKey) {
      return NextResponse.json(
        { message: "Passkey harus unik" },
        { status: 400 },
      );
    }
    const GENERAL_PASSCODE = process.env.KEY_PUSAT;
    if (body.keyLocation === GENERAL_PASSCODE) {
      return NextResponse.json(
        { message: "Passkey harus unik" },
        { status: 400 },
      );
    }

    const hashKey = await bcrypt.hash(body.keyLocation, 10);

    await prisma.place.create({
      data: {
        name: body.locationName,
        address: body.address,
        managerName: body.managerName,
        keyLocation: hashKey,
        managerPhone: body.managerPhone,
        operationalJam: body.operationalJam,
        latitude: body.latitude,
        longitude: body.longitude,
      },
    });
    return NextResponse.json(
      { message: "Lokasi pengumpulan berhasil ditambahkan" },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { message: "Gagal menambahkan lokasi pengumpulan" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  return (await protect(tambahLokasi, ["admin"]))(req);
}
