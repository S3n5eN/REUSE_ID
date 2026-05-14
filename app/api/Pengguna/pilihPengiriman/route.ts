import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import { NextRequest, NextResponse } from "next/server";
import { hitungJarak, hitungOngkir } from "@/lib/distance";

async function pilihPengiriman(req: NextRequest, decoded: { id: string }) {
  try {
    const { shipmentId, jenisPengiriman, alamat, lat, lng, paymentMethod } = await req.json();

    if (!jenisPengiriman || !shipmentId) {
      return NextResponse.json(
        { message: "Jenis pengiriman dan ID pengiriman diperlukan" },
        { status: 400 },
      );
    }

    // ==== validasi jika jenis pengiriman diluar seharusnya ====
    if (!["pickup", "delivery"].includes(jenisPengiriman)) {
      return NextResponse.json(
        { message: "Jenis pengiriman tidak valid" },
        { status: 400 },
      );
    }

    // ==== validasi kalau delivery tapi parameter kurang ====
    if (jenisPengiriman === "delivery" && (!alamat || lat === undefined || lng === undefined || !paymentMethod)) {
      return NextResponse.json(
        { message: "Alamat, koordinat lokasi, dan metode pembayaran diperlukan untuk pengiriman delivery" },
        { status: 400 },
      );
    }

    const shipment = await prisma.shipment.findFirst({
      where: { id: Number(shipmentId), userId: Number(decoded.id), type: "claim", claimType: null },
      include: {
        item: {
          include: { place: true }
        }
      }
    });

    if (!shipment) {
      return NextResponse.json(
        { message: "Pengiriman tidak ditemukan atau jenis pengiriman sudah dipilih" },
        { status: 404 },
      );
    }

    let distance = null;
    let shipmentCost = null;

    // Kalkulasi jarak dan ongkir di server (agar aman tidak dimanipulasi)
    if (jenisPengiriman === "delivery") {
      const placeLat = shipment.item.place?.latitude;
      const placeLng = shipment.item.place?.longitude;
      
      if (placeLat === null || placeLng === null || placeLat === undefined || placeLng === undefined) {
          return NextResponse.json({ message: "Koordinat gudang belum diatur, tidak bisa kalkulasi ongkir" }, { status: 400 });
      }

      distance = hitungJarak(Number(lat), Number(lng), placeLat, placeLng);
      shipmentCost = hitungOngkir(distance, shipment.item.weight || 1);
    }

    const updateShipment = await prisma.shipment.update({
        where: { id: Number(shipmentId)},
        data: {
            claimType: jenisPengiriman,
            receiverAddress: jenisPengiriman === "delivery" ? alamat : null,
            deliveryLat: jenisPengiriman === "delivery" ? Number(lat) : null,
            deliveryLng: jenisPengiriman === "delivery" ? Number(lng) : null,
            paymentMethod: jenisPengiriman === "delivery" ? paymentMethod : null,
            paymentStatus: jenisPengiriman === "delivery" ? "Unpaid" : "Paid",
            distance: distance,
            shipmentCost: shipmentCost
        }
    });

    return NextResponse.json(
      { message: "Jenis pengiriman berhasil dipilih", shipment: updateShipment },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error memilih jenis pengiriman:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat memilih jenis pengiriman" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
    return (await protect(pilihPengiriman, ["user"]))(req);
}