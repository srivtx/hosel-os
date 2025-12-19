import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useAuth } from '../context/AuthContext';
import { QrCode, Scan, History, Trash2, StopCircle } from 'lucide-react';
import api from '../services/api';

const GatePass = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('scanner'); // 'scanner', 'logs'
    const [scanResult, setScanResult] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [scannerInstance, setScannerInstance] = useState(null);

    // Student View: Digital ID
    if (user?.role === 'student') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
                <div className="bg-white p-8 rounded-3xl shadow-2xl">
                    <QRCode value={String(user.id)} size={256} />
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold">{user.name}</h2>
                    <p className="text-xl text-muted-foreground">Room: {user.room_number}</p>
                    <div className="bg-primary/20 text-primary px-4 py-2 rounded-full inline-block font-mono text-sm mt-4">
                        ID: {user.id}
                    </div>
                </div>
                <p className="text-muted-foreground max-w-sm">
                    Show this QR code to the guard at the gate to log your entry or exit.
                </p>
            </div>
        );
    }

    // Admin View: Scanner & Logs
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Gate Pass Control</h2>
                {activeTab === 'logs' && (
                    <button
                        onClick={() => setActiveTab('scanner')}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-xl flex items-center gap-2"
                    >
                        <Scan size={20} /> Open Scanner
                    </button>
                )}
                {activeTab === 'scanner' && (
                    <button
                        onClick={() => setActiveTab('logs')}
                        className="bg-secondary text-foreground px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-white/10"
                    >
                        <History size={20} /> View Logs
                    </button>
                )}
            </div>

            {activeTab === 'scanner' && <ScannerView setScanResult={setScanResult} />}
            {activeTab === 'logs' && <LogsView />}

            {/* Scan Result Modal/Overlay */}
            {scanResult && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className={`w-full max-w-md p-8 rounded-3xl text-center space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200 ${scanResult.event_type === 'OUT' ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'
                        }`}>
                        <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            {scanResult.event_type === 'OUT' ? <LogOutIcon size={32} /> : <LogInIcon size={32} />}
                        </div>

                        <h2 className="text-4xl font-bold mb-2">{scanResult.event_type}</h2>

                        <div className="space-y-1">
                            <p className="text-xl opacity-90">{scanResult.student_name}</p>
                            <p className="text-sm opacity-75">{new Date(scanResult.timestamp).toLocaleString()}</p>
                        </div>

                        <button
                            onClick={() => setScanResult(null)}
                            className="bg-white text-black px-8 py-3 rounded-xl font-bold mt-6 hover:bg-white/90 w-full"
                        >
                            Scan Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const ScannerView = ({ setScanResult }) => {
    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
        );

        scanner.render(onScanSuccess, onScanFailure);

        function onScanSuccess(decodedText, decodedResult) {
            // Handle the scanned code as you like, for example:
            console.log(`Code matched = ${decodedText}`, decodedResult);
            handleScan(decodedText);
            scanner.clear(); // Stop scanning after success
        }

        function onScanFailure(error) {
            // handle scan failure, usually better to ignore and keep scanning.
            // console.warn(`Code scan error = ${error}`);
        }

        return () => {
            scanner.clear().catch(error => console.error("Failed to clear html5-qrcode scanner. ", error));
        };
    }, []);

    const handleScan = async (studentId) => {
        try {
            // Validate ID format (simple integer check)
            if (!/^\d+$/.test(studentId)) {
                alert("Invalid QR Code");
                window.location.reload(); // Quick reset
                return;
            }

            const response = await api.post(`/gate/scan?student_id=${studentId}`);
            setScanResult(response.data);

        } catch (error) {
            console.error(error);
            alert("Scan failed: " + (error.response?.data?.detail || error.message));
            window.location.reload(); // Quick reset
        }
    };

    return (
        <div className="max-w-md mx-auto bg-card border border-white/10 rounded-3xl overflow-hidden p-6">
            <div id="reader" className="rounded-xl overflow-hidden"></div>
            <p className="text-center text-muted-foreground mt-4 text-sm">
                Point camera at student's QR code
            </p>
        </div>
    );
};

const LogsView = () => {
    const [logs, setLogs] = useState([]);
    const [cleanupDays, setCleanupDays] = useState(60);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const response = await api.get('/gate/logs');
            setLogs(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCleanup = async () => {
        if (!confirm(`Are you sure you want to delete logs older than ${cleanupDays} days?`)) return;
        try {
            const response = await api.delete(`/gate/cleanup?days=${cleanupDays}`);
            alert(response.data.message);
            fetchLogs();
        } catch (error) {
            console.error(error);
            alert('Cleanup failed');
        }
    };

    return (
        <div className="space-y-6">
            {/* Cleanup Utils */}
            <div className="flex items-center gap-4 bg-secondary/30 p-4 rounded-xl border border-white/5">
                <Trash2 size={20} className="text-muted-foreground" />
                <span className="text-sm font-medium">Maintenance:</span>
                <input
                    type="number"
                    value={cleanupDays}
                    onChange={(e) => setCleanupDays(parseInt(e.target.value))}
                    className="w-20 bg-black/20 rounded-lg px-2 py-1 text-center border border-white/10"
                />
                <span className="text-sm text-muted-foreground">days</span>
                <button
                    onClick={handleCleanup}
                    className="ml-auto bg-red-500/10 text-red-500 hover:bg-red-500/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                    Clean Old Logs
                </button>
            </div>

            {/* Logs Table */}
            <div className="bg-card rounded-2xl border border-white/5 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/10 bg-white/5">
                            <th className="p-4 font-medium text-muted-foreground">Time</th>
                            <th className="p-4 font-medium text-muted-foreground">Student</th>
                            <th className="p-4 font-medium text-muted-foreground">Event</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="p-4 font-medium">
                                    {new Date(log.timestamp).toLocaleString()}
                                </td>
                                <td className="p-4">
                                    {log.student_name || `ID: ${log.student_id}`}
                                </td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${log.event_type === 'IN'
                                            ? 'bg-green-500/20 text-green-500'
                                            : 'bg-orange-500/20 text-orange-500'
                                        }`}>
                                        {log.event_type}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {logs.length === 0 && (
                    <div className="text-center p-8 text-muted-foreground">No logs found.</div>
                )}
            </div>
        </div>
    );
};

// Icons
const LogOutIcon = ({ size }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
);
const LogInIcon = ({ size }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" x2="3" y1="12" y2="12" /></svg>
);

export default GatePass;
