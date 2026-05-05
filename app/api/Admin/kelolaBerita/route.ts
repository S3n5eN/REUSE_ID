import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import { Berita } from "@/types/berita";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";


async function tambahBerita(req: NextRequest, decoded: { id: string}) {
    try {
        const formData = await req.formData();

        const data: Pick<Berita, "title" | "imageUrl"> = {
            title: formData.get("title") as string,
            imageUrl: "",
        }

        const foto = formData.get("foto") as File;

        if (!data.title || !foto) {
            return NextResponse.json({ message: "Data Tidak Lengkap"}, { status: 400})
        }

        const fileName = `${randomUUID()}-${foto.name}`;
        const buffer = new Uint8Array(await foto.arrayBuffer());

        await fs.mkdir("public/uploads/berita", { recursive: true });
        await fs.writeFile(`public/uploads/berita/${fileName}`, buffer);

        data.imageUrl = `/uploads/berita/${fileName}`;

        const berita = await prisma.news.create({
            data: {
                title: data.title,
                image: data.imageUrl,
                adminId: Number(decoded.id),
            }
        })
        return NextResponse.json({message: "Berita berhasil ditambahkan", berita}, { status: 201})
    } catch {
        return NextResponse.json({message: "gagal menambahkan berita"}, {status: 500});
    }
}

export async function POST(req: NextRequest) {
    return (await protect(tambahBerita, ["admin"]))(req);
}