"use client";

import React, { useState } from 'react';
import { CSSProperties } from 'react';
import { useRouter } from 'next/navigation';

export interface UserLoginInfo {
    username: string;
    password: string;
}

export interface StudentRequest extends UserLoginInfo {
    balance: number;
}

export interface InstructorRequest extends UserLoginInfo {
    biography: string;
}

const styles: Record<string, CSSProperties> = {
    container: {
        padding: '20px',
        maxWidth: '400px',
        margin: '0 auto',
        textAlign: 'center' // Correctly typed without explicit casting
    },
    formControl: {
        margin: '10px 0'
    },
    label: {
        display: 'block',
        marginBottom: '5px',
        fontWeight: 'bold'
    },
    input: {
        width: '100%',
        padding: '8px',
        fontSize: '16px'
    },
    select: {
        width: '100%',
        padding: '8px',
        fontSize: '16px'
    },
    button: {
        padding: '10px 20px',
        fontSize: '16px',
        color: 'white',
        backgroundColor: '#007BFF',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
    },
    error: {
        color: 'red',
        fontSize: '14px'
    }
};

const RegistrationForm: React.FC = () => {
    const [userType, setUserType] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [balance, setBalance] = useState<string>('');
    const [biography, setBiography] = useState<string>('');
    const [error, setError] = useState<string>('');
    const router = useRouter();
    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        let payload: StudentRequest | InstructorRequest;

        if (userType === 'student') {
            payload = {
                username,
                password,
                balance: parseFloat(balance)
            };
        } else {
            payload = {
                username,
                password,
                biography
            };
        }

        try {
            const response = await fetch(`${"http://localhost:8080"}/${userType}s`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.text(); // Use response.text() if the message is plain text
                throw new Error(errorData || 'Failed to register.');
            }

            alert('Registration successful!');
            router.push('/login');
            // Optionally reset state or redirect user
        } catch (err : unknown) {
            let message = 'An error occurred during registration.';
            if (err instanceof Error) {
                message = err.message;
            }
            setError(message);        }
    };

    return (
        <div style={styles.container}>
            <h1>Register as a Student or Instructor</h1>
            <form onSubmit={handleRegister} style={{ margin: '20px 0' }}>
                <div style={styles.formControl}>
                    <label style={styles.label}>
                        User Type:
                        <select style={styles.select} value={userType} onChange={e => setUserType(e.target.value)}>
                            <option value="">Select User Type</option>
                            <option value="student">Student</option>
                            <option value="instructor">Instructor</option>
                        </select>
                    </label>
                </div>
                <div style={styles.formControl}>
                    <label style={styles.label}>Username:</label>
                    <input style={styles.input} type="text" value={username} onChange={e => setUsername(e.target.value)} required className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-900 focus:bg-white focus:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div style={styles.formControl}>
                    <label style={styles.label}>Password:</label>
                    <input style={styles.input} type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-900 focus:bg-white focus:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                {userType === 'student' && (
                    <div style={styles.formControl}>
                        <label style={styles.label}>Balance:</label>
                        <input style={styles.input} type="number" value={balance} onChange={e => setBalance(e.target.value)} required className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-900 focus:bg-white focus:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                )}
                {userType === 'instructor' && (
                    <div style={styles.formControl}>
                        <label style={styles.label}>Biography:</label>
                        <textarea style={styles.input} value={biography} onChange={e => setBiography(e.target.value)} required className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-900 focus:bg-white focus:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                )}
                <button style={styles.button} type="submit">Register</button>
                {error && <p style={styles.error}>{error}</p>}
            </form>
        </div>
    );
}


export default RegistrationForm;
