import { type NextRequest, NextResponse } from "next/server";

export default function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl;

	const forwardedFor = req.headers.get("x-forwarded-for") as string;
	const clientIp = forwardedFor
		? forwardedFor.split(",")[0].trim()
		: req.ip || "";

	if (!pathname.startsWith("/warranty")) {
		const isLocalNetwork =
			clientIp === "127.0.0.1" ||
			clientIp.startsWith("10.100.0.") ||
			clientIp.startsWith("172.18.0.") ||
			clientIp.startsWith("192.168.0.");

		if (!isLocalNetwork) {
			return NextResponse.json({ message: "Access Denied" }, { status: 403 });
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: "/:path*",
};
