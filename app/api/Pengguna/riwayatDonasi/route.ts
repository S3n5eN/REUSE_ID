import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";

async function getRiwayatDonasi(req: NextRequest, decoded: { id: string }) {
  try {
    const userId = Number(decoded.id);

    // Query data item (barang donasi) milik user tersebut
    const riwayatDonasi = await prisma.item.findMany({
      where: {
        userId: userId,
      },
      include: {
        // Ambil juga nama tempat donasi dari relasi place
        place: {
          select: {
            name: true,
          },
        },
        // Opsional: Ambil status pengiriman jika diperlukan
        shipment: {
          select: {
            status: true,
            deliveredDate: true,
            type: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc", // Urutkan dari donasi terbaru
      },
    });

    // Format ulang data agar lebih mudah dibaca oleh frontend
    const formattedData = riwayatDonasi.map((item) => ({
      id: item.id,
      namaBarang: item.name,
      kategori: item.category,
      deskripsi: item.description,
      statusBarang: item.status, // PendingApproval, Tersedia, Diambil, Ditolak
      kualitas: item.quality || "-",
      tanggalDonasi: item.createdAt,
      tempatDonasi: item.place?.name || "Belum ditentukan",
      // Karena 1 item bisa memiliki beberapa record shipment (misal pickup & delivery)
      shipment: item.shipment.length > 0 ? item.shipment : null, 
    }));

    return NextResponse.json(
      {
        success: true,
        message: "Berhasil mengambil riwayat donasi",
        data: formattedData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching riwayat donasi:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return (await protect(getRiwayatDonasi, ["user"]))(req);
}