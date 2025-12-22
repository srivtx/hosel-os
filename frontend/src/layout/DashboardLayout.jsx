import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, MessageSquare, LogOut, WashingMachine, Zap, QrCode, Calendar, Package, Utensils, ShoppingBag } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

const SidebarItem = ({ icon: Icon, label, path }) => {
    const location = useLocation();
    const isActive = location.pathname === path;

    return (
        <Link
            to={path}
            className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group border border-transparent",
                isActive
                    ? "bg-primary/10 text-primary border-primary/20 shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            )}
        >
            <Icon size={20} className={cn("transition-colors", isActive ? "text-primary" : "group-hover:text-foreground")} />
            <span className="font-medium">{label}</span>
        </Link>
    );
};

const DashboardLayout = ({ children }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex font-sans selection:bg-primary/20">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 flex flex-col p-4 bg-card/30 backdrop-blur-xl fixed h-full z-10">
                <div className="p-2 mb-8 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Hostel<span className="text-primary">OS</span>
                    </h1>
                </div>

                <nav className="flex-1 space-y-1">
                    <SidebarItem icon={LayoutDashboard} label="Dashboard" path="/" />

                    {/* Admin Only Links */}
                    {user?.role === 'admin' && (
                        <>
                            <SidebarItem icon={Users} label="Students" path="/students" />
                            <SidebarItem icon={CreditCard} label="Rent & Dues" path="/rent" />
                            <SidebarItem icon={MessageSquare} label="Complaints" path="/complaints" />
                            <SidebarItem icon={Calendar} label="Attendance" path="/attendance" />
                        </>
                    )}

                    {/* Common Links */}
                    <SidebarItem icon={Package} label="Mailroom" path="/mailroom" />
                    <SidebarItem icon={Utensils} label="Smart Mess" path="/mess" />
                    <SidebarItem icon={WashingMachine} label="Laundry" path="/laundry" />
                    <SidebarItem icon={Zap} label="Smart Energy" path="/energy" />
                    <SidebarItem icon={QrCode} label="Gate Pass" path="/gate" />

                    {/* Student Only Links (if any specific, e.g. "My Complaints") */}
                    {user?.role === 'student' && (
                        <>
                            <SidebarItem icon={ShoppingBag} label="Marketplace" path="/marketplace" />
                            <SidebarItem icon={MessageSquare} label="My Complaints" path="/complaints" />
                        </>
                    )}
                </nav>

                <div className="pt-4 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-red-500/10 hover:text-red-500 w-full transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8 relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent pointer-events-none" />
                <div className="relative z-0">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
