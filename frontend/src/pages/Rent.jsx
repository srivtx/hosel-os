import React, { useState, useEffect } from 'react';
import { DollarSign, Clock, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import rentService from '../services/rentService';
import studentsService from '../services/studentsService';
import Modal from '../components/Modal';

const Rent = () => {
    const [payments, setPayments] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        student_id: '',
        amount: '',
        month: new Date().toISOString().slice(0, 7), // YYYY-MM
        status: 'paid',
        payment_date: new Date().toISOString().split('T')[0],
        notes: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [paymentsData, studentsData] = await Promise.all([
                rentService.getAll(),
                studentsService.getAll()
            ]);
            setPayments(paymentsData);
            setStudents(studentsData);
        } catch (error) {
            console.error('Error fetching rent data:', error);
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
            await rentService.create(formData);
            setIsModalOpen(false);
            fetchData();
            setFormData({
                student_id: '',
                amount: '',
                month: new Date().toISOString().slice(0, 7),
                status: 'paid',
                payment_date: new Date().toISOString().split('T')[0],
                notes: ''
            });
        } catch (error) {
            console.error('Error recording payment:', error);
            alert('Failed to record payment');
        }
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'paid': return 'text-green-500 bg-green-500/10';
            case 'late': return 'text-orange-500 bg-orange-500/10';
            case 'unpaid': return 'text-red-500 bg-red-500/10';
            default: return 'text-gray-500 bg-gray-500/10';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Rent & Payments</h2>
                    <p className="text-muted-foreground">Track monthly rent and payment history.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors"
                >
                    <Plus size={18} />
                    Record Payment
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card p-6 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-500/20 rounded-xl text-green-500">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Collected</p>
                            <h3 className="text-2xl font-bold">
                                ₹{payments.reduce((acc, curr) => curr.status === 'paid' ? acc + curr.amount : acc, 0)}
                            </h3>
                        </div>
                    </div>
                </div>
                <div className="bg-card p-6 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-500/20 rounded-xl text-orange-500">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Pending</p>
                            <h3 className="text-2xl font-bold">
                                ₹{payments.reduce((acc, curr) => curr.status !== 'paid' ? acc + curr.amount : acc, 0)}
                            </h3>
                        </div>
                    </div>
                </div>
                <div className="bg-card p-6 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/20 rounded-xl text-blue-500">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Paid This Month</p>
                            <h3 className="text-2xl font-bold">
                                {payments.filter(p => p.month === new Date().toISOString().slice(0, 7) && p.status === 'paid').length}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-card rounded-2xl border border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5">
                    <h3 className="text-lg font-semibold">Payment History</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-secondary/50">
                            <tr>
                                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Student</th>
                                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Month</th>
                                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Amount</th>
                                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Status</th>
                                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-8">Loading...</td></tr>
                            ) : payments.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-8 text-muted-foreground">No payments found</td></tr>
                            ) : (
                                payments.map((payment) => (
                                    <tr key={payment.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="py-3 px-6">
                                            {students.find(s => s.id === payment.student_id)?.name || `ID: ${payment.student_id}`}
                                        </td>
                                        <td className="py-3 px-6">{payment.month}</td>
                                        <td className="py-3 px-6 font-medium">₹{payment.amount}</td>
                                        <td className="py-3 px-6">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(payment.status)}`}>
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-6 text-muted-foreground">{payment.payment_date}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Payment">
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
                        <label className="block text-sm font-medium mb-1 text-muted-foreground">Month</label>
                        <input
                            type="month"
                            name="month"
                            value={formData.month}
                            onChange={handleInputChange}
                            required
                            className="w-full bg-secondary/50 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors [color-scheme:dark]"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-muted-foreground">Amount</label>
                        <input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleInputChange}
                            required
                            className="w-full bg-secondary/50 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-muted-foreground">Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            className="w-full bg-secondary/50 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors"
                        >
                            <option value="paid">Paid</option>
                            <option value="late">Late</option>
                            <option value="unpaid">Unpaid</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-muted-foreground">Payment Date</label>
                        <input
                            type="date"
                            name="payment_date"
                            value={formData.payment_date}
                            onChange={handleInputChange}
                            className="w-full bg-secondary/50 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors [color-scheme:dark]"
                        />
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
                            Save Record
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Rent;
