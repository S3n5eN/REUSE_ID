import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import { Berita } from "@/types/berita";
import { NextRequest, NextResponse } from "next/server";
import { Buffer } from "buffer";
import sharp from "sharp";

async function tambahBerita(req: NextRequest, decoded: { id: string}) {
    try {
        const formData = await req.formData();

        const data: Pick<Berita, "title" | "imageUrl"> = {
            title: formData.get("title") as string,
            imageUrl: "",
        }

        const foto = formData.get("foto") as File;

        const MAX_FILE_SIZE = 5 * 1024 * 1024; // MAX 5 MB AJAA
        if (foto.size > MAX_FILE_SIZE) {
            return NextResponse.json({ message: "Ukuran gambar terlalu besar! Maksimal 5 MB."}, { status: 400})
        }

        const validTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!validTypes.includes(foto.type)) {
            return NextResponse.json({ message: "Format gambar tidak didukung"}, { status: 400})
        }

        if (!data.title || !foto) {
            return NextResponse.json({ message: "Data Tidak Lengkap"}, { status: 400})
        }

        const arrayBuffer = await foto.arrayBuffer();
        const originalBuffer = Buffer.from(arrayBuffer);

        // ==== Kompres gambar ke webp bair kecil sizenya ====
        const webpBuffer = await sharp(originalBuffer)
            .resize({ width: 800, withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer();

        await prisma.news.create({
            data: {
                title: data.title,
                imageData: webpBuffer,
                imageType: 'image/webp',
                adminId: Number(decoded.id),
            }
        })
        return NextResponse.json({message: "Berita berhasil ditambahkan"}, { status: 201})
    } catch {
        return NextResponse.json({message: "gagal menambahkan berita"}, {status: 500});
    }
}

export async function POST(req: NextRequest) {
    return (await protect(tambahBerita, ["admin"]))(req);
}