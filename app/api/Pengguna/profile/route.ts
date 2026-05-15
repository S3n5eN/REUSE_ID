import { userProfile_gender } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import { NextRequest, NextResponse } from "next/server";

interface ProfileData {
  namaLengkap: string;
  usia: number ;  
  gender: userProfile_gender;
  pekerjaan: string;
  phone: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

async function getProfile(req: NextRequest, decoded: { id: string }) {
  try {
    const userId = Number(decoded.id);

    const profile = await prisma.userProfile.findFirst({
      where: { userId: userId },
      include: {
        user: true
      }
    });

    if (!profile) {
      return NextResponse.json({
        hasProfile: false,
        isVerified: false,
        message: "Silahkan isi data diri terlebih dahulu"
      });
    }

    if (!profile.isVerified) {
      return NextResponse.json({
        hasProfile: true,
        isVerified: false,
        message: "Data diri sedang diverifikasi admin",
        data: {
          ...profile, // Tambahkan data meski belum verified
          email: profile.user.email,
        }
      });
    }

    return NextResponse.json({
      hasProfile: true,
      isVerified: true,
      message: "Berhasil mengambil profile",
      data: {
        ...profile,
        email: profile.user.email,
      },
    });

  } catch {
    return NextResponse.json(
      { message: "Gagal mengambil profile" },
      { status: 500 }
    );
  }
}

async function updateProfile(req: NextRequest, decoded: { id: string }) {
  try {
    const userId = Number(decoded.id);
    const body: ProfileData = await req.json();

    // Validasi data
    if (!body.namaLengkap?.trim() || !body.address?.trim()) {
      return NextResponse.json(
        { message: "Nama dan alamat wajib diisi" },
        { status: 400 }
      );
    }

    // Cek apakah profile sudah ada
    const existingProfile = await prisma.userProfile.findFirst({
      where: { userId: userId }
    });

    if (existingProfile) {
      // Update existing profile
      const updatedProfile = await prisma.userProfile.update({
        where: { id: existingProfile.id },
        data: {
          namaLengkap: body.namaLengkap.trim(),
          usia: Number (body.usia),
          gender: body.gender,
          pekerjaan: body.pekerjaan?.trim() || null,
          phone: body.phone.trim(), 
          address: body.address.trim(),
          latitude: body.latitude || null,
          longitude: body.longitude || null,
        }
      });
      
      return NextResponse.json({
        success: true,
        message: "Profile berhasil diupdate",
        data: updatedProfile
      });
    } else {
      // Create new profile
      const newProfile = await prisma.userProfile.create({
        data: {
          userId: userId,
          namaLengkap: body.namaLengkap.trim(),
          usia: Number (body.usia),
          gender: body.gender,
          pekerjaan: body.pekerjaan?.trim() || null,
          phone: body.phone.trim(),
          address: body.address.trim(),
          latitude: body.latitude || null,
          longitude: body.longitude || null,
          isVerified: false // Default belum verified
        }
      });
      
      return NextResponse.json({
        success: true,
        message: "Profile berhasil dibuat dan menunggu verifikasi",
        data: newProfile
      });
    }
  } catch {
    return NextResponse.json(
      { message: "Gagal menyimpan profile" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return (await protect(getProfile, ["user"]))(req);
}

export async function PUT(req: NextRequest) {
  return (await protect(updateProfile, ["user"]))(req);
}