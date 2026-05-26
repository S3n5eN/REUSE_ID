import { userProfile_gender } from "@/generated/prisma";

export interface pengguna {
    id: number;
    name: string;
    email: string;
    password: string;
    totalPoin: number;
    dataDiri: {
        namaLengkap: string;
        usia: number;
        nomorTelpon: string;
        alamat: string;
        gender: userProfile_gender;
        pekerjaan: string;
        longitude: number | null;
        latitude: number | null;
        // === Baru nih karena di database minta NIK ====
        NIK: string;
    }
}