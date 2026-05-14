import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

interface JwtPayload {
    id: number;
    role: "user";
    name: string;
}

// ==== Ini buat dapetin id, dan nama user yang login ====
export async function GET(req: NextRequest) {
    const token = req.cookies.get("token")?.value;

    if (!token) {
        return NextResponse.json({ message: "Belum login" }, { status: 401 });
    }

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret) as { payload: JwtPayload };

        const userProfile = await prisma.userProfile.findFirst({
        where: { userId: Number(payload.id)},
        select: { isVerified: true, namaLengkap: true },
    })

        const user = await prisma.user.findUnique({
            where: { id: Number(payload.id)},
            select: { 
                poin: true, 
                createdAt: true, 
                item: { 
                    select: { createdAt: true },
                    orderBy: { createdAt: 'desc' }
                } 
            }
        });

        let streak = 0;
        if (user && user.item.length > 0) {
            // Get unique local dates of donations
            const uniqueDates = [...new Set(user.item.map(i => {
                const d = new Date(i.createdAt);
                // Adjust to local timezone string (YYYY-MM-DD)
                d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                return d.toISOString().split('T')[0];
            }))].sort((a, b) => b.localeCompare(a));
            
            const today = new Date();
            today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
            const todayStr = today.toISOString().split('T')[0];
            
            const checkDate = new Date(todayStr);
            const firstDate = new Date(uniqueDates[0]);
            
            const diffTime = Math.abs(checkDate.getTime() - firstDate.getTime());
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays <= 1) {
                streak = 1;
                let currentCheck = firstDate;
                for (let i = 1; i < uniqueDates.length; i++) {
                    const prevDate = new Date(currentCheck);
                    prevDate.setDate(prevDate.getDate() - 1);
                    
                    const donationDate = new Date(uniqueDates[i]);
                    
                    if (donationDate.getTime() === prevDate.getTime()) {
                        streak++;
                        currentCheck = donationDate;
                    } else {
                        break;
                    }
                }
            }
        }

        return NextResponse.json({ 
            id: payload.id, 
            name: payload.name, 
            isVerified: userProfile?.isVerified || false,
            namalengkap: userProfile?.namaLengkap || payload.name,
            poin: user?.poin || 0,
            createdAt: user?.createdAt,
            totalDonasi: user?.item.length || 0,
            streak: streak
        });
    } catch  {
        return NextResponse.json({ message: "Token tidak valid" }, { status: 401 });
    }
}