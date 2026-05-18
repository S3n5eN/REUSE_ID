import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import { NextRequest, NextResponse } from "next/server";

async function getPembayaranMenunggu(req: NextRequest) {
  try {
    const placeId = req.cookies.get("placeId")?.value;

    if (!placeId) {
      return NextResponse.json(
        { message: "Place ID tidak ditemukan, pastikan sudah melakukan validasi key lokasi" },
        { status: 400 },
      );
    }

    const payments = await prisma.shipment.findMany({
      where: {
        type: "claim",
        claimType: "delivery",
        paymentStatus: "WaitingVerification",
        item: {
          placeId: Number(placeId),
        },
      },
      orderBy: { transferProofUploadedAt: "desc" },
      select: {
        id: true,
        paymentInvoice: true,
        paymentTotal: true,
        paymentStatus: true,
        paymentExpiredAt: true,
        shipmentCost: true,
        transferBankCode: true,
        transferBankName: true,
        transferAccountNumber: true,
        transferAccountHolder: true,
        payerBank: true,
        payerAccountName: true,
        transferProofUploadedAt: true,
        item: {
          select: {
            id: true,
            name: true,
            place: {
              select: {
                name: true,
              },
            },
          },
        },
        userProfile: {
          select: {
            namaLengkap: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json({ message: "Berhasil mengambil pembayaran", data: payments });
  } catch {
    return NextResponse.json({ message: "Gagal mengambil pembayaran" }, { status: 500 });
  }
}

async function verifikasiPembayaran(req: NextRequest, decoded: { id: string }) {
  try {
    const { shipmentId, action } = await req.json();

    if (!shipmentId || !action) {
      return NextResponse.json({ message: "Shipment ID dan action dibutuhkan" }, { status: 400 });
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ message: "Action tidak valid" }, { status: 400 });
    }

    const shipment = await prisma.shipment.findFirst({
      where: {
        id: Number(shipmentId),
        type: "claim",
        claimType: "delivery",
        paymentStatus: "WaitingVerification",
      },
    });

    if (!shipment) {
      return NextResponse.json({ message: "Pembayaran tidak ditemukan atau sudah diproses" }, { status: 404 });
    }

    const updated = await prisma.shipment.update({
      where: { id: Number(shipmentId) },
      data: {
        paymentStatus: action === "approve" ? "Paid" : "Failed",
        paymentVerifiedAt: action === "approve" ? new Date() : null,
        adminId: Number(decoded.id),
      },
      select: {
        id: true,
        paymentStatus: true,
      },
    });

    return NextResponse.json({
      message: action === "approve" ? "Pembayaran berhasil diverifikasi" : "Pembayaran ditolak",
      data: updated,
    });
  } catch {
    return NextResponse.json({ message: "Gagal memproses pembayaran" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return (await protect(getPembayaranMenunggu, ["admin"]))(req);
}

export async function POST(req: NextRequest) {
  return (await protect(verifikasiPembayaran, ["admin"]))(req);
}
