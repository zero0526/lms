import React from "react";
import student from "../assets/person.svg"
import lesson from "../assets/lesson.svg"

export default function CourseCard({ course }) {

  const priceCheck = (price) => {
    return price > 0 ? `${price}$` : "Free";
  }

  return (
    <div className="min-w-[300px] max-w-[320px] bg-white shadow-lg rounded-xl overflow-hidden flex-shrink-0 transform hover:scale-105 transition duration-300 cursor-pointer">
      <img src={course.img} alt={course.title} className="w-full h-40 object-cover" />
      <div className="p-4">
        <div className="flex flex-row justify-between">
          <h4 className="font-bold text-gray-800 text-sm mb-2">{course.title}</h4>
          <p className="text-yellow-500">{course.rating}★</p>
        </div>
        <p className="text-gray-500 text-xs mb-3">{course.subtitle}</p>
        <div className="flex items-center justify-between">
          <span className="flex flex-row text-black-100"><img className="w-5 h-5 mt-0.5" src={student}/>{course.studentNums}</span>
          <span className="flex flex-row text-black-100"><img className="w-5 h-5 mt-0.5" src={lesson}/>{course.lessonNums}</span>
          <span className="font-semibold">{priceCheck(course.price)}</span>
        </div>
        <button className="mt-3 w-full border border-[#00b6b6] text-[#00b6b6] rounded-lg py-1 hover:bg-[#00b6b6] hover:text-white transition">
          Explore
        </button>
      </div>
    </div>
  );
}
