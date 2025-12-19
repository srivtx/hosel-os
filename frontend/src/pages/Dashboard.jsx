import React, { useState, useEffect } from 'react';
import { Users, CreditCard, AlertCircle, MessageSquare, Zap, DollarSign, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';
import studentsService from '../services/studentsService';
import rentService from '../services/rentService';
import complaintService from '../services/complaintService';
import monitoringService from '../services/monitoringService';
import attendanceService from '../services/attendanceService';
import { useAuth } from '../context/AuthContext'; // Assuming AuthContext provides useAuth
import { useNavigate } from 'react-router-dom'; // Assuming react-router-dom for navigation

const StatCard = ({ icon: Icon, title, value, subtext, trend, colorClass }) => (
    <div className="p-6 rounded-2xl bg-card border border-white/5 backdrop-blur-sm relative overflow-hidden group hover:border-white/10 transition-colors">
        <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500", colorClass.bg)}></div>
        <div className="relative z-10 flex justify-between items-start">
            <div>
                <p className="text-muted-foreground text-sm font-medium mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-foreground mb-1">{value}</h3>
                {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
            </div>
            <div className={cn("p-3 rounded-xl bg-white/5", colorClass.text)}>
                <Icon size={24} />
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalStudents: 0,
        pendingDues: 0,
        pendingDuesCount: 0,
        activeIssues: 0,
        totalComplaints: 0,
        pendingComplaints: 0,
        energyBill: 0,
        energyLabel: 'Est. Bill'
    });
    const [loading, setLoading] = useState(true);
    const [attendance, setAttendance] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch existing stats...
                const students = await studentsService.getAll();
                const payments = await rentService.getPending();
                const complaints = await complaintService.getAll();

                const pendingRentPayments = payments.filter(p => p.status === 'Pending');
                const pendingAmount = pendingRentPayments.reduce((sum, p) => sum + p.amount, 0);
                const activeComplaints = complaints.filter(c => c.status !== 'Resolved');

                // Fetch Energy Stats
                let energyData = { projected_bill: 0, total_bill: 0 };
                try {
                    if (user?.role === 'admin') {
                        const res = await monitoringService.getAdminStats();
                        energyData = res.data;
                    } else if (user?.id) {
                        const res = await monitoringService.getStudentStats(user.id);
                        energyData = res.data;
                    }
                } catch (e) {
                    console.error("Energy stats fetch failed", e);
                }

                setStats({
                    totalStudents: students.length,
                    pendingDues: pendingAmount,
                    pendingDuesCount: pendingRentPayments.length,
                    activeIssues: activeComplaints.length,
                    totalComplaints: complaints.length,
                    pendingComplaints: activeComplaints.length,
                    energyBill: user?.role === 'admin' ? energyData.total_bill : energyData.projected_bill,
                    energyLabel: user?.role === 'admin' ? 'Total Collected' : 'Est. Bill'
                });
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };

        const checkAttendance = () => {
            if (user?.role === 'student' && navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        try {
                            const { latitude, longitude } = position.coords;
                            const res = await attendanceService.markAttendance(latitude, longitude);
                            setAttendance(res.data);
                        } catch (error) {
                            // console.error("Auto-attendance failed", error);
                        }
                    },
                    (error) => console.log("Silent location denied")
                );
            }
        };

        if (user) {
            fetchStats();
            checkAttendance();
        }
    }, [user]);

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Loading dashboard data...</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
                    <p className="text-muted-foreground mt-1">Here's what's happening in your hostel today.</p>
                </div>

                {/* Attendance Status Pill */}
                {(user?.role === 'student' || user?.role === 'admin') && (
                    <div className="flex flex-col items-end gap-1">
                        {attendance ? (
                            <div className={`px-4 py-2 rounded-full border flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-right-4 ${attendance.status === 'Present'
                                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                : 'bg-red-500/10 border-red-500/20 text-red-400'
                                }`}>
                                <div className={`w-2 h-2 rounded-full ${attendance.status === 'Present' ? 'bg-green-400 animate-pulse' : 'bg-red-500'
                                    }`} />
                                {attendance.status === 'Present'
                                    ? `Marked Present (${Math.round(attendance.distance_meters)}m)`
                                    : `Away (${(attendance.distance_meters / 1000).toFixed(1)}km)`
                                }
                            </div>
                        ) : user?.role === 'student' ? (
                            <button
                                onClick={() => {
                                    alert("Requesting Location Access... Please click Allow if prompted.");
                                    if (navigator.geolocation) {
                                        navigator.geolocation.getCurrentPosition(
                                            async (position) => {
                                                try {
                                                    const { latitude, longitude } = position.coords;
                                                    // Pass user.id properly
                                                    const res = await attendanceService.markAttendance(latitude, longitude, user.id);
                                                    setAttendance(res.data);
                                                    alert("Success! Marked as " + res.data.status);
                                                } catch (err) {
                                                    // console.error(err);
                                                    alert("Failed to mark attendance: " + err.message);
                                                }
                                            },
                                            (err) => alert("Location denied or error: " + err.message)
                                        );
                                    } else {
                                        alert("Geolocation not supported by this browser.");
                                    }
                                }}
                                className="text-xs text-primary underline hover:text-primary/80"
                            >
                                📍 Tap to Check In
                            </button>
                        ) : null}

                        {/* Admin Set Location Button */}
                        {user?.role === 'admin' && (
                            <button
                                onClick={() => {
                                    if (confirm("Set CURRENT location as the new Hostel Location? All student checks will be measured against this point.")) {
                                        if (navigator.geolocation) {
                                            navigator.geolocation.getCurrentPosition(
                                                async (position) => {
                                                    try {
                                                        const { latitude, longitude } = position.coords;
                                                        await attendanceService.setLocation(latitude, longitude);
                                                        alert("Hostel Location Updated to: " + latitude + ", " + longitude);
                                                    } catch (err) {
                                                        alert("Failed to set location");
                                                    }
                                                },
                                                (err) => alert("Location denied")
                                            );
                                        }
                                    }
                                }}
                                className="text-[10px] text-muted-foreground hover:text-foreground mt-1"
                            >
                                (Admin: Set Hostel Location)
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={Users}
                    title="Total Students"
                    value={stats.totalStudents}
                    subtext="Registered students"
                    colorClass={{ bg: 'bg-blue-500', text: 'text-blue-500' }}
                />
                <StatCard
                    icon={DollarSign}
                    title="Pending Dues"
                    value={`₹${stats.pendingDues} `}
                    subtext={`${stats.pendingDuesCount} payments pending`}
                    colorClass={{ bg: 'bg-green-500', text: 'text-green-500' }}
                />
                <StatCard
                    icon={AlertTriangle}
                    title="Active Issues"
                    value={stats.activeIssues}
                    subtext="Unresolved complaints"
                    colorClass={{ bg: 'bg-orange-500', text: 'text-orange-500' }}
                />
                <StatCard
                    icon={MessageSquare}
                    title="Total Complaints"
                    value={stats.totalComplaints}
                    subtext={`${stats.pendingComplaints} pending review`}
                    colorClass={{ bg: 'bg-purple-500', text: 'text-purple-500' }}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity / Issues Placeholder */}
                <div className="p-6 rounded-2xl bg-card border border-white/5 h-64 flex flex-col justify-center items-center text-muted-foreground">
                    <AlertTriangle className="mb-4 opacity-20" size={48} />
                    <p>Recent Discipline Logs (Coming Soon)</p>
                </div>

                {/* Occupancy Status (Placeholder for now) or Energy Widget */}
                <div className="bg-card border border-white/10 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Zap className="text-yellow-400" /> Smart Energy
                    </h3>
                    <div className="space-y-4">
                        <div className="bg-secondary/30 p-4 rounded-xl">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-muted-foreground">{stats.energyLabel || 'Est. Bill'}</span>
                                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">Live</span>
                            </div>
                            <div className="text-2xl font-bold">
                                {stats.energyBill ? `₹${stats.energyBill}` : '₹0'}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                {user?.role === 'admin' ? 'Total bills generated' : 'Projected for end of month'}
                            </div>
                        </div>
                        <button onClick={() => navigate('/energy')} className="w-full py-2 text-sm text-primary hover:text-primary/80 transition-colors">
                            View Detailed Report →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
