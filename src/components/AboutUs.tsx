import { useState, useEffect } from 'react';

export function AboutUs() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: "🚗",
      title: "Reliable Rides",
      description: "Available 24/7 with professional drivers"
    },
    {
      icon: "💳",
      title: "Secure Payments",
      description: "Multiple payment options with encryption"
    },
    {
      icon: "📍",
      title: "Real-time Tracking",
      description: "Track your ride from pickup to destination"
    },
    {
      icon: "⭐",
      title: "Top-rated Drivers",
      description: "Verified drivers with excellent ratings"
    }
  ];

  const stats = [
    { number: "50K+", label: "Happy Customers" },
    { number: "1M+", label: "Rides Completed" },
    { number: "500+", label: "Professional Drivers" },
    { number: "24/7", label: "Customer Support" }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 opacity-90"
        />
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: `url('/ride5.webp')`,
          }}
        />
        <div className="relative z-10 container mx-auto px-6 py-20">
          <div className={`text-center transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">
              About <span className="text-yellow-400">RideEasy</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
              Revolutionizing urban transportation with cutting-edge technology and exceptional service
            </p>
          </div>
        </div>
        
        {/* Animated waves */}
        <div className="absolute bottom-0 w-full">
          <svg viewBox="0 0 1200 120" className="w-full h-20 fill-white dark:fill-slate-900">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"/>
          </svg>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className={`transform transition-all duration-1000 delay-300 ${
              isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
            }`}>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-8">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                At <span className="font-semibold text-blue-600 dark:text-blue-400">RideEasy</span>, 
                we're on a mission to transform how people move around their cities. We believe 
                transportation should be accessible, reliable, and sustainable for everyone.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                Through innovative technology and a commitment to excellence, we're building 
                the future of urban mobility—one ride at a time.
              </p>
            </div>
            <div className={`transform transition-all duration-1000 delay-500 ${
              isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
            }`}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl transform rotate-6"></div>
                <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl">
                  <div className="text-6xl mb-4">🚀</div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Innovation First</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Leveraging cutting-edge technology to provide seamless, intelligent transportation solutions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50 dark:bg-slate-800"
      style = {{ backgroundImage: ` url('/ride1.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-6">
              Why Choose RideEasy?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Experience the difference with our premium features designed for your comfort and safety
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`bg-white dark:bg-slate-700 rounded-2xl p-8 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 delay-${index * 100}`}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Our Impact
            </h2>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Numbers that speak to our commitment to excellence
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center transform hover:scale-110 transition-transform duration-300"
              >
                <div className="text-5xl md:text-6xl font-bold text-yellow-400 mb-4">
                  {stat.number}
                </div>
                <div className="text-xl text-white font-semibold">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-8">
              Built by Innovators
            </h2>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 rounded-3xl p-12 shadow-xl">
              <div className="text-6xl mb-6">👥</div>
              <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
                Founded by a team of passionate transportation innovators and tech enthusiasts, 
                RideEasy was born from a simple idea: transportation should be effortless, 
                safe, and accessible to everyone.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                Our diverse team brings together expertise in technology, transportation, 
                and customer experience to create solutions that truly make a difference 
                in people's daily lives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Ready to Experience the Difference?
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust RideEasy for their daily transportation needs
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-4 px-8 rounded-full text-lg transform hover:scale-105 transition-all duration-300 shadow-lg">
              Book Your First Ride
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-black font-bold py-4 px-8 rounded-full text-lg transform hover:scale-105 transition-all duration-300">
              Become a Driver
            </button>
          </div>
        </div>
      </section>

      {/* Contact Footer */}
      <footer className="bg-gray-900 dark:bg-black py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="text-4xl mb-4">🚗</div>
          <h3 className="text-2xl font-bold text-white mb-4">RideEasy</h3>
          <p className="text-gray-400 mb-6">
            Thank you for choosing RideEasy. We're excited to serve you on every journey.
          </p>
          <div className="flex justify-center space-x-6 text-gray-400">
            <span>📧 support@rideeasy.com</span>
            <span>📞 1-800-RIDEEASY</span>
            <span>🌐 www.rideeasy.com</span>
          </div>
        </div>
      </footer>
    </div>
  );
}