import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import {
  NextRequest,
  NextResponse,
} from "next/server";

async function verifikasiDataPenerima(
  req: NextRequest,
  decoded: { id: string },
) {

  try {

    const {
      userId,
      action
    } = await req.json();

    // ==========================
    // VALIDASI
    // ==========================

    if (!userId || !action) {

      return NextResponse.json(

        {
          message:
            "Data tidak lengkap"
        },

        {
          status: 400
        }
      );
    }

    // ==========================
    // VALIDASI ACTION
    // ==========================

    if (
      !["Approve", "Reject"]
      .includes(action)
    ) {

      return NextResponse.json(

        {
          message:
            "Action tidak valid"
        },

        {
          status: 400
        }
      );
    }

    // ==========================
    // CEK PROFILE
    // ==========================

    const profile =
      await prisma.userProfile.findFirst({

        where: {
          userId:
            Number(userId)
        }
      });

    if (!profile) {

      return NextResponse.json(

        {
          message:
            "Profile tidak ditemukan"
        },

        {
          status: 404
        }
      );
    }

    // ==========================
    // APPROVE
    // ==========================

    if (action === "Approve") {

      await prisma.userProfile.update({

        where: {
          id: profile.id
        },

        data: {

          isVerified: true,

          verifiedAt:
            new Date(),

          verifiedBy:
            Number(decoded.id),
        }
      });

      return NextResponse.json(

        {
          message:
            "Data penerima berhasil diverifikasi"
        },

        {
          status: 200
        }
      );
    }

    // ==========================
    // REJECT
    // ==========================

    if (action === "Reject") {

      await prisma.userProfile.delete({

        where: {
          id: profile.id
        }
      });

      return NextResponse.json(

        {
          message:
            "Data penerima ditolak"
        },

        {
          status: 200
        }
      );
    }

  } catch (error) {

    console.error(
      "Error verifikasi data penerima:",
      error
    );

    return NextResponse.json(

      {
        message:
          "Terjadi kesalahan pada server"
      },

      {
        status: 500
      }
    );
  }
}

export async function POST(
  req: NextRequest
) {

  return (
    await protect(
      verifikasiDataPenerima,
      ["admin"]
    )
  )(req);
}