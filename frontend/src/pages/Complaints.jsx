import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, Plus, MessageSquare } from 'lucide-react';
import complaintService from '../services/complaintService';
import studentsService from '../services/studentsService';
import Modal from '../components/Modal';

const Complaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        student_id: '',
        category: 'Maintenance',
        description: '',
        status: 'open'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [complaintsData, studentsData] = await Promise.all([
                complaintService.getAll(),
                studentsService.getAll()
            ]);
            setComplaints(complaintsData);
            setStudents(studentsData);
        } catch (error) {
            console.error('Error fetching complaints:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await complaintService.create(formData);
            setIsModalOpen(false);
            fetchData();
            setFormData({
                student_id: '',
                category: 'Maintenance',
                description: '',
                status: 'open'
            });
        } catch (error) {
            console.error('Error raising complaint:', error);
            alert('Failed to raise complaint');
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await complaintService.update(id, { status: newStatus });
            fetchData();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const getStatusColor = (status) => {
        return status === 'resolved'
            ? 'text-green-500 bg-green-500/10'
            : 'text-orange-500 bg-orange-500/10';
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Complaints</h2>
                    <p className="text-muted-foreground">Track and resolve student complaints.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors"
                >
                    <Plus size={18} />
                    New Complaint
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-20 text-muted-foreground">Loading...</div>
                ) : complaints.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-card rounded-2xl border border-white/5 border-dashed">
                        <MessageSquare className="mx-auto w-12 h-12 text-muted-foreground opacity-50 mb-4" />
                        <p className="text-lg font-medium">No complaints found</p>
                    </div>
                ) : (
                    complaints.map((complaint) => (
                        <div key={complaint.id} className="bg-card p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors flex flex-col h-full">
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(complaint.status)}`}>
                                    {complaint.status.toUpperCase()}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(complaint.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <h3 className="font-semibold mb-2">{complaint.category}</h3>
                            <p className="text-sm text-muted-foreground mb-4 flex-grow">
                                {complaint.description}
                            </p>
                            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                <span className="text-sm font-medium">
                                    {students.find(s => s.id === complaint.student_id)?.name || 'Unknown'}
                                </span>
                                {complaint.status !== 'resolved' && (
                                    <button
                                        onClick={() => handleStatusUpdate(complaint.id, 'resolved')}
                                        className="text-xs bg-green-500/10 text-green-500 px-3 py-1.5 rounded hover:bg-green-500/20 transition-colors"
                                    >
                                        Mark Resolved
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Raise New Complaint">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-muted-foreground">Student</label>
                        <select
                            name="student_id"
                            value={formData.student_id}
                            onChange={handleInputChange}
                            required
                            className="w-full bg-secondary/50 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors"
                        >
                            <option value="">Select Student</option>
                            {students.map(s => (
                                <option key={s.id} value={s.id}>{s.name} (Room {s.room_number})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-muted-foreground">Category</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className="w-full bg-secondary/50 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors"
                        >
                            <option value="Maintenance">Maintenance</option>
                            <option value="Electrical">Electrical</option>
                            <option value="Plumbing">Plumbing</option>
                            <option value="Internet">Internet</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-muted-foreground">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            required
                            rows="4"
                            className="w-full bg-secondary/50 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors resize-none"
                        ></textarea>
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
                            Submit Ticket
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Complaints;
