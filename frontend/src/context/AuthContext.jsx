import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for persistent login
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = (username, password) => {
        // Hardcoded check for admin/admin
        if (username === 'admin' && password === 'admin') {
            const userData = { username, role: 'admin' };
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return { success: true };
        }
        return { success: false, message: 'Invalid admin credentials' };
    };

    const studentLogin = async (phone, password) => {
        try {
            // We need to import api here or pass it, but better to fetch directly or use clean architecture
            // For now, importing api inside or assuming fetch.
            // Let's use fetch for simplicity to avoid circular deps if api.js uses context later
            const response = await fetch('http://127.0.0.1:8000/students/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, password })
            });

            if (response.ok) {
                const studentData = await response.json();
                const userData = {
                    ...studentData,
                    role: 'student',
                    username: studentData.name // Normalize for UI usage
                };
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                return { success: true };
            } else {
                return { success: false, message: 'Invalid phone or password' };
            }
        } catch (error) {
            console.error(error);
            return { success: false, message: 'Login failed' };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    if (loading) {
        return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, login, studentLogin, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
