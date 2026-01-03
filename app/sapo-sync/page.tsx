"use client";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/app/components/ui/use-toast";
import { Toaster } from "@/app/components/ui/toaster";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { format, isValid } from "date-fns";

export default function SapoSyncPage() {
	const { toast } = useToast();
	const [loading, setLoading] = useState(false);

	// Format dates for display
	const formatDisplayDate = (dateInput: string | Date): string => {
		try {
			const date =
				typeof dateInput === "string" ? new Date(dateInput) : dateInput;
			return isValid(date) ? format(date, "MM/dd/yyyy") : "";
		} catch {
			return "";
		}
	};

	// Initialize with default values
	const [startDate, setStartDate] = useState("2026-01-01");
	const [endDate, setEndDate] = useState(
		new Date().toISOString().split("T")[0],
	);
	const [startDateDisplay, setStartDateDisplay] = useState(
		formatDisplayDate("2026-01-01"),
	);
	const [endDateDisplay, setEndDateDisplay] = useState(
		formatDisplayDate(new Date()), // Now works correctly with Date object
	);

	// Calendar popup state
	const [showStartCalendar, setShowStartCalendar] = useState(false);
	const [showEndCalendar, setShowEndCalendar] = useState(false);
	const [calendarMonth, setCalendarMonth] = useState(new Date(2026, 0));
	const [endCalendarMonth, setEndCalendarMonth] = useState(new Date());
	const [showMonthPicker, setShowMonthPicker] = useState(false);
	const [showEndMonthPicker, setShowEndMonthPicker] = useState(false);
	const [showYearPicker, setShowYearPicker] = useState(false);
	const [showEndYearPicker, setShowEndYearPicker] = useState(false);

	// Refs for outside click detection
	const startCalendarRef = useRef<HTMLDivElement>(null);
	const endCalendarRef = useRef<HTMLDivElement>(null);
	const startInputRef = useRef<HTMLDivElement>(null);
	const endInputRef = useRef<HTMLDivElement>(null);

	// Handle outside clicks to close calendar
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				showStartCalendar &&
				startCalendarRef.current &&
				!startCalendarRef.current.contains(event.target as Node) &&
				!startInputRef.current?.contains(event.target as Node)
			) {
				setShowStartCalendar(false);
			}
			if (
				showEndCalendar &&
				endCalendarRef.current &&
				!endCalendarRef.current.contains(event.target as Node) &&
				!endInputRef.current?.contains(event.target as Node)
			) {
				setShowEndCalendar(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [showStartCalendar, showEndCalendar]);
	interface CalendarDay {
		date: Date;
		day: number;
		isCurrentMonth: boolean;
		isToday: boolean;
	}
	// Generate calendar days
	const generateCalendarDays = (date: Date): CalendarDay[] => {
		const year = date.getFullYear();
		const month = date.getMonth();

		// First day of the month
		const firstDay = new Date(year, month, 1);
		// Last day of the month
		const lastDay = new Date(year, month + 1, 0);

		// Get day of week for first day (0 = Sunday, 1 = Monday, etc.)
		const firstDayOfWeek = firstDay.getDay();

		// Get the days from previous month to fill the first week
		const daysFromPrevMonth = firstDayOfWeek;

		// Get days in current month
		const daysInMonth = lastDay.getDate();

		// Calculate total number of days to display (including days from previous and next months)
		const totalDays = Math.ceil((daysFromPrevMonth + daysInMonth) / 7) * 7;

		// Build array of day objects
		const calendarDays: CalendarDay[] = [];

		// Days from previous month
		const prevMonthLastDay = new Date(year, month, 0).getDate();
		for (let i = 0; i < daysFromPrevMonth; i++) {
			calendarDays.push({
				date: new Date(
					year,
					month - 1,
					prevMonthLastDay - daysFromPrevMonth + i + 1,
				),
				day: prevMonthLastDay - daysFromPrevMonth + i + 1,
				isCurrentMonth: false,
				isToday: false,
			});
		}

		// Days from current month
		const today = new Date();
		for (let i = 1; i <= daysInMonth; i++) {
			const currentDate = new Date(year, month, i);
			calendarDays.push({
				date: currentDate,
				day: i,
				isCurrentMonth: true,
				isToday:
					today.getDate() === i &&
					today.getMonth() === month &&
					today.getFullYear() === year,
			});
		}

		// Days from next month
		const daysFromNextMonth = totalDays - calendarDays.length;
		for (let i = 1; i <= daysFromNextMonth; i++) {
			calendarDays.push({
				date: new Date(year, month + 1, i),
				day: i,
				isCurrentMonth: false,
				isToday: false,
			});
		}

		return calendarDays;
	};

	// Navigation for calendar
	const prevMonth = (isEndDate = false) => {
		if (isEndDate) {
			setEndCalendarMonth(
				new Date(
					endCalendarMonth.getFullYear(),
					endCalendarMonth.getMonth() - 1,
				),
			);
		} else {
			setCalendarMonth(
				new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1),
			);
		}
	};

	const nextMonth = (isEndDate = false) => {
		if (isEndDate) {
			setEndCalendarMonth(
				new Date(
					endCalendarMonth.getFullYear(),
					endCalendarMonth.getMonth() + 1,
				),
			);
		} else {
			setCalendarMonth(
				new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1),
			);
		}
	};

	// Select date handler
	const selectDate = (date: Date, isEndDate = false): void => {
		const formattedDate = format(date, "yyyy-MM-dd");
		const displayDate = format(date, "MM/dd/yyyy");

		if (isEndDate) {
			setEndDate(formattedDate);
			setEndDateDisplay(displayDate);
			setShowEndCalendar(false);
		} else {
			setStartDate(formattedDate);
			setStartDateDisplay(displayDate);
			setShowStartCalendar(false);
		}
	};

	// Clear date handler
	const clearDate = (isEndDate = false) => {
		if (isEndDate) {
			setEndDate("");
			setEndDateDisplay("");
			setShowEndCalendar(false);
		} else {
			setStartDate("");
			setStartDateDisplay("");
			setShowStartCalendar(false);
		}
	};

	const handleSync = async () => {
		if (!startDate || !endDate) {
			toast({
				title: "Missing date range",
				description: "Please select both start and end dates",
				variant: "destructive",
			});
			return;
		}

		// Validate date range
		if (new Date(startDate) > new Date(endDate)) {
			toast({
				title: "Invalid date range",
				description: "Start date must be before end date",
				variant: "destructive",
			});
			return;
		}

		setLoading(true);

		try {
			const response = await fetch("/sapo/sync", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					startDate,
					endDate,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to sync data");
			}

			toast({
				title: "Sync successful",
				description: "Your data is being processed",
			});
		} catch (error) {
			toast({
				title: "Sync failed",
				description: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	interface CustomCalendarProps {
		currentMonth: Date;
		selectedDate: string;
		onSelectDate: (date: Date) => void;
		onClear: () => void;
		calendarRef: React.Ref<HTMLDivElement>; // More general Ref type
		isEndDate: boolean;
	}
	// Custom Calendar Component
	const CustomCalendar = ({
		currentMonth,
		selectedDate,
		onSelectDate,
		onClear,
		calendarRef,
		isEndDate,
	}: CustomCalendarProps) => {
		const days = generateCalendarDays(currentMonth);
		const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
		const months = [
			"January", "February", "March", "April", "May", "June",
			"July", "August", "September", "October", "November", "December"
		];
		const showPicker = isEndDate ? showEndMonthPicker : showMonthPicker;
		const setShowPicker = isEndDate ? setShowEndMonthPicker : setShowMonthPicker;
		const showYearPickerState = isEndDate ? showEndYearPicker : showYearPicker;
		const setShowYearPickerState = isEndDate ? setShowEndYearPicker : setShowYearPicker;

		const currentYear = currentMonth.getFullYear();
		const years = Array.from({ length: 12 }, (_, i) => currentYear - 5 + i);

		const handleMonthSelect = (monthIndex: number) => {
			if (isEndDate) {
				setEndCalendarMonth(new Date(currentMonth.getFullYear(), monthIndex));
			} else {
				setCalendarMonth(new Date(currentMonth.getFullYear(), monthIndex));
			}
			setShowPicker(false);
		};

		const handleYearSelect = (year: number) => {
			if (isEndDate) {
				setEndCalendarMonth(new Date(year, currentMonth.getMonth()));
			} else {
				setCalendarMonth(new Date(year, currentMonth.getMonth()));
			}
			setShowYearPickerState(false);
		};

		const toggleMonthPicker = () => {
			setShowPicker(!showPicker);
			setShowYearPickerState(false);
		};

		const toggleYearPicker = () => {
			setShowYearPickerState(!showYearPickerState);
			setShowPicker(false);
		};

		return (
			<div
				ref={calendarRef}
				className="absolute z-10 bottom-full mb-1 bg-gray-900 text-white rounded-lg shadow-lg p-4 w-64"
			>
				{/* Month Navigation */}
				<div className="flex items-center justify-between mb-4">
					<button
						onClick={() => prevMonth(isEndDate)}
						className="text-gray-400 hover:text-white p-1 rounded-full focus:outline-none"
					>
						<ChevronLeft size={20} />
					</button>

					<div className="flex items-center gap-1">
						<div className="relative">
							<button
								onClick={toggleMonthPicker}
								className="border border-gray-700 rounded px-2 py-1 hover:bg-gray-800 focus:outline-none"
							>
								<span className="text-sm font-medium">
									{format(currentMonth, "MMMM")}
								</span>
							</button>

							{showPicker && (
								<div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-3 w-48 z-20">
									<div className="grid grid-cols-3 gap-2">
										{months.map((month, index) => (
											<button
												key={month}
												onClick={() => handleMonthSelect(index)}
												className={`text-xs px-2 py-2 rounded hover:bg-gray-700 focus:outline-none ${
													index === currentMonth.getMonth() ? 'bg-blue-600 text-white' : 'text-gray-300'
												}`}
											>
												{month.slice(0, 3)}
											</button>
										))}
									</div>
								</div>
							)}
						</div>

						<div className="relative">
							<button
								onClick={toggleYearPicker}
								className="border border-gray-700 rounded px-2 py-1 hover:bg-gray-800 focus:outline-none"
							>
								<span className="text-sm font-medium">
									{format(currentMonth, "yyyy")}
								</span>
							</button>

							{showYearPickerState && (
								<div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-3 w-40 z-20 max-h-64 overflow-y-auto">
									<div className="grid grid-cols-2 gap-2">
										{years.map((year) => (
											<button
												key={year}
												onClick={() => handleYearSelect(year)}
												className={`text-sm px-2 py-2 rounded hover:bg-gray-700 focus:outline-none ${
													year === currentMonth.getFullYear() ? 'bg-blue-600 text-white' : 'text-gray-300'
												}`}
											>
												{year}
											</button>
										))}
									</div>
								</div>
							)}
						</div>
					</div>

					<button
						onClick={() => nextMonth(isEndDate)}
						className="text-gray-400 hover:text-white p-1 rounded-full focus:outline-none"
					>
						<ChevronRight size={20} />
					</button>
				</div>

				{/* Days of Week */}
				<div className="grid grid-cols-7 mb-2">
					{dayNames.map((day, index) => (
						<div
							key={day}
							className={`text-center text-xs font-medium ${
								index === 0 || index === 6 ? "text-red-400" : "text-gray-400"
							}`}
						>
							{day}
						</div>
					))}
				</div>

				{/* Calendar Grid */}
				<div className="grid grid-cols-7 gap-1">
					{days.map((day, index) => {
						const isSelected = selectedDate === format(day.date, "yyyy-MM-dd");
						const isWeekend =
							day.date.getDay() === 0 || day.date.getDay() === 6;

						return (
							<button
								key={index}
								onClick={() => onSelectDate(day.date)}
								className={`
                  text-center p-1 text-sm rounded focus:outline-none
                  ${isWeekend && day.isCurrentMonth ? "text-red-400" : ""}
                  ${!day.isCurrentMonth ? "text-gray-600" : ""}
                  ${day.isToday ? "border border-blue-500" : ""}
                  ${isSelected ? "bg-blue-500 text-white" : "hover:bg-gray-800"}
                `}
							>
								{day.day}
							</button>
						);
					})}
				</div>

				{/* Clear Button */}
				<div className="mt-3 flex justify-start">
					<button
						onClick={onClear}
						className="text-sm bg-gray-800 text-gray-300 hover:bg-gray-700 px-3 py-1 rounded focus:outline-none"
					>
						Clear
					</button>
				</div>
			</div>
		);
	};

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
			<div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-gray-200 p-8">
				<h1 className="text-2xl font-semibold text-gray-800 mb-2 text-center">
					Data Synchronization
				</h1>
				<p className="text-gray-600 mb-6 text-center">
					Select a date range to synchronize your data
				</p>

				<div className="mb-8">
					<div className="flex items-center gap-4 mb-6">
						<div className="w-full relative">
							<label
								htmlFor="start-date"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								From
							</label>
							<div className="relative">
								<div
									ref={startInputRef}
									onClick={() => {
										setShowStartCalendar(!showStartCalendar);
										setShowEndCalendar(false);
									}}
									className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 cursor-pointer flex items-center text-gray-800 bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
								>
									{startDateDisplay || "Select Date"}
									<Calendar
										size={18}
										className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
									/>
								</div>
								{showStartCalendar && (
									<CustomCalendar
										currentMonth={calendarMonth}
										selectedDate={startDate}
										onSelectDate={(date) => selectDate(date, false)}
										onClear={() => clearDate(false)}
										calendarRef={startCalendarRef}
										isEndDate={false}
									/>
								)}
							</div>
						</div>

						<div className="flex items-center justify-center self-end pb-2">
							<span className="text-gray-500">to</span>
						</div>

						<div className="w-full relative">
							<label
								htmlFor="end-date"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								To
							</label>
							<div className="relative">
								<div
									ref={endInputRef}
									onClick={() => {
										setShowEndCalendar(!showEndCalendar);
										setShowStartCalendar(false);
									}}
									className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 cursor-pointer flex items-center text-gray-800 bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
								>
									{endDateDisplay || "Select Date"}
									<Calendar
										size={18}
										className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
									/>
								</div>
								{showEndCalendar && (
									<CustomCalendar
										currentMonth={endCalendarMonth}
										selectedDate={endDate}
										onSelectDate={(date) => selectDate(date, true)}
										onClear={() => clearDate(true)}
										calendarRef={endCalendarRef}
										isEndDate={true}
									/>
								)}
							</div>
						</div>
					</div>
				</div>

				<button
					onClick={handleSync}
					disabled={loading || !startDate || !endDate}
					className="w-full bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-white font-medium py-2.5 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{loading ? (
						<div className="flex items-center justify-center">
							<svg
								className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								></circle>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							Synchronizing...
						</div>
					) : (
						"Synchronize Data"
					)}
				</button>
			</div>
			<Toaster />
		</div>
	);
}
