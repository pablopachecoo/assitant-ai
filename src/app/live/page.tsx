'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video, PresentationIcon, Loader2 } from 'lucide-react';
import { useChat } from 'ai/react';

import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import ConnectionStatus from '@/components/ConnectionStatus';
import CameraSelect from '@/components/CameraSelect';
import MicrophoneSelect from '@/components/MicrophoneSelect';
import VideoPreview from '@/components/VideoPreview';
import useCookieJar from '@/lib/CookiesJar';

const PROXY_URL = "wss://[THE_URL_YOU_COPIED_WITHOUT_HTTP]";
const PROJECT_ID = "your project id";
const MODEL = "gemini-2.0-flash-exp";
const API_HOST = "us-central1-aiplatform.googleapis.com";

type ConnectionStatusType = 'disconnected' | 'connecting' | 'connected' | 'speaking';

export default function Home() {
  const [status, setStatus] = useState<ConnectionStatusType>('disconnected');
  const [accessToken, setAccessToken] = useState('');
  const [projectId, setProjectId] = useState(PROJECT_ID);
  const [systemInstructions, setSystemInstructions] = useState('');
  const [responseModality, setResponseModality] = useState('AUDIO');
  const [micActive, setMicActive] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');

  // Vercel AI SDK chat hook
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: {
      projectId,
      model: MODEL,
      systemInstructions,
    },
    onResponse: () => {
      // Handle response events if needed
    },
  });

  // Refs para gerenciadores de mídia e API
  const geminiApiRef = useRef<any>(null);
  const videoManagerRef = useRef<any>(null);
  const screenManagerRef = useRef<any>(null);
  const audioInputManagerRef = useRef<any>(null);
  const audioOutputManagerRef = useRef<any>(null);

  // Carregar valores salvos em cookies
  useEffect(() => {
    const { getCookie } = useCookieJar();

    const savedToken = getCookie('CookieJar_token');
    if (savedToken) setAccessToken(savedToken);

    const savedProject = getCookie('CookieJar_project');
    if (savedProject) setProjectId(savedProject);

    const savedInstructions = getCookie('CookieJar_systemInstructions');
    if (savedInstructions) setSystemInstructions(savedInstructions);
  }, []);

  // Inicializar gerenciadores quando o componente montar
  useEffect(() => {
    const initializeManagers = async () => {
      // Importação dinâmica dos módulos
      const { GeminiLiveAPI } = await import('@/lib/GeminiLiveAPI');
      const { LiveVideoManager } = await import('@/components/VideoManager/LiveVideoManager');
      const { LiveScreenManager } = await import('@/components/VideoManager/LiveScreenManager');
      const { LiveAudioInputManager } = await import('@/components/AudioManager/LiveAudioInputManager');
      const { LiveAudioOutputManager } = await import('@/components/AudioManager/LiveAudioOutputManager');

      // Elementos do DOM para preview de vídeo
      const videoElement = document.getElementById('video') as HTMLVideoElement;
      const canvasElement = document.getElementById('canvas') as HTMLCanvasElement;
      
      if (!videoElement || !canvasElement) return;

      // Criando instâncias
      const apiInstance = new GeminiLiveAPI(PROXY_URL, projectId, MODEL, API_HOST);
      geminiApiRef.current = apiInstance;
      videoManagerRef.current = new LiveVideoManager(videoElement, canvasElement);
      screenManagerRef.current = new LiveScreenManager(videoElement, canvasElement);
      audioInputManagerRef.current = new LiveAudioInputManager();
      audioOutputManagerRef.current = new LiveAudioOutputManager();

      // Configurando handlers
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
          // Mensagens agora são gerenciadas pelo Vercel AI SDK
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

    // Cleanup ao desmontar
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

  // Renderização da interface com design melhorado
  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <Card className="mb-8">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl py-2 mx-2">
          <CardTitle className="text-3xl font-bold">Gemini Multimodal Live API</CardTitle>
          <CardDescription className="text-blue-100">
            Interações de baixa latência com texto, áudio e vídeo usando o Google Gemini
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6">
            <ConnectionStatus status={status} />
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="chat" className="flex-1">Chat</TabsTrigger>
              <TabsTrigger value="settings" className="flex-1">Configurações</TabsTrigger>
            </TabsList>
            
            <TabsContent value="settings">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Token de Acesso</label>
                    <Input
                      type="password"
                      placeholder="Token de Acesso da API"
                      value={accessToken}
                      onChange={(e) => setAccessToken(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">ID do Projeto</label>
                    <Input
                      placeholder="ID do Projeto Google Cloud"
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Tipo de Resposta</label>
                    <Select 
                      value={responseModality} 
                      onValueChange={setResponseModality}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de resposta" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AUDIO">Áudio</SelectItem>
                        <SelectItem value="TEXT">Texto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Instruções do Sistema</label>
                    <Textarea
                      placeholder="Instruções para o modelo Gemini..."
                      value={systemInstructions}
                      onChange={(e) => setSystemInstructions(e.target.value)}
                      className="min-h-[150px]"
                    />
                  </div>
                  
                  <div className="flex gap-4 mt-4">
                    <Button 
                      onClick={handleConnect}
                      disabled={status === 'connecting' || status === 'connected'}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {status === 'connecting' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Conectar
                    </Button>
                    
                    <Button 
                      onClick={handleDisconnect}
                      disabled={status === 'disconnected'}
                      variant="outline"
                    >
                      Desconectar
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Dispositivos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Câmera</label>
                          <CameraSelect onChange={handleCameraChange} />
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium mb-1 block">Microfone</label>
                          <MicrophoneSelect onChange={handleMicrophoneChange} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Controle de Mídia</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap justify-around gap-4">
                        <Button
                          onClick={toggleMic}
                          variant={micActive ? "default" : "outline"}
                          size="icon"
                        >
                          {micActive ? <Mic size={18} /> : <MicOff size={18} />}
                        </Button>
                        
                        <Button
                          onClick={startCameraCapture}
                          variant="outline"
                          size="icon"
                        >
                          <Video size={18} />
                        </Button>
                        
                        <Button
                          onClick={startScreenCapture}
                          variant="outline"
                          size="icon"
                        >
                          <PresentationIcon size={18} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="chat" className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="text-lg">Visualização da Câmera</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                      <VideoPreview />
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <Card className="h-full overflow-hidden flex flex-col">
                    <CardHeader className="pb-0">
                      <CardTitle className="text-lg">Chat com Gemini</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col h-full p-0">
                      <div className="flex-1 overflow-auto p-4">
                        <div className="space-y-4">
                          {messages.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                              Inicie uma conversa com o Gemini
                            </div>
                          ) : (
                            messages.map((message) => (
                              <div
                                key={message.id}
                                className={`flex ${
                                  message.role === 'user' ? 'justify-end' : 'justify-start'
                                }`}
                              >
                                <div
                                  className={`max-w-[80%] px-4 py-2 rounded-lg ${
                                    message.role === 'user'
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {message.content}
                                </div>
                              </div>
                            ))
                          )}
                          {isLoading && (
                            <div className="flex justify-start">
                              <div className="max-w-[80%] px-4 py-2 rounded-lg bg-gray-100">
                                <div className="flex items-center gap-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  <span>Respondendo...</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="p-4 border-t">
                        <form
                          onSubmit={handleSubmit}
                          className="flex items-center space-x-2"
                        >
                          <Input
                            value={input}
                            onChange={handleInputChange}
                            placeholder="Envie uma mensagem..."
                            disabled={status !== 'connected' || isLoading}
                          />
                          <Button 
                            type="submit" 
                            disabled={status !== 'connected' || isLoading}
                          >
                            Enviar
                          </Button>
                        </form>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}