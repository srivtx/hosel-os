import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Calendar, UserCheck, UserX, Clock } from 'lucide-react';
import attendanceService from '../services/attendanceService';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

const Attendance = () => {
    const { user } = useAuth();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    // Ideally we add a date picker, defaulting to today for now
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchReport();
    }, [selectedDate]);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const res = await attendanceService.getReport(selectedDate);
            setReport(res.data);
        } catch (error) {
            console.error("Failed to fetch attendance report", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading attendance report...</div>;

    const pieData = report ? [
        { name: 'Present', value: report.stats.present, color: '#4ade80' },
        { name: 'Absent', value: report.stats.absent, color: '#f87171' },
    ] : [];

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Attendance Report</h2>
                    <p className="text-muted-foreground">Daily tracking of student presence</p>
                </div>
                <div className="flex items-center gap-2 bg-card border border-white/10 p-2 rounded-lg">
                    <Calendar size={18} className="text-muted-foreground" />
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 text-sm"
                    />
                </div>
            </div>

            {/* Stats Overview */}
            {report && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-card border border-white/5 p-6 rounded-2xl flex items-center justify-between">
                        <div>
                            <p className="text-muted-foreground text-sm font-medium">Total Students</p>
                            <h3 className="text-3xl font-bold mt-1">{report.stats.total}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <UserCheck size={24} />
                        </div>
                    </div>

                    <div className="bg-card border border-white/5 p-6 rounded-2xl flex items-center justify-between">
                        <div>
                            <p className="text-muted-foreground text-sm font-medium">Present Tonight</p>
                            <h3 className="text-3xl font-bold mt-1 text-green-400">{report.stats.present}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                            <UserCheck size={24} />
                        </div>
                    </div>

                    <div className="bg-card border border-white/5 p-6 rounded-2xl flex items-center justify-between">
                        <div>
                            <p className="text-muted-foreground text-sm font-medium">Absent (Late)</p>
                            <h3 className="text-3xl font-bold mt-1 text-red-400">{report.stats.absent}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                            <UserX size={24} />
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* List View */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Absent List (Priority) */}
                    <div className="bg-card border border-red-500/20 rounded-2xl overflow-hidden">
                        <div className="p-4 bg-red-500/5 border-b border-red-500/10 flex justify-between items-center">
                            <h3 className="font-semibold text-red-400 flex items-center gap-2">
                                <UserX size={18} /> Absent Students
                            </h3>
                            <span className="text-xs text-red-400/70 font-mono bg-red-500/10 px-2 py-1 rounded">Action Required</span>
                        </div>
                        <div className="divide-y divide-white/5">
                            {report?.absent_list.length > 0 ? (
                                report.absent_list.map(student => (
                                    <div key={student.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">
                                                {student.room_number}
                                            </div>
                                            <div>
                                                <p className="font-medium">{student.name}</p>
                                                <p className="text-xs text-muted-foreground">{student.phone}</p>
                                            </div>
                                        </div>
                                        <div className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded">
                                            Not Checked In
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-muted-foreground text-sm">Everyone is present! 🎉</div>
                            )}
                        </div>
                    </div>

                    {/* Present List */}
                    <div className="bg-card border border-white/5 rounded-2xl overflow-hidden">
                        <div className="p-4 border-b border-white/5 flex justify-between items-center">
                            <h3 className="font-semibold text-green-400 flex items-center gap-2">
                                <UserCheck size={18} /> Present Log
                            </h3>
                        </div>
                        <div className="divide-y divide-white/5">
                            {report?.present_list.length > 0 ? (
                                report.present_list.map(student => (
                                    <div key={student.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">
                                                {student.room_number}
                                            </div>
                                            <div>
                                                <p className="font-medium">{student.name}</p>
                                                <p className="text-xs text-muted-foreground">Checked in at {new Date(student.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                        <div className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded flex items-center gap-1">
                                            <Clock size={10} />
                                            On Time
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-muted-foreground text-sm">No check-ins yet.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Chart View */}
                <div className="bg-card border border-white/5 rounded-2xl p-6 h-fit">
                    <h3 className="font-semibold mb-6">Overview Chart</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                                    itemStyle={{ color: '#e4e4e7' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Attendance;
