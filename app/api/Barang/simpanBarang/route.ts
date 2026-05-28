import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import { Barang } from "@/types/Barang";
import { NextRequest, NextResponse } from "next/server";
import { Buffer } from "buffer";
import sharp from "sharp";

async function simpanBarang(req: NextRequest, decoded: { id: string }) {
  try {
    const formData = await req.formData();

    const data: Pick<
      Barang,
      "name" | "desc" | "foto" | "category" | "placeId"
    > = {
      name: formData.get("name") as string,
      desc: formData.get("desc") as string,
      foto: "",
      category: formData.get("category") as string,
      placeId: formData.get("placeId") as string,
    };

    const foto = formData.get("foto") as File;

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // MAX 5 MB AJAA
    if (foto.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: "Ukuran gambar terlalu besar! Maksimal 5 MB." },
        { status: 400 },
      );
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(foto.type)) {
      return NextResponse.json(
        { message: "Format gambar tidak didukung" },
        { status: 400 },
      );
    }

    if (!data.name || !data.desc || !foto || !data.category || !data.placeId) {
      return NextResponse.json(
        { message: "Data Tidak Lengkap" },
        { status: 400 },
      );
    }

    const nameContainsEmoji = /\p{Extended_Pictographic}/u.test(data.name);

    // Ini kalau nama barang mengandung emoji
    if (nameContainsEmoji) {
      return NextResponse.json(
        { message: "Nama barang tidak boleh mengandung emoji" },
        { status: 400 },
      );
    }

    // Ini kalau nama barang panjangnya kurang dari 8 karakter
    if (data.name.length < 8) {
      return NextResponse.json(
        { message: "Nama barang minimal terdiri dari 8 karakter" },
        { status: 400 },
      );
    }

    // Ini kalau nama barang panjangnya lebih dari 30 karakter
    if (data.name.length > 30) {
      return NextResponse.json(
        { message: "Nama barang maksimal terdiri dari 30 karakter" },
        { status: 400 },
      );
    }

    const descContainsEmoji = /\p{Extended_Pictographic}/u.test(data.desc);

    // Ini kalau deskripsi barang mengandung emoji
    if (descContainsEmoji) {
      return NextResponse.json(
        { message: "Deskripsi barang tidak boleh mengandung emoji" },
        { status: 400 },
      );
    }

    // Ini kalau deskripsi barang panjangnya kurang dari 10 karakter
    if (data.desc.length < 10) {
      return NextResponse.json(
        { message: "Deskripsi barang minimal terdiri dari 10 karakter" },
        { status: 400 },
      );
    }

    // Ini kalau deskripsi barang panjangnya lebih dari 255 karakter
    if (data.desc.length > 255) {
      return NextResponse.json(
        { message: "Deskripsi barang maksimal terdiri dari 255 karakter" },
        { status: 400 },
      );
    }

    const arrayBuffer = await foto.arrayBuffer();
    const originalBuffer = Buffer.from(arrayBuffer);

    // ==== Kompres gambar menggunakan sharp ke format WebP, ini biar ketika masuk ke database tidak terlalu besar ====
    const webpBuffer = await sharp(originalBuffer)
      .resize({ width: 800, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    // ==== Simpan data barang ke database ====
    const barang = await prisma.item.create({
      data: {
        name: data.name,
        description: data.desc,
        imageData: new Uint8Array(webpBuffer),
        imageType: "image/webp",
        category: data.category,
        userId: Number(decoded.id),
        placeId: Number(data.placeId),
      },
    });

    // ==== Setelah barang tersimpan, buat shipment ====
    await prisma.shipment.create({
      data: {
        itemId: Number(barang.id),
        userId: Number(decoded.id),
        type: "Donation",
        status: "Pending",
      },
    });

    return NextResponse.json(
      { message: "Barang berhasil disimpan" },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Gagal menyimpan barang" },
      { status: 500 },
    );
  }
}

// ==== ini Biar user doang yang bisa akses route / API ini ====
export async function POST(req: NextRequest) {
  return (await protect(simpanBarang, ["user"]))(req);
}
