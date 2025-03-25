import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { updateDoc, doc } from "firebase/firestore";

const StudentPage = ({ subjects, setSubjects }) => {
  const { subjectName, studentName } = useParams();
  const [studentFile, setStudentFile] = useState(null);
  const [score, setScore] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const readFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsText(file);
    });
  };

  const uploadAndCompare = async () => {
    if (!studentFile || !subjects[subjectName]?.ideal) {
      setFeedback("Please upload student file and ensure ideal answer is set");
      return;
    }

    const studentAnswer = await readFile(studentFile);
    const idealAnswer = subjects[subjectName].ideal;
    const apiKey = "AIzaSyBqY5eGZtgk8ashKv7rYYSHRh9rTcJDaew"; // Yaha sahi API key

    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Compare these two answers and respond only with: "Score: X/10, Feedback: [short feedback max 20 words]"\nIdeal Answer: ${idealAnswer}\nStudent Answer: ${studentAnswer}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Raw API Response:", JSON.stringify(data, null, 2));

      const result = data.candidates?.[0]?.content?.parts?.[0]?.text || "No result found";
      console.log("Parsed Result:", result);

      const scoreMatch = result.match(/Score: (\d+)\/10/);
      const feedbackMatch = result.match(/Feedback: (.+)/);
      const extractedScore = scoreMatch ? scoreMatch[1] : "N/A";
      const extractedFeedback = feedbackMatch ? feedbackMatch[1] : "No feedback";

      setScore(extractedScore);
      setFeedback(extractedFeedback);

      const subjectRef = doc(db, "subjects", subjectName);
      const currentStudents = subjects[subjectName]?.students || {};
      await updateDoc(subjectRef, {
        students: { ...currentStudents, [studentName]: studentAnswer },
      });
      setStudentFile(null);
    } catch (error) {
      setFeedback("Error: " + error.message);
      console.error("Fetch Error:", error);
    }
  };

  return (
    <div>
      <h2>Student: {studentName} (Subject: {subjectName})</h2>
      <div>
        <label>Student Answer File:</label>
        <input type="file" accept=".txt" onChange={(e) => setStudentFile(e.target.files[0])} />
      </div>
      <button onClick={uploadAndCompare}>Upload & Compare</button>
      {score && <p>Score: {score}/10</p>}
      {feedback && <p>Feedback: {feedback}</p>}
    </div>
  );
};

export default StudentPage;