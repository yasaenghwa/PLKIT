import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const ChatGPTComponent = () => {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([
    { role: "system", content: "You are a helpful assistant." },
  ]);
  const [loading, setLoading] = useState(false);

  const messageEndRef = useRef(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const sendMessage = async () => {
    if (!inputText) return;
    setLoading(true);

    // 사용자 입력 메시지 추가
    const newMessages = [...messages, { role: "user", content: inputText }];
    setMessages(newMessages);
    setInputText("");

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: newMessages,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      // API 응답 메시지 추가
      const gptMessage = response.data.choices[0].message;
      setMessages([...newMessages, gptMessage]);
    } catch (error) {
      console.error("Error calling ChatGPT API:", error);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      backgroundColor: "#1e1e1e", // 어두운 배경
      padding: "20px",
      borderRadius: "8px",
      maxWidth: "400px",
      width: "90%",
      height: "60vh", // 화면 높이의 80%로 고정
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      margin: "0 auto",
      overflow: "hidden",
      color: "white",
    },
    messageList: {
      flex: 1,
      overflowY: "auto", // 스크롤 가능
      padding: "10px",
      marginBottom: "10px",
    },
    messageContainer: {
      marginBottom: "10px",
    },
    userMessage: {
      alignSelf: "flex-end",
      backgroundColor: "#0084ff",
      color: "white",
      padding: "10px",
      borderRadius: "12px 12px 0 12px",
      maxWidth: "80%",
      wordWrap: "break-word",
      overflowWrap: "break-word",
      overflow: "hidden",
      whiteSpace: "pre-wrap",
    },
    assistantMessage: {
      alignSelf: "flex-start",
      backgroundColor: "#f1f0f0",
      color: "black",
      padding: "10px",
      borderRadius: "12px 12px 12px 0",
      maxWidth: "80%",
      wordWrap: "break-word",
      overflowWrap: "break-word",
      overflow: "hidden",
      whiteSpace: "pre-wrap",
    },
    inputContainer: {
      display: "flex",
      justifyContent: "space-between",
      padding: "10px",
      backgroundColor: "#333",
      borderRadius: "8px",
    },
    input: {
      width: "75%",
      padding: "10px",
      borderRadius: "20px",
      border: "1px solid #ccc",
      backgroundColor: "#444",
      color: "white",
    },
    sendButton: {
      backgroundColor: "#0084ff",
      color: "white",
      padding: "10px 20px",
      border: "none",
      borderRadius: "20px",
      cursor: "pointer",
      transition: "background-color 0.3s ease",
    },
    sendButtonDisabled: {
      backgroundColor: "#aaa",
      cursor: "not-allowed",
    },
    loading: {
      color: "#888",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.messageList}>
        {messages.map((msg, index) => (
          <div key={index} style={styles.messageContainer}>
            <div
              style={
                msg.role === "user"
                  ? styles.userMessage
                  : styles.assistantMessage
              }
            >
              <strong>{msg.role === "user" ? "User" : "Assistant"}:</strong>
              <p>{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      {loading && <p style={styles.loading}>Loading...</p>}

      <div style={styles.inputContainer}>
        <input
          type="text"
          value={inputText}
          onChange={handleInputChange}
          placeholder="Ask something..."
          style={styles.input}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          style={
            loading
              ? { ...styles.sendButton, ...styles.sendButtonDisabled }
              : styles.sendButton
          }
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatGPTComponent;
