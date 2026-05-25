import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import { NextRequest, NextResponse } from "next/server";

async function getDashboard(req: NextRequest) {
  try {
    const placeId = req.cookies.get("placeId")?.value;
    const isGeneral = !placeId || placeId === "";

    // if (!placeId) {
    //   return NextResponse.json(
    //     { message: "Place ID tidak ditemukan, pastikan sudah melakukan validasi key lokasi" },
    //     { status: 400 },
    //   );
    // }

    const [
      totalItem,
      pendingItem,
      totalTersedia,
      totalPlace,
      totalDiambil,
      pendingList,
      shipmentStatus,
      pendingPaymentCount,
      pendingPaymentList
    ] = await Promise.all([

      // TOTAL ITEM
      prisma.item.count(),

      // ITEM PENDING APPROVAL
      prisma.item.count({
        where: {
          status: "PendingApproval",
          ...(isGeneral ? {} : {placeId: Number(placeId)}),
        }
      }),

      // ITEM TERSEDIA
      prisma.item.count({
        where: {
          status: "Tersedia",
          ...(isGeneral ? {} :{placeId: Number(placeId)}),
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
          status: "PendingApproval",
          ...(isGeneral ? {} : { placeId: Number(placeId) }),
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
        
        where: {type: "claim",...(isGeneral ? {} : { item: {placeId: Number(placeId)} }),
      },

        _count: 
          {status: true}
        
      }),

      // TOTAL PEMBAYARAN TERTUNDA
      prisma.shipment.count({
        where: {
          type: "claim",
          claimType: "delivery",
          paymentStatus: "WaitingVerification",
          ...(isGeneral ? {} : { item: { placeId: Number(placeId) } }),
        }
      }),

      // LIST PEMBAYARAN TERTUNDA
      prisma.shipment.findMany({
        where: {
          type: "claim",
          claimType: "delivery",
          paymentStatus: "WaitingVerification",
          ...(isGeneral ? {} : { item: { placeId: Number(placeId) } }),
        },
        include: {
          user: {
            select: {
              name: true
            }
          },
          item: {
            select: {
              name: true,
              category: true
            }
          }
        },
        orderBy: {
          transferProofUploadedAt: "desc"
        },
        take: 5
      })
    ]);

    return NextResponse.json({

      // SUMMARY
      totalItem,
      pendingItem,
      totalTersedia,
      totalPlace,
      totalDiambil,
      pendingPaymentCount,

      // TABLE
      pendingList,
      pendingPaymentList,

      // DONUT CHART
      shipmentStatus
    });

  } catch (error) {
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