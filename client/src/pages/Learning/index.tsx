import React, { useEffect, useState } from "react";
import { LearningAPI } from "@/api/learning";
import Courses from "./Courses";
import CourseView from "./CourseView";
import { useAuth } from "@/auth/AuthContext";

export default function LearningPage() {
  const { token } = useAuth();
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, [token]);

  const loadCourses = async () => {
    const res = await LearningAPI.getCourses(headers);
    setCourses(res.data.courses);
    setLoading(false);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      {!selectedCourse && (
        <Courses
          courses={courses}
          onSelectCourse={setSelectedCourse}
          refresh={loadCourses}
          headers={headers}
        />
      )}

      {selectedCourse && (
        <CourseView
          course={selectedCourse}
          goBack={() => setSelectedCourse(null)}
          headers={headers}
        />
      )}
    </div>
  );
}
