import { type NextRequest, NextResponse } from "next/server";

export default function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl;

	// Lấy địa chỉ IP của client
	// Nếu có x-forwarded-for, lấy IP đầu tiên (IP thật của client)
	const forwardedFor = req.headers.get("x-forwarded-for") as string;
	const connectionRemoteIp = req.headers.get("x-real-ip") as string;
	const clientIp = forwardedFor
		? forwardedFor.split(",")[0].trim()
		: connectionRemoteIp || "";

	// Chỉ cho phép /warranty từ public
	if (!pathname.startsWith("/warranty")) {
		// Kiểm tra xem IP có phải là local không
		const isLocalNetwork =
			clientIp === "127.0.0.1" ||
			clientIp.startsWith("10.100.0.") ||
			clientIp.startsWith("172.18.0.") ||
			clientIp.startsWith("192.168.0.");

		if (!isLocalNetwork) {
			return NextResponse.json({ message: "Access Denied" }, { status: 403 });
		}
	}

	// Tiếp tục request nếu là path /warranty hoặc từ mạng local
	return NextResponse.next();
}

export const config = {
	matcher: "/:path*",
};
