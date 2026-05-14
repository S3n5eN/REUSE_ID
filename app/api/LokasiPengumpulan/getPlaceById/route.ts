import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import { NextRequest, NextResponse } from "next/server";

async function getPlaceById(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const placeId = searchParams.get("placeId");

        if (!placeId) {
            return NextResponse.json({ message: "Parameter placeId diperlukan" }, { status: 400 });
        }

        const place = await prisma.place.findUnique({
            where: { id: Number(placeId) },
            select: {
                latitude:true,
                longitude: true
            }
        })

        if (!place) {
            return NextResponse.json({ message: "Lokasi tidak ditemukan" }, { status: 404 });
        }

        return NextResponse.json({ 
            latitude: place.latitude, 
            longitude: place.longitude 
        }, { status: 200 });
    } catch {
        return NextResponse.json({ message: "Terjadi kesalahan saat mengambil data lokasi" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    return (await protect(getPlaceById, ["user", "admin"]))(req);
}