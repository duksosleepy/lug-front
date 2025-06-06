import AccountingProcessor from "@/app/components/AccountingProcessor";
import { Toaster } from "@/app/components/ui/toaster";

export default function AccountingPage() {
	return (
		<main>
			<AccountingProcessor />
			<Toaster />
		</main>
	);
}
