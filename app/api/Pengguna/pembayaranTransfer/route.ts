import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import { NextRequest, NextResponse } from "next/server";

async function getPembayaranTransfer(req: NextRequest, decoded: { id: string }) {
  try {
    const shipmentId = req.nextUrl.searchParams.get("shipmentId");

    if (!shipmentId) {
      return NextResponse.json({ message: "Shipment ID dibutuhkan" }, { status: 400 });
    }

    const shipment = await prisma.shipment.findFirst({
      where: {
        id: Number(shipmentId),
        userId: Number(decoded.id),
        type: "claim",
        claimType: "delivery",
      },
      select: {
        id: true,
        paymentInvoice: true,
        paymentMethod: true,
        paymentStatus: true,
        paymentTotal: true,
        paymentExpiredAt: true,
        shipmentCost: true,
        distance: true,
        transferBankCode: true,
        transferBankName: true,
        transferAccountNumber: true,
        transferAccountHolder: true,
        payerBank: true,
        payerAccountName: true,
        transferProofUploadedAt: true,
        item: {
          select: {
            name: true,
            place: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!shipment) {
      return NextResponse.json({ message: "Data pembayaran tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ message: "Berhasil mengambil data pembayaran", data: shipment });
  } catch {
    return NextResponse.json({ message: "Gagal mengambil data pembayaran" }, { status: 500 });
  }
}

async function uploadBuktiTransfer(req: NextRequest, decoded: { id: string }) {
  try {
    const formData = await req.formData();
    const shipmentId = formData.get("shipmentId");
    const payerBank = formData.get("payerBank");
    const payerAccountName = formData.get("payerAccountName");
    const proof = formData.get("proof");

    if (!shipmentId || !payerBank || !payerAccountName || !(proof instanceof File)) {
      return NextResponse.json(
        { message: "Shipment ID, bank pengirim, nama pemilik rekening, dan bukti transfer wajib diisi" },
        { status: 400 },
      );
    }

    if (!proof.type.startsWith("image/")) {
      return NextResponse.json({ message: "Bukti transfer harus berupa gambar" }, { status: 400 });
    }

    if (proof.size > 2 * 1024 * 1024) {
      return NextResponse.json({ message: "Ukuran bukti transfer maksimal 2MB" }, { status: 400 });
    }

    const shipment = await prisma.shipment.findFirst({
      where: {
        id: Number(shipmentId),
        userId: Number(decoded.id),
        type: "claim",
        claimType: "delivery",
      },
    });

    if (!shipment) {
      return NextResponse.json({ message: "Data pembayaran tidak ditemukan" }, { status: 404 });
    }

    if (shipment.paymentExpiredAt && shipment.paymentExpiredAt < new Date()) {
      return NextResponse.json({ message: "Batas waktu pembayaran sudah lewat" }, { status: 400 });
    }

    if (shipment.paymentStatus === "Paid") {
      return NextResponse.json({ message: "Pembayaran sudah diverifikasi" }, { status: 400 });
    }

    const bytes = Buffer.from(await proof.arrayBuffer());

    const updated = await prisma.shipment.update({
      where: { id: Number(shipmentId) },
      data: {
        payerBank: String(payerBank),
        payerAccountName: String(payerAccountName),
        transferProofImage: bytes,
        transferProofType: proof.type,
        transferProofUploadedAt: new Date(),
        paymentStatus: "WaitingVerification",
      },
      select: {
        id: true,
        paymentStatus: true,
        transferProofUploadedAt: true,
      },
    });

    return NextResponse.json({ message: "Bukti transfer berhasil diupload", data: updated });
  } catch {
    return NextResponse.json({ message: "Gagal upload bukti transfer" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return (await protect(getPembayaranTransfer, ["user"]))(req);
}

export async function POST(req: NextRequest) {
  return (await protect(uploadBuktiTransfer, ["user"]))(req);
}
