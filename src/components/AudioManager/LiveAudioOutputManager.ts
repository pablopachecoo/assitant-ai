// components/AudioManager/LiveAudioOutputManager.ts
export class LiveAudioOutputManager {
  private audioInputContext: AudioContext | null;
  private workletNode: AudioWorkletNode | null;
  private initialized: boolean;
  private audioQueue: Float32Array[];
  private isPlaying: boolean;
  
  constructor() {
    this.audioInputContext = null;
    this.workletNode = null;
    this.initialized = false;
    this.audioQueue = [];
    this.isPlaying = false;
    
    if (typeof window !== 'undefined') {
      this.initializeAudioContext();
    }
  }

  async playAudioChunk(base64AudioChunk: string): Promise<void> {
    try {
      if (!this.initialized) {
        await this.initializeAudioContext();
      }

      if (!this.audioInputContext) {
        await this.initializeAudioContext();
      }

      if (this.audioInputContext && this.audioInputContext.state === "suspended") {
        await this.audioInputContext.resume();
      }

      const arrayBuffer = LiveAudioOutputManager.base64ToArrayBuffer(base64AudioChunk);
      const float32Data = LiveAudioOutputManager.convertPCM16LEToFloat32(arrayBuffer);

      if (this.workletNode) {
        this.workletNode.port.postMessage(float32Data);
      }
    } catch (error) {
      console.error("Error processing audio chunk:", error);
    }
  }

  async initializeAudioContext(): Promise<void> {
    if (this.initialized || typeof window === 'undefined') return;

    console.log("Initializing audio context...");

    try {
      this.audioInputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ 
        sampleRate: 24000 
      });
      
      await this.audioInputContext.audioWorklet.addModule("/pcm-processor.ts");
      
      this.workletNode = new AudioWorkletNode(
        this.audioInputContext,
        "pcm-processor"
      );
      
      this.workletNode.connect(this.audioInputContext.destination);
      this.initialized = true;
      
      console.log("Audio context initialized");
    } catch (error) {
      console.error("Failed to initialize audio context:", error);
    }
  }

  static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  static convertPCM16LEToFloat32(pcmData: ArrayBuffer): Float32Array {
    const inputArray = new Int16Array(pcmData);
    const float32Array = new Float32Array(inputArray.length);
    for (let i = 0; i < inputArray.length; i++) {
      float32Array[i] = inputArray[i] / 32768;
    }
    return float32Array;
  }
}

export default LiveAudioOutputManager;