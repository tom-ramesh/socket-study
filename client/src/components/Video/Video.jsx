import { useEffect, useRef, useState } from "react";
import useAudioContext from "../../hooks/useAudioContext";
import useCountdown from "../../hooks/useCountdown";

const Video = ({ socket, userName, room }) => {
  const [stream, setStream] = useState(null);
  const [setSocket] = useAudioContext(null);
  const { secondsLeft, setStartTime } = useCountdown();

  const myVideoRef = useRef();
  const partyVideoRef = useRef();

  let interval;

  useEffect(() => {
    // setSocket(socket);
    getMedia();
    setStartTime(300);

    socket.on("videoStream", (data) => {
      console.log(data);

      // const audioContext = new AudioContext({ sampleRate: 44100 });
      // const sourceNode = audioContext.createBufferSource();
      // // const parsed = JSON.parse(data);
      // const audioBuffer = audioContext.createBuffer(
      //   1,
      //   44100,
      //   audioContext.sampleRate
      // );
      // const liveAudioArray = new Float32Array(data);
      // audioBuffer.copyToChannel(liveAudioArray, 0, 0);
      // sourceNode.buffer = audioBuffer;
      // sourceNode.connect(audioContext.destination);
      // sourceNode.start();
    });

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // useEffect(() => {
  //   socket.on("partyVideo", (data) => {
  //     const blob = new Blob([data], { type: "video/webm" });

  //     const videoSrc = URL.createObjectURL(blob);
  //     partyVideoRef.current.src = videoSrc;
  //     console.log(videoSrc);
  //   });
  // }, []);

  const sendRecordedVideo = (chunk) => {
    const blob = new Blob([chunk], { type: "audio/webm" });

    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(blob);

    // const audioblob = new Blob([chunk], { type: "video/webm" });

    // const videoSrc = URL.createObjectURL(audioblob);
    // partyVideoRef.current.src = videoSrc;

    fileReader.onload = () => {
      const arrayBuffer = fileReader.result;

      socket.emit("videoStream", { room, data: arrayBuffer }, { binary: true });
    };

    // socket.send(blob);
    // socket.emit("videoStream", blob);
  };

  const getAudio = async (stream) => {
    const audioContext = new AudioContext({ sampleRate: 44100 });
    const audioSource = audioContext.createMediaStreamSource(stream);

    audioContext.audioWorklet
      .addModule("/voice-processor.js")
      .then(() => {
        const audioProcessor = new AudioWorkletNode(
          audioContext,
          "voice-processor",
          {}
        );

        audioProcessor.port.onmessage = (event) => {
          // const audioDataJson = JSON.stringify({ audio: event.data });
          // socket.send(audioDataJson);
          console.log("to");

          socket.emit("videoStream", { audio: event.data, room });
        };

        audioSource.connect(audioProcessor);
        audioProcessor.connect(audioContext.destination);
      })
      .catch((e) => {
        console.log("err", e);
      });
  };

  const getMedia = async () => {
    const videoStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    // const audioStream = videoStream.getAudioTracks()[0];

    setStream(videoStream);

    getAudio(videoStream);

    if (myVideoRef.current) {
      myVideoRef.current.srcObject = videoStream;
    }

    const mediaRecorder = new MediaRecorder(videoStream, {
      mimeType: "video/webm",
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event?.data.size > 0) {
        // sendRecordedVideo(event.data);
      }
    };

    mediaRecorder.start(2000);
  };

  return (
    <div>
      <label>{secondsLeft}</label>
      <video
        playsInline
        muted
        ref={myVideoRef}
        autoPlay
        width="300"
        height="200"
      />
      <video
        playsInline
        ref={partyVideoRef}
        autoPlay
        width="300"
        height="200"
      />
    </div>
  );
};

export default Video;
