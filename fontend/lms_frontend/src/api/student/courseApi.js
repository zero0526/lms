import apiClient from '../utils/apiClient';

export const getCouseData = (courseId) => {
  // Logic to get course data based on courseId
  return { id: courseId, title: "Sample Course" }; // Example return value
}

export const enrollInCourse = (courseId, studentId) => {
  // Logic to enroll a student in a course
  return { success: true, courseId, studentId }; // Example return value
}

export const getEnrolledCourses = (studentId) => {
  // Logic to get all courses a student is enrolled in
  return [{ id: 1, title: "Sample Course 1" }, { id: 2, title: "Sample Course 2" }]; // Example return value
}

export const dropCourse = (courseId, studentId) => {
  // Logic to drop a course for a student
  return { success: true, courseId, studentId }; // Example return value
}

export const getCourseMaterials = (courseId) => {
  // Logic to get course materials based on courseId
  return [{ id: 1, title: "Lecture Notes" }, { id: 2, title: "Assignments" }]; // Example return value
}

export const submitAssignment = (courseId, studentId, assignmentData) => {
  // Logic to submit an assignment for a course by a student
  return { success: true, courseId, studentId, assignmentData }; // Example return value
}

export const getGrades = (studentId) => {
  // Logic to get grades for a student
  return [{ courseId: 1, grade: "A" }, { courseId: 2, grade: "B+" }]; // Example return value
}

export const getCourseSchedule = (courseId) => {
  // Logic to get the schedule for a course
  return { courseId, schedule: "Mon-Wed-Fri 10:00-11:00 AM" }; // Example return value
}

export const getInstructorInfo = (courseId) => {
  // Logic to get instructor information for a course
  return { courseId, instructor: "Dr. John Doe" }; // Example return value
}
