import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import { NextRequest, NextResponse } from "next/server";


async function getPenerimaApprove(decoded: { id: number }) {
    try {
        const response = await prisma.shipment.findMany({
            where: {
                claimType: { not: null },
                status: "Approved",
                type: "claim"
            },
            include: {
                userProfile: true,
                item: {
                    select: {
                        name: true
                    }
                }
            }
        });

        return NextResponse.json({ message: "Berhasil mengambil data penerima approve", data: response }, { status: 200 })
    } catch (error) {
        console.error("Error fetching approved recipients:", error);
        return NextResponse.json({ message: "Gagal mengambil data penerima approve" }, { status: 500 })
    }
}

export async function GET(req: NextRequest) {
    return (await protect(getPenerimaApprove, ["admin"]))(req);
}