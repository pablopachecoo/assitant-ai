'use client';

import { useState, useEffect } from 'react';
import { useChat } from 'ai/react';
import { MessageCircle, FileText, Menu, X, ArrowUp, RefreshCw } from 'lucide-react';

import RagChat from '@/components/RagChat';
import FileUpload from '@/components/FileUpload';
import SourcesList from '@/components/SourcesList';

// Interfaces para os tipos de dados
interface Source {
  id: string;
  title: string;
  content: string;
  filename?: string;
  filetype?: string;
  page?: number;
  relevance?: number;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  isStreaming?: boolean;
}

export default function RagPage() {
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: number }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoadingSources, setIsLoadingSources] = useState(false);
  const [apiKey, setApiKey] = useState<string>(
    process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
  );

  // Hook useChat da biblioteca Vercel AI
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: '/api/rag-chat',
    onResponse: (response) => {
      // Extrair informações de fontes do header personalizado
      const sourcesHeader = response.headers.get('x-sources');
      if (sourcesHeader) {
        try {
          const { sources: responseSources } = JSON.parse(sourcesHeader);
          setSources(responseSources || []);
        } catch (error) {
          console.error('Erro ao processar fontes:', error);
        }
      }
    },
  });

  // Manipular o upload de arquivos
  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/process-file', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Erro desconhecido ao processar arquivo');
      }
      
      setUploadedFiles(prev => [...prev, { name: file.name, size: file.size }]);
      return result;
    } catch (error) {
      console.error('Erro ao fazer upload do arquivo:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // Limpar fontes quando uma nova pergunta é enviada
  const handleChatSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setSources([]);
    setIsLoadingSources(true);
    handleSubmit(e);
  };

  // Limpar todos os documentos
  const handleClearDocuments = async () => {
    try {
      setIsProcessing(true);
      const response = await fetch('/api/process-file', {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setUploadedFiles([]);
        setMessages([]);
        setSources([]);
      }
    } catch (error) {
      console.error('Erro ao limpar documentos:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Formatar mensagens para o componente RagChat
  const formattedMessages: ChatMessage[] = messages.map(msg => ({
    id: msg.id,
    role: msg.role === 'user' || msg.role === 'assistant' ? msg.role : 'assistant',
    content: msg.content,
    isStreaming: isLoading && msg.role === 'assistant' && 
                messages[messages.length - 1]?.id === msg.id,
  }));

  // Efeito para atualizar o estado de carregamento de fontes
  useEffect(() => {
    if (!isLoading && isLoadingSources) {
      setIsLoadingSources(false);
    }
  }, [isLoading, isLoadingSources]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Cabeçalho */}
      <header className="bg-white border-b border-gray-200 py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-medium">Sistema RAG com Gemini</h1>
          </div>
          
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 rounded-md hover:bg-gray-100 lg:hidden"
          >
            {showSidebar ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="flex-1 flex overflow-hidden">
        {/* Área de chat */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
              <RagChat 
                messages={formattedMessages} 
                isLoading={isLoading} 
              />
            </div>
          </div>
          
          {/* Área de input */}
          <div className="border-t border-gray-200 bg-white p-4">
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleChatSubmit} className="flex space-x-2">
                <input
                  type="text"
                  className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Digite sua pergunta..."
                  value={input}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <RefreshCw className="h-5 w-5 animate-spin" />
                  ) : (
                    <ArrowUp className="h-5 w-5" />
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div 
          className={`
            ${showSidebar ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'} 
            w-full max-w-md border-l border-gray-200 bg-white overflow-y-auto
            transition-transform lg:transform-none
            absolute inset-y-0 right-0 lg:relative z-10
            pt-16 lg:pt-0
          `}
        >
          <div className="p-4 h-full flex flex-col">
            <h2 className="text-lg font-medium mb-4">Documentos</h2>
            
            {/* Upload de arquivos */}
            <div className="mb-6">
              <FileUpload 
                onUpload={handleFileUpload}
                acceptedFileTypes={['.pdf', '.txt', '.md']}
              />
            </div>
            
            {/* Visualização de fontes */}
            <div className="flex-1 overflow-y-auto">
              <SourcesList
                sources={sources}
                isLoading={isLoadingSources}
                emptyMessage="Faça uma pergunta para ver as fontes relevantes"
              />
            </div>
            
            {/* Ações */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              {uploadedFiles.length > 0 && (
                <button
                  onClick={handleClearDocuments}
                  disabled={isProcessing}
                  className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {isProcessing ? 'Limpando...' : 'Limpar todos os documentos'}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 