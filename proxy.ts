import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim());

const JWT_SECRET = process.env.JWT_SECRET;
// ==== Route yang boleh diakses ====
const Protected_routes: Record<string, string[]> = {
  "/admin/dashboard": ["admin"],
  "/api/admin": ["admin"],
  "/dashboard": ["user"],
};

interface JwtPayload {
  id: string;
  role: "admin" | "user";
  name: string;
}

const addCorsHeaders = (res: NextResponse, origin: string | null) => {
  if (origin && allowedOrigins.includes(origin)) {
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Access-Control-Allow-Credentials", "true");
  }
  return res;
}

export async function proxy(req: NextRequest) {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    if (origin && allowedOrigins.includes(origin)) {
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Max-Age": "86400",
        },
      });
    }
    return new NextResponse("CORS denied", { status: 403 });
  }

  const { pathname } = req.nextUrl;

  // ==== Ambil token di cookie ====
  const token = req.cookies.get("token")?.value;

  // ==== cek apakah user sedang di halaman login atau register ====
  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  let decoded: JwtPayload | null = null;
  if (token) {
    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = (await jwtVerify(token, secret)) as {
        payload: JwtPayload;
      };
      decoded = payload;
    } catch {
      // Token tidak valid
      decoded = null;
    }
  }

  // ==== kalau user masih dalam keadaan login tapi masuk ke halaman auth, maka akan langsung kembali ke dashboard ====
  if (isAuthPage) {
    if (decoded) {
      const redirectTo =
        decoded.role === "admin" ? "/admin/dashboard" : "/dashboard";
      return NextResponse.redirect(new URL(redirectTo, req.url));
    }
    return NextResponse.next();
  }

  // ==== Cek apakah path termasuk protected route ===
  const matchedRoute = Object.keys(Protected_routes).find((route) =>
    pathname.startsWith(route),
  );

  // ==== Kalau bukan bisa lanjut ====
  if (!matchedRoute) return NextResponse.next();

  // ==== kalau ga ada token, redirect ke halaman login ====
  if (!decoded) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const allowedRoles = Protected_routes[matchedRoute];

  if (!allowedRoles.includes(decoded.role)) {
    const redirectTo =
      decoded.role === "admin" ? "/admin/dashboard" : "/dashboard";
    return NextResponse.redirect(new URL(redirectTo, req.url));
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-user-id", String(decoded.id));
  requestHeaders.set("x-user-name", decoded.name);
  requestHeaders.set("x-user-role", decoded.role);

  return addCorsHeaders(NextResponse.next({ request: { headers: requestHeaders } }), origin);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
