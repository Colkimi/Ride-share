import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { callChatbotAPI } from "../api/apiUtils";
import { useAuth } from "../hooks/useAuth";

export function Hero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative py-32 px-8 text-center min-h-[80vh] flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/rideshare.jpg')`,
      }}
    >
      <div className="absolute inset-0 bg-black/30"></div>
      <div className="relative z-10 max-w-4xl mx-auto text-white">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Your Ride, Your Comfort
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-gray-100">
          Safe, reliable, and affordable rides at your fingertips
        </p>
        <div className="space-x-4">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-200 shadow-lg"
            onClick={() => {
              if (localStorage.getItem("accessToken") === null) {
                window.location.href = "/login";
              } else {
                window.location.href = "/bookings/create";
              }
            }}
          >
            Book a Ride
          </button>
          <button
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-200 border border-white/30"
            onClick={() => {
              window.location.href = "/about";
            }}
          >
            Learn More
          </button>
        </div>
      </div>
    </motion.section>
  );
}

export function ImageGallery() {
  const images = ["/ride1.jpg", "/ride2.jpg", "/ride3.jpg", "/ride4.jpg"];
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="py-16 px-8 bg-gray-100"

    >
      <h2 className="text-3xl font-semibold mb-12 text-center">
        Explore Our Rides
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {images.map((src, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300"
          >
            <img
              src={src}
              alt={`Ride ${index + 1}`}
              className="w-full h-48 object-cover"
            />
          </div>
        ))}
      </div>
    </motion.section>
  );
}

export function HowItWorks() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="bg-gray-50 py-16 px-8 text-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/ride5.webp')`,
      }}
    >
      <h2 className="text-3xl font-semibold mb-12">How It Works</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {[
          {
            step: "1",
            title: "Request a Ride",
            desc: "Open the app and request a ride instantly.",
          },
          {
            step: "2",
            title: "Get Matched",
            desc: "We connect you to the nearest available driver.",
          },
          {
            step: "3",
            title: "Arrive Safely",
            desc: "Enjoy the ride and rate your driver.",
          },
        ].map(({ step, title, desc }) => (
          <div
            key={step}
            className="bg-white p-6 rounded-2xl shadow-md transform hover:scale-105 transition-transform duration-300"
          >
            <div className="text-4xl font-bold text-blue-600 mb-2">{step}</div>
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="text-gray-600 mt-2">{desc}</p>
          </div>
        ))}
      </div>
    </motion.section>
  );
}

export function Features() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6 }}
      className="py-16 px-8 bg-white text-center"
    >
      <h2 className="text-3xl font-semibold mb-12">Why Ride with Us?</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto text-left">
        {[
          {
            title: "Real-time Tracking",
            desc: "Follow your driver’s location and ETA live.",
          },
          {
            title: "Secure Payments",
            desc: "Pay seamlessly with mobile money or card.",
          },
          {
            title: "Top-rated Drivers",
            desc: "All drivers are vetted and reviewed by riders.",
          },
        ].map(({ title, desc }) => (
          <div
            key={title}
            className="bg-gray-200 p-6 rounded-2xl shadow-sm transform hover:scale-105 transition-transform duration-300"
          >
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-600">{desc}</p>
          </div>
        ))}
      </div>
    </motion.section>
  );
}

export function Footer() {
  return (
    <footer className="bg-gray-900 p-8 text-center text-white">
      <div className="flex flex-col md:flex-row justify-between mb-4">
        <div className="flex-1 mb-4 md:mb-0">
          <h3 className="text-xl font-semibold">Quick Links</h3>
          <ul>
            <li><a href="/about" className="hover:text-gray-400 text-sm">About Us</a></li>
            <li><a href="#" className="hover:text-gray-400 text-sm">Terms & Conditions</a></li>
            <li><a href="#" className="hover:text-gray-400 text-sm">Privacy Policy</a></li>
            <li><a href="/support" className="hover:text-gray-400 text-sm">Help Center</a></li>
          </ul>
        </div>
        <div className="flex-1 mb-4 md:mb-0">
          <h3 className="text-xl font-semibold">Follow Us</h3>
          <ul>
            <li><a href="#" className="hover:text-gray-400 text-sm">Facebook</a></li>
            <li><a href="#" className="hover:text-gray-400 text-sm">Twitter</a></li>
            <li><a href="#" className="hover:text-gray-400 text-sm">Instagram</a></li>
            <li><a href="#" className="hover:text-gray-400 text-sm">LinkedIn</a></li>
          </ul>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold">Contact Us</h3>
          <ul>
            <li className="text-sm">Phone: +254 (7) 89-471-918</li>
            <li className="text-sm">Email: colkimib@gmail.com</li>
            <li className="text-sm">Address: 123 Kirinyaga University, KyU</li>
            <li className="text-sm">Hours: Mon-Sat 9am-5pm</li>
          </ul>
        </div>
      </div>
      <p>&copy; {new Date().getFullYear()} RideEasy. All rights reserved.</p>
    </footer>
  );
}

