import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { callChatbotAPI } from "../api/apiUtils";
import { useAuth } from "../hooks/useAuth";
import {
	HelpCircle,
	MessageCircle,
	Send,
	ChevronDown,
	ChevronUp,
	Bot,
	User,
	Search,
	Phone,
	Mail,
	Clock,
	CheckCircle,
	AlertCircle,
	Headphones,
} from "lucide-react";
import { FormattedMessage } from "./FormattedMessage";

const faqItems = [
	{
		category: "Getting Started",
		question: "How To Rideshare",
		answer:
			"To rideshare, you need to create an account, select your ride options, and confirm your booking. Simply download our app, sign up with your email or phone number, verify your account, and you're ready to start booking rides.",
		tags: ["beginner", "account", "signup"],
	},
	{
		category: "Payments",
		question: "How to pay for rides",
		answer:
			"You can pay using Mastercard credit/debit cards, PayPal, M-Pesa, or other payment methods available in your account. We also support digital wallets and cash payments in select locations.",
		tags: ["payment", "cards", "mpesa", "paypal"],
	},
	{
		category: "Booking",
		question: "How to request for rides",
		answer:
			"Request rides by entering your pickup and drop-off locations, then choose a ride option and confirm. You can schedule rides in advance or book them immediately for faster service.",
		tags: ["booking", "request", "schedule"],
	},
	{
		category: "Promotions",
		question: "How do I get Discounts",
		answer:
			"Discounts are available through promo codes, loyalty programs, and special offers. Check the 'Promotions' section in your app regularly for the latest deals and referral bonuses.",
		tags: ["discounts", "promo", "loyalty", "offers"],
	},
	{
		category: "Safety",
		question: "How to ensure ride safety",
		answer:
			"We prioritize your safety with verified drivers, real-time tracking, emergency contacts, and 24/7 support. Always check driver details and share your trip with trusted contacts.",
		tags: ["safety", "security", "emergency", "tracking"],
	},
	{
		category: "Driver",
		question: "How to become a driver",
		answer:
			"To become a driver, you need a valid driver's license, vehicle registration, insurance, and pass our background check. Apply through our driver portal and complete the onboarding process.",
		tags: ["driver", "registration", "requirements", "apply"],
	},
];

type ChatMessage = {
	sender: "user" | "bot";
	content: string;
	timestamp: Date;
};

