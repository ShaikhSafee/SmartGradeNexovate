import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { db } from "./firebase";
import { collection, onSnapshot } from "firebase/firestore";
import LandingPage from "./components/LandingPage";
import TeacherDashboard from "./components/TeacherDashboard";
import SubjectPage from "./components/SubjectPage";
import StudentPage from "./components/StudentPage";

const App = () => {
  const [subjects, setSubjects] = useState({});
  const [guestUsername, setGuestUsername] = useState(null);

  useEffect(() => {
    if (!guestUsername) {
      setSubjects({}); // Clear subjects if no username is set
      return;
    }

    const subjectsRef = collection(db, "guests", guestUsername, "subjects");
    const unsubscribe = onSnapshot(
      subjectsRef,
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
  }, [guestUsername]); // Re-run when guestUsername changes

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<LandingPage setSubjects={setSubjects} setGuestUsername={setGuestUsername} />}
        />
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
  );
};

export default App;