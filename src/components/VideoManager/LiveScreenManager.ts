// components/VideoManager/LiveScreenManager.ts
export class LiveScreenManager {
  private previewVideoElement: HTMLVideoElement | null;
  private previewCanvasElement: HTMLCanvasElement | null;
  private ctx: CanvasRenderingContext2D | null;
  private stream: MediaStream | null;
  private interval: NodeJS.Timeout | null;
  public onNewFrame: (newFrame: string) => void;
  
  constructor(previewVideoElement: HTMLVideoElement | null, previewCanvasElement: HTMLCanvasElement | null) {
    this.previewVideoElement = previewVideoElement;
    this.previewCanvasElement = previewCanvasElement;
    this.ctx = null;
    this.stream = null;
    this.interval = null;
    
    if (previewCanvasElement) {
      this.ctx = previewCanvasElement.getContext("2d");
    }
    
    this.onNewFrame = (newFrame: string) => {
      console.log("Default new frame trigger.");
    };
  }

  async startCapture(): Promise<void> {
    if (typeof window === 'undefined') return;
    
    try {
      this.stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      
      if (this.previewVideoElement) {
        this.previewVideoElement.srcObject = this.stream;
      }
      
      // Handle stream ending (user stops sharing)
      this.stream.getVideoTracks()[0].addEventListener('ended', () => {
        console.log('Screen sharing ended');
        this.stopCapture();
      });
      
      this.interval = setInterval(this.newFrame.bind(this), 1000);
    } catch (err) {
      console.error("Error accessing screen capture: ", err);
    }
  }

  stopCapture(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }

    if (!this.stream) return;

    const tracks = this.stream.getTracks();
    tracks.forEach((track) => {
      track.stop();
    });
    
    this.stream = null;
    
    if (this.previewVideoElement) {
      this.previewVideoElement.srcObject = null;
    }
  }

  captureFrameB64(): string {
    if (!this.stream || !this.previewVideoElement || !this.previewCanvasElement || !this.ctx) {
      return "";
    }

    try {
      this.previewCanvasElement.width = this.previewVideoElement.videoWidth;
      this.previewCanvasElement.height = this.previewVideoElement.videoHeight;
      
      this.ctx.drawImage(
        this.previewVideoElement,
        0,
        0,
        this.previewCanvasElement.width,
        this.previewCanvasElement.height,
      );
      
      const imageData = this.previewCanvasElement
        .toDataURL("image/jpeg")
        .split(",")[1]
        .trim();
        
      return imageData;
    } catch (error) {
      console.error("Error capturing frame:", error);
      return "";
    }
  }

  newFrame(): void {
    const frameData = this.captureFrameB64();
    if (frameData) {
      this.onNewFrame(frameData);
    }
  }
}

export default LiveScreenManager;