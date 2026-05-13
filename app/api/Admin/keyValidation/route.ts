import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { protect } from "@/lib/protect";

const GENERAL_PASSCODE = "guapunyaduitguapunyakuasa"

async function validateKey(req: NextRequest, decoded: { id: string }) {
  try {
    const { keyLocation } = await req.json();

    if (!keyLocation) {
      return NextResponse.json(
        { message: "Key lokasi harus diisi" },
        { status: 400 },
      );
    }

    if (keyLocation === GENERAL_PASSCODE){
      const response = NextResponse.json(
      {
        message:"Key general valid",isGeneral:true
      },
      {status:200},
    );
    response.cookies.set("placeId","",{
      httpOnly:true,
      path: "/",
      maxAge: 0,
    });
    return response;
    }

    const places = await prisma.place.findMany({
        select: {
            id: true,
            keyLocation: true
        }
    });

    const place = await Promise.all(
      places.map(async (p) => {
        const isValid = await bcrypt.compare(keyLocation, p.keyLocation);
        return isValid ? p : null;
      }),
    ).then((results) => results.find((p) => p !== null));

    if (!place) {
        return NextResponse.json(
            { message: "Key lokasi tidak valid" },
            { status: 401 },
        );
    }

    const response =NextResponse.json(
      { message: "Key lokasi valid" },
      { status: 200 },
    );

    response.cookies.set("placeId", String(place.id), {
      httpOnly: true,
      path: "/"
    })

    return response;
  } catch {
    return NextResponse.json(
      { message: "Terjadi kesalahan saat memproses permintaan" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
    return (await protect(validateKey, ["admin"]))(req);
}