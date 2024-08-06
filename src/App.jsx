import './App.css';
import { useState } from 'react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';

const API_KEY = process.env.REACT_APP_API_KEY;

function App() {
  const [typing, setTyping] = useState(false)
  // Initialize state with a default message
  const [messages, setMessages] = useState([
    {
      message: "Welcome! Ever wanted to chat with your favorite fictional character? Now you can! Just tell me the name of the character you want to talk to and the title of the book, movie, or show they are from.",
      sender: "ChatGPT",
      direction: "incoming"
    }
  ]);

  // Function to handle sending a new message
  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing"
    };

    // Create a new array with all old messages and the new message
    const newMessages = [...messages, newMessage];

    // Update message state
    setMessages(newMessages);

    // set a tpyping indicator
    setTyping(true)

    // process message to chatgpt
    await processMessagetoChatGPT(newMessages);
    }

  async function processMessagetoChatGPT(chatMessages) {
    // convert message format to chatgpt api format
    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if(messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message };
  });

    const systemMessage = {
      role: "system",
      content: "You are a conversational AI designed to emulate fictional characters from various media. When a user provides the name of a character and the title of the media they are from, you should respond in a way that matches the character's personality, speech patterns, and knowledge. Your goal is to provide an immersive and engaging interaction that feels authentic to the character chosen by the user. Remember to stay true to the character's attributes and context within their story."
    }

    const apiRequestBody = {
      "model": "gpt-4o-mini",
      "messages": [
        systemMessage,
        ...apiMessages
      ]
    }
    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json"},
      body: JSON.stringify(apiRequestBody)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      console.log(data);
      console.log(data.choices[0].message.content);
      setMessages(
        [...chatMessages, {
          message: data.choices[0].message.content,
          sender: "ChatGPT",
          direction: "incoming"
        }]
      );
      setTyping(false);
    });
  }
  

  return (
    <div className="App">
      <h1>Chatbot Title</h1> {/* Add your title here */}
      <div className="chat-container">
        <MainContainer>
          <ChatContainer>
            <MessageList>
              {messages.map((message, i) => (
                <Message key={i} model={message} />
              ))}
              {typing && <TypingIndicator content="ChatGPT is typing..." />}
            </MessageList>
            <MessageInput placeholder="Type message here" onSend={handleSend} />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
}

export default App;