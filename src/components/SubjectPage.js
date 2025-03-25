import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { updateDoc, doc } from "firebase/firestore";

const SubjectPage = ({ subjects, setSubjects }) => {
  const { subjectName } = useParams();
  const [studentName, setStudentName] = useState("");
  const [idealFile, setIdealFile] = useState(null);
  const navigate = useNavigate();

  const readFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsText(file);
    });
  };

  const addStudent = async () => {
    if (studentName) {
      const subjectRef = doc(db, "subjects", subjectName);
      const currentStudents = subjects[subjectName]?.students || {};
      await updateDoc(subjectRef, {
        students: { ...currentStudents, [studentName]: null },
      });
      setStudentName("");
    }
  };

  const handleIdealUpload = async () => {
    if (idealFile) {
      const idealAnswer = await readFile(idealFile);
      const subjectRef = doc(db, "subjects", subjectName);
      await updateDoc(subjectRef, { ideal: idealAnswer });
      setIdealFile(null);
    }
  };

  return (
    <div>
      <h2>Subject: {subjectName}</h2>
      <div>
        <input
          type="text"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          placeholder="Enter student name"
        />
        <button onClick={addStudent}>Add Student</button>
      </div>
      <div>
        <label>Ideal Answer File:</label>
        <input type="file" accept=".txt" onChange={(e) => setIdealFile(e.target.files[0])} />
        <button onClick={handleIdealUpload}>Upload Ideal Answer</button>
        {subjects[subjectName]?.ideal && <p>Ideal Answer Uploaded</p>}
      </div>
      <ul>
        {Object.keys(subjects[subjectName]?.students || {}).map((student) => (
          <li key={student}>
            <button onClick={() => navigate(`/subject/${subjectName}/student/${student}`)}>
              {student}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SubjectPage;