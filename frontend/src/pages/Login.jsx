import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn, User, ShieldCheck } from 'lucide-react';

const Login = () => {
    const [role, setRole] = useState('student'); // 'student' or 'admin'

    // Admin State
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // Student State
    const [phone, setPhone] = useState('');
    const [studentPassword, setStudentPassword] = useState('');

    const [error, setError] = useState('');
    const { login, studentLogin } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        let result;
        if (role === 'admin') {
            result = login(username, password);
        } else {
            result = await studentLogin(phone, studentPassword);
        }

        if (result.success) {
            navigate('/');
        } else {
            setError(result.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-card border border-white/10 rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
                        <LogIn className="text-white" size={24} />
                    </div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Welcome Back
                    </h1>
                    <p className="text-muted-foreground mt-2">Sign in to HostelOS</p>
                </div>

                {/* Role Switcher */}
                <div className="flex bg-secondary/50 p-1 rounded-xl mb-6">
                    <button
                        type="button"
                        onClick={() => setRole('student')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${role === 'student'
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <User size={16} />
                        Student
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole('admin')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${role === 'admin'
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <ShieldCheck size={16} />
                        Admin
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm text-center border border-red-500/20">
                            {error}
                        </div>
                    )}

                    {role === 'admin' ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Username</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-secondary/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors hover:border-white/20"
                                    placeholder="Enter username"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-secondary/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors hover:border-white/20"
                                    placeholder="Enter password"
                                    required
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Phone Number</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-secondary/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors hover:border-white/20"
                                    placeholder="Enter registered phone"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Password</label>
                                <input
                                    type="password"
                                    value={studentPassword}
                                    onChange={(e) => setStudentPassword(e.target.value)}
                                    className="w-full bg-secondary/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors hover:border-white/20"
                                    placeholder="Default: Phone Number"
                                    required
                                />
                            </div>
                        </>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 transition-all active:scale-[0.98] shadow-lg shadow-primary/25 mt-2"
                    >
                        Sign In as {role === 'admin' ? 'Admin' : 'Student'}
                    </button>

                    <div className="text-center mt-6">
                        {role === 'admin' ? (
                            <p className="text-xs text-muted-foreground">
                                Default: <span className="font-mono text-primary">admin / admin</span>
                            </p>
                        ) : (
                            <p className="text-xs text-muted-foreground">
                                Use your registered phone number. Default password is your phone number.
                            </p>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
