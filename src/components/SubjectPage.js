import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { updateDoc, doc } from "firebase/firestore";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import "pdfjs-dist/build/pdf.worker.entry";
import "../Folder.css";

const SubjectPage = ({ subjects, setSubjects }) => {
  const { subjectName } = useParams();
  const username = localStorage.getItem("username");
  const fullSubjectName = subjectName; // Already prefixed from URL
  const [studentName, setStudentName] = useState("");
  const [idealFile, setIdealFile] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const extractTextFromPDF = async (file) => {
    const fileReader = new FileReader();
    return new Promise((resolve, reject) => {
      fileReader.onload = async (e) => {
        try {
          const typedArray = new Uint8Array(e.target.result);
          const pdf = await pdfjsLib.getDocument(typedArray).promise;
          let text = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map((item) => item.str).join(" ") + "\n";
          }
          resolve(text);
        } catch (error) {
          reject(new Error("Text extraction failed: " + error.message));
        }
      };
      fileReader.onerror = () => reject(new Error("File reading failed."));
      fileReader.readAsArrayBuffer(file);
    });
  };

  const addStudent = async () => {
    if (studentName) {
      try {
        const subjectRef = doc(db, "subjects", fullSubjectName);
        const currentStudents = subjects[fullSubjectName]?.students || {};
        await updateDoc(subjectRef, {
          students: { ...currentStudents, [studentName]: null },
        });
        setStudentName("");
        setMessage(`Student ${studentName} added!`);
      } catch (error) {
        setMessage("Error adding student: " + error.message);
      }
    } else {
      setMessage("Please enter a student name!");
    }
  };

  const handleIdealUpload = async () => {
    if (idealFile) {
      try {
        setMessage("Extracting text from ideal PDF...");
        const idealText = await extractTextFromPDF(idealFile);
        const subjectRef = doc(db, "subjects", fullSubjectName);
        await updateDoc(subjectRef, { idealText });
        setIdealFile(null);
        setMessage("Ideal answer text uploaded to Firebase!");
      } catch (error) {
        setMessage("Error uploading ideal answer: " + error.message);
      }
    } else {
      setMessage("Please upload an ideal answer PDF!");
    }
  };

  return (
    <div className="page-container">
      <h2>Subject: {subjectName.replace(`${username}_`, "")}</h2>
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
        <label>Ideal Answer PDF:</label>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setIdealFile(e.target.files[0])}
        />
        <button onClick={handleIdealUpload}>Upload Ideal Answer</button>
        {subjects[fullSubjectName]?.idealText && <p>Ideal answer text uploaded</p>}
      </div>
      {message && <p>{message}</p>}
      <ul className="folder-list">
        {Object.keys(subjects[fullSubjectName]?.students || {}).map((student) => (
          <li key={student} className="folder">
            <button onClick={() => navigate(`/subject/${fullSubjectName}/student/${student}`)}>
              {student}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SubjectPage;