export function LandingPage() {
  type ChatMessage = { sender: string; content: string };
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { sender: "bot",
      content: "Hello, I'm Colkimi, a virtual assistant. Do you need help?" }
  ]);
  const { user } = useAuth();
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [isToasterVisible, setIsToasterVisible] = useState(true); 
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const audio = new Audio('/notification.wav'); 
    audio.play().catch(() => {
    });
  }, []);

    useEffect(() => {
    if (isToasterVisible) {
      const timer = setTimeout(() => {
        setIsToasterVisible(false);
        setNotificationCount(1);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isToasterVisible]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "") return;

    const userMessage: ChatMessage = { sender: "user", content: inputMessage };
    setChatMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const contextMessages = chatMessages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.content,
      }));
     if (!user?.userId) {
      console.log(user?.userId);
      alert("You must be logged in to chat with the assistant.");
      setIsChatOpen(false);
      return;
     }
      const response = await callChatbotAPI(user.userId, inputMessage, contextMessages);
      console.log(response)
      const botMessage: ChatMessage = {
        sender: "bot",
        content: response.response || "Sorry, I didn't get that.", 
      };
      setChatMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [isChatOpen]);
  return (
    <div>
      <Hero />
      <ImageGallery />
      <HowItWorks />
      <Features />

      {isChatOpen ? (
        <div className="fixed bottom-16 right-4 w-80 bg-white rounded-lg shadow-lg border p-4 flex flex-col z-50">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-green-700 font-bold text-center flex-grow">Chat with our assistant</h3>
            <button
              onClick={() => setIsChatOpen(false)}
              aria-label="Close chat"
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              &#x2715;
            </button>
          </div>
          <div className="border rounded p-3 mb-4 h-64 overflow-y-auto bg-gray-50">
            {chatMessages.map((msg, idx) => (
              <div key={idx} 
              className={`mb-2 flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "bot" && (
                  <img
                    src="/bot.png"
                    alt="Bot"
                    className="w-8 h-8 rounded-full mr-2 self-end"
                  />
                )}                
                <div className={`rounded px-3 py-2 max-w-xs ${msg.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" &&!e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            ref={inputRef}
            placeholder="Type your message here..."
            rows={2}
            disabled={isLoading}
            className="mb-2 border-gray-400 w-full"
          />
          <Button onClick={handleSendMessage} disabled={isLoading || !inputMessage.trim()}>
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </div>
      ) : (
        <>
        <AnimatePresence>
  {isToasterVisible && (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 1.5 }}
      className="fixed bottom-28 right-4 bg-green-600 text-white rounded-md px-4 py-2 shadow-lg z-50 max-w-xs flex items-center space-x-2"
    >
      <img
        src="/bot.png"
        alt="Bot"
        className="w-6 h-6 rounded-full"
      />
      <span>Hello, I'm Colkimi, a virtual assistant. Here to help</span>
    </motion.div>
  )}
  </AnimatePresence>
      <button
          onClick={() =>{ 
            setIsChatOpen(true);
            setIsToasterVisible(false);
          }}
          aria-label="Open chat"
          className="fixed bottom-16 right-4 bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-blue-700 focus:outline-none z-[9999]"
        >
          &#128172;
        </button>
        </>
      )}
      <Footer />
    </div>
  );
}