export function HelpSupport() {
	const { user } = useAuth();
	const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
	const [issue, setIssue] = useState("");
	const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
	const [inputMessage, setInputMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [activeTab, setActiveTab] = useState<"faq" | "chat" | "contact">("faq");
	const chatEndRef = useRef<HTMLDivElement>(null);

	const toggleFAQ = (index: number) => {
		setExpandedIndex(expandedIndex === index ? null : index);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (issue.trim() === "") {
			alert("Please describe your issue before submitting.");
			return;
		}
		console.log("Issue submitted:", issue);
		alert("Thank you for your submission. We will get back to you shortly.");
		setIssue("");
	};

	const scrollToBottom = () => {
		chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [chatMessages]);

	const handleSendMessage = async () => {
		if (inputMessage.trim() === "") return;

		if (!user?.userId) {
			alert("You must be logged in to chat with the assistant.");
			return;
		}

		const userMessage: ChatMessage = {
			sender: "user",
			content: inputMessage,
			timestamp: new Date(),
		};
		setChatMessages((prev) => [...prev, userMessage]);
		setInputMessage("");
		setIsLoading(true);

		try {
			const contextMessages = chatMessages
				.filter((msg) => msg.content.trim() !== "")
				.map((msg) => ({
					role: msg.sender === "user" ? "user" : "assistant",
					content: msg.content,
					name: msg.sender === "user" ? "user" : "bot",
				}));

			const response = await callChatbotAPI(
				user.userId,
				inputMessage,
				contextMessages
			);
			const botMessage: ChatMessage = {
				sender: "bot",
				content:
					response?.response || response || "Sorry, I did not receive a response.",
				timestamp: new Date(),
			};
			setChatMessages((prev) => [...prev, botMessage]);
		} catch (error) {
			const errorMessage: ChatMessage = {
				sender: "bot",
				content: "Sorry, I encountered an error while processing your request.",
				timestamp: new Date(),
			};
			setChatMessages((prev) => [...prev, errorMessage]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	const filteredFAQs = faqItems.filter((item) =>
		item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
		item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
		item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
		item.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
	);

	const categories = [...new Set(faqItems.map((item) => item.category))];

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
			<div className="max-w-6xl mx-auto space-y-6">
				{/* Header */}
				<div className="text-center space-y-4">
					<div className="flex items-center justify-center space-x-3">
						<div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
							<Headphones className="h-8 w-8 text-blue-600 dark:text-blue-400" />
						</div>
						<h1 className="text-4xl font-bold text-gray-900 dark:text-white">
							Help & Support
						</h1>
					</div>
					<p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
						Get help with your rides, account, payments, and more. We're here to
						assist you 24/7.
					</p>
				</div>

				{/* Navigation Tabs */}
				<div className="flex justify-center">
					<div className="flex space-x-1 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-lg">
						<Button
							onClick={() => setActiveTab("faq")}
							variant={activeTab === "faq" ? "default" : "ghost"}
							className="flex items-center space-x-2"
						>
							<HelpCircle className="h-4 w-4" />
							<span>FAQ</span>
						</Button>
						<Button
							onClick={() => setActiveTab("chat")}
							variant={activeTab === "chat" ? "default" : "ghost"}
							className="flex items-center space-x-2"
						>
							<MessageCircle className="h-4 w-4" />
							<span>Live Chat</span>
						</Button>
						<Button
							onClick={() => setActiveTab("contact")}
							variant={activeTab === "contact" ? "default" : "ghost"}
							className="flex items-center space-x-2"
						>
							<Phone className="h-4 w-4" />
							<span>Contact Us</span>
						</Button>
					</div>
				</div>

				{/* FAQ Section */}
				{activeTab === "faq" && (
					<div className="space-y-6">
						{/* Search Bar */}
						<Card>
							<CardContent className="p-6">
								<div className="relative">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
									<Input
										placeholder="Search for answers..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="pl-10"
									/>
								</div>
							</CardContent>
						</Card>

						{/* Category Filter */}
						<div className="flex flex-wrap gap-2 justify-center">
							<Button
								variant={searchTerm === "" ? "default" : "outline"}
								size="sm"
								onClick={() => setSearchTerm("")}
							>
								All Categories
							</Button>
							{categories.map((category) => (
								<Button
									key={category}
									variant="outline"
									size="sm"
									onClick={() => setSearchTerm(category)}
								>
									{category}
								</Button>
							))}
						</div>

						{/* FAQ Items */}
						<div className="grid gap-4">
							{filteredFAQs.map((item, index) => (
								<Card key={index} className="hover:shadow-md transition-shadow">
									<CardContent className="p-0">
										<div
											className="cursor-pointer p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
											onClick={() => toggleFAQ(index)}
										>
											<div className="flex justify-between items-start">
												<div className="space-y-2 flex-1">
													<div className="flex items-center space-x-2">
														<Badge variant="secondary" className="text-xs">
															{item.category}
														</Badge>
													</div>
													<h3 className="font-semibold text-lg text-gray-900 dark:text-white">
														{item.question}
													</h3>
												</div>
												<div className="ml-4">
													{expandedIndex === index ? (
														<ChevronUp className="h-5 w-5 text-gray-500" />
													) : (
														<ChevronDown className="h-5 w-5 text-gray-500" />
													)}
												</div>
											</div>

											{expandedIndex === index && (
												<div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
													<p className="text-gray-700 dark:text-gray-300 leading-relaxed">
														{item.answer}
													</p>
													<div className="flex flex-wrap gap-1 mt-3">
														{item.tags.map((tag, tagIndex) => (
															<Badge
																key={tagIndex}
																variant="outline"
																className="text-xs"
															>
																{tag}
															</Badge>
														))}
													</div>
												</div>
											)}
										</div>
									</CardContent>
								</Card>
							))}
						</div>

						{filteredFAQs.length === 0 && (
							<Card>
								<CardContent className="p-12 text-center">
									<HelpCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
									<p className="text-gray-600 dark:text-gray-400">
										No FAQs found matching your search.
									</p>
								</CardContent>
							</Card>
						)}
					</div>
				)}

				{/* Chat Section */}
				{activeTab === "chat" && (
					<div className="max-w-4xl mx-auto">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center space-x-2">
									<Bot className="h-5 w-5 text-blue-600" />
									<span>Chat with our AI Assistant</span>
								</CardTitle>
								<CardDescription>
									Get instant answers to your questions. Our AI assistant is here to
									help 24/7.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								{/* Chat Messages */}
								<div className="border rounded-lg p-4 h-96 overflow-y-auto bg-gray-50 dark:bg-gray-900/20">
									{chatMessages.length === 0 && (
										<div className="flex items-center justify-center h-full">
											<div className="text-center space-y-3">
												<Bot className="h-12 w-12 mx-auto text-gray-400" />
												<p className="text-gray-500 dark:text-gray-400">
													Start the conversation by typing a message below.
												</p>
												<p className="text-sm text-gray-400">
													Ask me anything about rides, payments, or account issues!
												</p>
											</div>
										</div>
									)}

									{chatMessages.map((msg, idx) => (
										<div
											key={idx}
											className={`mb-4 flex ${
												msg.sender === "user" ? "justify-end" : "justify-start"
											}`}
										>
											<div
												className={`flex items-start space-x-2 max-w-xs ${
													msg.sender === "user"
														? "flex-row-reverse space-x-reverse"
														: ""
												}`}
											>
												<div
													className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
														msg.sender === "user"
															? "bg-blue-500"
															: "bg-gray-300 dark:bg-gray-600"
													}`}
												>
													{msg.sender === "user" ? (
														<User className="h-4 w-4 text-white" />
													) : (
														<Bot className="h-4 w-4 text-gray-700 dark:text-gray-300" />
													)}
												</div>
												<div
													className={`rounded-lg px-4 py-2 ${
														msg.sender === "user"
															? "bg-blue-500 text-white"
															: "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border"
													}`}
												>
													<FormattedMessage
														content={msg.content}
														sender={msg.sender}
													/>
													<div
														className={`text-xs mt-1 ${
															msg.sender === "user"
																? "text-blue-100"
																: "text-gray-500"
														}`}
													>
														{msg.timestamp.toLocaleTimeString()}
													</div>
												</div>
											</div>
										</div>
									))}

									{isLoading && (
										<div className="flex justify-start mb-4">
											<div className="flex items-center space-x-2">
												<div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
													<Bot className="h-4 w-4 text-gray-700 dark:text-gray-300" />
												</div>
												<div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 border">
													<div className="flex space-x-1">
														<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
														<div
															className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
															style={{ animationDelay: "0.1s" }}
														></div>
														<div
															className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
															style={{ animationDelay: "0.2s" }}
														></div>
													</div>
												</div>
											</div>
										</div>
									)}

									<div ref={chatEndRef} />
								</div>

								{/* Chat Input */}
								<div className="flex space-x-2">
									<Textarea
										value={inputMessage}
										onChange={(e) => setInputMessage(e.target.value)}
										onKeyDown={handleKeyDown}
										placeholder="Type your message here..."
										rows={2}
										disabled={isLoading}
										className="flex-1"
									/>
									<Button
										onClick={handleSendMessage}
										disabled={isLoading || inputMessage.trim() === ""}
										className="self-end"
									>
										{isLoading ? (
											<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
										) : (
											<Send className="h-4 w-4" />
										)}
									</Button>
								</div>

								{!user?.userId && (
									<div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
										<div className="flex items-center space-x-2">
											<AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
											<p className="text-yellow-800 dark:text-yellow-200">
												Please log in to chat with our assistant.
											</p>
										</div>
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				)}

				{/* Contact Section */}
				{activeTab === "contact" && (
					<div className="max-w-4xl mx-auto space-y-6">
						<div className="grid md:grid-cols-2 gap-6">
							{/* Contact Information */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center space-x-2">
										<Phone className="h-5 w-5 text-green-600" />
										<span>Contact Information</span>
									</CardTitle>
									<CardDescription>
										Reach out to us through any of these channels
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="flex items-center space-x-3">
										<div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
											<Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
										</div>
										<div>
											<p className="font-semibold">Phone Support</p>
											<p className="text-sm text-gray-600 dark:text-gray-400">
												+254 (7) 89-471-918
											</p>
										</div>
									</div>

									<div className="flex items-center space-x-3">
										<div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
											<Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
										</div>
										<div>
											<p className="font-semibold">Email Support</p>
											<p className="text-sm text-gray-600 dark:text-gray-400">
												support@rideshare.com
											</p>
										</div>
									</div>

									<div className="flex items-center space-x-3">
										<div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
											<Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
										</div>
										<div>
											<p className="font-semibold">Business Hours</p>
											<p className="text-sm text-gray-600 dark:text-gray-400">
												24/7 Available
											</p>
										</div>
									</div>

									<div className="flex items-center space-x-3">
										<div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
											<CheckCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
										</div>
										<div>
											<p className="font-semibold">Response Time</p>
											<p className="text-sm text-gray-600 dark:text-gray-400">
												Within 2 hours
											</p>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Contact Form */}
							<Card>
								<CardHeader>
									<CardTitle>Submit a Support Request</CardTitle>
									<CardDescription>
										Describe your issue and we'll get back to you shortly
									</CardDescription>
								</CardHeader>
								<CardContent>
									<form onSubmit={handleSubmit} className="space-y-4">
										<div>
											<label
												htmlFor="issue"
												className="block text-sm font-medium mb-2"
											>
												Describe your issue *
											</label>
											<Textarea
												id="issue"
												value={issue}
												onChange={(e) => setIssue(e.target.value)}
												placeholder="Please provide as much detail as possible about your issue..."
												rows={4}
												disabled={isLoading}
												required
											/>
										</div>

										<Button
											type="submit"
											className="w-full bg-green-600 hover:bg-green-700"
											disabled={isLoading || issue.trim() === ""}
										>
											{isLoading ? "Submitting..." : "Submit Request"}
										</Button>
									</form>
								</CardContent>
							</Card>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
