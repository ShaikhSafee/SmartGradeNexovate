import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { setDoc, doc } from "firebase/firestore";

const TeacherDashboard = ({ subjects, setSubjects }) => {
  const [subjectName, setSubjectName] = useState("");
  const navigate = useNavigate();

  const addSubject = async () => {
    if (subjectName) {
      await setDoc(doc(db, "subjects", subjectName), { ideal: null, students: {} });
      setSubjectName("");
    }
  };

  return (
    <div>
      <h2>Teacher Dashboard</h2>
      <input
        type="text"
        value={subjectName}
        onChange={(e) => setSubjectName(e.target.value)}
        placeholder="Enter subject name"
      />
      <button onClick={addSubject}>Add Subject</button>
      <ul>
        {Object.keys(subjects).map((subject) => (
          <li key={subject}>
            <button onClick={() => navigate(`/subject/${subject}`)}>{subject}</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TeacherDashboard;