import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { Buffer } from "buffer";

import fs from "fs";
import path from "path";

async function uploadPhoto(
  req: NextRequest,
  decoded: { id: string }
) {
  try {
    const userId = Number(decoded.id);

    const formData = await req.formData();

    const foto = formData.get("foto") as File;

    if (!foto) {
      return NextResponse.json(
        { message: "Foto wajib diupload" },
        { status: 400 }
      );
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024;

    if (foto.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: "Ukuran gambar maksimal 5MB" },
        { status: 400 }
      );
    }

    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!validTypes.includes(foto.type)) {
      return NextResponse.json(
        { message: "Format gambar tidak didukung" },
        { status: 400 }
      );
    }

    const arrayBuffer = await foto.arrayBuffer();

    const originalBuffer = Buffer.from(arrayBuffer);

    // tetap pakai sharp
    const webpBuffer = await sharp(originalBuffer)
      .resize({
        width: 500,
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer();

    const profile = await prisma.userProfile.findFirst({
      where: {
        userId: userId,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { message: "Profile belum dibuat" },
        { status: 404 }
      );
    }

    await prisma.userProfile.update({
      where: {
        id: profile.id,
      },
      data: {
        profileImage: new Uint8Array(webpBuffer),
        profileImageType: "image/webp",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Foto profile berhasil diupload",
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: "Gagal upload foto" },
      { status: 500 }
    );
  }
}

async function getPhoto(
  req: NextRequest,
  decoded: { id: string }
) {
  try {
    const userId = Number(decoded.id);

    const profile = await prisma.userProfile.findFirst({
      where: {
        userId: userId,
      },
    });

    // kalau belum ada foto profile
    if (
      !profile ||
      !profile.profileImage ||
      !profile.profileImageType
    ) {
      const defaultImagePath = path.join(
        process.cwd(),
        "public",
        "default-profile.png"
      );

      const imageBuffer = fs.readFileSync(
        defaultImagePath
      );

      return new NextResponse(imageBuffer, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "no-store",
        },
      });
    }

    // kalau ada foto profile user
    return new NextResponse(profile.profileImage, {
      headers: {
        "Content-Type": profile.profileImageType,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.log(error);

    return new NextResponse(null, {
      status: 500,
    });
  }
}

async function deletePhoto(
  req: NextRequest,
  decoded: { id: string }
) {
  try {
    const userId = Number(decoded.id);

    const profile = await prisma.userProfile.findFirst({
      where: {
        userId: userId,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { message: "Profile tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.userProfile.update({
      where: {
        id: profile.id,
      },
      data: {
        profileImage: null,
        profileImageType: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Foto profile berhasil dihapus",
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: "Gagal menghapus foto" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return (await protect(uploadPhoto, ["user"]))(
    req
  );
}

export async function GET(req: NextRequest) {
  return (await protect(getPhoto, ["user"]))(
    req
  );
}

export async function DELETE(req: NextRequest) {
  return (await protect(deletePhoto, ["user"]))(
    req
  );
}