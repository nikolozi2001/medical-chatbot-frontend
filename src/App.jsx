import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generateAnswer() {
    setLoading(true);
    setError("");
    try {
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
    } catch (err) {
      setError("Failed to generate answer. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Medical ChatBot</h1>
      <div className="mb-3">
        <textarea
          className="form-control"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Type your medical question here..."
          rows="5"
        ></textarea>
      </div>
      <div className="text-center">
        <button className="btn btn-primary" onClick={generateAnswer} disabled={loading}>
          {loading ? "Generating..." : "Generate Answer"}
        </button>
      </div>
      {error && <p className="text-danger text-center mt-3">{error}</p>}
      <p className="mt-4">{answer}</p>
    </div>
  );
}

export default App;
