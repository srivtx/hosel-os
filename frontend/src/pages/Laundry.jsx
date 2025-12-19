import React, { useState, useEffect } from 'react';
import { Shirt, Clock, Plus, ChevronLeft, ChevronRight, Calendar, User } from 'lucide-react';
import laundryService from '../services/laundryService';
import studentsService from '../services/studentsService';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

const Laundry = () => {
    const [usage, setUsage] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedMachine, setSelectedMachine] = useState(1);

    // Auth context to auto-select current user if implemented, or just for access
    const { user } = useAuth();

    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [bookingDetails, setBookingDetails] = useState({
        slot: null, // "08:00"
        timeLabel: null // "8:00 AM"
    });

    // Form data for the actual submission
    const [formData, setFormData] = useState({
        student_id: '',
        machine_id: 1,
        slot: '',
        usage_date: ''
    });

    const timeSlots = [
        "08:00", "09:00", "10:00", "11:00", "12:00",
        "13:00", "14:00", "15:00", "16:00", "17:00",
        "18:00", "19:00", "20:00", "21:00"
    ];

    useEffect(() => {
        fetchData();
    }, [selectedDate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usageData, studentsData] = await Promise.all([
                laundryService.getAll(selectedDate),
                studentsService.getAll()
            ]);
            setUsage(usageData);
            setStudents(studentsData);
        } catch (error) {
            console.error('Error fetching laundry data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (days) => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + days);
        setSelectedDate(date.toISOString().split('T')[0]);
    };

    const isSlotBooked = (time, machine) => {
        return usage.some(log =>
            // Simple string prefix matching for now since backend might return full ISO strings
            // or if we store "08:00" directly in slot. 
            // Based on previous plan, backend `slot` field might store "Morning".
            // We need to shift to storing "08:00" or similar.
            // For existing data compliance, we'll check both.
            (log.machine_id === machine) &&
            (log.slot === time || log.usage_date.includes(time))
        );
    };

    const getBookedStudent = (time, machine) => {
        const log = usage.find(log =>
            (log.machine_id === machine) &&
            (log.slot === time)
        );
        if (!log) return null;
        return students.find(s => s.id === log.student_id);
    };

    const handleSlotClick = (time) => {
        // Admin is read-only
        if (user?.role === 'admin') {
            return;
        }

        if (isSlotBooked(time, selectedMachine)) return;

        setBookingDetails({
            slot: time,
            timeLabel: formatTime(time)
        });

        // Auto-fill for student
        if (user?.role === 'student') {
            setFormData({
                student_id: user.id, // AuthContext must store student ID
                machine_id: selectedMachine,
                slot: time,
                usage_date: selectedDate
            });
            // Skip modal if we don't need extra info, but modal confirms booking. 
            // We need to autofill the select dropdown in modal or remove it.
        } else {
            setFormData({
                student_id: '',
                machine_id: selectedMachine,
                slot: time,
                usage_date: selectedDate
            });
        }

        setIsBookingModalOpen(true);
    };

    const formatTime = (time24) => {
        const [hour, min] = time24.split(':');
        const h = parseInt(hour, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${min} ${ampm}`;
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        try {
            // We need to send full ISO string for usage_date if backend expects it to match exact date
            // But our filter logic on backend uses `like date%` so sending YYYY-MM-DD is fine if we updated models?
            // Wait, backend `usage_date` is DateTime.
            // Let's create a combined ISO string to be safe.
            const combinedDateTime = `${selectedDate}T${bookingDetails.slot}:00`;

            await laundryService.logUsage({
                ...formData,
                usage_date: combinedDateTime
            });

            setIsBookingModalOpen(false);
            fetchData();
        } catch (error) {
            console.error('Error logging laundry usage:', error);
            alert('Failed to book slot');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Laundry Booking</h2>
                    <p className="text-muted-foreground">Select a machine and time slot.</p>
                </div>

                {/* Date Navigation */}
                <div className="flex items-center gap-2 bg-card border border-white/5 rounded-xl p-1">
                    <button
                        onClick={() => handleDateChange(-1)}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2 px-4 py-1 text-sm font-medium">
                        <Calendar size={16} className="text-primary" />
                        <span>{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <button
                        onClick={() => handleDateChange(1)}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Machine Selection Tabs */}
            <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map(num => (
                    <button
                        key={num}
                        onClick={() => setSelectedMachine(num)}
                        className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${selectedMachine === num
                            ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(34,197,94,0.15)]'
                            : 'bg-card border-white/5 hover:border-white/10 text-muted-foreground hover:bg-white/5'
                            }`}
                    >
                        <Shirt size={24} />
                        <span className="font-medium">Machine {num}</span>
                    </button>
                ))}
            </div>

            {/* Slots Grid */}
            <div className="bg-card rounded-2xl border border-white/5 p-6">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Clock size={20} className="text-primary" />
                    Available Slots for Machine {selectedMachine}
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {timeSlots.map(time => {
                        const isBooked = isSlotBooked(time, selectedMachine);
                        const bookedStudent = isBooked ? getBookedStudent(time, selectedMachine) : null;

                        return (
                            <button
                                key={time}
                                disabled={isBooked}
                                onClick={() => handleSlotClick(time)}
                                className={`relative p-4 rounded-xl border text-left transition-all group ${isBooked
                                    ? 'bg-red-500/10 border-red-500/20 opacity-80 cursor-not-allowed'
                                    : 'bg-secondary/30 border-white/5 hover:border-primary/50 hover:bg-primary/5 hover:shadow-lg hover:scale-[1.02]'
                                    }`}
                            >
                                <div className="text-lg font-bold mb-1">{formatTime(time)}</div>
                                <div className="text-xs">
                                    {isBooked ? (
                                        <span className="text-red-400 flex items-center gap-1">
                                            <User size={12} />
                                            {bookedStudent ? bookedStudent.name.split(' ')[0] : 'Booked'}
                                        </span>
                                    ) : (
                                        <span className="text-green-500 font-medium">Available</span>
                                    )}
                                </div>
                                {!isBooked && (
                                    <div className="absolute inset-x-0 bottom-0 h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-b-xl" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Booking Modal */}
            <Modal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} title={`Book Laundry Slot`}>
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                    <div className="bg-secondary/30 p-4 rounded-xl space-y-2 mb-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Date</span>
                            <span className="font-medium">{selectedDate}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Machine</span>
                            <span className="font-medium"># {selectedMachine}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Time Slot</span>
                            <span className="font-medium text-primary">{bookingDetails.timeLabel}</span>
                        </div>
                    </div>

                    {user?.role === 'student' ? (
                        <div className="bg-primary/20 p-3 rounded-lg text-primary text-sm font-medium text-center">
                            Booking for yourself: {user.name}
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium mb-1 text-muted-foreground">Select Student</label>
                            <select
                                value={formData.student_id}
                                onChange={(e) => setFormData(prev => ({ ...prev, student_id: e.target.value }))}
                                required
                                className="w-full bg-secondary/50 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors"
                            >
                                <option value="">Select Student</option>
                                {students.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} (Room {s.room_number})</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsBookingModalOpen(false)}
                            className="px-4 py-2 rounded-lg text-muted-foreground hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                        >
                            Confirm Booking
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Laundry;
