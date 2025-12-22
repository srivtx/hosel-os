import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import roomsService from '../services/roomsService';

// Error Boundary Component
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("3D Component Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="h-64 flex flex-col items-center justify-center text-red-400 bg-gray-900 rounded-xl border border-red-500/30 p-4">
                    <span className="text-2xl mb-2">⚠️</span>
                    <p className="font-bold">3D View Error</p>
                    <p className="text-sm opacity-70">Check console for details.</p>
                </div>
            );
        }

        return this.props.children;
    }
}

const RoomBox = ({ room, position, onClick }) => {
    const [hovered, setHovered] = useState(false);

    if (!room) return null;

    // Color logic: Red = Full, Yellow = Partial, Green = Empty
    const occupancy = room.current_occupancy || 0;
    const capacity = room.capacity || 1;

    let color = '#22c55e'; // Default Green (Empty)
    if (occupancy >= capacity) {
        color = '#ef4444'; // Red (Full)
    } else if (occupancy > 0) {
        color = '#eab308'; // Yellow (Partial)
    }

    return (
        <mesh
            position={position}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            onClick={() => onClick(room)}
        >
            <boxGeometry args={[1.5, 1, 1.5]} />
            <meshStandardMaterial color={hovered ? '#fbbf24' : color} />
            <Text
                position={[0, 0, 0.8]}
                fontSize={0.4}
                color="white"
                anchorX="center"
                anchorY="middle"
            >
                {room.number}
            </Text>
            {hovered && (
                <Html position={[0, 1.5, 0]}>
                    <div className="bg-gray-900 text-white p-2 rounded text-xs whitespace-nowrap border border-gray-700 pointer-events-none z-50 shadow-lg">
                        <div className="font-bold border-b border-gray-700 mb-1 pb-1">Room {room.number}</div>
                        Occ: {room.current_occupancy}/{room.capacity}
                    </div>
                </Html>
            )}
        </mesh>
    );
};

const Building = ({ rooms, onRoomClick }) => {
    if (!rooms || !Array.isArray(rooms) || rooms.length === 0) return null;

    return (
        <group>
            {rooms.map((room) => {
                if (!room || !room.number) return null;

                // Procedural Generation Logic
                const roomNum = parseInt(room.number.replace(/\D/g, '')); // Handle "101A" -> 101
                if (isNaN(roomNum)) return null;

                const floor = Math.floor(roomNum / 100);
                const roomIndex = roomNum % 100;

                // Position calculation
                const x = (roomIndex % 5) * 2 - 4; // 5 rooms per row
                const z = Math.floor(roomIndex / 5) * 2; // Rows depth
                const y = floor * 1.5; // Height based on floor

                return (
                    <RoomBox
                        key={room.id}
                        room={room}
                        position={[x, y, z]}
                        onClick={onRoomClick}
                    />
                );
            })}
        </group>
    );
};

const Hostel3D = ({ students = [] }) => {
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [showStudents, setShowStudents] = useState(false);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const res = await roomsService.getAll();
                if (Array.isArray(res)) {
                    setRooms(res);
                } else {
                    console.warn("roomsService.getAll returned non-array:", res);
                    setRooms([]);
                }
            } catch (e) {
                console.error("Failed to load 3D rooms", e);
            }
        };
        fetchRooms();
    }, []);

    const roomStudents = selectedRoom && students
        ? students.filter(s => s.room_number === selectedRoom.number)
        : [];

    return (
        <ErrorBoundary>
            <div className="h-[500px] w-full bg-gray-900 rounded-xl overflow-hidden relative border border-gray-700 shadow-2xl">
                <div className="absolute top-4 left-4 z-10 pointer-events-none">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="text-blue-400">⚡</span> 3D Digital Twin
                    </h2>
                    <p className="text-gray-400 text-xs">Interactive Hostel Map</p>
                </div>

                {rooms.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                        <div className="bg-black/80 p-8 rounded-2xl text-center backdrop-blur-md border border-white/10 shadow-2xl pointer-events-auto">
                            <span className="text-4xl mb-4 block">🏗️</span>
                            <p className="text-white font-bold text-xl mb-2">Initialize 3D World</p>
                            <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">
                                The 3D view is empty. Initialize the database with demo room data to see the visualization.
                            </p>
                            <button
                                onClick={async () => {
                                    try {
                                        const btn = document.activeElement;
                                        if (btn) {
                                            btn.textContent = "Building Rooms...";
                                            btn.disabled = true;
                                        }
                                        const res = await roomsService.seed();
                                        if (res.error) {
                                            alert("Seeding Error: " + res.error);
                                        } else {
                                            alert(`Seed Result: ${res.details.status} (Count: ${res.details.count})`);
                                            window.location.reload();
                                        }
                                    } catch (e) {
                                        alert("Failed to seed: " + e.message);
                                    }
                                }}
                                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 active:scale-95"
                            >
                                Build Demo Rooms
                            </button>
                        </div>
                    </div>
                )}

                <Canvas camera={{ position: [8, 8, 8], fov: 50 }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} />
                    <OrbitControls autoRotate autoRotateSpeed={0.5} />
                    <gridHelper args={[20, 20, 0x444444, 0x222222]} position={[0, 0, 0]} />
                    <Building rooms={rooms} onRoomClick={(room) => { setSelectedRoom(room); setShowStudents(false); }} />
                </Canvas>

                {selectedRoom && (
                    <div className="absolute bottom-4 right-4 bg-gray-800 p-4 rounded-lg border border-gray-600 shadow-xl w-64 z-20">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold text-white">Room {selectedRoom.number}</h3>
                            <button onClick={() => setSelectedRoom(null)} className="text-gray-400 hover:text-white transition-colors">✕</button>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Floor:</span>
                                <span className="text-white">{Math.floor(parseInt(selectedRoom.number) / 100)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Occupancy:</span>
                                <span className={`font-bold ${selectedRoom.current_occupancy >= selectedRoom.capacity ? 'text-red-400' : 'text-green-400'}`}>
                                    {selectedRoom.current_occupancy} / {selectedRoom.capacity}
                                </span>
                            </div>

                            {showStudents && roomStudents.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-700 animate-in slide-in-from-bottom-2">
                                    <p className="text-xs text-gray-400 mb-2">Residents:</p>
                                    <ul className="space-y-1">
                                        {roomStudents.map(s => (
                                            <li key={s.id} className="text-xs text-blue-300 flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                                {s.name}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {!showStudents && (
                                <button
                                    onClick={() => setShowStudents(true)}
                                    className="w-full mt-3 bg-blue-600 hover:bg-blue-500 text-white text-sm py-2 rounded transition shadow-lg shadow-blue-500/20"
                                >
                                    View Details
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </ErrorBoundary>
    );
};

export default Hostel3D;
