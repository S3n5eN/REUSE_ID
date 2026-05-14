import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import "dotenv/config";

export async function main() {
  // ==== Place Utama. Admin Pusat ====
  await prisma.place.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Kantor Pusat",
      address: "Jl. Sudirman No. 1, Jakarta",
      managerName: "Admin Pusat",
      managerPhone: "08123456789",
      keyLocation: await bcrypt.hash("guapunyaduitguapunyakuasa", 10),
      operationalJam: "08:00 - 17:00",
      latitude: -6.2088,
      longitude: 106.8456,
    },
  });

  // ==== Place ====
  const place1 = await prisma.place.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: "Gudang Bandung",
      address: "Jl. Sudirman No. 1, Bandung",
      managerName: "Budi Santoso",
      managerPhone: "08123456789",
      keyLocation: await bcrypt.hash("GDGBDG", 10),
      operationalJam: "08:00 - 17:00",
      latitude: -6.9175,
      longitude: 107.6191,
    },
  });

  const place2 = await prisma.place.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: "Gudang Jakarta",
      address: "Jl. Sudirman No. 2, Jakarta",
      managerName: "Siti Aminah",
      managerPhone: "08123456789",
      keyLocation: await bcrypt.hash("GDKBJKT", 10),
      operationalJam: "08:00 - 17:00",
      latitude: -6.2088,
      longitude: 106.8456,
    },
  });

  // ==== Rak Gudang Bandung ====
  await prisma.rak.createMany({
    data: [
      { nomor: "A1", kapasitasMax: 20, placeId: place1.id },
      { nomor: "A2", kapasitasMax: 15, placeId: place1.id },
      { nomor: "B1", kapasitasMax: 30, placeId: place1.id },
      { nomor: "B2", kapasitasMax: 10, placeId: place1.id },
      { nomor: "C1", kapasitasMax: 25, placeId: place1.id },
    ],
  });

  // ==== Rak Gudang Jakarta ====
  await prisma.rak.createMany({
    data: [
      { nomor: "A1", kapasitasMax: 50, placeId: place2.id },
      { nomor: "A2", kapasitasMax: 35, placeId: place2.id },
      { nomor: "B1", kapasitasMax: 20, placeId: place2.id },
      { nomor: "B2", kapasitasMax: 40, placeId: place2.id },
      { nomor: "C1", kapasitasMax: 15, placeId: place2.id },
    ],
  });

  // ==== Admin ====
  const admin = await prisma.admin.upsert({
    where: { email: "adminone@gmail.com" },
    update: {},
    create: {
      name: "adminOne",
      email: "adminone@gmail.com",
      password: await bcrypt.hash("Password123", 10),
    },
  });

  await prisma.place.update({
    where: { id: place1.id },
    data: { admin: { connect: { id: admin.id } } },
  });

  await prisma.place.update({
    where: { id: place2.id },
    data: { admin: { connect: { id: admin.id } } },
  });

  // ==== User Donatur ====
  const donatur = await prisma.user.upsert({
    where: { email: "asep123@gmail.com" },
    update: {},
    create: {
      name: "Asep01",
      email: "asep123@gmail.com",
      password: await bcrypt.hash("Asep1234", 10),
    },
  });

  // ==== User Penerima ====
  const penerima = await prisma.user.upsert({
    where: { email: "siti123@gmail.com" },
    update: {},
    create: {
      name: "Siti12",
      email: "siti123@gmail.com",
      password: await bcrypt.hash("Siti1234", 10),
    },
  });

  // ==== UserProfile Penerima (belum verified) ====
  const profilePenerima = await prisma.userProfile.upsert({
    where: { userId: penerima.id },
    update: {},
    create: {
      userId: penerima.id,
      namaLengkap: "Siti Nurhaliza",
      phone: "089876543210",
      pekerjaan: "Pelajar",
      address: "Jl. Sudirman No. 5, Jakarta",
      usia: 22,
      gender: "Wanita",
      identityId: "3171012345678902",
      isVerified: false,
    },
  });

  // ==== Item 1: Pending Approval (baru didonasikan) ====
  const itemPending = await prisma.item.create({
    data: {
      name: "Baju Pramuka SMP",
      category: "Pakaian",
      description: "Baju pramuka bekas, masih layak pakai, ukuran M",
      imageData: "",
      imageType: "image/webp",
      userId: donatur.id,
      placeId: place1.id,
      status: "PendingApproval",
    },
  });

  await prisma.shipment.create({
    data: {
      itemId: itemPending.id,
      userId: donatur.id,
      type: "Donation",
      status: "Pending",
    },
  });

  // ==== Item 2: Tersedia (sudah di-approve admin) ====
  const itemTersedia = await prisma.item.create({
    data: {
      name: "Sepatu Sekolah",
      category: "Pakaian",
      description: "Sepatu sekolah hitam, ukuran 38, masih bagus",
      imageData: "",
      imageType: "image/webp",
      userId: donatur.id,
      placeId: place2.id,
      status: "Tersedia",
      quality: "Baik",
    },
  });

  await prisma.shipment.create({
    data: {
      itemId: itemTersedia.id,
      userId: donatur.id,
      type: "Donation",
      status: "Approved",
      adminId: admin.id,
      receivedAt: new Date(),
    },
  });

  // ==== Item 3: Diambil + claim pending verifikasi data penerima ====
  const itemClaim = await prisma.item.create({
    data: {
      name: "Tas Sekolah",
      category: "Tas",
      description: "Tas ransel bekas, kondisi baik",
      imageData: "",
      imageType: "image/webp",
      userId: donatur.id,
      placeId: place2.id,
      status: "Diambil",
      quality: "CukupBaik",
    },
  });

  // Shipment donasi sudah approved
  await prisma.shipment.create({
    data: {
      itemId: itemClaim.id,
      userId: donatur.id,
      type: "Donation",
      status: "Approved",
      adminId: admin.id,
      receivedAt: new Date(),
    },
  });

  // Shipment claim pending verifikasi data penerima
  await prisma.shipment.create({
    data: {
      itemId: itemClaim.id,
      userId: penerima.id,
      userProfileId: profilePenerima.id,
      type: "claim",
      status: "Pending",
      isAutoApproved: false,
    },
  });

  // ==== Item 4: konfirmasiTerima — sudah approved + pilih delivery ====
  const itemDelivery = await prisma.item.create({
    data: {
      name: "Buku Pelajaran SD",
      category: "Buku",
      description: "Buku pelajaran kelas 5 SD, lengkap",
      imageData: "",
      imageType: "image/webp",
      userId: donatur.id,
      placeId: place1.id,
      status: "Diambil",
      quality: "SangatBaik",
    },
  });

  await prisma.shipment.create({
    data: {
      itemId: itemDelivery.id,
      userId: donatur.id,
      type: "Donation",
      status: "Approved",
      adminId: admin.id,
      receivedAt: new Date(),
    },
  });

  await prisma.shipment.create({
    data: {
      itemId: itemDelivery.id,
      userId: penerima.id,
      userProfileId: profilePenerima.id,
      type: "claim",
      status: "Approved",
      isAutoApproved: false,
      adminId: admin.id,
      claimType: "delivery",
      receiverAddress: "Jl. Sudirman No. 5, Jakarta",
    },
  });

  console.log("Seeding berhasil");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
