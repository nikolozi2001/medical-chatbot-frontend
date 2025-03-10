import { useState } from "react";
import InputForm from "./components/InputForm";
import ResponseDisplay from "./components/ResponseDisplay";
import Modal from "./components/Modal";
import SmsSvg from "./assets/icons/sms.svg";
import LiveCallerWidget from "./components/LiveCallerWidget";
import { Typography } from "@mui/material";
import './App.css';

const App = () => {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLiveCaller, setShowLiveCaller] = useState(true);
  const [showChatForm, setShowChatForm] = useState(false);

  const getResponse = async () => {
    if (!value) {
      setError("გთხოვთ ჩაწეროთ შეკითხვა");
      return;
    }
    setLoading(true);
    setError("");
    setShowLiveCaller(false);
    try {
      const options = {
        method: "POST",
        body: JSON.stringify({
          message: value,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      };
      const response = await fetch("http://localhost:8000/chat", options);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();

      console.log(data);

      setResponse(data.text);
      setValue("");
    } catch (error) {
      console.error("Error fetching response:", error);
      setError("შეცდომაა, გთხოვთ სცადოთ ხელახლა");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <img
        onClick={() => setIsModalOpen(true)}
        src={SmsSvg}
        alt="SMS Icon"
        className="sms_svg"
      />
      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          {!showChatForm && (
            <LiveCallerWidget onChatButtonClick={() => setShowChatForm(true)} />
          )}
          {showChatForm && (
            <>
              <Typography variant="h6" fontWeight="bold" pt={2} pl={8}>
                რისი ცოდნა გსურთ?
              </Typography>
              <InputForm
                value={value}
                setValue={setValue}
                getResponse={getResponse}
                error={error}
                loading={loading}
              />
            </>
          )}
          {error && <p className="error">{error}</p>}
          <ResponseDisplay response={response} />
        </Modal>
      )}
    </div>
  );
};

export default App;
