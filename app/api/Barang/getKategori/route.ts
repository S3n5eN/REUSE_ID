import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const categories = await prisma.item.findMany({
      where: {
        status: {
          in: ["Tersedia", "Diambil"],
        },
      },
      select: {
        category: true,
      },
      distinct: ["category"],
    });

    const categoryList = categories
      .map((c) => c.category)
      .filter((cat) => cat && cat.trim() !== "");

    return NextResponse.json(categoryList);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
