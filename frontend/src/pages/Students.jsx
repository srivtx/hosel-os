import React, { useState, useEffect } from 'react';
import { Plus, Search, User, Phone, Home, Calendar } from 'lucide-react';
import studentsService from '../services/studentsService';
import Modal from '../components/Modal';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        room_number: '',
        move_in_date: new Date().toISOString().split('T')[0]
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const data = await studentsService.getAll();
            setStudents(data);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Fix 422 Error: Add default password
            const payload = {
                ...formData,
                password: formData.phone || "123456"
            };
            console.log("Sending Student Payload:", payload);

            await studentsService.create(payload);
            setIsModalOpen(false);
            fetchStudents();
            setFormData({
                name: '',
                phone: '',
                room_number: '',
                move_in_date: new Date().toISOString().split('T')[0]
            });
        } catch (error) {
            console.error('Error creating student:', error);
            alert("Failed to add student. See console.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Students</h2>
                    <p className="text-muted-foreground">Manage student records and directory.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors"
                >
                    <Plus size={18} />
                    Add Student
                </button>
            </div>

            {/* Search Bar Placeholder */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                    type="text"
                    placeholder="Search students..."
                    className="w-full bg-card border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
                />
            </div>

            {/* Student List */}
            {loading ? (
                <div className="text-center py-20 text-muted-foreground">Loading...</div>
            ) : students.length === 0 ? (
                <div className="text-center py-20 bg-card rounded-2xl border border-white/5 border-dashed">
                    <User className="mx-auto w-12 h-12 text-muted-foreground opacity-50 mb-4" />
                    <p className="text-lg font-medium">No students found</p>
                    <p className="text-sm text-muted-foreground">Add your first student to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {students.map((student) => (
                        <div key={student.id} className="bg-card p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-xl font-bold text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                    {student.name.charAt(0)}
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${student.is_active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {student.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <h3 className="text-lg font-semibold mb-1">{student.name}</h3>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Home size={16} />
                                    <span>Room {student.room_number}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone size={16} />
                                    <span>{student.phone}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} />
                                    <span>Since {student.move_in_date}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Student">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-muted-foreground">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full bg-secondary/50 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-muted-foreground">Phone Number</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            className="w-full bg-secondary/50 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-muted-foreground">Room Number</label>
                            <input
                                type="text"
                                name="room_number"
                                value={formData.room_number}
                                onChange={handleInputChange}
                                required
                                className="w-full bg-secondary/50 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-muted-foreground">Move-in Date</label>
                            <input
                                type="date"
                                name="move_in_date"
                                value={formData.move_in_date}
                                onChange={handleInputChange}
                                required
                                className="w-full bg-secondary/50 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors [color-scheme:dark]"
                            />
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 rounded-lg text-muted-foreground hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                        >
                            Add Student
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Students;
