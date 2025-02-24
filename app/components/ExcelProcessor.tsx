"use client";
import { useState } from "react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Upload, FileSpreadsheet, Download } from "lucide-react";
import { useToast } from "@/app/components/ui/use-toast";

const ExcelProcessor = () => {
	const [file, setFile] = useState<File | null>(null);
	const [loading, setLoading] = useState(false);
	const [validFileUrl, setValidFileUrl] = useState<string | null>(null);
	const [invalidFileUrl, setInvalidFileUrl] = useState<string | null>(null);
	const [mode, setMode] = useState<"online" | "offline">("online");
	const { toast } = useToast();

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = event.target.files?.[0];
		if (selectedFile) {
			if (
				selectedFile.type ===
					"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
				selectedFile.type === "application/vnd.ms-excel"
			) {
				setFile(selectedFile);
				setValidFileUrl(null);
				setInvalidFileUrl(null);
			} else {
				toast({
					title: "Invalid file type",
					description: "Please upload an Excel file (.xlsx or .xls)",
					variant: "destructive",
				});
			}
		}
	};

	const handleUpload = async () => {
		if (!file) return;

		setLoading(true);
		const formData = new FormData();
		formData.append("file", file);

		try {
			const endpoint = `/process/${mode}`;
			const response = await fetch(endpoint, {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.detail || "Upload failed");
			}

			const result = await response.json();

			const validBlob = new Blob([Buffer.from(result.valid_file, "base64")], {
				type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			});
			setValidFileUrl(URL.createObjectURL(validBlob));

			if (result.invalid_file) {
				const invalidBlob = new Blob(
					[Buffer.from(result.invalid_file, "base64")],
					{
						type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
					},
				);
				setInvalidFileUrl(URL.createObjectURL(invalidBlob));

				toast({
					title: "Processing Complete",
					description: `Found ${result.invalid_count} records with invalid phone numbers. Please check the invalid records file.`,
					variant: "warning",
				});
			} else {
				toast({
					title: "Success!",
					description:
						"All records processed successfully with no invalid phone numbers.",
				});
			}
		} catch (error) {
			toast({
				title: "Error",
				description: `Failed to process file: ${error instanceof Error ? error.message : "Unknown error"}`,
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
			<Card className="w-full max-w-md shadow-lg">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold text-center text-slate-800 flex items-center justify-center gap-2">
						<FileSpreadsheet className="h-6 w-6 text-emerald-600" />
						Excel File Processor
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex justify-center gap-2 mb-4">
						<Button
							variant={mode === "online" ? "default" : "outline"}
							onClick={() => setMode("online")}
						>
							Online
						</Button>
						<Button
							variant={mode === "offline" ? "default" : "outline"}
							onClick={() => setMode("offline")}
						>
							Offline
						</Button>
					</div>

					<div
						className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center hover:border-emerald-500 transition-colors"
						onDrop={(e) => {
							e.preventDefault();
							const droppedFile = e.dataTransfer.files[0];
							if (droppedFile?.type.includes("excel")) {
								setFile(droppedFile);
								setValidFileUrl(null);
								setInvalidFileUrl(null);
							}
						}}
						onDragOver={(e) => e.preventDefault()}
					>
						<div className="space-y-4">
							<Upload className="h-12 w-12 text-slate-400 mx-auto" />
							<div className="space-y-2">
								<p className="text-sm font-medium text-slate-700">
									{file ? file.name : "Drag and drop your Excel file here"}
								</p>
								<p className="text-xs text-slate-500">or</p>
								<Button
									variant="outline"
									onClick={() =>
										document.getElementById("file-upload")?.click()
									}
								>
									Browse Files
								</Button>
								<input
									id="file-upload"
									type="file"
									className="hidden"
									accept=".xlsx,.xls"
									onChange={handleFileChange}
								/>
							</div>
						</div>
					</div>
					<div className="space-y-2">
						<Button
							className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
							disabled={!file || loading}
							onClick={handleUpload}
						>
							{loading ? "Processing..." : "Process File"}
						</Button>

						{validFileUrl && (
							<Button
								className="w-full bg-blue-600 hover:bg-blue-700 text-white"
								onClick={() => window.open(validFileUrl)}
							>
								<Download className="w-4 h-4 mr-2" />
								Download Processed File
							</Button>
						)}

						{invalidFileUrl && (
							<Button
								className="w-full bg-amber-600 hover:bg-amber-700 text-white"
								onClick={() => window.open(invalidFileUrl)}
							>
								<Download className="w-4 h-4 mr-2" />
								Download Invalid Records
							</Button>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default ExcelProcessor;
