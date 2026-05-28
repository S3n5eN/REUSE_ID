import { userProfile_gender } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import { NextRequest, NextResponse } from "next/server";

interface ProfileData {
  namaLengkap: string;
  usia: number;
  gender: userProfile_gender;
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
        user: true,
      },
    });

    if (!profile) {
      return NextResponse.json({
        hasProfile: false,
        isVerified: false,
        message: "Silahkan isi data diri terlebih dahulu",
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
        },
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
      { status: 500 },
    );
  }
}

async function updateProfile(req: NextRequest, decoded: { id: string }) {
  try {
    const userId = Number(decoded.id);
    const body: ProfileData = await req.json();

    // Validasi data
    const containsEmoji = (str: string) =>
      /\p{Extended_Pictographic}/u.test(str);

    // Validasi nama lengkap
    // Ini jika nama tidak diisi
    if (!body.namaLengkap || !body.namaLengkap.trim()) {
      return NextResponse.json(
        { message: "Nama lengkap tidak boleh kosong" },
        { status: 400 },
      );
    }

    // Ini jika nama ada emoji
    if (containsEmoji(body.namaLengkap)) {
      return NextResponse.json(
        { message: "Nama lengkap tidak boleh mengandung emoji" },
        { status: 400 },
      );
    }

    // Ini jika nama ada angka
    if (!/^[A-Za-z\s]+$/.test(body.namaLengkap)) {
      return NextResponse.json(
        { message: "Nama lengkap hanya boleh berisi huruf alfabet" },
        { status: 400 },
      );
    }

    // Ini jika nama kurang dari 4 karakter
    if (body.namaLengkap.length < 4) {
      return NextResponse.json(
        { message: "Nama lengkap minimal terdiri dari 4 karakter" },
        { status: 400 },
      );
    }

    // Ini jika nama lebih dari 30 karakter
    if (body.namaLengkap.length > 30) {
      return NextResponse.json(
        { message: "Nama lengkap maksimal terdiri dari 30 karakter" },
        { status: 400 },
      );
    }

    // Validasi usia
    // Ini jika usia tidak diisi
    if (
      body.usia === undefined ||
      body.usia === null ||
      String(body.usia) === ""
    ) {
      return NextResponse.json(
        { message: "Usia wajib diisi" },
        { status: 400 },
      );
    }

    // Ini jika usia kurang dari 17
    if (Number(body.usia) < 17) {
      return NextResponse.json(
        { message: "Usia minimal 17 tahun" },
        { status: 400 },
      );
    }

    // Ini jika usia lebih dari 120
    if (Number(body.usia) > 120) {
      return NextResponse.json(
        { message: "Usia maksimal 120 tahun" },
        { status: 400 },
      );
    }

    // Validasi gender
    // Ini jika gender bukan Pria atau Wanita
    const genderMapped =
      (body.gender as string) === "Laki-laki"
        ? "Pria"
        : (body.gender as string) === "Perempuan"
          ? "Wanita"
          : body.gender;
    if (!["Pria", "Wanita"].includes(genderMapped)) {
      return NextResponse.json(
        { message: "Gender harus berupa Pria atau Wanita" },
        { status: 400 },
      );
    }

    // Validasi phone
    // Ini jika nomor telepon tidak diisi
    if (!body.phone) {
      return NextResponse.json(
        { message: "Nomor telepon wajib diisi" },
        { status: 400 },
      );
    }

    // Ini jika nomor telepon tidak ada angka
    if (!/^\d+$/.test(body.phone)) {
      return NextResponse.json(
        { message: "Nomor telepon hanya boleh berisi angka" },
        { status: 400 },
      );
    }

    // Ini jika nomor telepon kurang dari 9 digit
    if (body.phone.length < 9) {
      return NextResponse.json(
        { message: "Nomor telepon minimal terdiri dari 9 digit" },
        { status: 400 },
      );
    }

    // Ini jika nomor telepon lebih dari 15 digit
    if (body.phone.length > 15) {
      return NextResponse.json(
        { message: "Nomor telepon maksimal terdiri dari 15 digit" },
        { status: 400 },
      );
    }

    // Validasi alamat (address)
    // Ini jika alamat tidak diisi
    if (!body.address || !body.address.trim()) {
      return NextResponse.json(
        { message: "Alamat tidak boleh kosong" },
        { status: 400 },
      );
    }

    // Ini jika alamat mengandung emoji
    if (containsEmoji(body.address)) {
      return NextResponse.json(
        { message: "Alamat tidak boleh mengandung emoji" },
        { status: 400 },
      );
    }

    // Ini jika alamat kurang dari 10 karakter
    if (body.address.length < 10) {
      return NextResponse.json(
        { message: "Alamat minimal terdiri dari 10 karakter" },
        { status: 400 },
      );
    }

    // Ini jika alamat lebih dari 200 karakter
    if (body.address.length > 200) {
      return NextResponse.json(
        { message: "Alamat maksimal terdiri dari 200 karakter" },
        { status: 400 },
      );
    }

    // Cek apakah profile sudah ada
    const existingProfile = await prisma.userProfile.findFirst({
      where: { userId: userId },
    });

    if (existingProfile) {
      // Update existing profile
      const updatedProfile = await prisma.userProfile.update({
        where: { id: existingProfile.id },
        data: {
          namaLengkap: body.namaLengkap.trim(),
          usia: Number(body.usia),
          gender: genderMapped as userProfile_gender,
          phone: body.phone.trim(),
          address: body.address.trim(),
          latitude: body.latitude || null,
          longitude: body.longitude || null,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Profile berhasil diupdate",
        data: updatedProfile,
      });
    } else {
      // Create new profile
      const newProfile = await prisma.userProfile.create({
        data: {
          userId: userId,
          namaLengkap: body.namaLengkap.trim(),
          usia: Number(body.usia),
          gender: genderMapped as userProfile_gender,
          phone: body.phone.trim(),
          address: body.address.trim(),
          latitude: body.latitude || null,
          longitude: body.longitude || null,
          identityId: "",
          isVerified: false, // Default belum verified
        },
      });

      return NextResponse.json({
        success: true,
        message: "Profile berhasil dibuat dan menunggu verifikasi",
        data: newProfile,
      });
    }
  } catch {
    return NextResponse.json(
      { message: "Gagal menyimpan profile" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  return (await protect(getProfile, ["user"]))(req);
}

export async function PUT(req: NextRequest) {
  return (await protect(updateProfile, ["user"]))(req);
}
