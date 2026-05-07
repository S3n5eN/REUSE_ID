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
        imageData: webpBuffer,
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
    console.log("Error menyimpan barang:", error);
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
