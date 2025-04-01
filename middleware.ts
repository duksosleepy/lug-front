import { type NextRequest, NextResponse } from "next/server";

export default function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl;

	// Lấy địa chỉ IP của client
	const forwardedFor = req.headers.get("x-forwarded-for") as string;
	const realIp = req.headers.get("x-real-ip") as string;
	const clientIp = forwardedFor
		? forwardedFor.split(",")[0].trim()
		: realIp || "";

	// Danh sách các đường dẫn được phép truy cập từ public
	const allowedPublicPaths = [
		"/warranty", // Endpoint chính
		"/_next/", // JavaScript và CSS được build bởi Next.js
		"/static/", // Tệp tĩnh
		"/images/", // Thư mục hình ảnh
		"/favicon.ico", // Favicon
		"/api/warranty", // API endpoints liên quan đến warranty
		".js", // Các file JavaScript
		".css", // Các file CSS
		".png",
		".jpg",
		".gif",
		".svg", // Hình ảnh
		".woff",
		".woff2",
		".ttf",
		".eot", // Font
	];

	// Kiểm tra xem đường dẫn có nằm trong danh sách cho phép không
	const isAllowedPublicPath = allowedPublicPaths.some((path) => {
		if (path.startsWith(".")) {
			// Kiểm tra nếu là extension của file
			return pathname.endsWith(path);
		}
		return pathname.startsWith(path);
	});

	// Nếu không phải đường dẫn được phép và không phải từ mạng local
	if (!isAllowedPublicPath) {
		// Kiểm tra xem IP có phải là local không
		const isLocalNetwork =
			clientIp === "127.0.0.1" ||
			clientIp === "localhost" ||
			clientIp.startsWith("10.100.0.") ||
			clientIp.startsWith("172.18.0.") ||
			clientIp.startsWith("192.168.0.");

		if (!isLocalNetwork) {
			// Log để debug
			console.log(`Blocked access to ${pathname} from IP ${clientIp}`);

			return NextResponse.json({ message: "Access Denied" }, { status: 403 });
		}
	}

	// Tiếp tục request nếu là path cho phép hoặc từ mạng local
	return NextResponse.next();
}

export const config = {
	matcher: [
		// Áp dụng middleware cho tất cả các đường dẫn trừ API routes và static files
		"/((?!_next/static|_next/image|favicon.ico).*)",
	],
};
