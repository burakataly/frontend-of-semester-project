import React, { useEffect, useState } from 'react';
import { CourseResponse } from '@/app/interfaces/course';
import Link from 'next/link';

interface CourseCardProps {
    courseId: number;
    course: CourseResponse;
    userRole: string;
    userId: number | undefined;
    userBalance: number;
}

const CourseCard: React.FC<CourseCardProps> = ({ courseId, course, userRole, userId, userBalance}) => {
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [enrollmentCount, setEnrollmentCount] = useState(course.enrollments.length);
    const checkEnrollments = async () => {
        var EnrollmentControl = course.enrollments.find((enrollment =>  enrollment.studentId === userId));
        if(EnrollmentControl != null){
            setIsEnrolled(true);
        }
      }

    useEffect(()=>{checkEnrollments()}, [])
    
    const handleEnrollment = async () =>{
        setIsEnrolled(!isEnrolled);
        if(!isEnrolled){
            const success = await saveEnrollment();
            if(success){
                setEnrollmentCount(enrollmentCount + 1); 
            }
        }
        else{
            const success = await deleteEnrollment();
            if(success){
                setEnrollmentCount(enrollmentCount - 1); 
            } 
        }
    }

    const saveEnrollment = async () => {
        if (userBalance < course.price) {
            alert("You do not have enough balance to enroll in this course.");
            setIsEnrolled(false);
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
