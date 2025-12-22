import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Scan, Utensils, CheckCircle, XCircle, Camera } from 'lucide-react';
import messService from '../services/messService';
import { useAuth } from '../context/AuthContext';

const Mess = () => {
    const { user } = useAuth();
    const webcamRef = useRef(null);
    const [mode, setMode] = useState(user?.role === 'admin' ? 'scan' : 'view'); // 'scan', 'view', 'enroll'
    const [scanResult, setScanResult] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [credits, setCredits] = useState(0);

    React.useEffect(() => {
        if (user?.role === 'student') {
            fetchCredits();
        }
    }, [user]);

    const fetchCredits = async () => {
        if (!user?.id) {
            console.error("User ID missing in Mess.jsx");
            return;
        }
        try {
            console.log("Fetching credits for:", user.id);
            const res = await messService.getCredits(user.id);
            console.log("Credits response:", res.data);
            setCredits(res.data.credits);
        } catch (e) {
            console.error("Fetch credits failed:", e);
        }
    };

    const handleEnroll = async () => {
        setScanning(true);
        const imageSrc = webcamRef.current.getScreenshot();
        const res = await fetch(imageSrc);
        const blob = await res.blob();

        try {
            // Create a fake file object for the simulation/upload
            const file = new File([blob], "enrollment.jpg", { type: "image/jpeg" });

            await messService.enroll(user.id, file);
            alert("Face Registered Successfully!");
            setScanning(false);
            setMode('view');
        } catch (error) {
            console.error(error);
            alert("Failed to register face.");
            setScanning(false);
        }
    };

    const capture = useCallback(async () => {
        setScanning(true);
        const imageSrc = webcamRef.current.getScreenshot();
        const res = await fetch(imageSrc);
        const blob = await res.blob();

        try {
            const response = await messService.verify(blob);
            setScanResult(response.data);
            setTimeout(() => {
                setScanResult(null);
                setScanning(false);
            }, 3000);
        } catch (error) {
            console.error(error);
            setScanResult({ status: 'unknown', message: 'Not Recognized' });
            setScanning(false);
        }
    }, [webcamRef]);

    if (user?.role === 'student' || mode === 'view' || mode === 'enroll') {
        if (mode === 'enroll') {
            return (
                <div className="max-w-md mx-auto space-y-6">
                    <div className="bg-card border border-white/10 rounded-2xl p-4 overflow-hidden relative">
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            className="w-full rounded-xl mb-4 transform scale-x-[-1]"
                        />
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <div className="w-48 h-64 border-2 border-cyan-500/50 rounded-[50%]"></div>
                        </div>
                    </div>

                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => setMode('view')}
                            className="px-6 py-3 rounded-xl font-medium hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleEnroll}
                            disabled={scanning}
                            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium shadow-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                        >
                            {scanning ? 'Saving...' : <><Camera size={20} /> Snap & Save</>}
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="max-w-md mx-auto space-y-6">
                <div className="bg-card border border-white/10 rounded-2xl p-8 text-center">
                    <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                        <Utensils size={40} />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">My Meal Plan</h2>
                    <p className="text-muted-foreground mb-8">Available Credits</p>

                    <div className="text-6xl font-bold text-white mb-4">{credits}</div>
                    <div className="inline-block bg-white/10 px-4 py-2 rounded-full text-sm mb-8">
                        Resets on 1st of Month
                    </div>

                    <div className="border-t border-white/10 pt-6">
                        <button
                            onClick={() => setMode('enroll')}
                            className="w-full py-3 border border-dashed border-white/20 rounded-xl hover:bg-white/5 transition-colors text-sm text-muted-foreground hover:text-white flex items-center justify-center gap-2"
                        >
                            <Scan size={16} /> Setup / Update Face ID
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Admin Scanner View
    return (
        <div className="max-w-4xl mx-auto">
            <div className="relative bg-black rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl aspect-video">
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="w-full h-full object-cover opacity-80"
                />

                {/* HUD Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-8 left-8 border-t-4 border-l-4 border-cyan-500 w-16 h-16"></div>
                    <div className="absolute top-8 right-8 border-t-4 border-r-4 border-cyan-500 w-16 h-16"></div>
                    <div className="absolute bottom-8 left-8 border-b-4 border-l-4 border-cyan-500 w-16 h-16"></div>
                    <div className="absolute bottom-8 right-8 border-b-4 border-r-4 border-cyan-500 w-16 h-16"></div>

                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-64 h-64 border border-cyan-500/30 rounded-full animate-pulse flex items-center justify-center">
                            <div className="w-56 h-56 border border-cyan-500/50 rounded-full"></div>
                        </div>
                    </div>

                    <div className="absolute top-8 left-0 right-0 text-center">
                        <span className="bg-black/50 text-cyan-500 font-mono px-4 py-1 rounded border border-cyan-500/30 tracking-widest text-xs">
                            FACE ID SYSTEM V1.0
                        </span>
                    </div>
                </div>

                {/* Result Overlay */}
                {scanResult && (
                    <div className={`absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-all duration-300`}>
                        <div className="text-center">
                            {scanResult.status === 'authorized' ? (
                                <>
                                    <CheckCircle size={80} className="text-green-500 mx-auto mb-4 animate-bounce" />
                                    <h2 className="text-4xl font-bold text-green-400 mb-2">ACCESS GRANTED</h2>
                                    <p className="text-2xl text-white">{scanResult.student}</p>
                                    <p className="text-white/50 mt-2">{scanResult.credits} Credits Remaining</p>
                                </>
                            ) : scanResult.status === 'denied' ? (
                                <>
                                    <XCircle size={80} className="text-red-500 mx-auto mb-4" />
                                    <h2 className="text-4xl font-bold text-red-500 mb-2">ACCESS DENIED</h2>
                                    <p className="text-xl text-white">{scanResult.reason}</p>
                                </>
                            ) : (
                                <>
                                    <Scan size={80} className="text-yellow-500 mx-auto mb-4 animate-spin" />
                                    <h2 className="text-3xl font-bold text-yellow-500">SEARCHING...</h2>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-8 flex justify-center">
                <button
                    onClick={capture}
                    disabled={scanning}
                    className="flex items-center gap-3 bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                >
                    <Camera size={24} />
                    {scanning ? 'PROCESSING...' : 'SCAN FACE'}
                </button>
            </div>
        </div>
    );
};

export default Mess;
