// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  // Function executed when the user is authenticated
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Specify which routes should be protected
export const config = {
  matcher: [
    "/bookings/:path*",
    "/stays/:path*",
    "/hotels/:path*",
    "/companies/:path*",
    "/contacts/:path*",
  ],
};