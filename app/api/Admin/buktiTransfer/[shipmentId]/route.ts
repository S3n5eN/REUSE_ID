import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import { NextRequest, NextResponse } from "next/server";

async function getBuktiTransfer(
  req: NextRequest,
) {
  try {
    const shipmentId = req.nextUrl.pathname.split("/").pop();

    if (!shipmentId) {
      return NextResponse.json({ message: "Shipment ID dibutuhkan" }, { status: 400 });
    }

    const shipment = await prisma.shipment.findUnique({
      where: { id: Number(shipmentId) },
      select: {
        transferProofImage: true,
        transferProofType: true,
      },
    });

    if (!shipment?.transferProofImage || !shipment.transferProofType) {
      return NextResponse.json({ message: "Bukti transfer tidak ditemukan" }, { status: 404 });
    }

    return new NextResponse(Buffer.from(shipment.transferProofImage), {
      headers: {
        "Content-Type": shipment.transferProofType,
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch {
    return NextResponse.json({ message: "Gagal mengambil bukti transfer" }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
) {
  return (await protect(getBuktiTransfer, ["admin"]))(req);
}
