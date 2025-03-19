import { Card, CardContent } from "@/app/components/ui/card";

export const metadata = {
	title: "Warranty Submission Successful",
	description: "Your warranty information has been submitted successfully",
};

export default function WarrantySuccessPage() {
	return (
		<div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
			<Card className="w-full max-w-md shadow-lg">
				<CardContent className="text-center pt-8 pb-8">
					<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<svg
							className="w-8 h-8 text-green-500"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-labelledby="success-icon-title"
							role="img"
						>
							<title id="success-icon-title">Success checkmark icon</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M5 13l4 4L19 7"
							/>
						</svg>
					</div>
					<h1 className="text-2xl font-semibold text-gray-800 mb-2">
						Thank You!
					</h1>
					<p className="text-gray-600">
						Your warranty information has been submitted successfully.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
