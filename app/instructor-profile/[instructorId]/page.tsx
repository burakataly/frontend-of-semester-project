"use client"
import React, { useEffect, useState } from 'react';
import CourseCard from '@/app/components/courseCard';
import { CourseResponse } from '@/app/interfaces/course';
import {User} from '@/app/interfaces/user';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface InstructorResponse {
    id: number;
    username: string;
    biography: string;
    courseCount: number;
}

export default function InstructorProfile({ params }: { params: { instructorId: string } }) {
    const { instructorId } = params;
    const [instructor, setInstructor] = useState<InstructorResponse | null>(null);
    const [courses, setCourses] = useState<CourseResponse[]>([]);
    const router = useRouter();
    const [userRole, setUserRole] = useState<string>('');
    const [userId, setUserId] = useState<number>();
    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const userObj: User = JSON.parse(userData);
            setUserRole(userObj.role);
            setUserId(userObj.id);
        }
    }, []);

    useEffect(() => {
        if (instructorId) {
            const fetchInstructor = async () => {
                const res = await fetch(`http://localhost:8080/instructors/${instructorId}`);
                if (res.ok) {
                    const data = await res.json();
                    setInstructor(data);
                } else {
                    console.error('Failed to fetch instructor');
                }
            };

            const fetchCourses = async () => {
                const res = await fetch(`http://localhost:8080/courses?instructorId=${instructorId}`);
                if (res.ok) {
                    const data = await res.json();
                    setCourses(data);
                } else {
                    console.error('Failed to fetch courses');
                }
            };

            fetchInstructor();
            fetchCourses();
        }
    }, [instructorId]);

    const logout = () => {
        localStorage.removeItem('user');  // Remove user data from localStorage
        router.push('/');
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center">
                <Link href="/courses" passHref>
                    <button className="mt-4 mb-4 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none transition ease-in-out duration-150">
                        Go Back to Courses
                    </button>
                </Link>
                <button 
                    onClick={logout}
                    className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-opacity-50 transition ease-in-out duration-150 cursor-pointer"
                >
                    Logout
                </button>
            </div>
            <h1 className="text-xl font-bold">Instructor Profile</h1>
            {instructor && (
                <>
                    <div>
                        <p>Username: {instructor.username}</p>
                        <p>Biography: {instructor.biography}</p>
                        <p>Total Courses: {instructor.courseCount}</p>
                    </div>
                    {userRole === 'instructor' && parseInt(instructorId) === userId && (
                        <Link href="/create-course" passHref>
                            <button className="mt-4 mb-4 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none transition ease-in-out duration-150">
                                Create Course
                            </button>
                        </Link>
                    )}
                </>
            )}
            <h2 className="mt-4 font-bold">Courses by {instructor?.username}</h2>
            <div>
                {courses.map(course => (
                    <React.Fragment key={course.id}>
                    <CourseCard
                        courseId={course.id}
                        course={course}
                        userRole="instructor"
                        userId={parseInt(instructorId)}
                        userBalance={0}
                    />
                </React.Fragment>
                ))}
            </div>
        </div>
    );
};

