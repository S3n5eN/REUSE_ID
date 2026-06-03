import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import { NextRequest, NextResponse } from "next/server";
import { hitungJarak, hitungOngkir } from "@/lib/distance";

async function pilihPengiriman(req: NextRequest, decoded: { id: string }) {
  try {
    const {
      shipmentId,
      jenisPengiriman,
      paymentMethod,
      transferBankCode,
      transferBankName,
      transferAccountNumber,
      transferAccountHolder,
    } = await req.json();

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

    // Ambil profile pengguna untuk mendapatkan alamat dan koordinat yang terverifikasi
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: Number(decoded.id) },
    });

    if (jenisPengiriman === "delivery" && (!userProfile || !userProfile.address || userProfile.latitude === null || userProfile.longitude === null)) {
      return NextResponse.json(
        { message: "Profil data diri atau alamat pengiriman Anda belum lengkap" },
        { status: 400 },
      );
    }

    // ==== validasi kalau delivery tapi parameter kurang ====
    if (jenisPengiriman === "delivery" && !paymentMethod) {
      return NextResponse.json(
        { message: "Metode pembayaran diperlukan untuk pengiriman delivery" },
        { status: 400 },
      );
    }

    if (jenisPengiriman === "delivery" && paymentMethod !== "ATM") {
      return NextResponse.json(
        { message: "Metode pembayaran hanya mendukung transfer ATM" },
        { status: 400 },
      );
    }

    const allowedBanks = {
      BCA: { name: "Bank Central Asia", accountNumber: "1234567890", holder: "REUSEID INDONESIA" },
      BNI: { name: "Bank Negara Indonesia", accountNumber: "8800123456", holder: "REUSEID INDONESIA" },
      BRI: { name: "Bank Rakyat Indonesia", accountNumber: "002301234567890", holder: "REUSEID INDONESIA" },
      MANDIRI: { name: "Bank Mandiri", accountNumber: "1410012345678", holder: "REUSEID INDONESIA" },
    };

    if (jenisPengiriman === "delivery") {
      const bankInfo = allowedBanks[transferBankCode as keyof typeof allowedBanks];
      if (
        !bankInfo ||
        transferBankName !== bankInfo.name ||
        transferAccountNumber !== bankInfo.accountNumber ||
        transferAccountHolder !== bankInfo.holder
      ) {
        return NextResponse.json(
          { message: "Data bank transfer tidak valid" },
          { status: 400 },
        );
      }
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
    let paymentInvoice = null;
    let paymentTotal = null;
    let paymentExpiredAt = null;

    // Kalkulasi jarak dan ongkir di server (agar aman tidak dimanipulasi)
    if (jenisPengiriman === "delivery" && userProfile) {
      const placeLat = shipment.item.place?.latitude;
      const placeLng = shipment.item.place?.longitude;

      if (placeLat === null || placeLng === null || placeLat === undefined || placeLng === undefined) {
        return NextResponse.json({ message: "Koordinat gudang belum diatur, tidak bisa kalkulasi ongkir" }, { status: 400 });
      }

      distance = hitungJarak(userProfile.latitude!, userProfile.longitude!, placeLat, placeLng);
      shipmentCost = hitungOngkir(distance, shipment.item.weight || 1);
      paymentInvoice = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(shipment.id).padStart(6, "0")}`;
      paymentTotal = shipmentCost;
      paymentExpiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    const updateShipment = await prisma.shipment.update({
      where: { id: Number(shipmentId) },
      data: {
        claimType: jenisPengiriman,
        receiverAddress: jenisPengiriman === "delivery" ? userProfile?.address : null,
        deliveryLat: jenisPengiriman === "delivery" ? userProfile?.latitude : null,
        deliveryLng: jenisPengiriman === "delivery" ? userProfile?.longitude : null,
        paymentMethod: jenisPengiriman === "delivery" ? paymentMethod : null,
        paymentStatus: jenisPengiriman === "delivery" ? "Unpaid" : "Paid",
        distance: distance,
        shipmentCost: shipmentCost,
        paymentInvoice,
        paymentTotal,
        paymentExpiredAt,
        transferBankCode: jenisPengiriman === "delivery" ? transferBankCode : null,
        transferBankName: jenisPengiriman === "delivery" ? transferBankName : null,
        transferAccountNumber: jenisPengiriman === "delivery" ? transferAccountNumber : null,
        transferAccountHolder: jenisPengiriman === "delivery" ? transferAccountHolder : null,
        status: "Approved"
      }
    });

    return NextResponse.json(
      { message: "Jenis pengiriman berhasil dipilih", shipment: updateShipment },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Terjadi kesalahan saat memilih jenis pengiriman" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  return (await protect(pilihPengiriman, ["user"]))(req);
}
