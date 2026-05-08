import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import { NextRequest, NextResponse } from "next/server";

async function getDashboard(req: NextRequest) {
  try {

    const [
      totalItem,
      pendingItem,
      totalTersedia,
      totalPlace,
      totalDiambil,
      pendingList,
      shipmentStatus
    ] = await Promise.all([

      // TOTAL ITEM
      prisma.item.count(),

      // ITEM PENDING APPROVAL
      prisma.item.count({
        where: {
          status: "PendingApproval"
        }
      }),

      // ITEM TERSEDIA
      prisma.item.count({
        where: {
          status: "Tersedia"
        }
      }),

      // TOTAL PLACE
      prisma.place.count(),

      // ITEM SUDAH DIAMBIL
      prisma.shipment.count({
        where: {
          status: "Delivered"
        }
      }),

      // TABEL PENDING
      prisma.item.findMany({
        where: {
          status: "PendingApproval"
        },

        include: {
          user: {
            select: {
              name: true
            }
          }
        },

        orderBy: {
          createdAt: "desc"
        },

        take: 5
      }),

      // DONUT CHART SHIPMENT STATUS
      prisma.shipment.groupBy({
        by: ["status"],
        
        where: {type: "claim"},

        _count: {
          status: true,
        }
      })
    ]);

    return NextResponse.json({

      // SUMMARY
      totalItem,
      pendingItem,
      totalTersedia,
      totalPlace,
      totalDiambil,

      // TABLE
      pendingList,

      // DONUT CHART
      shipmentStatus
    });

  } catch (error) {

    console.error("ERROR DASHBOARD:", error);

    return NextResponse.json(
      {
        message: "Gagal mengambil dashboard"
      },
      {
        status: 500
      }
    );
  }
}

export async function GET(req: NextRequest) {
  return (await protect(getDashboard, ["admin"]))(req);
}