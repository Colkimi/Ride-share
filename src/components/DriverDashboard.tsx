import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts'

const monthlyAnalyticsData = [
  { day: '01', last6Days: 30, lastWeek: 20 },
  { day: '02', last6Days: 20, lastWeek: 25 },
  { day: '03', last6Days: 27, lastWeek: 22 },
  { day: '04', last6Days: 18, lastWeek: 20 },
  { day: '05', last6Days: 35, lastWeek: 30 },
  { day: '06', last6Days: 40, lastWeek: 35 },
  { day: '07', last6Days: 32, lastWeek: 28 },
  { day: '08', last6Days: 25, lastWeek: 30 },
  { day: '09', last6Days: 20, lastWeek: 22 },
  { day: '10', last6Days: 30, lastWeek: 25 },
  { day: '11', last6Days: 38, lastWeek: 30 },
  { day: '12', last6Days: 40, lastWeek: 35 },
]

const rideTimeData = [
  { name: 'Afternoon', value: 25, color: '#8884d8' },
  { name: 'Evening', value: 20, color: '#82ca9d' },
  { name: 'Morning', value: 18, color: '#ffc658' },
]

const ratingData = [
  { name: 'Customer experience', value: 85, color: '#8884d8' },
  { name: 'Time conscious', value: 85, color: '#ff8042' },
  { name: 'Friendliness', value: 92, color: '#82ca9d' },
]

const topRides = [
  { destination: 'To Nairobi and Ruiru', price: 4500, img: 'https://via.placeholder.com/40' },
  { destination: 'To Safari park', price: 7500, img: 'https://via.placeholder.com/40' },
  { destination: 'To Travel kenya', price: 4500, img: 'https://via.placeholder.com/40' },
  { destination: 'To City center', price: 4500, img: 'https://via.placeholder.com/40' },
]

const drivesData = [
  { day: '01', last6Days: 10, lastWeek: 15 },
  { day: '02', last6Days: 12, lastWeek: 14 },
  { day: '03', last6Days: 8, lastWeek: 10 },
  { day: '04', last6Days: 15, lastWeek: 12 },
  { day: '05', last6Days: 20, lastWeek: 18 },
  { day: '06', last6Days: 25, lastWeek: 20 },
]

const COLORS = ['#8884d8', '#82ca9d', '#ffc658']

export default function DriverDashboard() {
  return (
    <div className="p-6 w-full">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Monthly Analytics</h2>
          <p className="mb-2 font-bold">KAA 527E</p>
          <p className="mb-4 text-green-600">↑ 2.1% vs last week</p>
          <p className="mb-4 text-gray-600">Rides from 1-12 JULY, 2025</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyAnalyticsData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="last6Days" fill="#8884d8" />
              <Bar dataKey="lastWeek" fill="#ccc" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex space-x-4 mt-4">
            <div>
              <span className="inline-block w-4 h-4 bg-blue-600 rounded-full mr-2"></span>Last 6 days
            </div>
            <div>
              <span className="inline-block w-4 h-4 bg-gray-400 rounded-full mr-2"></span>Last Week
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Ride Time</h2>
          <p className="text-gray-600 mb-4">From 1-6 JULY, 2025</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={rideTimeData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={60}
                fill="#8884d8"
                label
              >
                {rideTimeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-between mt-4 text-sm text-gray-600">
            {rideTimeData.map((entry) => (
              <div key={entry.name} className="flex items-center space-x-2">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                ></span>
                <span>{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-md font-semibold mb-2">Your Rating</h3>
          <div className="flex space-x-4">
            {ratingData.map((rating) => (
              <div key={rating.name} className="text-center">
                <div
                  className="mx-auto mb-2 rounded-full border-4 border-blue-600"
                  style={{ width: 80, height: 80, lineHeight: '80px', fontSize: 18 }}
                >
                  {rating.value}%
                </div>
                <div>{rating.name}</div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-gray-600">See more on reviews and ratings</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-md font-semibold mb-2">Top rides this week</h3>
          <ul>
            {topRides.map((ride) => (
              <li key={ride.destination} className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <img src={ride.img} alt={ride.destination} className="w-10 h-10 rounded-full" />
                  <span>{ride.destination}</span>
                </div>
                <span>ksh {ride.price}</span>
              </li>
            ))}
          </ul>
          <p>Checkout your top rides this week</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-md font-semibold mb-2">Drives</h3>
          <p className="text-2xl font-bold mb-2">68</p>
          <p className="text-red-500 mb-2">↓ 2.1% vs last week</p>
          <p className="text-gray-600 mb-4">Showing rides from 1-6 July, 2025</p>
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={drivesData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="last6Days" stroke="#8884d8" />
              <Line type="monotone" dataKey="lastWeek" stroke="#ccc" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
