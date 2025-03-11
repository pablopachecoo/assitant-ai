import { NextRequest, NextResponse } from 'next/server';
import { StreamingTextResponse, Message as VercelAIMessage } from 'ai';
import { searchSimilarDocuments, getGeminiFlashModel } from '@/lib/embeddings';

// Importar armazenamento de documentos
// Em um cenário real, isso viria de um banco de dados
import { documentsStore } from '@/lib/store';

// Prompt para o sistema RAG
const RAG_SYSTEM_PROMPT = `
Você é um assistente de IA útil e preciso, utilizando um sistema de Retrieval-Augmented Generation (RAG).
Responda com precisão às perguntas do usuário usando apenas as informações fornecidas nos trechos de contexto.
Se a resposta não estiver nos trechos de contexto, admita que não sabe e não invente informações.
Quando citar informações dos documentos, indique claramente a fonte.
Suas respostas devem ser claras, concisas e diretas ao ponto.
`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();
    
    // Obter a última mensagem do usuário
    const lastUserMessage = messages
      .filter((msg: VercelAIMessage) => msg.role === 'user')
      .pop();
    
    if (!lastUserMessage) {
      return NextResponse.json(
        { error: 'Nenhuma mensagem do usuário encontrada' },
        { status: 400 }
      );
    }
    
    // Buscar documentos relevantes
    const relevantDocuments = await searchSimilarDocuments(
      lastUserMessage.content, 
      documentsStore.documents,
      5 // Top 5 documentos mais relevantes
    );
    
    // Formatar documentos para o contexto
    const contextText = relevantDocuments
      .map(({ document, similarity }) => {
        return `
DOCUMENTO: ${document.metadata.title}
RELEVÂNCIA: ${Math.round(similarity * 100)}%
CONTEÚDO:
${document.content}
---
`;
      })
      .join('\n');
    
    // Construir o prompt completo
    const geminiModel = getGeminiFlashModel();
    
    // Formatar histórico de mensagens para o Gemini
    const formattedMessages = [
      { role: 'system', content: RAG_SYSTEM_PROMPT },
      { role: 'system', content: `CONTEXTO DE DOCUMENTOS:\n${contextText}` },
      ...messages.map((msg: VercelAIMessage) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        content: msg.content
      }))
    ];
    
    // Criar o chat
    const chat = geminiModel.startChat({
      history: formattedMessages.slice(0, -1).map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      })),
      systemInstruction: RAG_SYSTEM_PROMPT,
    });

    // Transformar as fontes em um formato adequado para resposta
    const sources = relevantDocuments.map(({ document, similarity }) => ({
      id: document.id,
      title: document.metadata.title,
      content: document.content.length > 300 
        ? document.content.substring(0, 300) + '...' 
        : document.content,
      filename: document.metadata.filename,
      filetype: document.metadata.filetype,
      page: document.metadata.page,
      relevance: similarity
    }));
    
    // Gerar resposta
    const result = await chat.sendMessageStream(formattedMessages[formattedMessages.length - 1].content);

    // Adicionar metadados com as fontes
    const customMetadata = {
      sources: sources
    };
    
    // Retornar resposta em streaming
    return new StreamingTextResponse(result.stream, {
      headers: {
        'x-sources': JSON.stringify(customMetadata)
      }
    });
  } catch (error) {
    console.error('Erro ao processar pergunta:', error);
    return NextResponse.json(
      { error: `Erro ao processar pergunta: ${(error as Error).message}` },
      { status: 500 }
    );
  }
} 