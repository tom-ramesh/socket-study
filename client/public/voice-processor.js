class CustomTarget extends EventTarget {
  myEvent;
  constructor() {
    super();
    this.myEvent = new Event("myevent");
  }

  createEvent() {
    this.dispatchEvent(this.myEvent);
  }
}

const target = new CustomTarget();

target.addEventListener("myevent", () => {
  // console.log("test");
});

class VoiceProcessor extends AudioWorkletProcessor {
  constructor() {
    super();

    this.buffer = [];
  }

  process(inputs, outputs, parameters) {
    this.buffer.push(inputs[0][0]);

    if (this.buffer.length >= 1000) {
      console.log("procss");
      this.port.postMessage(this.buffer);
      this.buffer = [];
    }
    // this.port.postMessage(inputs[0][0]);
    // this.buffer.push(inputs[0][0]);
    return true;
  }
}

registerProcessor("voice-processor", VoiceProcessor);
