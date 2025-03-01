import { useState } from "react";
import "./App.css";
import axios from "axios";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  async function generateAnswer() {
    const response = await axios({
      method: "POST",
      url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAwZtXNPCDfIHZtl2lEOTWd3y98KBn_D2k",
      data: {
        contents: [{ parts: [{ text: question }] }],
      },
    });
    const aiResponse =
      response["data"]["candidates"][0]["content"]["parts"][0]["text"];
    setAnswer(aiResponse);
    console.log(aiResponse);
  }

  return (
    <>
      <p className="read-the-docs">Medical ChatBot</p>
      <textarea
        name=""
        id=""
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      ></textarea>
      <p>{answer}</p>
      <button onClick={generateAnswer}>Generate Answer</button>
    </>
  );
}

export default App;
