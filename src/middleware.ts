import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/clients/:path*",
    "/projects/:path*",
    "/expenses/:path*",
    "/income/:path*",
    "/statistics/:path*",
    "/celkove-financie/:path*",
    "/login",
  ],
};
