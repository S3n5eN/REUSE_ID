import { Gender } from "@/generated/prisma";

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
        gender: Gender;
        pekerjaan: string;
        longitude: number | null;
        latitude: number | null;
        // === Baru nih karena di database minta NIK ====
        NIK: string;
    }
}