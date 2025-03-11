'use client';

import { useState, useEffect } from 'react';
import { useChat } from 'ai/react';
import { SearchIcon, Upload, Database, FileText, Loader2, Send } from 'lucide-react';

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

export default function DocsSearchPage() {
  const [activeTab, setActiveTab] = useState<'chat' | 'upload'>('chat');
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: number }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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
    <div className="min-h-screen bg-slate-50">
      {/* Cabeçalho */}
      <header className="bg-white shadow-sm py-5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <SearchIcon className="h-6 w-6 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">Docs Search</h1>
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'chat' 
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'upload' 
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Documentos
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="container mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Área de chat e input */}
          <div className="lg:col-span-2">
            {activeTab === 'chat' ? (
              <>
                <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
                  <div className="p-1">
                    <RagChat 
                      messages={formattedMessages} 
                      isLoading={isLoading} 
                    />
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-4">
                  <form onSubmit={handleChatSubmit} className="flex items-center space-x-2">
                    <input
                      type="text"
                      className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Digite sua pergunta sobre os documentos..."
                      value={input}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className="p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Database className="h-5 w-5 mr-2 text-indigo-600" />
                    Gerenciar Documentos
                  </h2>
                  {uploadedFiles.length > 0 && (
                    <button
                      onClick={handleClearDocuments}
                      disabled={isProcessing}
                      className="px-4 py-2 bg-red-50 border border-red-200 rounded-md text-sm font-medium text-red-600 hover:bg-red-100"
                    >
                      {isProcessing ? 'Limpando...' : 'Limpar todos'}
                    </button>
                  )}
                </div>
                
                <FileUpload 
                  onUpload={handleFileUpload}
                  acceptedFileTypes={['.pdf', '.txt', '.md']}
                />
                
                {uploadedFiles.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Documentos Processados
                    </h3>
                    <div className="border rounded-md overflow-hidden">
                      <ul className="divide-y divide-gray-200">
                        {uploadedFiles.map((file, index) => (
                          <li key={index} className="px-4 py-3 flex items-center">
                            <FileText className="h-5 w-5 text-gray-500 mr-3" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {(file.size / 1024).toFixed(0)} KB
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Fontes */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 h-full">
              <div className="flex items-center mb-4">
                <SearchIcon className="h-5 w-5 text-indigo-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Fontes Relevantes</h2>
              </div>
              
              <SourcesList 
                sources={sources}
                isLoading={isLoadingSources}
                emptyMessage={
                  formattedMessages.length > 0 
                    ? "Nenhuma fonte relevante encontrada para esta consulta" 
                    : "Faça uma pergunta para ver as fontes relevantes"
                }
                title=""
              />
            </div>
          </div>
        </div>
      </main>
      
      {/* Rodapé */}
      <footer className="bg-white border-t border-gray-200 py-4 mt-12">
        <div className="container mx-auto px-4 md:px-6">
          <p className="text-center text-sm text-gray-500">
            Sistema RAG com Gemini Embedding Exp-03-07 e Gemini Flash
          </p>
        </div>
      </footer>
    </div>
  );
} 