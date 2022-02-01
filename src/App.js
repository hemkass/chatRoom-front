import { useEffect, useState } from "react";
import io from "socket.io-client";
import "./App.css";

let socket;
const PORT = "http://localhost:4000";

function App() {
  const [logIn, setLogIn] = useState(false);
  const [room, setRoom] = useState("my room");
  const [username, setUsername] = useState("");

  const [message, setMessage] = useState("");
  const [messagesSent, setMessagesSent] = useState([]);
  /*  console.log("ma list", messagesSent); */

  /* La fonction pour se connecter et rejoindre une room */
  const connectToRoom = () => {
    socket.emit("join_room", room);
    setLogIn(true);
  };

  /* La fonction pour envoyer les messages */
  const sendMessage = async () => {
    let messageContent = {
      room: room,
      content: { author: username, message: message },
    };
    if (message === "") {
      return;
    }
    socket.emit("send_message", messageContent);

    /*  console.log("mon message", messageContent.content); */
    setMessagesSent([...messagesSent, messageContent.content]);
    setMessage("");
    /*  console.log(messagesSent); */
  };

  /* La fonction pour se déconnecter */
  const handleDisconnect = () => {
    let messageContent = {
      room: room,
      username: username,
    };
    socket.emit("disconnected", messageContent);
    setLogIn(false);
  };

  /* connection côté client à socket io */
  useEffect(() => {
    socket = io(PORT, {
      cors: {
        origin: "http://localhost:4000",
      },
    });
  }, [PORT]);

  /* permet de recevoir les messages sur les différentes sessions */
  useEffect(() => {
    socket.on("receive-message", (data) => {
      setMessagesSent([...messagesSent, data]);
    });
  });

  return (
    <div className="app">
      {!logIn ? (
        <div className="logIn">
          <input
            type="text"
            placeholder="Username"
            onChange={(event) => {
              setUsername(event.target.value);
            }}
          ></input>
          <input
            type="text"
            placeholder="Room"
            onChange={(event) => {
              setRoom(event.target.value);
            }}
          ></input>
          <button onClick={connectToRoom}> Enter chat </button>
        </div>
      ) : (
        <div className="container">
          <div className="header">
            <div className="disconnect-box">
              <button onClick={handleDisconnect}>disconnect</button>
            </div>
          </div>
          <div className="chat-container">
            <div className="title">
              <h1>welcome on : {room}</h1>
            </div>

            <div
              className="chat-screen"
              id={message.author === username ? "youbox" : "othersbox"}
            >
              {messagesSent.map((message, index) => {
                return (
                  <div
                    id={message.author === username ? "you" : "others"}
                    className="mess-box"
                    key={index}
                  >
                    <span
                      className={message.author === username ? "you" : "others"}
                    >
                      {message.author}:{message.message}
                    </span>
                  </div>
                );
              })}{" "}
            </div>
            <div className="chat-message">
              <input
                type="text"
                value={message}
                placeholder="message"
                onChange={(event) => {
                  setMessage(event.target.value);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    sendMessage();
                  }
                }}
              ></input>
              <button onClick={sendMessage}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
