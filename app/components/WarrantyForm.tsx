"use client";
import { useState, useRef, useEffect } from "react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { PhoneNumberUtil } from "google-libphonenumber";
import ReCAPTCHA from "react-google-recaptcha";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { useToast } from "@/app/components/ui/use-toast";
import { ChevronLeft, ChevronRight, X, HelpCircle } from "lucide-react";

// Initialize PhoneNumberUtil instance
const phoneUtil = PhoneNumberUtil.getInstance();

interface FormData {
	name: string;
	phone: string;
	order_code: string;
}

// Step type for the carousel
interface Step {
	title: string;
	description: string;
	// In a real app, these would be actual image paths
	imagePath: string;
}

// Mock data for the carousel steps
const shopeeSteps: Step[] = [
	{
		title: "Step 1",
		description: "Open the Shopee app and go to your orders",
		imagePath: "/api/placeholder/400/300",
	},
	{
		title: "Step 2",
		description: "Find the order you want to register for warranty",
		imagePath: "/api/placeholder/400/300",
	},
	{
		title: "Step 3",
		description: "Tap on the order to view details",
		imagePath: "/api/placeholder/400/300",
	},
	{
		title: "Step 4",
		description: "The order code is displayed at the top of the order details",
		imagePath: "/api/placeholder/400/300",
	},
];

const tiktokSteps: Step[] = [
	{
		title: "Step 1",
		description: "Open TikTok Shop and navigate to your orders",
		imagePath: "/api/placeholder/400/300",
	},
	{
		title: "Step 2",
		description: "Select the order you need the code for",
		imagePath: "/api/placeholder/400/300",
	},
	{
		title: "Step 3",
		description: "The order code is listed in the order details",
		imagePath: "/api/placeholder/400/300",
	},
];

const lazadaSteps: Step[] = [
	{
		title: "Step 1",
		description: "Log in to your Lazada account",
		imagePath: "/api/placeholder/400/300",
	},
	{
		title: "Step 2",
		description: "Go to 'My Orders' section",
		imagePath: "/api/placeholder/400/300",
	},
	{
		title: "Step 3",
		description: "Find and click on the specific order",
		imagePath: "/api/placeholder/400/300",
	},
	{
		title: "Step 4",
		description: "Look for the order code/number in the order details page",
		imagePath: "/api/placeholder/400/300",
	},
];

