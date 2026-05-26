import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import { NextRequest, NextResponse } from "next/server";
import { Buffer } from "buffer";
import sharp from "sharp";

async function getBerita(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const news = await prisma.news.findMany({
      where: status === "published"
        ? { isPublished: true }
        : status === "pending"
        ? { isPublished: false }
        : undefined,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        caption:true,
        imageType: true,
        createdAt: true,
        isPublished: true,
        admin: { select: { name: true } },
      },
    });

    return NextResponse.json(news);
  } catch {
    return NextResponse.json({ message: "Gagal mengambil berita" }, { status: 500 });
  }
}

async function tambahBerita(req: NextRequest, decoded: { id: string }) {
  try {
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const foto = formData.get("foto") as File;
    const caption = formData.get("caption") as string;

    if (!title || !foto) {
      return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (foto.size > MAX_FILE_SIZE) {
      return NextResponse.json({ message: "Ukuran gambar terlalu besar! Maksimal 5 MB." }, { status: 400 });
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(foto.type)) {
      return NextResponse.json({ message: "Format gambar tidak didukung" }, { status: 400 });
    }

    const arrayBuffer = await foto.arrayBuffer();
    const originalBuffer = Buffer.from(arrayBuffer);

    const webpBuffer = await sharp(originalBuffer)
      .resize({ width: 800, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    await prisma.news.create({
      data: {
        title,
        caption: caption || null,
        imageData: new Uint8Array(webpBuffer),
        imageType: "image/webp",
        adminId: Number(decoded.id),
        isPublished: false,
      },
    });

    return NextResponse.json({ message: "Berita berhasil ditambahkan" }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Gagal menambahkan berita" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return (await protect(getBerita, ["admin"]))(req);
}

export async function POST(req: NextRequest) {
  return (await protect(tambahBerita, ["admin"]))(req);
}