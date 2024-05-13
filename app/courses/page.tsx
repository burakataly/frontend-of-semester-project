"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Corrected import path
import CourseCard from '@/app/components/courseCard';
import { CourseResponse } from '@/app/interfaces/course'; 
import { User } from '@/app/interfaces/user'; 

const MainPage: React.FC = () => {
    const [courses, setCourses] = useState<CourseResponse[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const userObj: User = JSON.parse(userData);
            setUser(userObj);
            fetchCourses();
        }
    }, []);

    const fetchCourses = async () => {
        const courseResponse = await fetch('http://localhost:8080/courses');

        if (courseResponse.ok) {
            const coursesData = await courseResponse.json() as CourseResponse[];
            setCourses(coursesData);
        } else {
            console.error('Failed to load courses');
        }
    };

    const goToProfile = () => {
        // Ensure navigation logic respects user role
        if (user?.role === 'student') {
            router.push('/student-profile');
        } else if (user?.role === 'instructor') {
            router.push('/instructor-profile/' + user.id);
        } else {
            // Handle case where role is undefined or user is not logged in
            router.push('/login');
        }
    };

    const logout = () => {
        localStorage.removeItem('user');  // Remove user data from localStorage
        router.push('/');
    };

    return (
        <div className="bg-gray-100 min-h-screen"> {/* Setting a light gray background and minimum height to full screen */}
            <div className="main-container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
                    <button 
                        onClick={goToProfile}
                        className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg shadow hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-opacity-50 transition ease-in-out duration-150 cursor-pointer"
                    >
                        Go to Your Profile
                    </button>
                    <button 
                            onClick={logout}
                            className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-opacity-50 transition ease-in-out duration-150 cursor-pointer"
                        >
                            Logout
                        </button>
                </div>
                {courses.map(course => (
                    <React.Fragment key={course.id}>
                    <CourseCard
                        courseId={course.id}
                        course={course}
                    />
                </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default MainPage;
