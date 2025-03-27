"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { PhoneNumberUtil } from "google-libphonenumber";
import ReCAPTCHA from "react-google-recaptcha";
// Bỏ import Image vì không sử dụng
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { useToast } from "@/app/components/ui/use-toast";
import {
	ChevronLeft,
	ChevronRight,
	X,
	HelpCircle,
	ChevronDown,
	ZoomIn,
} from "lucide-react";

// Initialize PhoneNumberUtil instance
const phoneUtil = PhoneNumberUtil.getInstance();

interface FormData {
	name: string;
	phone: string;
	order_code: string;
	purchase_platform: string; // Field for purchase platform
}

// Phone input data interface
interface PhoneInputData {
	country?: {
		iso2?: string;
	};
}

// Step type for the carousel
interface Step {
	imagePath: string;
	notes?: string; // Optional additional notes for each step
}

// Real data for the carousel steps with actual images
const shopeeSteps: Step[] = [
	{
		imagePath: "/images/shopee/1.png",
		notes: "Vào mục 'Tôi' > 'Đơn mua' trong ứng dụng Shopee",
	},
	{
		imagePath: "/images/shopee/2.png",
	},
	{
		imagePath: "/images/shopee/3.png",
	},
	{
		imagePath: "/images/shopee/4.png",
	},
];

const tiktokSteps: Step[] = [
	{
		imagePath: "/images/tiktok/1.png",
	},
	{
		imagePath: "/images/tiktok/2.png",
	},
	{
		imagePath: "/images/tiktok/3.png",
	},
	{
		imagePath: "/images/tiktok/4.png",
	},
];

const lazadaSteps: Step[] = [
	{
		imagePath: "/images/lazada/1.png",
	},
	{
		imagePath: "/images/lazada/2.png",
	},
	{
		imagePath: "/images/lazada/3.png",
	},
	{
		imagePath: "/images/lazada/4.png",
	},
];

// Available purchase platforms
const PURCHASE_PLATFORMS = [
	{ value: "shopee", label: "Shopee" },
	{ value: "tiktok", label: "TikTok" },
	{ value: "lazada", label: "Lazada" },
];

