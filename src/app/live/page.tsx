'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video, PresentationIcon } from 'lucide-react';

import ConnectionStatus from '@/components/ConnectionStatus';
import CameraSelect from '@/components/CameraSelect';
import MicrophoneSelect from '@/components/MicrophoneSelect';
import SystemInstructions from '@/components/SystemInstructions';
import TextInput from '@/components/TextInput';
import VideoPreview from '@/components/VideoPreview';
import GeminiChat from '@/components/GeminiChat';
import useCookieJar from '@/lib/CookiesJar';

// Import dos componentes do shadcn/ui
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';

const PROXY_URL = "ws://[THE_URL_YOU_COPIED_WITHOUT_HTTP]";
const PROJECT_ID = "your project id";
const MODEL = "gemini-2.0-flash-exp";
const API_HOST = "us-central1-aiplatform.googleapis.com";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

type ConnectionStatusType = 'disconnected' | 'connecting' | 'connected' | 'speaking';

export default function Home() {
  const [status, setStatus] = useState<ConnectionStatusType>('disconnected');
  const [accessToken, setAccessToken] = useState('');
  const [projectId, setProjectId] = useState(PROJECT_ID);
  const [systemInstructions, setSystemInstructions] = useState('');
  const [responseModality, setResponseModality] = useState('AUDIO');
  const [messages, setMessages] = useState<Message[]>([]);
  const [micActive, setMicActive] = useState(false);

  const geminiApiRef = useRef<any>(null);
  const videoManagerRef = useRef<any>(null);
  const screenManagerRef = useRef<any>(null);
  const audioInputManagerRef = useRef<any>(null);
  const audioOutputManagerRef = useRef<any>(null);

  useEffect(() => {
    const { getCookie } = useCookieJar();

    const savedToken = getCookie('CookieJar_token');
    if (savedToken) setAccessToken(savedToken);

    const savedProject = getCookie('CookieJar_project');
    if (savedProject) setProjectId(savedProject);

    const savedInstructions = getCookie('CookieJar_systemInstructions');
    if (savedInstructions) setSystemInstructions(savedInstructions);
  }, []);

  useEffect(() => {
    const initializeManagers = async () => {
      const { GeminiLiveAPI } = await import('@/lib/GeminiLiveAPI');
      const { LiveVideoManager } = await import('@/components/VideoManager/LiveVideoManager');
      const { LiveScreenManager } = await import('@/components/VideoManager/LiveScreenManager');
      const { LiveAudioInputManager } = await import('@/components/AudioManager/LiveAudioInputManager');
      const { LiveAudioOutputManager } = await import('@/components/AudioManager/LiveAudioOutputManager');

      const videoElement = document.getElementById('video') as HTMLVideoElement;
      const canvasElement = document.getElementById('canvas') as HTMLCanvasElement;

      if (!videoElement || !canvasElement) return;

      const apiInstance = new GeminiLiveAPI(PROXY_URL, projectId, MODEL, API_HOST);
      geminiApiRef.current = apiInstance;
      videoManagerRef.current = new LiveVideoManager(videoElement, canvasElement);
      screenManagerRef.current = new LiveScreenManager(videoElement, canvasElement);
      audioInputManagerRef.current = new LiveAudioInputManager();
      audioOutputManagerRef.current = new LiveAudioOutputManager();

      apiInstance.onErrorMessage = (message: string) => {
        console.error("API Error:", message);
        setStatus('disconnected');
      };

      apiInstance.onConnectionStarted = () => {
        setStatus('connected');
        startAudioInput();
      };

      apiInstance.onReceiveResponse = (messageResponse: any) => {
        if (messageResponse.type === "AUDIO") {
          if (audioOutputManagerRef.current) {
            audioOutputManagerRef.current.playAudioChunk(messageResponse.data);
          }
        } else if (messageResponse.type === "TEXT") {
          console.log("Gemini said:", messageResponse.data);
          setMessages((prev: any) => [...prev, { role: 'assistant', content: messageResponse.data }]);
        }
      };

      videoManagerRef.current.onNewFrame = (b64Image: string) => {
        if (geminiApiRef.current) {
          geminiApiRef.current.sendImageMessage(b64Image);
        }
      };

      screenManagerRef.current.onNewFrame = (b64Image: string) => {
        if (geminiApiRef.current) {
          geminiApiRef.current.sendImageMessage(b64Image);
        }
      };

      audioInputManagerRef.current.onNewAudioRecordingChunk = (audioData: string) => {
        if (geminiApiRef.current) {
          geminiApiRef.current.sendAudioMessage(audioData);
        }
      };
    };

    initializeManagers();

    return () => {
      if (videoManagerRef.current) videoManagerRef.current.stopWebcam();
      if (screenManagerRef.current) screenManagerRef.current.stopCapture();
      if (audioInputManagerRef.current) audioInputManagerRef.current.disconnectMicrophone();
      if (geminiApiRef.current) geminiApiRef.current.disconnect();
    };
  }, [projectId]);

  const handleConnect = () => {
    if (!geminiApiRef.current) return;

    setStatus('connecting');

    geminiApiRef.current.responseModalities = responseModality;
    geminiApiRef.current.systemInstructions = systemInstructions;
    geminiApiRef.current.setProjectId(projectId);
    geminiApiRef.current.connect(accessToken);

    const { setCookie } = useCookieJar();
    setCookie('CookieJar_token', accessToken);
    setCookie('CookieJar_project', projectId);
    setCookie('CookieJar_systemInstructions', systemInstructions);
  };

  const handleDisconnect = () => {
    if (geminiApiRef.current) {
      geminiApiRef.current.disconnect();
    }
    if (audioInputManagerRef.current) {
      stopAudioInput();
    }
    setStatus('disconnected');
  };

  const startAudioInput = () => {
    if (audioInputManagerRef.current) {
      audioInputManagerRef.current.connectMicrophone();
      setMicActive(true);
    }
  };

  const stopAudioInput = () => {
    if (audioInputManagerRef.current) {
      audioInputManagerRef.current.disconnectMicrophone();
      setMicActive(false);
    }
  };

  const toggleMic = () => {
    if (micActive) {
      stopAudioInput();
    } else {
      startAudioInput();
    }
  };

  const startCameraCapture = () => {
    if (screenManagerRef.current) screenManagerRef.current.stopCapture();
    if (videoManagerRef.current) videoManagerRef.current.startWebcam();
  };

  const startScreenCapture = () => {
    if (videoManagerRef.current) videoManagerRef.current.stopWebcam();
    if (screenManagerRef.current) screenManagerRef.current.startCapture();
  };

  const handleCameraChange = (deviceId: string) => {
    if (videoManagerRef.current) {
      videoManagerRef.current.updateWebcamDevice(deviceId);
    }
  };

  const handleMicrophoneChange = (deviceId: string) => {
    if (audioInputManagerRef.current) {
      audioInputManagerRef.current.updateMicrophoneDevice(deviceId);
    }
  };

  const handleSendMessage = (message: string) => {
    if (!geminiApiRef.current || !message.trim()) return;

    geminiApiRef.current.sendTextMessage(message);
    setMessages((prev: any) => [...prev, { role: 'user', content: message }]);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-1">Multimodal Live API</h1>
      <p className="text-center mb-8">
        The Multimodal Live API enables low-latency, two-way interactions that use text, audio, and video input, with audio and text output.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* Credenciais */}
        <Card className="p-4">
          <CardHeader>
            <CardTitle>Credenciais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="access-token">Access Token</Label>
            <Input
              id="access-token"
              type="password"
              placeholder="Access Token"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
            />
            <Label htmlFor="project-id">Project ID</Label>
            <Input
              id="project-id"
              type="text"
              placeholder="Project ID"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Tipo de Resposta */}
        <Card className="p-4">
          <CardHeader>
            <CardTitle>Tipo de Resposta</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={responseModality} onValueChange={(value) => setResponseModality(value)}>
              <TabsList>
                <TabsTrigger value="AUDIO">Audio</TabsTrigger>
                <TabsTrigger value="TEXT">Text</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Configurações */}
        <Card className="p-4">
          <CardHeader>
            <CardTitle>Configurações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SystemInstructions
              value={systemInstructions}
              onChange={setSystemInstructions}
            />
            <div className="flex space-x-4">
              <Button onClick={handleConnect}>Conectar</Button>
              <Button variant="secondary" onClick={handleDisconnect}>Desconectar</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConnectionStatus status={status} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        {/* Coluna 1: Dispositivos e Controles */}
        <div className="space-y-4">
          <Card className="p-4">
            <CardHeader>
              <CardTitle>Dispositivos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CameraSelect onChange={handleCameraChange} />
              <MicrophoneSelect onChange={handleMicrophoneChange} />
            </CardContent>
          </Card>

          <Card className="p-4">
            <CardHeader>
              <CardTitle>Controles</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-around">
              <Button variant="ghost" onClick={toggleMic} className="rounded-full p-2">
                {micActive ? <MicOff size={24} /> : <Mic size={24} />}
              </Button>
              <Button variant="ghost" onClick={startCameraCapture} className="rounded-full p-2">
                <Video size={24} />
              </Button>
              <Button variant="ghost" onClick={startScreenCapture} className="rounded-full p-2">
                <PresentationIcon size={24} />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Coluna 2: Visualização de Vídeo */}
        <div>
          <VideoPreview />
        </div>

        {/* Coluna 3: Chat e Envio de Mensagens */}
        <div className="space-y-4">
          <TextInput onSend={handleSendMessage} />
          <GeminiChat messages={messages} />
        </div>
      </div>
    </main>
  );
}
