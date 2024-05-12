"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {User} from '@/app/interfaces/user'

interface UserLoginInfo {
    username: string;
    password: string;
}

function LoginPage() {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const router = useRouter();

    const tryLogin = async (url: string, userInfo: UserLoginInfo, role: 'student' | 'instructor'): Promise<boolean> => {
        const response = await fetch(`${"http://localhost:8080"}${url}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userInfo)
        });
        if (response.ok) {
            const data = await response.json();
            const userData: User = {
                id: data.id,
                username: data.username,
                role: role as 'student' | 'instructor',
                balance: role === 'student' ? data.balance : undefined,
                biography: role === 'instructor' ? data.biography : undefined
            };
            localStorage.setItem('user', JSON.stringify(userData));
            router.push('/courses');
            return true;
        } else {
            const errorText = await response.text(); // Read response as text to handle non-JSON responses
            console.error('Login failed:', errorText);
            setError('Login failed: ' + errorText);
            return false;
        }
    };

    const handleLogin = async () => {
        setError('');
        if (!(await tryLogin('/students/login', { username, password }, 'student'))) {
            if (!(await tryLogin('/instructors/login', { username, password }, 'instructor'))) {
                setError('Login failed: Invalid credentials or server error');
            }
        }
    };

    return (
        <div className="flex justify-center items-center h-screen">
            <div className="w-full max-w-xs">
                <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" onSubmit={e => e.preventDefault()}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                            Username
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="username"
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                            id="password"
                            type="password"
                            placeholder="**********"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="button"
                            onClick={handleLogin}
                        >
                            Sign In
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-xs italic">{error}</p>}
                </form>
            </div>
        </div>
    );
}

export default LoginPage;