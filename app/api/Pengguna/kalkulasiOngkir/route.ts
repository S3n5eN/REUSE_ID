import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import { NextRequest, NextResponse } from "next/server";
import { hitungJarak, hitungOngkir } from "@/lib/distance";

async function kalkulasiOngkir(req: NextRequest, decoded: { id: string }) {
    try {
        const { searchParams } = new URL(req.url);
        const itemId = searchParams.get("itemId");
        const lat = searchParams.get("lat");
        const lng = searchParams.get("lng");

        if (!itemId || !lat || !lng) {
            return NextResponse.json({ message: "Parameter itemId, lat, dan lng diperlukan" }, { status: 400 });
        }

        const item = await prisma.item.findUnique({
            where: { id: Number(itemId) },
            include: { place: true }
        });

        if (!item || !item.place) {
            return NextResponse.json({ message: "Item atau lokasi gudang tidak ditemukan" }, { status: 404 });
        }

        const placeLat = item.place.latitude;
        const placeLng = item.place.longitude;

        if (placeLat === null || placeLng === null) {
            return NextResponse.json({ message: "Koordinat gudang belum diatur" }, { status: 400 });
        }

        const distance = hitungJarak(Number(lat), Number(lng), placeLat, placeLng);
        const ongkir = hitungOngkir(distance, item.weight || 1);

        return NextResponse.json({ 
            distance: distance, 
            ongkir: ongkir 
        }, { status: 200 });
    } catch {
        return NextResponse.json({ message: "Terjadi kesalahan saat mengkalkulasi ongkos kirim" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    return (await protect(kalkulasiOngkir, ["user"]))(req);
}