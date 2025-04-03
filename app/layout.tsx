import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/app/lib/AuthContext";
import AppWrapper from "@/app/components/AppWrapper";
const inter = Inter({ subsets: ["latin"] });
import { Suspense } from "react";
export const metadata: Metadata = {
	metadataBase: new URL("http://dl.lug.info.vn/warranty"),
	title: "LUG.vn Bảo Hành",
	description: "Trang chủ bảo hành",
	openGraph: {
		title: "LUG.vn Bảo Hành",
		description: "Trang chủ bảo hành",
		images: [
			{
				url: "/logo320x320.png",
				width: 1131,
				height: 500,
				alt: "LUG.vn",
			},
		],
		url: "http://dl.lug.info.vn/warranty",
		type: "website",
	},
	icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<Suspense>
					<AuthProvider>
						<AppWrapper>{children}</AppWrapper>
					</AuthProvider>
				</Suspense>
			</body>
		</html>
	);
}
