import React, { useEffect, useState } from 'react';
import { CourseResponse } from '@/app/interfaces/course';
import { User } from '@/app/interfaces/user';
import Link from 'next/link';

interface CourseCardProps {
    courseId: number;
    course: CourseResponse;
}

interface StudentResponse {
    id: number;
    balance: number;
}

const CourseCard: React.FC<CourseCardProps> = ({ courseId, course }) => {
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [enrollmentCount, setEnrollmentCount] = useState(course.enrollments.length);
    const [userRole, setUserRole] = useState<string>('');
    const [userId, setUserId] = useState<number>();
    const [student, setStudent] = useState<StudentResponse | null>(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const userObj: User = JSON.parse(userData);
            setUserRole(userObj.role);
            setUserId(userObj.id);
        }
    }, []);

    useEffect(() => {
        if (userId) {
            fetchStudent();
        }
    }, [userId]);

    const fetchStudent = async () => {
        const res = await fetch(`http://localhost:8080/students/${userId}`);
        if (res.ok) {
            const data = await res.json();
            setStudent(data);
        } else {
            console.error('Failed to fetch student');
        }
    };

    const checkEnrollments = () => {
        if (userRole == 'instructor') return;
        if (student) {
            const enrollmentControl = course.enrollments.find(enrollment => enrollment.studentId === student.id);
            if (enrollmentControl != null) {
                setIsEnrolled(true);
            }
        }
    };

    useEffect(() => {
        checkEnrollments();
    }, [student, course.enrollments, userRole]);

    const handleEnrollment = async () => {
        if (userRole == 'instructor') return;

        if (!isEnrolled) {
            const success = await saveEnrollment();
            if (success) {
                setIsEnrolled(true);
                setEnrollmentCount(enrollmentCount + 1);
            }
        } else {
            const success = await deleteEnrollment();
            if (success) {
                setIsEnrolled(false);
                alert('Enrollment deleted successfully!');
                setEnrollmentCount(enrollmentCount - 1);
            }
        }
    };

    const saveEnrollment = async () => {
        console.log("balance:", student?.balance);
        if (student && student.balance < course.price) {
            alert("You do not have enough balance to enroll in this course.");
            return false;
        }

        try {
            const response = await fetch(`http://localhost:8080/enrollments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId: userId, courseId: course.id })
            });
            if (response.ok) {
                alert('Enrollment successful!');
                return true;
            } else {
                const errorData = await response.text();
                alert(errorData || 'Failed to enroll in the course');
                return false;
            }
        } catch (error) {
            console.error('Failed to save enrollment:', error);
            return false;
        }
    };

    const deleteEnrollment = async () => {
        try {
            const studentId = userId?.toString();
            const courseId = course.id.toString();

            const url = new URL('http://localhost:8080/enrollments?studentId=' + studentId + '&courseId=' + courseId);

            await fetch(url, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });
            return true;

        } catch (error) {
            console.error('Failed to delete enrollment:', error);
            return false;
        }
    };

    const deleteCourse = async () => {
        try {
            await fetch('http://localhost:8080/courses/' + courseId, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });
            alert('Course deleted successfully!');
            return true;
        } catch (error) {
            console.error('Failed to delete course:', error);
            return false;
        }
    };

    return (
        <div className="bg-white shadow-md rounded-lg p-4 mb-6 relative">
            <h2 className="text-xl font-bold mb-2 text-gray-800">{course.title}</h2>
            <p className="text-gray-700 mb-4">{course.description}</p>
            <Link href={`/instructor-profile/${course.instructorId}`} passHref>
                <span className="text-gray-600 mb-1 cursor-pointer underline hover:text-blue-500">
                    Instructor: {course.instructorName}
                </span>
            </Link>
            <p className="text-gray-600 mb-1">Duration: {course.duration} weeks</p>
            <p className="text-gray-600 mb-3">Price: {course.price.toFixed(2)} TL</p>
            <div className="flex justify-between items-center">
                <p className="text-green-500">Enrollments: {enrollmentCount}</p>
                {userRole === 'student' && !isEnrolled && (
                    <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={() => handleEnrollment()}>
                        Enroll
                    </button>
                )}
                {userRole === 'student' && isEnrolled && (
                    <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600" onClick={() => handleEnrollment()}>
                        Unenroll
                    </button>
                )}
            </div>
        </div>
    );
};

export default CourseCard;

