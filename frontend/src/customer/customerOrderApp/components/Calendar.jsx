import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CalendarComponent = ({
                               calendar,
                               navigateMonth,
                               generateCalendarDays,
                               handleDateSelect,
                               formData,
                               currentDate
                           }) => {
    // Render days of the week
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
        <div className="bg-white p-6 rounded-lg shadow h-[30rem] w-[28rem] text-gray-700 fixed">
            <h2 className="text-2xl font-bold mb-4 text-orange-950">Choose your Order Date</h2>

            <div className="mb-4 flex items-center justify-between">
                <div className="text-lg font-medium">{calendar.displayedMonthYear}</div>
                <div className="flex gap-2">
                    <button
                        onClick={() => navigateMonth('prev')}
                        className="p-2 rounded-full hover:bg-rose-300 bg-rose-200"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => navigateMonth('next')}
                        className="p-2 rounded-full hover:bg-rose-300 bg-rose-200 hover:outline-none"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1">
                {weekDays.map(day => (
                    <div key={day} className="text-center py-2 font-medium text-sm text-gray-600">
                        {day}
                    </div>
                ))}

                {generateCalendarDays().map((date, index) => {
                    const isSelected = formData.selectedDate &&
                        formData.selectedDate.getDate() === date.day &&
                        formData.selectedDate.getMonth() === date.month &&
                        formData.selectedDate.getFullYear() === date.year;

                    const isPast = new Date(date.year, date.month, date.day) < currentDate;

                    return (
                        <button
                            key={index}
                            onClick={() => handleDateSelect(date.day, date.month, date.year)}
                            disabled={isPast}
                            className={`
                                py-2 text-center rounded-full
                                ${!date.isCurrentMonth ? 'text-gray-400' : ''}
                                ${isPast ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100'}
                                ${isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                            `}
                        >
                            {date.day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarComponent;
