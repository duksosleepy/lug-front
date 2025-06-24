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

const AccountingProcessor = () => {
	const [file, setFile] = useState<File | null>(null);
	const [loading, setLoading] = useState(false);
	const [resultFileUrl, setResultFileUrl] = useState<string | null>(null);
	const [resultFileName, setResultFileName] = useState<string>("");
	const { toast } = useToast();

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = event.target.files?.[0];
		if (selectedFile) {
			if (
				selectedFile.type ===
					"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
				selectedFile.type === "application/vnd.ms-excel" ||
				selectedFile.type === "application/vnd.oasis.opendocument.spreadsheet"
			) {
				setFile(selectedFile);
				setResultFileUrl(null);
				setResultFileName("");
			} else {
				toast({
					title: "Invalid file type",
					description:
						"Please upload a spreadsheet file (.xlsx, .xls, or .ods)",
					variant: "destructive",
				});
			}
		}
	};

	// Function to download file with specific name and format
	const downloadFile = (blob: Blob, filename: string) => {
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	const handleUpload = async () => {
		if (!file) return;

		setLoading(true);
		const formData = new FormData();
		formData.append("file", file);

		try {
			const endpoint = "/process/accounting";
			const response = await fetch(endpoint, {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.detail || "Upload failed");
			}

			const result = await response.json();

			if (result.result_file) {
				// Create blob with .xls MIME type instead of .xlsx
				const resultBlob = new Blob(
					[Buffer.from(result.result_file, "base64")],
					{
						type: "application/vnd.ms-excel", // Changed from xlsx to xls MIME type
					},
				);
				setResultFileUrl(URL.createObjectURL(resultBlob));

				// Generate filename with .xls extension
				const originalName = file.name.replace(/\.[^/.]+$/, ""); // Remove original extension
				const timestamp = new Date()
					.toISOString()
					.slice(0, 19)
					.replace(/[:]/g, "-");
				setResultFileName(`${originalName}_processed_${timestamp}.xls`);

				toast({
					title: "Success!",
					description: "Accounting data processed successfully.",
				});
			} else {
				toast({
					title: "Processing Complete",
					description:
						"No result file was returned. Please check the console for details.",
					variant: "destructive",
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

	const handleDownload = () => {
		if (resultFileUrl && resultFileName) {
			// Create a new blob with .xls MIME type for download
			fetch(resultFileUrl)
				.then((response) => response.blob())
				.then((blob) => {
					const xlsBlob = new Blob([blob], {
						type: "application/vnd.ms-excel",
					});
					downloadFile(xlsBlob, resultFileName);
				})
				.catch((error) => {
					console.error("Download failed:", error);
					toast({
						title: "Download Error",
						description: "Failed to download the file.",
						variant: "destructive",
					});
				});
		}
	};

	return (
		<div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
			<Card className="w-full max-w-md shadow-lg">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold text-center text-slate-800 flex items-center justify-center gap-2">
						<FileSpreadsheet className="h-6 w-6 text-blue-600" />
						Accounting Processor
					</CardTitle>
					<p className="text-sm text-center text-slate-600">
						Process Excel, LibreOffice, and OpenDocument spreadsheets
					</p>
				</CardHeader>
				<CardContent className="space-y-4">
					<div
						className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center hover:border-blue-500 transition-colors"
						onDrop={(e) => {
							e.preventDefault();
							const droppedFile = e.dataTransfer.files[0];
							if (
								droppedFile?.type.includes("excel") ||
								droppedFile?.type.includes("spreadsheet") ||
								droppedFile?.name.endsWith(".xlsx") ||
								droppedFile?.name.endsWith(".xls") ||
								droppedFile?.name.endsWith(".ods")
							) {
								setFile(droppedFile);
								setResultFileUrl(null);
								setResultFileName("");
							}
						}}
						onDragOver={(e) => e.preventDefault()}
					>
						<div className="space-y-4">
							<Upload className="h-12 w-12 text-slate-400 mx-auto" />
							<div className="space-y-2">
								<p className="text-sm font-medium text-slate-700">
									{file
										? file.name
										: "Drag and drop your spreadsheet file here"}
								</p>
								<p className="text-xs text-slate-500">(.xlsx, .xls, or .ods)</p>
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
									accept=".xlsx,.xls,.ods"
									onChange={handleFileChange}
								/>
							</div>
						</div>
					</div>
					<div className="space-y-2">
						<Button
							className="w-full bg-blue-600 hover:bg-blue-700 text-white"
							disabled={!file || loading}
							onClick={handleUpload}
						>
							{loading ? "Processing..." : "Process Spreadsheet File"}
						</Button>

						{resultFileUrl && (
							<Button
								className="w-full bg-green-600 hover:bg-green-700 text-white"
								onClick={handleDownload}
							>
								<Download className="w-4 h-4 mr-2" />
								Download Processed File (.xls)
							</Button>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default AccountingProcessor;
