import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  socket.emit("me", socket.id);

  console.log("User connected: " + socket.id);

  socket.on("message", (data) => {
    // console.log("message", data);
    console.log(data);
  });

  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  // socket.onmessage = (event) => {
  //   console.log("message received");
  //   console.log("Received data " + event.data);
  // };

  socket.on("send_message", (data) => {
    console.log(data);
    socket.to(data.room).emit("receive_message", data.data);
  });

  socket.on("videoStream", (data) => {
    // console.log(data.audio);
    // console.log("videoStream");
    console.log(data.audio);

    socket.to(data.room).emit("videoStream", data.audio);
  });

  socket.on("audio_stream", (data) => {
    console.log(data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});

server.listen(3001, () => {
  console.log("Server is running");
});
