import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { db } from "./firebase";
import { collection, onSnapshot } from "firebase/firestore";
import LandingPage from "./components/LandingPage";
import TeacherDashboard from "./components/TeacherDashboard";
import SubjectPage from "./components/SubjectPage";
import StudentPage from "./components/StudentPage";
import "./App.css";

const App = () => {
  const [subjects, setSubjects] = useState({});

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "subjects"),
      (snapshot) => {
        const data = {};
        snapshot.forEach((doc) => {
          data[doc.id] = doc.data();
        });
        setSubjects(data);
      },
      (error) => {
        console.error("Firestore Sync Error:", error);
      }
    );
    return () => unsubscribe();
  }, []);

  return (
    <div className="app-container">
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage setSubjects={setSubjects} />} />
          <Route
            path="/dashboard"
            element={<TeacherDashboard subjects={subjects} setSubjects={setSubjects} />}
          />
          <Route
            path="/subject/:subjectName"
            element={<SubjectPage subjects={subjects} setSubjects={setSubjects} />}
          />
          <Route
            path="/subject/:subjectName/student/:studentName"
            element={<StudentPage subjects={subjects} setSubjects={setSubjects} />}
          />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
