import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { AppDispatch, RootState } from '../store';
import { getBookingsByDate, Booking } from '../store/slices/bookingSlice';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths, isSameMonth, isSameDay, addDays, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, PlusCircle, Calendar as CalendarIcon } from 'lucide-react';

const BookingCalendar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { bookings, isLoading } = useSelector((state: RootState) => state.booking);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookingsForSelectedDate, setBookingsForSelectedDate] = useState<Booking[]>([]);

  useEffect(() => {
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    dispatch(getBookingsByDate(formattedDate));
  }, [dispatch, selectedDate]);

  useEffect(() => {
    setBookingsForSelectedDate(
      bookings.filter(booking => 
        isSameDay(parseISO(booking.bookingDate), selectedDate)
      )
    );
  }, [bookings, selectedDate]);

  const onDateClick = (day: Date) => {
    setSelectedDate(day);
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={prevMonth}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold text-gray-800">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const dateFormat = 'EEE';
    const startDate = startOfWeek(currentMonth);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center font-medium text-gray-500 text-sm py-2">
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }

    return <div className="grid grid-cols-7">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;
        const hasBookings = bookings.some(booking => 
          isSameDay(parseISO(booking.bookingDate), day)
        );
        
        days.push(
          <div
            key={day.toString()}
            className={`min-h-[80px] border border-gray-200 p-1 ${
              !isSameMonth(day, monthStart)
                ? 'bg-gray-50 text-gray-400'
                : isSameDay(day, selectedDate)
                ? 'bg-indigo-50 border-indigo-500'
                : ''
            }`}
            onClick={() => onDateClick(cloneDay)}
          >
            <div className="flex justify-between items-start">
              <span className={`text-sm ${
                isSameDay(day, new Date()) ? 'bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''
              }`}>
                {formattedDate}
              </span>
              {hasBookings && (
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>
      );
      days = [];
    }
    return <div className="mb-4">{rows}</div>;
  };

  const getBookingTypeLabel = (type: string, slot: string | null) => {
    if (type === 'FULL_DAY') return 'Full Day';
    if (type === 'HALF_DAY') {
      return slot === 'FIRST_HALF' ? 'Half Day (Morning)' : 'Half Day (Afternoon)';
    }
    return 'Custom';
  };

  const formatTimeRange = (start: string | null, end: string | null) => {
    if (!start || !end) return 'N/A';
    return `${start} - ${end}`;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booking Calendar</h1>
          <p className="text-gray-600 mt-1">
            View and manage your bookings by date
          </p>
        </div>
        <Link
          to="/booking/new"
          className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          New Booking
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            {renderHeader()}
            {renderDays()}
            {renderCells()}
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <div className="flex items-center mb-4">
              <CalendarIcon className="h-5 w-5 text-indigo-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">
                {format(selectedDate, 'MMMM d, yyyy')}
              </h3>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : bookingsForSelectedDate.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-md">
                <p className="text-gray-500 mb-4">No bookings for this date</p>
                <Link
                  to="/booking/new"
                  className="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors"
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add Booking
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bookingsForSelectedDate.map((booking) => (
                  <div key={booking.id} className="border border-gray-200 rounded-md p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{booking.customerName}</h4>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        booking.bookingType === 'FULL_DAY' 
                          ? 'bg-green-100 text-green-800' 
                          : booking.bookingType === 'HALF_DAY'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {getBookingTypeLabel(booking.bookingType, booking.bookingSlot)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">{booking.customerEmail}</p>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Time:</span>{' '}
                      {booking.bookingType === 'CUSTOM' 
                        ? formatTimeRange(booking.startTime, booking.endTime)
                        : booking.bookingType === 'HALF_DAY'
                        ? booking.bookingSlot === 'FIRST_HALF' ? '8:00 AM - 1:00 PM' : '2:00 PM - 7:00 PM'
                        : 'All Day'
                      }
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;