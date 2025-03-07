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

const DisProcessor = () => {
	const [firstFile, setFirstFile] = useState<File | null>(null);
	const [secondFile, setSecondFile] = useState<File | null>(null);
	const [loading, setLoading] = useState(false);
	const [resultFileUrl, setResultFileUrl] = useState<string | null>(null);
	const { toast } = useToast();

	const handleFirstFileChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const selectedFile = event.target.files?.[0];
		if (selectedFile) {
			if (
				selectedFile.type ===
					"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
				selectedFile.type === "application/vnd.ms-excel"
			) {
				setFirstFile(selectedFile);
			} else {
				toast({
					title: "Invalid file type",
					description: "Please upload an Excel file (.xlsx or .xls)",
					variant: "destructive",
				});
			}
		}
	};

	const handleSecondFileChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const selectedFile = event.target.files?.[0];
		if (selectedFile) {
			if (
				selectedFile.type ===
					"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
				selectedFile.type === "application/vnd.ms-excel"
			) {
				setSecondFile(selectedFile);
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
		if (!firstFile || !secondFile) {
			toast({
				title: "Missing files",
				description: "Please upload both Excel files before processing",
				variant: "destructive",
			});
			return;
		}

		setLoading(true);
		const formData = new FormData();
		formData.append("firstFile", firstFile);
		formData.append("secondFile", secondFile);

		try {
			// Direct endpoint to the backend, using rewrite rule in next.config.ts
			const endpoint = "/process-dual-files";
			const response = await fetch(endpoint, {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.detail || "Upload failed");
			}

			const result = await response.json();

			if (result.resultFile) {
				const resultBlob = new Blob(
					[Buffer.from(result.resultFile, "base64")],
					{
						type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
					},
				);
				setResultFileUrl(URL.createObjectURL(resultBlob));

				toast({
					title: "Success!",
					description:
						"Files processed successfully. You can now download the result.",
				});
			}
		} catch (error) {
			toast({
				title: "Error",
				description: `Failed to process files: ${error instanceof Error ? error.message : "Unknown error"}`,
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	const resetForm = () => {
		setFirstFile(null);
		setSecondFile(null);
		setResultFileUrl(null);

		// Reset the file input elements
		const firstInput = document.getElementById(
			"first-file-upload",
		) as HTMLInputElement;
		const secondInput = document.getElementById(
			"second-file-upload",
		) as HTMLInputElement;

		if (firstInput) firstInput.value = "";
		if (secondInput) secondInput.value = "";
	};

	return (
		<div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
			<Card className="w-full max-w-md shadow-lg">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold text-center text-slate-800 flex items-center justify-center gap-2">
						<FileSpreadsheet className="h-6 w-6 text-emerald-600" />
						Warranty Processor
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* First File Upload */}
					<div className="space-y-2">
						<p className="text-sm font-medium text-slate-700">Raw file</p>
						<div
							className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:border-emerald-500 transition-colors"
							onDrop={(e) => {
								e.preventDefault();
								const droppedFile = e.dataTransfer.files[0];
								if (
									droppedFile?.type.includes("excel") ||
									droppedFile?.name.endsWith(".xlsx") ||
									droppedFile?.name.endsWith(".xls")
								) {
									setFirstFile(droppedFile);
								}
							}}
							onDragOver={(e) => e.preventDefault()}
						>
							<div className="space-y-2">
								<Upload className="h-8 w-8 text-slate-400 mx-auto" />
								<p className="text-sm font-medium text-slate-700">
									{firstFile
										? firstFile.name
										: "Drag and drop your first Excel file here"}
								</p>
								<p className="text-xs text-slate-500">or</p>
								<Button
									variant="outline"
									onClick={() =>
										document.getElementById("first-file-upload")?.click()
									}
									size="sm"
								>
									Browse Files
								</Button>
								<input
									id="first-file-upload"
									type="file"
									className="hidden"
									accept=".xlsx,.xls"
									onChange={handleFirstFileChange}
								/>
							</div>
						</div>
					</div>

					{/* Second File Upload */}
					<div className="space-y-2">
						<p className="text-sm font-medium text-slate-700">Warranty file</p>
						<div
							className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:border-emerald-500 transition-colors"
							onDrop={(e) => {
								e.preventDefault();
								const droppedFile = e.dataTransfer.files[0];
								if (
									droppedFile?.type.includes("excel") ||
									droppedFile?.name.endsWith(".xlsx") ||
									droppedFile?.name.endsWith(".xls")
								) {
									setSecondFile(droppedFile);
								}
							}}
							onDragOver={(e) => e.preventDefault()}
						>
							<div className="space-y-2">
								<Upload className="h-8 w-8 text-slate-400 mx-auto" />
								<p className="text-sm font-medium text-slate-700">
									{secondFile
										? secondFile.name
										: "Drag and drop your second Excel file here"}
								</p>
								<p className="text-xs text-slate-500">or</p>
								<Button
									variant="outline"
									onClick={() =>
										document.getElementById("second-file-upload")?.click()
									}
									size="sm"
								>
									Browse Files
								</Button>
								<input
									id="second-file-upload"
									type="file"
									className="hidden"
									accept=".xlsx,.xls"
									onChange={handleSecondFileChange}
								/>
							</div>
						</div>
					</div>

					<div className="space-y-2 pt-4">
						<Button
							className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
							disabled={!firstFile || !secondFile || loading}
							onClick={handleUpload}
						>
							{loading ? "Processing..." : "Process Files"}
						</Button>

						{resultFileUrl && (
							<Button
								className="w-full bg-blue-600 hover:bg-blue-700 text-white"
								onClick={() => window.open(resultFileUrl)}
							>
								<Download className="w-4 h-4 mr-2" />
								Download Result File
							</Button>
						)}

						<Button
							className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700"
							onClick={resetForm}
						>
							Reset
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default DisProcessor;
