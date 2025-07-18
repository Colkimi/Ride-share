import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { callChatbotAPI } from "../api/apiUtils";
import { useAuth } from "../hooks/useAuth";

const faqItems = [
  { question: "How To Rideshare", answer: "To rideshare, you need to create an account, select your ride options, and confirm your booking." },
  { question: "How to pay for rides", answer: "You can pay using mastercard credit/debit cards, paypal, mpesa or other payment methods available in your account." },
  { question: "How to request for rides", answer: "Request rides by entering your pickup and drop-off locations, then choose a ride option and confirm." },
  { question: "How do I get Discounts", answer: "Discounts are available through promo codes, loyalty programs, and special offers." },
];

type ChatMessage = {
  sender: "user" | "bot";
  content: string;
};

export function HelpSupport() {
  const { user } = useAuth();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [issue, setIssue] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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

    const userMessage: ChatMessage = { sender: "user", content: inputMessage };
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

      const response = await callChatbotAPI(user.userId, inputMessage, contextMessages);
      const botMessage: ChatMessage = {
        sender: "bot",
        content: response?.response || response || "Sorry, I did not receive a response.",
      };
      setChatMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        sender: "bot",
        content: "Sorry, I encountered an error while processing your request.",
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

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg select-none ml-80 border-2">
      <h2 className="text-blue-700 font-bold text-xl flex items-center gap-2 mb-6">
        HELP AND SUPPORT: <span role="img" aria-label="headset">🎧</span>
      </h2>

      <h3 className="font-bold text-lg mb-4">FREQUENTLY ASKED QUESTIONS(FAQ)</h3>
      <div className="space-y-3 mb-6 text-">
        {faqItems.map((item, index) => (
          <div key={index} className="cursor-pointer" onClick={() => toggleFAQ(index)}>
            <div className="flex justify-between items-center text-base font-normal">
              <span>{item.question}</span>
              <span className="text-xl font-bold select-none">{expandedIndex === index ? "−" : "+"}</span>
            </div>
            {expandedIndex === index && (
              <p className="mt-1 text-md text-blue-700">{item.answer}</p>
            )}
          </div>
        ))}
      </div>

      <h3 className="text-green-700 font-bold mb-2">Chat with our assistant</h3>
      <div className="border rounded p-3 mb-4 h-64 overflow-y-auto bg-gray-50">
        {chatMessages.length === 0 && <p className="text-gray-500">Start the conversation by typing a message below.</p>}
        {chatMessages.map((msg, idx) => (
          <div key={idx} className={`mb-2 flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`rounded px-3 py-2 max-w-xs whitespace-pre-wrap ${msg.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-800"}`}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <Textarea
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message here..."
        rows={3}
        disabled={isLoading}
        className="mb-2 border-gray-400"
      />
      <Button onClick={handleSendMessage} disabled={isLoading || inputMessage.trim() === ""} className="bg-green-700 hover:bg-green-800">
        {isLoading ? "Sending..." : "Send"}
      </Button>

      <h3 className="text-green-700 font-bold mt-6 mb-2">Still need Help?</h3>
      <form onSubmit={handleSubmit}>
        <label htmlFor="issue" className="block text-red-600 font-semibold mb-1">
          Please Describe your issue:
        </label>
        <Textarea
          id="issue"
          value={issue}
          onChange={(e) => setIssue(e.target.value)}
          placeholder="Describe your issue here..."
          rows={4}
          className="mb-4 border-gray-400"
          disabled={isLoading}
        />
        <Button type="submit" variant="default" size="default" className="bg-green-700 hover:bg-green-800" disabled={isLoading}>
          SUBMIT
        </Button>
      </form>
    </div>
  );
}
