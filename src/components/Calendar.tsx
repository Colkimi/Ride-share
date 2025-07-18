import { useState } from 'react';
import CalendarLib from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const bookings = [
  { id: 1, date: '2025-06-26', name: 'John Doe' },
  { id: 2, date: '2025-06-27', name: 'Jane Smith'},
  { id: 3, date: '2025-06-28', name: 'Alice Brown'},
];

function Calendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());

 
  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  const selectedDateStr = formatDate(selectedDate);

 
  const bookingsForDate = bookings.filter(l => l.date === selectedDateStr);

  return (
    <div className="max-w-2xl mx-auto p-4 ml-90">
      <h1 className="text-2xl font-bold text-green-700 mb-4">Calendar</h1>
      <CalendarLib
        onChange={(e) => {
          if (e instanceof Date) setSelectedDate(e);
        }}
        value={selectedDate}
        className="rounded-lg shadow"
      />
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Showing bookings for {selectedDateStr}</h2>
        {bookingsForDate.length === 0 ? (
          <div className="text-gray-500">No bookings for this date.</div>
        ) : (
          <ul className="space-y-2">
            {bookingsForDate.map(bookings => (
              <li key={bookings.id} className="bg-yellow-100 border-l-4 border-yellow-500 p-2 rounded">
                <span className="font-bold">{bookings.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Calendar;