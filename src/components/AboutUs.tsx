export function AboutUs() {
  return (
<main
  className="flex items-center justify-center min-h-screen bg-cover bg-center"
  style={{
    backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/ride5.webp')`,
  }}
>
  <div className="max-w-3xl bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-10 mx-4 text-gray-800 font-sans"
  >
    <h1 className="text-5xl font-extrabold mb-6 text-center text-blue-700">About RideEasy</h1>
    <p className="mb-5 text-lg leading-relaxed">
      Welcome to <span className="font-semibold ">RideEasy</span> — your trusted partner for safe,
      reliable, and affordable rides. We’re committed to delivering a seamless ride-sharing
      experience with real-time tracking, secure payments, and top-rated drivers.
    </p>
    <p className="mb-5 text-lg leading-relaxed">
      Our mission is to make transportation accessible and convenient for everyone. Whether you
      need a quick ride across town or a comfortable trip to the airport, <span className="font-semibold">RideEasy</span> is here to get you there with ease.
    </p>
    <p className="mb-5 text-lg leading-relaxed">
      Founded by passionate transportation innovators, we’re dedicated to improving urban mobility
      through technology and customer-focused service.
    </p>
    <p className="text-lg leading-relaxed">
      Thank you for choosing <span className="font-semibold">RideEasy</span>. We’re excited to serve
      you on every journey.
    </p>
  </div>
</main>

  )
}
