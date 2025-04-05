import React, { useState } from "react";
import { useParams } from "react-router-dom";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import "pdfjs-dist/build/pdf.worker.entry";
import { db } from "../firebase";
import { updateDoc, doc } from "firebase/firestore";
import "../StudentFolder.css";

const StudentPage = ({ subjects, setSubjects }) => {
  const { subjectName, studentName } = useParams();
  const username = localStorage.getItem("username");
  const fullSubjectName = subjectName; // Already prefixed from URL
  const [studentFile, setStudentFile] = useState(null);
  const [score, setScore] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [message, setMessage] = useState("");

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

  const uploadAndCompare = async () => {
    setMessage("");
    setFeedback("");
    if (!studentFile || !subjects[fullSubjectName]?.idealText) {
      setMessage("Please upload student PDF and ensure ideal answer text is set in Firebase");
      return;
    }

    try {
      setMessage("Extracting text from student PDF...");
      const studentText = await extractTextFromPDF(studentFile);
      const idealText = subjects[fullSubjectName].idealText;

      setMessage("Sending to Gemini 1.5 Pro...");
      const apiKey = "AIzaSyBv_L-S89nBWxG8VocdP34Nv6WdGxBFtdk";
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=" + apiKey,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Compare the ideal answer text with the student answer text ,smartly analyse the content , there may be language differences but content may still be correct so analyse properly for student answer text on the basis of ideal answer text , also this is possible that sequence of question number(if any) may be different in ideal and student answer text, so ideantify question number(if any) and their respective answers and then accordinly evaluate, respond only with : "Score: x/10 , Feedback: [short feedback max 100 words]"\nIdeal Answer Text: ${idealText}\nStudent Answer Text: ${studentText}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) throw new Error("Gemini API failed: " + (await response.text()));
      const data = await response.json();
      const result = data.candidates[0].content.parts[0].text;
      const scoreMatch = result.match(/Score: (\d+)\/10/);
      const feedbackMatch = result.match(/Feedback: (.+)/);
      const extractedScore = scoreMatch ? scoreMatch[1] : "N/A";
      const extractedFeedback = feedbackMatch ? feedbackMatch[1] : "No feedback";

      setScore(extractedScore);
      setFeedback(extractedFeedback);
      setMessage("Comparison complete!");

      const subjectRef = doc(db, "subjects", fullSubjectName);
      const currentStudents = subjects[fullSubjectName]?.students || {};
      await updateDoc(subjectRef, {
        students: { ...currentStudents, [studentName]: { text: studentText } },
      });
      setStudentFile(null);
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };

  return (
    <div className="page-container">
      <h2>Student: {studentName} (Subject: {subjectName.replace(`${username}_`, "")})</h2>
      <div className="student-folder">
        <label>Student Answer PDF:</label>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setStudentFile(e.target.files[0])}
        />
      </div>
      <button onClick={uploadAndCompare}>Upload & Compare</button>
      {message && <p>{message}</p>}
      {score && <p>Score: {score}/10</p>}
      {feedback && <p>Feedback: {feedback}</p>}
    </div>
  );
};

export default StudentPage;
