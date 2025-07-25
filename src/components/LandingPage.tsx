import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { callChatbotAPI } from "../api/apiUtils";
import { useAuth } from "../hooks/useAuth";

export function Hero() {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const heroTexts = [
    "Your Ride, Your Comfort",
    "Safe, Reliable, Affordable",
    "Travel Made Simple"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % heroTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
      className="relative py-32 px-8 text-center min-h-[90vh] flex items-center justify-center bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{
        backgroundImage: `url('/rideshare.jpg')`,
      }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-yellow-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-purple-900/30 via-blue-900/30 to-indigo-900/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto text-white">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-8"
        >
          <span className="inline-block bg-yellow-400/25 backdrop-blur-sm text-yellow-200 px-6 py-2 rounded-full text-sm font-semibold border border-yellow-400/40 mb-6 shadow-lg">
            🚀 #1 Ride Sharing Platform
          </span>
        </motion.div>

        <motion.h1 
          key={currentTextIndex}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-7xl font-bold mb-6 leading-tight bg-gradient-to-r from-white via-gray-100 to-yellow-200 bg-clip-text text-transparent drop-shadow-lg"
        >
          {heroTexts[currentTextIndex]}
        </motion.h1>

        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-xl md:text-2xl mb-12 text-gray-100 max-w-3xl mx-auto leading-relaxed drop-shadow-md"
        >
          Experience premium transportation with professional drivers, real-time tracking, and seamless payments
        </motion.p>

        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <button
            className="group bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black px-10 py-4 rounded-full text-lg font-bold transition-all duration-300 shadow-2xl hover:shadow-yellow-400/25 hover:scale-105 transform"
            onClick={() => {
              if (localStorage.getItem("accessToken") === null) {
                window.location.href = "/login";
              } else {
                window.location.href = "/create";
              }
            }}
          >
            <span className="flex items-center">
              🚗 Book Your Ride
              <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </button>
          
          <button
            className="group bg-white/15 hover:bg-white/25 backdrop-blur-md text-white px-10 py-4 rounded-full text-lg font-semibold transition-all duration-300 border-2 border-white/40 hover:border-white/60 hover:scale-105 transform shadow-xl"
            onClick={() => {
              window.location.href = "/about";
            }}
          >
            <span className="flex items-center">
              ✨ Learn More
              <svg className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </button>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
        >
          {[
            { number: "50K+", label: "Happy Riders" },
            { number: "1M+", label: "Rides Completed" },
            { number: "500+", label: "Professional Drivers" }
          ].map((stat, index) => (
            <div key={index} className="bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-xl">
              <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2 drop-shadow-lg">{stat.number}</div>
              <div className="text-gray-100 font-medium">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-bounce"></div>
        </div>
      </motion.div>
    </motion.section>
  );
}

export function ImageGallery() {
  const images = [
    { src: "/ride1.jpg", title: "Luxury Rides", subtitle: "Premium comfort" },
    { src: "/ride2.jpg", title: "City Commute", subtitle: "Daily convenience" },
    { src: "/ride3.jpg", title: "Airport Transfers", subtitle: "Travel in style" },
    { src: "/ride4.jpg", title: "Group Travel", subtitle: "Space for everyone" },
    { src: "/arteum-ro-TVFx7iFAAdQ-unsplash.jpg", title: "Night Rides", subtitle: "24/7 service" },
    { src: "/diane-picchiottino-cF-e-TSa1lE-unsplash.jpg", title: "Electric Vehicles", subtitle: "Eco-friendly" },
    { src: "/diane-picchiottino-XEJcQCc1tPs-unsplash.jpg", title: "Business Class", subtitle: "Professional service" },
    { src: "/josiah-quijano-bJMjelYH1gU-unsplash.jpg", title: "City Explorer", subtitle: "Urban adventures" }
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="py-20 px-8 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-900 dark:to-slate-800"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Experience Premium Comfort
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            From luxury sedans to eco-friendly electric vehicles, we have the perfect ride for every occasion
          </p>
        </motion.div>

        {/* Main Featured Images - Top 4 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {images.slice(0, 4).map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10"></div>
              <img
                src={image.src}
                alt={image.title}
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                onError={(e) => {
                  console.log(`Failed to load image: ${image.src}`);
                  // Fallback to a default image or hide if needed
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="absolute bottom-4 left-4 right-4 z-20">
                <h3 className="text-white font-bold text-lg mb-1">{image.title}</h3>
                <p className="text-gray-300 text-sm mb-2">{image.subtitle}</p>
                <div className="flex items-center text-yellow-400">
                  <span className="text-sm">⭐⭐⭐⭐⭐</span>
                  <span className="text-white text-sm ml-2">(4.9)</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Secondary Image Grid - Additional 4 images */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {images.slice(4).map((image, index) => (
            <motion.div
              key={index + 4}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
              <img
                src={image.src}
                alt={image.title}
                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                onError={(e) => {
                  console.log(`Failed to load image: ${image.src}`);
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="absolute bottom-3 left-3 right-3 z-20">
                <h4 className="text-white font-semibold text-base mb-1">{image.title}</h4>
                <p className="text-gray-300 text-xs">{image.subtitle}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Ready to experience the difference? Book your ride today!
          </p>
          <button
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform"
            onClick={() => {
              if (localStorage.getItem("accessToken") === null) {
                window.location.href = "/login";
              } else {
                window.location.href = "/create";
              }
            }}
          >
            🚗 Book Now
          </button>
        </motion.div>
      </div>
    </motion.section>
  );
}

export function HowItWorks() {
  const steps = [
    {
      step: "1",
      icon: "📱",
      title: "Request a Ride",
      desc: "Open the app, set your destination, and request a ride instantly with just a few taps.",
    },
    {
      step: "2",
      icon: "🎯",
      title: "Get Matched",
      desc: "Our smart algorithm connects you to the nearest available driver in seconds.",
    },
    {
      step: "3",
      icon: "🚗",
      title: "Track & Ride",
      desc: "Track your driver in real-time and enjoy a safe, comfortable journey.",
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="relative py-20 px-8 overflow-hidden"
      style={{
        backgroundImage: ` url('/ride5.webp')`,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-purple-900/50"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            How It Works
          </h2>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Getting a ride has never been easier. Follow these simple steps
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl text-center hover:bg-white/20 transition-all duration-500 hover:scale-105">
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {step.icon}
                </div>
                <div className="text-4xl font-bold text-yellow-400 mb-4">
                  {step.step}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-200 leading-relaxed">
                  {step.desc}
                </p>
              </div>
              
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-yellow-400 to-transparent"></div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

export function Features() {
  const features = [
    {
      icon: "🛡️",
      title: "Safety First",
      desc: "All drivers are background-checked and vehicles are regularly inspected for your safety.",
      color: "from-green-400 to-green-600"
    },
    {
      icon: "⚡",
      title: "Lightning Fast",
      desc: "Average pickup time of 3 minutes. Real-time tracking keeps you informed every step.",
      color: "from-blue-400 to-blue-600"
    },
    {
      icon: "💳",
      title: "Secure Payments",
      desc: "Multiple payment options with bank-level encryption. No cash needed, everything digital.",
      color: "from-purple-400 to-purple-600"
    },
    {
      icon: "⭐",
      title: "Top-rated Drivers",
      desc: "Only the best drivers with 4.8+ ratings. Professional, courteous, and experienced.",
      color: "from-yellow-400 to-orange-500"
    },
    {
      icon: "🌍",
      title: "Eco-Friendly",
      desc: "Choose from hybrid and electric vehicles to reduce your carbon footprint.",
      color: "from-emerald-400 to-teal-600"
    },
    {
      icon: "💬",
      title: "24/7 Support",
      desc: "Round-the-clock customer support to help you with any questions or concerns.",
      color: "from-pink-400 to-rose-600"
    }
  ];

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="py-20 px-8 bg-white dark:bg-slate-900"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
            Why Choose RideEasy?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            We're not just another ride-sharing app. We're your trusted transportation partner with features that matter
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden"
            >
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-lg hover:shadow-2xl border dark:border-slate-700 transition-all duration-500 hover:scale-105 h-full">
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-3xl">{feature.icon}</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-6">
              <div className="text-4xl mr-3">🚗</div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                RideEasy
              </h3>
            </div>
            <p className="text-gray-300 text-lg leading-relaxed mb-6 max-w-md">
              Your trusted transportation partner. Safe, reliable, and affordable rides at your fingertips, 24/7.
            </p>
            <div className="flex space-x-4">
              {['📘', '🐦', '📷', '💼'].map((icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-xl transition-all duration-300 hover:scale-110"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-bold mb-6 text-yellow-400">Quick Links</h4>
            <ul className="space-y-3">
              {['About Us', 'Terms & Conditions', 'Privacy Policy', 'Help Center'].map((link, index) => (
                <li key={index}>
                  <a href={link === 'About Us' ? '/about' : link === 'Help Center' ? '/support' : '#'} 
                     className="text-gray-300 hover:text-yellow-400 transition-colors duration-200 flex items-center">
                    <span className="mr-2">→</span>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-xl font-bold mb-6 text-yellow-400">Get in Touch</h4>
            <div className="space-y-4">
              <div className="flex items-center text-gray-300">
                <span className="mr-3 text-xl">📞</span>
                <span>+254 (7) 89-471-918</span>
              </div>
              <div className="flex items-center text-gray-300">
                <span className="mr-3 text-xl">📧</span>
                <span>colkimib@gmail.com</span>
              </div>
              <div className="flex items-center text-gray-300">
                <span className="mr-3 text-xl">📍</span>
                <span>123 Kirinyaga University, KyU</span>
              </div>
              <div className="flex items-center text-gray-300">
                <span className="mr-3 text-xl">🕒</span>
                <span>Mon-Sat 9am-5pm</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} RideEasy. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 text-gray-400">
            <span>Made with ❤️ for better transportation</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function LandingPage() {
  type ChatMessage = { sender: string; content: string };
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { sender: "bot",
      content: "Hello, I'm Colkimi, your virtual assistant. How can I help you today? 🚗✨" }
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
    audio.play().catch(() => {});
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
    <div className="overflow-x-hidden">
      <Hero />
      <ImageGallery />
      <HowItWorks />
      <Features />

      {/* Enhanced Chat Interface */}
      {isChatOpen ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed bottom-4 right-4 w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border dark:border-slate-600 overflow-hidden z-50"
        >
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <img src="/bot.png" alt="Colkimi" className="w-8 h-8 rounded-full mr-3 border-2 border-white/30" />
                <div>
                  <h3 className="font-bold">Colkimi Assistant</h3>
                  <p className="text-xs opacity-80">Online • Ready to help</p>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="h-80 overflow-y-auto p-4 bg-gray-50 dark:bg-slate-900">
            {chatMessages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-4 flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "bot" && (
                  <img src="/bot.png" alt="Bot" className="w-8 h-8 rounded-full mr-2 self-end" />
                )}
                <div className={`rounded-2xl px-4 py-2 max-w-xs shadow-sm ${
                  msg.sender === "user" 
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white" 
                    : "bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200 border dark:border-slate-600"
                }`}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <img src="/bot.png" alt="Bot" className="w-8 h-8 rounded-full mr-2" />
                <div className="bg-white dark:bg-slate-700 rounded-2xl px-4 py-2 border dark:border-slate-600">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-white dark:bg-slate-800 border-t dark:border-slate-600">
            <div className="flex space-x-2">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                ref={inputRef}
                placeholder="Type your message..."
                rows={2}
                disabled={isLoading}
                className="flex-1 border-gray-300 dark:border-slate-600 dark:bg-slate-700 rounded-xl resize-none"
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={isLoading || !inputMessage.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl px-4"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </Button>
            </div>
          </div>
        </motion.div>
      ) : (
        <>
          <AnimatePresence>
            {isToasterVisible && (
              <motion.div
                initial={{ opacity: 0, x: 100, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.8 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="fixed bottom-20 right-4 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-2xl px-6 py-4 shadow-2xl z-50 max-w-sm"
              >
                <div className="flex items-center space-x-3">
                  <img src="/bot.png" alt="Bot" className="w-10 h-10 rounded-full border-2 border-white/30" />
                  <div>
                    <p className="font-semibold">Hey there! 👋</p>
                    <p className="text-sm opacity-90">I'm Colkimi, ready to assist you!</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => { 
              setIsChatOpen(true);
              setIsToasterVisible(false);
            }}
            className="fixed bottom-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-2xl z-[9999] transition-all duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {notificationCount > 0 && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                {notificationCount}
              </div>
            )}
          </motion.button>
        </>
      )}
      <Footer />
    </div>
  );
}
