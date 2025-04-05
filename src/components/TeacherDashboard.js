import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { setDoc, doc } from "firebase/firestore";

const TeacherDashboard = ({ subjects, setSubjects }) => {
  const [subjectName, setSubjectName] = useState("");
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  const addSubject = async () => {
    if (subjectName && username) {
      const fullSubjectName = `${username}_${subjectName}`;
      await setDoc(doc(db, "subjects", fullSubjectName), {
        creator: username,
        idealText: null,
        students: {},
      });
      setSubjectName("");
    } else {
      alert("Please ensure you have a username set and enter a subject name.");
    }
  };

  const userSubjects = Object.keys(subjects)
    .filter((key) => subjects[key].creator === username)
    .reduce((obj, key) => {
      obj[key] = subjects[key];
      return obj;
    }, {});

  return (
    <div className="page-container">
      <h2>Teacher Dashboard - {username || "Guest"}</h2>
      <input
        type="text"
        value={subjectName}
        onChange={(e) => setSubjectName(e.target.value)}
        placeholder="Enter subject name"
      />
      <button onClick={addSubject}>Add Subject</button>
      <ul>
        {Object.keys(userSubjects).map((subject) => (
          <li key={subject}>
            <button onClick={() => navigate(`/subject/${subject}`)}>
              {subject.replace(`${username}_`, "")}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TeacherDashboard;
