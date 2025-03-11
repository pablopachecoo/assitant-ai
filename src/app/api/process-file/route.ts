import { NextRequest, NextResponse } from 'next/server';
import { processFile } from '@/lib/documentProcessor';
import { generateEmbeddingsForDocuments } from '@/lib/embeddings';
import { documentsStore } from '@/lib/store';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo fornecido' },
        { status: 400 }
      );
    }

    // Verificar tamanho máximo de arquivo (10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Limite de 10MB.' },
        { status: 400 }
      );
    }

    // Processar o arquivo
    const result = await processFile(file);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Gerar embeddings para os documentos
    const documentsWithEmbeddings = await generateEmbeddingsForDocuments(result.documents);
    
    // Adicionar ao armazenamento (em memória)
    documentsStore.documents = [
      ...documentsStore.documents,
      ...documentsWithEmbeddings
    ];

    // Remover os embeddings da resposta para economizar bandwidth
    const documentsForResponse = documentsWithEmbeddings.map(({ embedding, ...rest }) => rest);

    return NextResponse.json({
      success: true,
      message: `Arquivo "${file.name}" processado com sucesso`,
      documents: documentsForResponse,
      totalDocuments: documentsStore.documents.length
    });
  } catch (error) {
    console.error('Erro ao processar arquivo:', error);
    return NextResponse.json(
      { error: `Erro ao processar arquivo: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

// Endpoint para obter todos os documentos armazenados
export async function GET() {
  try {
    // Remover os embeddings da resposta
    const documentsForResponse = documentsStore.documents.map(({ embedding, ...rest }) => rest);
    
    return NextResponse.json({
      success: true,
      documents: documentsForResponse,
      totalDocuments: documentsStore.documents.length
    });
  } catch (error) {
    console.error('Erro ao recuperar documentos:', error);
    return NextResponse.json(
      { error: `Erro ao recuperar documentos: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

// Endpoint para limpar os documentos armazenados
export async function DELETE() {
  try {
    documentsStore.documents = [];
    
    return NextResponse.json({
      success: true,
      message: 'Todos os documentos foram removidos',
      totalDocuments: 0
    });
  } catch (error) {
    console.error('Erro ao limpar documentos:', error);
    return NextResponse.json(
      { error: `Erro ao limpar documentos: ${(error as Error).message}` },
      { status: 500 }
    );
  }
} 