import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Zap, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Energy = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [simulating, setSimulating] = useState(false);

    useEffect(() => {
        if (user) fetchStats();
    }, [user]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            if (user?.role === 'admin') {
                const response = await api.get('/monitoring/admin-stats');
                setData(response.data);
            } else {
                const response = await api.get(`/monitoring/stats/${user.id}`);
                setData(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch energy stats", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSimulate = async () => {
        if (!confirm("This will overwrite usage data with new random values. Continue?")) return;
        try {
            setSimulating(true);
            await api.post('/monitoring/simulate');
            await fetchStats();
            alert("Simulation complete! New data generated.");
        } catch (error) {
            alert("Simulation failed");
        } finally {
            setSimulating(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading energy data...</div>;

    // Empty State
    if (!data && user?.role === 'student') {
        return (
            <div className="text-center p-12 space-y-4">
                <div className="bg-secondary/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                    <Zap size={32} />
                </div>
                <h3 className="text-xl font-medium">No Data Available</h3>
                <p className="text-muted-foreground">Ask your admin to enable the smart meter.</p>
            </div>
        );
    }

    // Admin Empty State
    if (!data && user?.role === 'admin') {
        return (
            <div className="text-center p-12 space-y-4">
                <h2 className="text-2xl font-bold mb-4">Smart Energy Monitor</h2>
                <p className="text-muted-foreground mb-8">No data found. Start the simulation to see how it works.</p>
                <button
                    onClick={handleSimulate}
                    disabled={simulating}
                    className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium flex items-center gap-2 mx-auto hover:bg-primary/90"
                >
                    <RefreshCw className={simulating ? "animate-spin" : ""} />
                    {simulating ? "Simulating IoT..." : "Start Simulation"}
                </button>
            </div>
        );
    }

    // --- ADMIN DASHBOARD ---
    if (user?.role === 'admin') {
        return (
            <div className="space-y-8 max-w-5xl mx-auto">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight mb-2">Hostel Energy Overview</h2>
                        <p className="text-muted-foreground">Aggregated usage for all rooms</p>
                    </div>
                    <button
                        onClick={handleSimulate}
                        disabled={simulating}
                        className="bg-secondary text-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-white/10 transition-colors"
                    >
                        <RefreshCw size={16} className={simulating ? "animate-spin" : ""} />
                        Regenerate Data
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-card border border-white/5 p-8 rounded-2xl flex flex-col justify-center">
                        <div className="text-muted-foreground font-medium mb-2">Total Power Consumption</div>
                        <div className="text-5xl font-bold">{data.total_units} <span className="text-xl text-muted-foreground">kWh</span></div>
                    </div>

                    <div className="bg-card border border-white/5 p-8 rounded-2xl flex flex-col justify-center">
                        <div className="text-muted-foreground font-medium mb-2">Total Bill to Collect</div>
                        <div className="text-5xl font-bold text-primary">₹{data.total_bill}</div>
                    </div>
                </div>

                <div className="bg-card border border-white/5 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-white/5">
                        <h3 className="text-xl font-bold">Room Consumption Breakdown</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="p-4 font-medium text-muted-foreground">Room Number</th>
                                    <th className="p-4 font-medium text-muted-foreground text-right">Units (kWh)</th>
                                    <th className="p-4 font-medium text-muted-foreground text-right">Bill Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.room_breakdown.map((room, idx) => (
                                    <tr key={room.room_number} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="p-4 font-medium flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center text-xs text-muted-foreground">
                                                {idx + 1}
                                            </div>
                                            Room {room.room_number}
                                        </td>
                                        <td className="p-4 text-right">{room.total_units}</td>
                                        <td className="p-4 text-right font-mono">₹{room.bill}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // --- STUDENT DASHBOARD ---
    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight mb-2">My Energy Usage</h2>
                    <p className="text-muted-foreground">Room {data.room_number}</p>
                </div>

                {user?.role === 'admin' && (
                    <button
                        onClick={handleSimulate}
                        disabled={simulating}
                        className="bg-secondary text-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-white/10 transition-colors"
                    >
                        <RefreshCw size={16} className={simulating ? "animate-spin" : ""} />
                        Regenerate Data
                    </button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card border border-white/5 p-6 rounded-2xl">
                    <div className="text-muted-foreground text-sm font-medium mb-1">Current Usage</div>
                    <div className="text-3xl font-bold">{data.total_units} <span className="text-lg text-muted-foreground">kWh</span></div>
                    <div className="mt-2 text-xs text-green-400">Avg {data.avg_daily} kWh/day</div>
                </div>

                <div className="bg-card border border-white/5 p-6 rounded-2xl">
                    <div className="text-muted-foreground text-sm font-medium mb-1">Current Bill</div>
                    <div className="text-3xl font-bold text-primary">₹{data.current_bill}</div>
                    <div className="mt-2 text-xs text-muted-foreground">@ ₹10 per unit</div>
                </div>

                <div className={`bg-card border p-6 rounded-2xl ${data.projected_bill > 2000 ? 'border-red-500/50 bg-red-500/5' : 'border-white/5'
                    }`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="text-muted-foreground text-sm font-medium mb-1">Projected Bill</div>
                            <div className={`text-3xl font-bold ${data.projected_bill > 2000 ? 'text-red-400' : 'text-foreground'}`}>
                                ₹{data.projected_bill}
                            </div>
                        </div>
                        {data.projected_bill > 2000 && (
                            <AlertTriangle className="text-red-500" />
                        )}
                    </div>

                    <div className="mt-2 text-xs opacity-80">
                        {data.projected_bill > 2000 ? "⚠️ High usage alert!" : "Usage is normal"}
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-card border border-white/5 p-6 rounded-3xl h-[400px]">
                <h3 className="text-lg font-medium mb-6">Last 30 Days Trend</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.readings}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis
                            dataKey="reading_date"
                            stroke="#ffffff50"
                            tickFormatter={(str) => new Date(str).getDate()}
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis stroke="#ffffff50" tick={{ fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20', borderRadius: '12px' }}
                            labelFormatter={(label) => new Date(label).toLocaleDateString()}
                        />
                        <Bar dataKey="units_kwh" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default Energy;
