import {
  clerkClient,
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Roles } from "./types/global";

const isPublicRoute = createRouteMatcher(["/auth(.*)", "/"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const role = userId
    ? ((await (await clerkClient())?.users?.getUser(userId || ""))
        .unsafeMetadata.role as Roles)
    : undefined;

  if (!userId && !isPublicRoute(req)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (userId && isPublicRoute(req)) {
    if (role === "hospital") {
      return NextResponse.redirect(new URL("/dashboard/hospital", req.url));
    }
    if (role === "admin") {
      return NextResponse.redirect(new URL("/dashboard/admin", req.url));
    }
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
