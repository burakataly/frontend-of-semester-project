export interface User {
    id: number;
    username: string;
    role: 'student' | 'instructor';
    balance?: number;  // Optional for students
    biography?: string;  // Optional for instructors
}