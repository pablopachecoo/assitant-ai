// components/AudioManager/LiveAudioInputManager.ts
export class LiveAudioInputManager {
  private audioContext: AudioContext | null;
  private processor: ScriptProcessorNode | false;
  private pcmData: Int16Array;
  private deviceId: string | null;
  private interval: NodeJS.Timeout | null;
  private stream: MediaStream | null;
  public onNewAudioRecordingChunk: (audioData: string) => void;

  constructor() {
    this.audioContext = null;
    this.processor = false;
    this.pcmData = new Int16Array();
    this.deviceId = null;
    this.interval = null;
    this.stream = null;
    this.onNewAudioRecordingChunk = (audioData: string) => {
      console.log("New audio recording ");
    };
  }

  async connectMicrophone(): Promise<void> {
    if (typeof window === 'undefined') return;
    
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: 16000,
    });

    let constraints: MediaStreamConstraints = {
      audio: {
        channelCount: 1,
        sampleRate: 16000,
      } as MediaTrackConstraints,
    };

    if (this.deviceId) {
      (constraints.audio as MediaTrackConstraints).deviceId = { exact: this.deviceId };
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      const source = this.audioContext.createMediaStreamSource(this.stream);
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        // Convert float32 to int16
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcm16[i] = inputData[i] * 0x7fff;
        }
        this.pcmData = new Int16Array([...this.pcmData, ...pcm16]);
      };

      source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);

      this.interval = setInterval(this.recordChunk.bind(this), 1000);
    } catch (error) {
      console.error("Error connecting microphone:", error);
    }
  }

  recordChunk(): void {
    if (this.pcmData.length === 0) return;
    
    const buffer = new ArrayBuffer(this.pcmData.length * 2);
    const view = new DataView(buffer);
    this.pcmData.forEach((value, index) => {
      view.setInt16(index * 2, value, true);
    });

    const base64 = btoa(
      String.fromCharCode(...Array.from(new Uint8Array(buffer)))
    );
    this.onNewAudioRecordingChunk(base64);
    this.pcmData = new Int16Array();
  }

  disconnectMicrophone(): void {
    try {
      if (this.processor) {
        this.processor.disconnect();
      }
      if (this.audioContext) {
        this.audioContext.close();
      }
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
      }
    } catch (error) {
      console.error("Error disconnecting microphone:", error);
    }

    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  async updateMicrophoneDevice(deviceId: string): Promise<void> {
    this.deviceId = deviceId;
    this.disconnectMicrophone();
    await this.connectMicrophone();
  }
}

export default LiveAudioInputManager;