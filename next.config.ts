import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	async rewrites() {
		return [
			{
				source: "/process/online",
				destination: "http://localhost:8000/process/online",
			},
			{
				source: "/process/offline",
				destination: "http://localhost:8000/process/offline",
			},
			{
				source: "/process-dual-files",
				destination: "http://localhost:8000/process/mapping",
			},
		];
	},
};

export default nextConfig;