const WarrantyForm = () => {
	const [formData, setFormData] = useState<FormData>({
		name: "",
		phone: "",
		order_code: "",
		purchase_platform: "shopee", // Default value
	});
	const [loading, setLoading] = useState(false);
	const [orderCodeError, setOrderCodeError] = useState<string | null>(null);
	const { toast } = useToast();

	// Dropdown state
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	// Captcha state
	const [captchaValue, setCaptchaValue] = useState<string | null>(null);
	const recaptchaRef = useRef<ReCAPTCHA>(null);

	// Modal and carousel state
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [activeTab, setActiveTab] = useState<"shopee" | "tiktok" | "lazada">(
		"shopee",
	);
	const [currentStep, setCurrentStep] = useState(0);
	const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

	// Add ref for modal content
	const modalRef = useRef<HTMLDivElement>(null);
	// Add ref for dropdown
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Phone validation state
	const [phoneValue, setPhoneValue] = useState("");
	const [isPhoneValid, setIsPhoneValid] = useState(false);

	// Country management - still needed for phone
	const [countryIso, setCountryIso] = useState<string>("vn"); // Lowercase to match PhoneInput

	// Close dropdown when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsDropdownOpen(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	// Improved phone input validation using google-libphonenumber with useCallback
	const validatePhone = useCallback(
		(phone: string) => {
			// Remove non-digit characters to count only the digits.
			const numericPhone = phone.replace(/\D/g, "");

			// If too few digits are entered, skip parsing.
			if (numericPhone.length < 5) {
				return false;
			}

			try {
				// Pass the region code (ensure it's uppercase)
				const parsedNumber = phoneUtil.parseAndKeepRawInput(
					phone,
					countryIso.toUpperCase(),
				);
				return phoneUtil.isValidNumber(parsedNumber);
			} catch (error) {
				console.error("Phone validation error:", error);
				return false;
			}
		},
		[countryIso],
	);

	// Handle phone input changes with country code persistence
	const handlePhoneChange = (phone: string, data: PhoneInputData) => {
		// Check if the phone input is empty or just contains non-digit characters
		if (!phone || phone.replace(/\D/g, "") === "") {
			// Reset to empty string - the defaultCountry will ensure country code is visible
			setPhoneValue("");
		} else {
			setPhoneValue(phone);
		}

		// Update country when phone country changes
		if (data?.country?.iso2) {
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
	}, [phoneValue, validatePhone]);

	// Add handler for backdrop click
	const handleBackdropClick = (e: React.MouseEvent) => {
		// If click is on backdrop (not on modal content)
		if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
			setIsModalOpen(false);
		}
	};

	// Validate order code function based on selected platform
	const validateOrderCode = (
		code: string,
		platform: string,
	): { isValid: boolean; message: string | null } => {
		if (!code) {
			return { isValid: false, message: "Mã đơn hàng là bắt buộc" };
		}

		// Remove any spaces from the code
		const trimmedCode = code.trim();

		switch (platform) {
			case "shopee":
				// Shopee: 14 characters, alphanumeric
				const shopeeRegex = /^[a-zA-Z0-9]{14}$/;
				if (!shopeeRegex.test(trimmedCode)) {
					return {
						isValid: false,
						message: "Mã đơn hàng Shopee phải có đúng 14 ký tự chữ và số",
					};
				}
				break;

			case "tiktok":
				// TikTok: 18 characters, numbers only
				const tiktokRegex = /^[0-9]{18}$/;
				if (!tiktokRegex.test(trimmedCode)) {
					return {
						isValid: false,
						message: "Mã đơn hàng TikTok phải có đúng 18 ký tự số",
					};
				}
				break;

			case "lazada":
				// Lazada: 15 characters, numbers only
				const lazadaRegex = /^[0-9]{15}$/;
				if (!lazadaRegex.test(trimmedCode)) {
					return {
						isValid: false,
						message: "Mã đơn hàng Lazada phải có đúng 15 ký tự số",
					};
				}
				break;

			default:
				return { isValid: false, message: "Nền tảng không hợp lệ" };
		}

		return { isValid: true, message: null };
	};

	// Handle order code blur event
	const handleOrderCodeBlur = () => {
		if (formData.order_code) {
			const validation = validateOrderCode(
				formData.order_code,
				formData.purchase_platform,
			);
			if (!validation.isValid) {
				setOrderCodeError(validation.message);
			} else {
				setOrderCodeError(null);
			}
		} else {
			setOrderCodeError(null);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;

		// Reset error message if user starts typing in order_code field
		if (name === "order_code" && orderCodeError) {
			setOrderCodeError(null);
		}

		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));

		// Real-time validation for order code as user types
		if (name === "order_code" && value) {
			// Only check format when user has typed enough characters
			if (
				(formData.purchase_platform === "shopee" && value.length >= 14) ||
				(formData.purchase_platform === "tiktok" && value.length >= 18) ||
				(formData.purchase_platform === "lazada" && value.length >= 15)
			) {
				const validation = validateOrderCode(value, formData.purchase_platform);
				if (!validation.isValid) {
					setOrderCodeError(validation.message);
				} else {
					setOrderCodeError(null);
				}
			}
		}
	};

	// Handle platform selection
	const handlePlatformSelect = (platform: string) => {
		setFormData((prev) => ({
			...prev,
			purchase_platform: platform,
		}));
		setIsDropdownOpen(false);

		// Update active tab in modal to match selected platform
		setActiveTab(platform as "shopee" | "tiktok" | "lazada");

		// Re-validate order code if there's one entered already
		if (formData.order_code) {
			const validation = validateOrderCode(formData.order_code, platform);
			if (!validation.isValid) {
				setOrderCodeError(validation.message);
			} else {
				setOrderCodeError(null);
			}
		}
	};

	const validateForm = () => {
		// Basic validation
		if (!formData.name || formData.name.length < 2) {
			toast({
				title: "Lỗi xác thực",
				description: "Tên phải có ít nhất 2 ký tự",
				variant: "destructive",
			});
			return false;
		}

		if (!isPhoneValid) {
			toast({
				title: "Lỗi xác thực",
				description: "Vui lòng nhập số điện thoại hợp lệ",
				variant: "destructive",
			});
			return false;
		}

		if (!formData.order_code) {
			toast({
				title: "Lỗi xác thực",
				description: "Mã đơn hàng là bắt buộc",
				variant: "destructive",
			});
			return false;
		}

		// Validate order code based on platform
		const orderCodeValidation = validateOrderCode(
			formData.order_code,
			formData.purchase_platform,
		);
		if (!orderCodeValidation.isValid) {
			setOrderCodeError(orderCodeValidation.message);
			toast({
				title: "Lỗi xác thực",
				description: orderCodeValidation.message || "Mã đơn hàng không hợp lệ",
				variant: "destructive",
			});
			return false;
		}

		if (!formData.purchase_platform) {
			toast({
				title: "Lỗi xác thực",
				description: "Vui lòng chọn nơi mua hàng",
				variant: "destructive",
			});
			return false;
		}

		if (!captchaValue) {
			toast({
				title: "Lỗi xác thực",
				description: "Vui lòng hoàn thành xác minh captcha",
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
				throw new Error("Không thể gửi biểu mẫu bảo hành");
			}

			await response.json();

			toast({
				title: "Thành công!",
				description: "Thông tin bảo hành của bạn đã được gửi thành công!",
			});

			// Redirect to success page
			window.location.href = "/warranty/success";
		} catch (error) {
			toast({
				title: "Lỗi",
				description: `Không thể gửi biểu mẫu bảo hành: ${error instanceof Error ? error.message : "Lỗi không xác định"}`,
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

	// Preload images for better user experience
	const preloadImages = (steps: Step[]) => {
		steps.forEach((step) => {
			const img = new Image();
			img.src = step.imagePath;
		});
	};

	// Handler for opening the guide modal
	const openGuideModal = () => {
		setIsModalOpen(true);
		// Set active tab to match the currently selected purchase platform
		setActiveTab(formData.purchase_platform as "shopee" | "tiktok" | "lazada");
		setCurrentStep(0); // Reset to first step whenever opened

		// Preload images for the current platform
		const currentSteps = getCurrentSteps();
		preloadImages(currentSteps);
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

	// Get the display label for current platform
	const getCurrentPlatformLabel = () => {
		const platform = PURCHASE_PLATFORMS.find(
			(p) => p.value === formData.purchase_platform,
		);
		return platform ? platform.label : "Chọn nơi mua";
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-100 to-blue-50 flex items-center justify-center p-4">
			<div className="w-full max-w-4xl">
				{/* Desktop Layout: Side by side with equal heights */}
				<div className="flex flex-col lg:flex-row items-stretch gap-8">
					{/* Logo and Branding Column - Modified for equal height */}
					<div className="w-full lg:w-1/3 flex flex-col items-start justify-between bg-white/80 rounded-lg shadow-sm mb-6 lg:mb-0 p-4 lg:p-6">
						<div className="w-full">
							<div className="w-full flex justify-center lg:justify-start mb-6">
								<img
									src="/logo.png"
									alt="LUG.vn Logo"
									width={160}
									height={48}
									className="h-auto"
								/>
							</div>
							<div className="w-full text-gray-700">
								<h2 className="text-2xl font-bold text-gray-800 mb-4 text-center lg:text-left">
									Đăng Ký Bảo Hành Sản Phẩm
								</h2>
								<p className="mb-3 text-center lg:text-left">
									Cảm ơn bạn đã lựa chọn sản phẩm của chúng tôi!
								</p>
								<p className="mb-5 text-center lg:text-left">
									Hãy hoàn thành mẫu đăng ký bảo hành để được hỗ trợ tốt nhất.
								</p>
							</div>
						</div>
						<div className="w-full bg-gradient-to-r from-blue-50 to-red-50 p-5 rounded-lg border border-blue-100 mt-4">
							<h3 className="font-semibold text-red-600 mb-3 text-center lg:text-left">
								Lợi ích khi đăng ký bảo hành:
							</h3>
							<ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
								<li>Bảo hành chính hãng</li>
								<li>Hỗ trợ kỹ thuật ưu tiên</li>
								<li>Ưu đãi đặc biệt cho khách hàng đã đăng ký</li>
							</ul>
						</div>
					</div>

					{/* Form Column - Using h-full for equal height */}
					<div className="w-full lg:w-2/3 h-full flex">
						<Card className="w-full shadow-xl border-0 flex flex-col">
							<CardHeader className="space-y-1 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-t-lg flex-shrink-0">
								{/* Show this title only on mobile, on desktop it appears in the left column */}
								<CardTitle className="text-2xl font-bold text-center lg:hidden">
									Đăng Ký Bảo Hành
								</CardTitle>
								{/* On desktop, show a simpler header */}
								<CardTitle className="text-xl font-bold text-center hidden lg:block">
									Thông Tin Đăng Ký
								</CardTitle>
							</CardHeader>
							<CardContent className="pt-6 flex-grow">
								<form onSubmit={handleSubmit} className="space-y-6">
									{/* Name Field */}
									<div>
										<label
											htmlFor="name"
											className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1"
										>
											<span>Họ và tên</span>
										</label>
										<input
											type="text"
											id="name"
											name="name"
											value={formData.name}
											onChange={handleChange}
											className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
											placeholder="Nhập họ và tên của bạn"
											required
										/>
									</div>

									{/* Phone Field */}
									<div>
										<label
											htmlFor="phone"
											className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1"
										>
											<span>Số điện thoại</span>
										</label>
										<div className="phone-input-wrapper relative">
											<PhoneInput
												defaultCountry="vn"
												value={phoneValue}
												onChange={handlePhoneChange}
												inputClassName="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
													border-color: rgb(239, 68, 68) !important;
													box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.3);
												}

												.phone-input-wrapper .react-international-phone-input:focus {
													z-index: 1;
												}
											`}</style>
										</div>
										{phoneValue && !isPhoneValid && (
											<p className="text-red-500 text-xs mt-1">
												Vui lòng nhập số điện thoại hợp lệ
											</p>
										)}
									</div>

									{/* Purchase Platform Dropdown Field */}
									<div>
										<label
											htmlFor="purchase_platform"
											className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1"
										>
											<span>Nơi mua</span>
										</label>
										<div className="relative" ref={dropdownRef}>
											<button
												type="button"
												className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-left"
												onClick={() => setIsDropdownOpen(!isDropdownOpen)}
												aria-haspopup="listbox"
												aria-expanded={isDropdownOpen}
											>
												<span>{getCurrentPlatformLabel()}</span>
												<ChevronDown
													className={`h-5 w-5 transition-transform ${isDropdownOpen ? "transform rotate-180" : ""}`}
												/>
											</button>

											{isDropdownOpen && (
												<div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg border border-gray-200">
													<ul
														className="py-1 max-h-60 overflow-auto"
														role="listbox"
													>
														{PURCHASE_PLATFORMS.map((platform) => (
															<li
																key={platform.value}
																className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
																	formData.purchase_platform === platform.value
																		? "bg-red-50 text-red-600"
																		: ""
																}`}
																onClick={() =>
																	handlePlatformSelect(platform.value)
																}
																role="option"
																aria-selected={
																	formData.purchase_platform === platform.value
																}
															>
																{platform.label}
															</li>
														))}
													</ul>
												</div>
											)}
										</div>
									</div>

									{/* Order Code Field */}
									<div>
										<div className="flex justify-between items-center mb-1">
											<label
												htmlFor="order_code"
												className="flex items-center text-sm font-medium text-gray-700"
											>
												<span>Mã đơn hàng</span>
											</label>
											<button
												type="button"
												className="text-sm text-red-600 flex items-center hover:underline"
												onClick={openGuideModal}
											>
												<HelpCircle size={16} className="mr-1" />
												Cách lấy mã đơn hàng?
											</button>
										</div>
										<input
											type="text"
											id="order_code"
											name="order_code"
											value={formData.order_code}
											onChange={handleChange}
											onBlur={handleOrderCodeBlur}
											className={`w-full px-4 py-3 rounded-lg border ${
												orderCodeError
													? "border-red-500 focus:ring-red-500"
													: "border-gray-300 focus:ring-red-500"
											} focus:outline-none focus:ring-2 focus:border-transparent`}
											placeholder={
												formData.purchase_platform === "shopee"
													? "Nhập mã đơn hàng Shopee (14 ký tự)"
													: formData.purchase_platform === "tiktok"
														? "Nhập mã đơn hàng TikTok (18 ký tự số)"
														: "Nhập mã đơn hàng Lazada (15 ký tự số)"
											}
											required
										/>
										{orderCodeError && (
											<p className="text-red-500 text-xs mt-1">
												{orderCodeError}
											</p>
										)}
									</div>

									{/* Captcha */}
									<div className="pt-2">
										<label
											htmlFor="recaptcha"
											className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1"
										>
											<span>Xác minh bảo mật</span>
										</label>
										<div className="flex justify-center">
											<ReCAPTCHA
												id="recaptcha"
												ref={recaptchaRef}
												sitekey="6LcxZPsqAAAAAAyySBd1W6bq1Ue3uxKmV_iM23HH"
												onChange={handleCaptchaChange}
												className="transform scale-90 md:scale-100"
											/>
										</div>
										{!captchaValue && (
											<p className="text-xs text-gray-500 mt-1 text-center">
												Vui lòng hoàn thành xác minh để tiếp tục
											</p>
										)}
									</div>

									{/* Submit Button */}
									<div className="pt-2">
										<Button
											type="submit"
											className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg transition duration-200 ease-in-out"
											disabled={loading || !captchaValue}
										>
											{loading ? "Đang gửi..." : "Gửi đăng ký"}
										</Button>
									</div>
								</form>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>

			{/* Modal for Order Code Guide */}
			{isModalOpen && (
				// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
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
							<h3 className="text-lg font-semibold">Cách tìm mã đơn hàng</h3>
							<button
								type="button"
								onClick={() => setIsModalOpen(false)}
								className="text-gray-500 hover:text-gray-700"
							>
								<X size={20} />
							</button>
						</div>

						{/* Tab Navigation */}
						<div className="flex justify-center border-b">
							<button
								type="button"
								className={`px-6 py-3 text-sm font-medium mx-2 ${
									activeTab === "shopee"
										? "border-b-2 border-red-500 text-red-600"
										: "text-gray-500 hover:text-gray-700"
								}`}
								onClick={() => handleTabChange("shopee")}
							>
								Shopee
							</button>
							<button
								type="button"
								className={`px-6 py-3 text-sm font-medium mx-2 ${
									activeTab === "tiktok"
										? "border-b-2 border-red-500 text-red-600"
										: "text-gray-500 hover:text-gray-700"
								}`}
								onClick={() => handleTabChange("tiktok")}
							>
								TikTok
							</button>
							<button
								type="button"
								className={`px-6 py-3 text-sm font-medium mx-2 ${
									activeTab === "lazada"
										? "border-b-2 border-red-500 text-red-600"
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
											type="button"
											onClick={goToPrevSlide}
											className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-gray-200 bg-opacity-70 hover:bg-gray-300 z-10"
											aria-label="Previous slide"
										>
											<ChevronLeft size={20} />
										</button>

										<div
											className="cursor-zoom-in relative"
											onClick={() =>
												setFullscreenImage(
													getCurrentSteps()[currentStep].imagePath,
												)
											}
										>
											<img
												src={getCurrentSteps()[currentStep].imagePath}
												alt="Hướng dẫn"
												className="w-full h-64 object-contain mb-4"
											/>
											<div className="absolute bottom-2 right-2 bg-white bg-opacity-70 rounded-full p-1">
												<ZoomIn size={16} className="text-gray-700" />
											</div>

											{/* Highlight areas if defined */}
											{getCurrentSteps()[currentStep].highlightAreas?.map(
												(area, idx) => (
													<div
														key={idx}
														className="absolute border-2 border-red-500 bg-red-500 bg-opacity-20 pointer-events-none"
														style={{
															left: `${area.x}px`,
															top: `${area.y}px`,
															width: `${area.width}px`,
															height: `${area.height}px`,
														}}
													/>
												),
											)}
										</div>

										<button
											type="button"
											onClick={goToNextSlide}
											className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-gray-200 bg-opacity-70 hover:bg-gray-300 z-10"
											aria-label="Next slide"
										>
											<ChevronRight size={20} />
										</button>

										{/* Removed title and description since they're already in the images */}

										{/* Display additional notes if available */}
										{getCurrentSteps()[currentStep].notes && (
											<p className="text-xs italic text-gray-500 mt-2 text-center">
												{getCurrentSteps()[currentStep].notes}
											</p>
										)}
									</div>
								</div>

								{/* Indicator Dots */}
								<div className="flex justify-center mt-4">
									{getCurrentSteps().map((step, index) => (
										<div
											key={`${activeTab}-${step.title}-${index}`}
											className={`w-2 h-2 mx-1 rounded-full ${
												currentStep === index ? "bg-red-500" : "bg-gray-300"
											}`}
										/>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Fullscreen image modal */}
			{fullscreenImage && (
				<div
					className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
					onClick={() => setFullscreenImage(null)}
				>
					<div className="relative max-w-4xl max-h-screen">
						<img
							src={fullscreenImage}
							alt="Xem chi tiết hướng dẫn"
							className="max-h-[90vh] max-w-full object-contain"
						/>
						<button
							className="absolute top-2 right-2 bg-white rounded-full p-1"
							onClick={(e) => {
								e.stopPropagation();
								setFullscreenImage(null);
							}}
						>
							<X size={24} />
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default WarrantyForm;
