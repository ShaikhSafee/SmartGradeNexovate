import React, { useState } from "react";
import { useParams } from "react-router-dom";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import { db } from "../firebase";
import { updateDoc, doc } from "firebase/firestore";

pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.0.375/pdf.worker.min.js";

const StudentPage = ({ subjects, setSubjects }) => {
  const { subjectName, studentName } = useParams();
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
    if (!studentFile || !subjects[subjectName]?.idealText) {
      setMessage("Please upload student PDF and ensure ideal answer text is set in Firebase");
      return;
    }

    try {
      setMessage("Extracting text from student PDF...");
      const studentText = await extractTextFromPDF(studentFile);
      const idealText = subjects[subjectName].idealText;

      setMessage("Sending to Gemini 1.5 Pro...");
      const apiKey = "AIzaSyBv_L-S89nBWxG8VocdP34Nv6WdGxBFtdk"; // Teri key yaha daal
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
                    text: `Compare the ideal answer text with the student answer text and respond only with: "Score: X/10, Feedback: [short feedback max 20 words]"\nIdeal Answer Text: ${idealText}\nStudent Answer Text: ${studentText}`,
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

      const subjectRef = doc(db, "subjects", subjectName);
      const currentStudents = subjects[subjectName]?.students || {};
      await updateDoc(subjectRef, {
        students: { ...currentStudents, [studentName]: { text: studentText } },
      });
      setStudentFile(null);
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };

  return (
    <div>
      <h2>Student: {studentName} (Subject: {subjectName})</h2>
      <div>
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