const WarrantyForm = () => {
	const [formData, setFormData] = useState<FormData>({
		name: "",
		phone: "",
		order_code: "",
	});
	const [loading, setLoading] = useState(false);
	const { toast } = useToast();

	// Captcha state
	const [captchaValue, setCaptchaValue] = useState<string | null>(null);
	const recaptchaRef = useRef<ReCAPTCHA>(null);

	// Modal and carousel state
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [activeTab, setActiveTab] = useState<"shopee" | "tiktok" | "lazada">(
		"shopee",
	);
	const [currentStep, setCurrentStep] = useState(0);

	// Add ref for modal content
	const modalRef = useRef<HTMLDivElement>(null);

	// Phone validation state
	const [phoneValue, setPhoneValue] = useState("");
	const [isPhoneValid, setIsPhoneValid] = useState(false);

	// Country management - still needed for phone
	const [countryIso, setCountryIso] = useState<string>("vn"); // Lowercase to match PhoneInput

	// Improved phone input validation using google-libphonenumber
	const validatePhone = (phone: string) => {
		try {
			return phoneUtil.isValidNumber(phoneUtil.parseAndKeepRawInput(phone));
		} catch (error) {
			return false;
		}
	};

	// Handle phone input changes with country code persistence
	const handlePhoneChange = (phone: string, data: any) => {
		// Check if the phone input is empty or just contains non-digit characters
		if (!phone || phone.replace(/\D/g, "") === "") {
			// Reset to empty string - the defaultCountry will ensure country code is visible
			setPhoneValue("");
		} else {
			setPhoneValue(phone);
		}

		// Update country when phone country changes
		if (data && data.country && data.country.iso2) {
			const newCountryIso = data.country.iso2.toLowerCase(); // Ensure lowercase

			// Only update if country has changed
			if (newCountryIso !== countryIso) {
				setCountryIso(newCountryIso);
			}
		}
	};

	// Effect to ensure country code is reset when phone is cleared
	useEffect(() => {
		// If user completely clears the input, reset it to empty string
		// so that the defaultCountry takes effect again
		if (phoneValue === "") {
			// Force re-render with default country
			setPhoneValue("");
		}
	}, [phoneValue]);

	// Update form data when phone changes
	useEffect(() => {
		setFormData((prev) => ({
			...prev,
			phone: phoneValue,
		}));

		// Validate phone
		setIsPhoneValid(validatePhone(phoneValue));
	}, [phoneValue]);

	// Add handler for backdrop click
	const handleBackdropClick = (e: React.MouseEvent) => {
		// If click is on backdrop (not on modal content)
		if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
			setIsModalOpen(false);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const validateForm = () => {
		// Basic validation
		if (!formData.name || formData.name.length < 2) {
			toast({
				title: "Validation Error",
				description: "Name should be at least 2 characters",
				variant: "destructive",
			});
			return false;
		}

		if (!isPhoneValid) {
			toast({
				title: "Validation Error",
				description: "Please enter a valid phone number",
				variant: "destructive",
			});
			return false;
		}

		if (!formData.order_code) {
			toast({
				title: "Validation Error",
				description: "Order code is required",
				variant: "destructive",
			});
			return false;
		}

		if (!captchaValue) {
			toast({
				title: "Validation Error",
				description: "Please complete the captcha verification",
				variant: "destructive",
			});
			return false;
		}

		return true;
	};

	// Handle captcha change
	const handleCaptchaChange = (value: string | null) => {
		setCaptchaValue(value);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setLoading(true);

		try {
			// Include captcha token in the payload
			const payloadWithCaptcha = {
				...formData,
				captchaToken: captchaValue,
			};

			// Replace with your actual API endpoint
			const response = await fetch("/api/warranty", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payloadWithCaptcha),
			});

			if (!response.ok) {
				throw new Error("Failed to submit warranty form");
			}

			const result = await response.json();

			toast({
				title: "Success!",
				description:
					"Your warranty information has been submitted successfully!",
			});

			// Redirect to success page
			window.location.href = "/warranty/success";
		} catch (error) {
			toast({
				title: "Error",
				description: `Failed to submit warranty form: ${error instanceof Error ? error.message : "Unknown error"}`,
				variant: "destructive",
			});

			// Reset captcha on error
			if (recaptchaRef.current) {
				recaptchaRef.current.reset();
			}
			setCaptchaValue(null);
		} finally {
			setLoading(false);
		}
	};

	// Handler for opening the guide modal
	const openGuideModal = () => {
		setIsModalOpen(true);
		setCurrentStep(0); // Reset to first step whenever opened
	};

	// Get the current steps based on active tab
	const getCurrentSteps = (): Step[] => {
		switch (activeTab) {
			case "shopee":
				return shopeeSteps;
			case "tiktok":
				return tiktokSteps;
			case "lazada":
				return lazadaSteps;
			default:
				return shopeeSteps;
		}
	};

	// Carousel navigation
	const goToNextSlide = () => {
		const steps = getCurrentSteps();
		setCurrentStep((prevStep) =>
			prevStep === steps.length - 1 ? 0 : prevStep + 1,
		);
	};

	const goToPrevSlide = () => {
		const steps = getCurrentSteps();
		setCurrentStep((prevStep) =>
			prevStep === 0 ? steps.length - 1 : prevStep - 1,
		);
	};

	// Switch between tabs
	const handleTabChange = (tab: "shopee" | "tiktok" | "lazada") => {
		setActiveTab(tab);
		setCurrentStep(0); // Reset step when changing tabs
	};

	return (
		<div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
			<Card className="w-full max-w-md shadow-lg">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold text-center text-slate-800">
						Warranty Registration
					</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Name Field */}
						<div>
							<label
								htmlFor="name"
								className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between"
							>
								<span>Name</span>
								<span className="text-xs text-red-500">* required</span>
							</label>
							<input
								type="text"
								id="name"
								name="name"
								value={formData.name}
								onChange={handleChange}
								className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="Enter your name"
								required
							/>
						</div>

						{/* Phone Field */}
						<div>
							<label
								htmlFor="phone"
								className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between"
							>
								<span>Phone</span>
								<span className="text-xs text-red-500">* required</span>
							</label>
							<div className="phone-input-wrapper relative">
								<PhoneInput
									defaultCountry="vn"
									value={phoneValue}
									onChange={handlePhoneChange}
									inputClassName="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									countrySelectorStyleProps={{
										buttonClassName:
											"border border-gray-300 border-r-0 rounded-l-lg bg-white px-2 h-12",
										dropdownStyleProps: {
											className:
												"absolute mt-1 z-10 bg-white border border-gray-300 rounded-lg shadow-lg",
											listItemClassName:
												"px-3 py-2 hover:bg-gray-100 cursor-pointer",
										},
									}}
									forceDialCode={true}
									disableDialCodeAndPrefix={false}
								/>
								<style jsx global>{`
									/* Synchronized focus states for phone input */
									.phone-input-wrapper {
										position: relative;
									}

									.phone-input-wrapper .react-international-phone-input-container {
										display: flex;
									}

									.phone-input-wrapper .react-international-phone-country-selector-button {
										transition: all 0.2s ease-in-out;
									}

									.phone-input-wrapper .react-international-phone-input:focus + .react-international-phone-country-selector-button,
									.phone-input-wrapper .react-international-phone-input:focus-within + .react-international-phone-country-selector-button {
										border-color: rgb(59, 130, 246) !important;
										box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
									}

									.phone-input-wrapper .react-international-phone-input:focus {
										z-index: 1;
									}
								`}</style>
							</div>
							{phoneValue && !isPhoneValid && (
								<p className="text-red-500 text-xs mt-1">
									Please enter a valid phone number
								</p>
							)}
						</div>

						{/* Order Code Field */}
						<div>
							<div className="flex justify-between items-center mb-1">
								<label
									htmlFor="order_code"
									className="block text-sm font-medium text-gray-700 flex items-center"
								>
									<span>Order Code</span>
									<span className="text-xs text-red-500 ml-2">* required</span>
								</label>
								<div
									className="text-sm text-blue-600 flex items-center cursor-pointer hover:underline"
									onClick={openGuideModal}
								>
									<HelpCircle size={16} className="mr-1" />
									How to find it
								</div>
							</div>
							<input
								type="text"
								id="order_code"
								name="order_code"
								value={formData.order_code}
								onChange={handleChange}
								className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="Enter your order code"
								required
							/>
						</div>

						{/* Captcha */}
						<div className="pt-2">
							<label className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
								<span>Security Verification</span>
								<span className="text-xs text-red-500">* required</span>
							</label>
							<div className="flex justify-center md:justify-start">
								<ReCAPTCHA
									ref={recaptchaRef}
									sitekey="6LeOF6MqAAAAAHPim0XGcbswI_ZwaA5iRPRipvbb" // Replace with your actual reCAPTCHA site key
									onChange={handleCaptchaChange}
									className="transform scale-90 origin-left md:scale-100"
								/>
							</div>
							{!captchaValue && (
								<p className="text-xs text-gray-500 mt-1">
									Please complete the captcha to continue
								</p>
							)}
						</div>

						{/* Submit Button */}
						<div className="pt-2">
							<Button
								type="submit"
								className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition duration-200 ease-in-out"
								disabled={loading || !captchaValue}
							>
								{loading ? "Submitting..." : "Submit"}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>

			{/* Modal for Order Code Guide */}
			{isModalOpen && (
				<div
					className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
					onClick={handleBackdropClick}
				>
					<div
						ref={modalRef}
						className="bg-white rounded-lg w-full max-w-lg shadow-xl"
					>
						{/* Modal Header */}
						<div className="flex justify-between items-center p-4 border-b">
							<h3 className="text-lg font-semibold">
								How to Find Your Order Code
							</h3>
							<button
								onClick={() => setIsModalOpen(false)}
								className="text-gray-500 hover:text-gray-700"
							>
								<X size={20} />
							</button>
						</div>

						{/* Tab Navigation */}
						<div className="flex justify-center border-b">
							<button
								className={`px-6 py-3 text-sm font-medium mx-2 ${
									activeTab === "shopee"
										? "border-b-2 border-blue-500 text-blue-600"
										: "text-gray-500 hover:text-gray-700"
								}`}
								onClick={() => handleTabChange("shopee")}
							>
								Shopee
							</button>
							<button
								className={`px-6 py-3 text-sm font-medium mx-2 ${
									activeTab === "tiktok"
										? "border-b-2 border-blue-500 text-blue-600"
										: "text-gray-500 hover:text-gray-700"
								}`}
								onClick={() => handleTabChange("tiktok")}
							>
								TikTok
							</button>
							<button
								className={`px-6 py-3 text-sm font-medium mx-2 ${
									activeTab === "lazada"
										? "border-b-2 border-blue-500 text-blue-600"
										: "text-gray-500 hover:text-gray-700"
								}`}
								onClick={() => handleTabChange("lazada")}
							>
								Lazada
							</button>
						</div>

						{/* Carousel */}
						<div className="p-4">
							<div className="relative">
								{/* Carousel Content */}
								<div className="overflow-hidden relative">
									<div className="flex flex-col items-center justify-center">
										{/* Navigation Buttons (now positioned on the sides of the image) */}
										<button
											onClick={goToPrevSlide}
											className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-gray-200 bg-opacity-70 hover:bg-gray-300 z-10"
											aria-label="Previous slide"
										>
											<ChevronLeft size={20} />
										</button>

										<img
											src={getCurrentSteps()[currentStep].imagePath}
											alt={getCurrentSteps()[currentStep].title}
											className="w-full h-64 object-contain mb-4"
										/>

										<button
											onClick={goToNextSlide}
											className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-gray-200 bg-opacity-70 hover:bg-gray-300 z-10"
											aria-label="Next slide"
										>
											<ChevronRight size={20} />
										</button>

										<h4 className="text-lg font-medium">
											{getCurrentSteps()[currentStep].title}
										</h4>
										<p className="text-sm text-gray-600 text-center">
											{getCurrentSteps()[currentStep].description}
										</p>
									</div>
								</div>

								{/* Indicator Dots */}
								<div className="flex justify-center mt-4">
									{getCurrentSteps().map((_, index) => (
										<div
											key={index}
											className={`w-2 h-2 mx-1 rounded-full ${
												currentStep === index ? "bg-blue-500" : "bg-gray-300"
											}`}
										></div>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default WarrantyForm;
