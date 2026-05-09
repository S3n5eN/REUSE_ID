import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import { NextRequest, NextResponse } from "next/server";

async function getProfile(
  req: NextRequest,
  decoded: { id: string }
) {

  try {

    const userId = Number(decoded.id);

    const profile =
      await prisma.userProfile.findFirst({

        where: {
          userId: userId
        }
      });

    // ==========================
    // BELUM ISI DATA DIRI
    // ==========================

    if (!profile) {

      return NextResponse.json({

        hasProfile: false,

        isVerified: false,

        message:
          "Silahkan isi data diri terlebih dahulu"

      });
    }

    // ==========================
    // BELUM DIVERIFIKASI
    // ==========================

    if (!profile.isVerified) {

      return NextResponse.json({

        hasProfile: true,

        isVerified: false,

        message:
          "Data diri sedang diverifikasi admin"

      });
    }

    // ==========================
    // SUDAH VERIFIED
    // ==========================

    return NextResponse.json({

      hasProfile: true,

      isVerified: true,

      data: profile,

      message:
        "Berhasil mengambil profile"

    });

  } catch (error: any) {

    console.error(
      "ERROR GET PROFILE:",
      error
    );

    return NextResponse.json(

      {
        message:
          "Gagal mengambil profile"
      },

      {
        status: 500
      }
    );
  }
}

export async function GET(
  req: NextRequest
) {

  return (
    await protect(
      getProfile,
      ["user"]
    )
  )(req);
}