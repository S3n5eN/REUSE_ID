import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import { lokasiPengumpulan } from "@/types/lokasiPengumpulan";
import { NextRequest, NextResponse } from "next/server";

async function tambahLokasi(req: NextRequest){
    try {
        const body: lokasiPengumpulan = await req.json();

        // ==== Cek apakah semua data yang diminta sudah terisi ====
        if (!body.locationName || !body.address || !body.managerName || !body.managerPhone || !body.operationalJam) {
            return NextResponse.json({ message: "Semua field harus diisi" }, { status: 400 });
        }

        const isExist = await prisma.place.findFirst({
            where: { name: body.locationName}
        })

        if (isExist) {
            return NextResponse.json({ message: "Nama lokasi pengumpulan sudah ada" }, { status: 400 });
        }

        await prisma.place.create({
            data: {
                name: body.locationName,
                address: body.address,
                managerName: body.managerName,
                managerPhone: body.managerPhone,
                operationalJam: body.operationalJam
            }
        })
        return NextResponse.json({ message: "Lokasi pengumpulan berhasil ditambahkan" }, { status: 201 });
    } catch (error) {
        console.error("Error menambahkan lokasi pengumpulan:", error);
        return NextResponse.json({ message: "Gagal menambahkan lokasi pengumpulan" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    return (await protect(tambahLokasi, ["admin"]))(req);
}