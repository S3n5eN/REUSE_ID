import { sendResetPasswordEmail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt"
import { authRateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
    try {
        const identifier = req.headers.get('x-identifier-for')?.split(',')[0] || 'unknown';
        const { success } = await authRateLimit.limit(identifier);

        if (!success) {
            return NextResponse.json({ message: `Terlalu banyak mencoba, silahkan coba lagi nanti` }, { status: 429 });
        }


        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ message: "Email harus diisi" }, { status: 404 });
        }

        const isExist = await prisma.user.findFirst({
            where: { email }
        });

        // ==== statsus tetap 200 dan pesan tetap seperti ini, ini biar tidak menunjukkan apakah email ada atau tidak ====
        if (!isExist) {
            return NextResponse.json({ message: "Kami telah mengirim pesan ke alamat gmail mu, silahkan cek untuk mereset password" }, { status: 200 });
        }

        const tokenReset = await bcrypt.hash(crypto.randomUUID(), 10);

        await prisma.passwordReset.create({
            data: {
                email,
                token: tokenReset,
                expiresAt: new Date(Date.now() + 60 * 60 * 1000) // Token berlaku selama 1 jam
            }
        })

        await sendResetPasswordEmail(email, tokenReset);

        return NextResponse.json({ message: "Email reset password berhasil dikirim" }, { status: 200 });
    } catch {
        return NextResponse.json({ message: "Gagal mengirim email reset password" }, { status: 500 });
    }
}