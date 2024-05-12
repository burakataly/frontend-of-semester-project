"use client"
import React, { useEffect, useState } from 'react';
import { CourseResponse } from '@/app/interfaces/course';
import { Enrollment, UserProgress } from '@/app/interfaces/enrollment';
import { useRouter } from 'next/navigation';

export default function CoursePage({ params }: { params: { enrollmentId: string } }) {
    const { enrollmentId } = params;
    const router = useRouter();
    const [course, setCourse] = useState<CourseResponse | null>(null);
    const [enrollment, setEnrollment] = useState<Enrollment | null>(null);

    // Fetch enrollment details once on component mount or when enrollmentId changes
    useEffect(() => {
        const fetchEnrollmentDetails = async () => {    
            const response = await fetch(`http://localhost:8080/enrollments/${enrollmentId}`);
            if (response.ok) {
                const data: Enrollment = await response.json();
                setEnrollment(data);
            }
            console.error('Failed to fetch enrollment details');
        };

        fetchEnrollmentDetails();
    }, [enrollmentId]);

    // Fetch course details once when enrollment is set or changes
    useEffect(() => {
        if (enrollment) {
            const fetchCourseDetails = async () => {
                const response = await fetch(`http://localhost:8080/courses/${enrollment.courseId}`);
                if (response.ok) {
                    const data: CourseResponse = await response.json();
                    setCourse(data);
                }
                else{
                    console.error('Failed to fetch course details');
                }
            };

            fetchCourseDetails();
        }
    }, [enrollment]);

    const handleWeekCompletion = async (userProgressId: number, currentStatus: boolean) => {
        if (!enrollment) {
            console.error('Enrollment data is not available.');
            return;
        }
        const newStatus = !currentStatus;
        const response = await fetch(`http://localhost:8080/enrollments/userProgresses/${userProgressId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            alert('Week status updated successfully!');
            // Update local state to reflect the change without re-fetching from the server
            const updatedUserProgresses = enrollment.userProgresses?.map(userProgress => {
                if (userProgress.id === userProgressId) {
                    return { ...userProgress, status: newStatus };
                }
                return userProgress;
            });
    
            // Set the updated enrollment with new user progresses
            setEnrollment(previousEnrollment => {
                if (!previousEnrollment) return null;  // Guard against null
            
                return {
                    ...previousEnrollment,
                    userProgresses: updatedUserProgresses
                } as Enrollment;  // Assure TypeScript that this matches the Enrollment type
            });
        } else {
            alert('Failed to update week status.');
        }
    };

    if (!course || !enrollment) return <p>Loading...</p>;
    
    return (
        <div className="bg-white shadow-md rounded-lg p-4 mb-7">
            <button 
                onClick={() => router.push('/student-profile')}
                className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg shadow hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-opacity-50 transition ease-in-out duration-150 cursor-pointer"
            >
                Go to Your Profile
            </button>
        <h2 className="text-xl font-bold mb-2 text-gray-800">{course.title}</h2>
        <p className="text-gray-700 mb-4">{course.description}</p>
        <p className="text-gray-600 mb-1">Instructor: {course.instructorName}</p>
        <p className="text-gray-600 mb-1">Duration: {course.duration} weeks</p>
        <ul className="space-y-3">
                {enrollment.userProgresses && enrollment.userProgresses.length > 0 ? (
                    enrollment.userProgresses.map((userProgress: UserProgress, index: number) => (
                        <li key={userProgress.id} className="flex justify-between items-center">
                            <span style={{ color: 'teal' }}>Week {index + 1}: {userProgress.week.reading}</span>
                            <button
                                className={`p-2 rounded ${userProgress.status ? 'bg-red-500' : 'bg-green-500'} text-white`}
                                onClick={() => handleWeekCompletion(userProgress.id, userProgress.status)}
                            >
                                {userProgress.status ? 'Mark Incomplete' : 'Mark Complete'}
                            </button>
                        </li>
                    ))
                ) : (
                    <p>No weeks available.</p>
                )}
            </ul>
        </div>
    );
};
