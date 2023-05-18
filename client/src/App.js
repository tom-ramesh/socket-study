import { useState } from "react";
import io from "socket.io-client";
import "./App.css";
import Chat from "./components/Chat/Chat";
import Video from "./components/Video/Video";

const socket = io.connect("http://localhost:3001");

function App() {
  const [userName, setUserName] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);

  const joinRoom = () => {
    if (userName && room) {
      socket.emit("join_room", room);
      setShowChat(true);
    }
  };

  return (
    <div className="App">
      {!showChat ? (
        <div className="joinChatContainer">
          <h3>Join a Chat</h3>
          <input
            type="text"
            placeholder="John.."
            value={userName}
            onChange={(event) => setUserName(event.target.value)}
          />
          <input
            type="text"
            placeholder="Room ID.."
            value={room}
            onChange={(event) => setRoom(event.target.value)}
          />
          <button onClick={joinRoom}>Join A Room</button>
        </div>
      ) : (
        <>
          <Video socket={socket} room={room} />
          <Chat socket={socket} userName={userName} room={room} />
        </>
      )}
    </div>
  );
}

export default App;
