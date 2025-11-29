import { useEffect, useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { format, getDate, isSameMonth, parseISO } from "date-fns";

interface CalendarEvent {
    id: string;
    title: string;
    event_date: string;
    location?: string;
    type: 'alert' | 'info' | 'notification';
}

export default function CalendarWidget() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    useEffect(() => {
        async function fetchEvents() {
            const { data, error } = await supabase
                .from('announcements')
                .select('*')
                .eq('is_event', true)
                .gte('event_date', new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString())
                .lte('event_date', new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString())
                .order('event_date', { ascending: true });

            if (error) {
                console.error("Error fetching events:", error);
            } else {
                setEvents(data || []);
            }
            setLoading(false);
        }

        fetchEvents();
    }, [currentDate]);

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        setSelectedDate(null);
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        setSelectedDate(null);
    };

    const handleDayClick = (day: number) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        setSelectedDate(newDate);
    };

    const displayedEvents = selectedDate
        ? events.filter(e => isSameMonth(parseISO(e.event_date), selectedDate) && getDate(parseISO(e.event_date)) === getDate(selectedDate))
        : events;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold font-serif text-gray-900 dark:text-white flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-teal-600" />
                    Calendar
                </h2>
                <div className="flex items-center gap-2">
                    <button onClick={prevMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500">
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {format(currentDate, 'MMMM yyyy')}
                    </span>
                    <button onClick={nextMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500">
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wide">
                <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-6">
                {days.map((day) => {
                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                    const dayEvents = events.filter(e => isSameMonth(parseISO(e.event_date), currentDate) && getDate(parseISO(e.event_date)) === day);
                    const hasEvent = dayEvents.length > 0;
                    const isSelected = selectedDate && getDate(selectedDate) === day && isSameMonth(selectedDate, currentDate);

                    return (
                        <button
                            key={day}
                            onClick={() => handleDayClick(day)}
                            className={`h-8 flex flex-col items-center justify-center relative rounded-lg transition-colors ${isSelected ? 'bg-teal-600 text-white shadow-md' :
                                    hasEvent ? 'bg-gray-50 dark:bg-gray-700/50 font-bold text-gray-900 dark:text-white hover:bg-teal-50 dark:hover:bg-teal-900/20' :
                                        'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/30'
                                }`}
                        >
                            <span className="text-xs">{day}</span>
                            {hasEvent && (
                                <div className="flex gap-0.5 mt-0.5">
                                    {dayEvents.map((e, i) => (
                                        <div key={i} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' :
                                                e.type === 'alert' ? 'bg-red-500' :
                                                    e.type === 'info' ? 'bg-blue-500' :
                                                        'bg-teal-500'
                                            }`} />
                                    ))}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Events List */}
            <div className="flex-1 overflow-y-auto space-y-3 border-t border-gray-100 dark:border-gray-700 pt-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {selectedDate ? `Events for ${format(selectedDate, 'MMM d')}` : 'Upcoming Events'}
                    </h3>
                    <div className="flex gap-2">
                        {selectedDate && (
                            <button
                                onClick={() => setSelectedDate(null)}
                                className="text-xs text-gray-400 hover:text-gray-600"
                            >
                                Clear
                            </button>
                        )}
                        <Link href="/events/new" className="text-xs text-teal-600 hover:text-teal-700 font-medium">
                            + Add Event
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <p className="text-xs text-gray-400 text-center py-2">Loading events...</p>
                ) : displayedEvents.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-2">
                        {selectedDate ? 'No events on this day.' : 'No events this month.'}
                    </p>
                ) : (
                    displayedEvents.map((event) => (
                        <Link href={`/announcements/${event.id}`} key={event.id} className="flex gap-3 items-start group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-1.5 rounded-lg transition-colors">
                            <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${event.type === 'alert' ? 'bg-red-500' :
                                event.type === 'info' ? 'bg-blue-500' :
                                    'bg-teal-500'
                                }`} />
                            <div className="flex-1">
                                <div className="flex items-baseline justify-between w-full">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-teal-600 transition-colors">{event.title}</span>
                                    <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                                        {format(parseISO(event.event_date), 'MMM d')}
                                    </span>
                                </div>
                                {event.location && (
                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                        <MapPin size={10} /> {event.location}
                                    </p>
                                )}
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
