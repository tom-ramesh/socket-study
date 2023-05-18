import { useEffect, useState } from "react";

const voiceProcessor = `class VoiceProcessor extends AudioWorkletProcessor {
    constructor() {
      super();
    }
  
    process(inputs, outputs, parameters) {
      this.port.postMessage(inputs[0][0]);
      return true;
    }
  }
  
  registerProcessor("voice-processor", VoiceProcessor);`;

//creates an audiocontext and sends the audio through sockets
const useAudioContext = () => {
  const [socket, setSocket] = useState(null);

  const voiceProcessorBlob = new Blob([voiceProcessor], {
    type: "application/javascript",
  });
  const voiceProcessorUrl = URL.createObjectURL(voiceProcessorBlob);
  const audioContext = new AudioContext({ sampleRate: 16000 });

  useEffect(() => {
    if (socket) {
      getAudio(audioContext);
    }

    return () => {
      if (audioContext?.state !== "closed") {
        audioContext.close();
      }
    };
  }, [socket]);

  const getAudio = async (audioContext) => {
    const audioStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    const audioSource = audioContext.createMediaStreamSource(audioStream);
    audioContext.audioWorklet
      .addModule(voiceProcessorUrl)
      .then(() => {
        const audioProcessor = new AudioWorkletNode(
          audioContext,
          "voice-processor"
        );

        audioProcessor.port.onmessage = (event) => {
          const audioDataJson = JSON.stringify({ audio: event.data });
          if (socket) {
            socket.send(event.data);
          }
        };

        audioProcessor.addEventListener("processorerror", (event) => {
          console.log("Error while processing audio " + event);
        });

        audioSource.connect(audioProcessor);
        //for playing the output
        // audioProcessor.connect(audioContext.destination);
      })
      .catch((e) => {
        console.log("err", e);
      });
  };

  return [setSocket];
};

export default useAudioContext;
