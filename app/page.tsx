import Link from 'next/link';

export default function HomePage() {
    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Welcome to Our Application</h1>
            <p>Get started by logging in or registering a new account.</p>
            <div>
                <Link href="/login">
                    <button style={{ marginRight: '10px', padding: '10px 20px', cursor: 'pointer' }}>Login</button>
                </Link>
                <Link href="/register">
                    <button style={{ padding: '10px 20px', cursor: 'pointer' }}>Register</button>
                </Link>
            </div>
        </div>
    );
}