import WarrantyForm from "@/app/components/WarrantyForm";
import { Toaster } from "@/app/components/ui/toaster";

export const metadata = {
	title: "Warranty Registration",
	description: "Register your product warranty",
};

export default function WarrantyPage() {
	return (
		<main>
			<WarrantyForm />
			<Toaster />
		</main>
	);
}
