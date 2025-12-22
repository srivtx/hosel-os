import React, { useState, useEffect } from 'react';
import { Package, CheckCircle, Search, Box } from 'lucide-react';
import parcelService from '../services/parcelService';
import studentsService from '../services/studentsService';
import { useAuth } from '../context/AuthContext';

const Mailroom = () => {
    const { user } = useAuth();
    const [parcels, setParcels] = useState([]);
    const [loading, setLoading] = useState(true);

    // Guard State
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [courier, setCourier] = useState('');

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchPendingParcels();
            fetchStudents();
        } else {
            fetchMyParcels();
        }
    }, [user]);

    const fetchPendingParcels = async () => {
        try {
            const res = await parcelService.getPending();
            setParcels(res.data);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const fetchMyParcels = async () => {
        if (user?.id) {
            try {
                const res = await parcelService.getMyParcels(user.id);
                setParcels(res.data);
            } catch (e) { console.error(e); }
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const data = await studentsService.getAll();
            setStudents(data);
        } catch (e) { console.error(e); }
    };

    const handleReceive = async (e) => {
        e.preventDefault();
        try {
            await parcelService.receive(selectedStudent, courier);
            alert("Package Logged!");
            setCourier('');
            setSelectedStudent('');
            fetchPendingParcels();
        } catch (error) {
            alert("Failed to log package");
        }
    };

    const handleCollect = async (id) => {
        if (confirm("Confirm handover?")) {
            await parcelService.collect(id);
            fetchPendingParcels();
        }
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading mailroom...</div>;

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div>
                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <Package className="text-primary" /> Mailroom
                </h2>
                <p className="text-muted-foreground">Manage incoming deliveries and collections.</p>
            </div>

            {/* Admin View: Log New Package */}
            {user?.role === 'admin' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="bg-card border border-white/10 p-6 rounded-2xl h-fit">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Box size={18} /> Log New Arrival
                        </h3>
                        <form onSubmit={handleReceive} className="space-y-4">
                            <div>
                                <label className="text-xs text-muted-foreground block mb-2">Select Student</label>
                                <select
                                    className="w-full bg-secondary/50 border-none rounded-lg p-3 text-sm"
                                    value={selectedStudent}
                                    onChange={(e) => setSelectedStudent(e.target.value)}
                                    required
                                >
                                    <option value="">Choose Student...</option>
                                    {students.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} (Room {s.room_number})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground block mb-2">Courier Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Amazon, BlueDart"
                                    className="w-full bg-secondary/50 border-none rounded-lg p-3 text-sm"
                                    value={courier}
                                    onChange={(e) => setCourier(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:opacity-90 transition-opacity">
                                Log Package
                            </button>
                        </form>
                    </div>

                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold text-muted-foreground">Pending Collection ({parcels.length})</h3>
                        </div>

                        {parcels.length === 0 ? (
                            <div className="bg-card border border-white/5 rounded-2xl p-12 text-center text-muted-foreground">
                                No packages waiting.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {parcels.map(parcel => (
                                    <div key={parcel.id} className="bg-card border border-white/5 p-4 rounded-xl flex justify-between items-center group hover:border-white/20 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 font-bold text-lg">
                                                {parcel.pickup_code}
                                            </div>
                                            <div>
                                                <p className="font-medium">{parcel.courier}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    For Student ID: {parcel.student_id} • {new Date(parcel.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleCollect(parcel.id)}
                                            className="px-4 py-2 bg-secondary hover:bg-green-500/20 hover:text-green-500 rounded-lg text-xs font-medium transition-colors"
                                        >
                                            Mark Collected
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Student View */}
            {user?.role === 'student' && (
                <div>
                    {parcels.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 bg-card border border-white/5 rounded-2xl text-center">
                            <CheckCircle size={48} className="text-green-500 mb-4 opacity-50" />
                            <h3 className="text-xl font-bold">No Mail For You</h3>
                            <p className="text-muted-foreground mt-2">You are all caught up! Check back later.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {parcels.map(parcel => (
                                <div key={parcel.id} className="bg-card border border-yellow-500/20 p-6 rounded-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <Package size={80} />
                                    </div>
                                    <p className="text-xs font-mono text-yellow-500 mb-2">WAITING FOR PICKUP</p>
                                    <h3 className="text-2xl font-bold mb-1">{parcel.courier}</h3>
                                    <p className="text-muted-foreground text-sm mb-6">Arrived at {new Date(parcel.arrival_time).toLocaleTimeString()}</p>

                                    <div className="bg-secondary/50 p-4 rounded-xl text-center">
                                        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Pickup Code</p>
                                        <p className="text-4xl font-mono font-bold tracking-widest text-foreground">{parcel.pickup_code}</p>
                                    </div>
                                    <p className="text-center text-[10px] text-muted-foreground mt-3">Show this code to the guard.</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Mailroom;
