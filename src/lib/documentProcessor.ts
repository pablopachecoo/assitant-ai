import { Document } from './embeddings';
import { v4 as uuidv4 } from 'uuid';

// Interface para o resultado do processamento
export interface ProcessingResult {
  success: boolean;
  documents: Document[];
  error?: string;
}

// Função para dividir texto em blocos
export function splitTextIntoChunks(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  if (!text || text.length <= chunkSize) {
    return [text];
  }

  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    // Determinar o fim do bloco atual
    let endIndex = startIndex + chunkSize;
    
    // Se não estamos no fim do texto, tentar encontrar um ponto natural para a quebra
    if (endIndex < text.length) {
      // Procurar por quebras de parágrafo, sentenças ou palavras
      const breakPoints = [
        text.lastIndexOf('\n\n', endIndex), // Quebra de parágrafo
        text.lastIndexOf('. ', endIndex),   // Fim de sentença
        text.lastIndexOf(' ', endIndex)     // Espaço entre palavras
      ];
      
      // Encontrar o melhor ponto de quebra
      const bestBreakPoint = breakPoints.reduce((best, current) => {
        return (current > best && current > startIndex) ? current : best;
      }, startIndex + chunkSize - 1);
      
      endIndex = bestBreakPoint + 1;
    } else {
      endIndex = text.length;
    }
    
    // Adicionar o bloco
    chunks.push(text.substring(startIndex, endIndex).trim());
    
    // Atualizar o próximo índice de início, considerando a sobreposição
    startIndex = endIndex - overlap;
    if (startIndex < 0) startIndex = 0;
  }

  return chunks;
}

// Processa um arquivo de texto (TXT, MD)
export async function processTextFile(file: File, fileName: string): Promise<ProcessingResult> {
  try {
    const text = await file.text();
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
    
    // Dividir o texto em blocos
    const chunks = splitTextIntoChunks(text);
    
    // Criar documento para cada bloco
    const documents: Document[] = chunks.map((chunk, index) => ({
      id: uuidv4(),
      content: chunk,
      metadata: {
        title: `${fileName} (Parte ${index + 1})`,
        filename: fileName,
        filetype: fileExtension,
        source: 'upload',
        chunkIndex: index
      }
    }));
    
    return {
      success: true,
      documents
    };
  } catch (error) {
    return {
      success: false,
      documents: [],
      error: `Erro ao processar arquivo de texto: ${(error as Error).message}`
    };
  }
}

// Processa um arquivo PDF
export async function processPdfFile(file: File, fileName: string): Promise<ProcessingResult> {
  try {
    // Em um cenário real, precisaríamos de uma biblioteca como pdf.js
    // Vamos simular o processamento para este exemplo
    const arrayBuffer = await file.arrayBuffer();
    
    // Simular extração de texto (em produção, use pdf.js ou similar)
    // Esta é apenas uma simulação - em um ambiente real, use uma biblioteca apropriada
    const simulatedText = `Conteúdo simulado do PDF ${fileName} com ${arrayBuffer.byteLength} bytes.
Este é um documento de exemplo que simularia o conteúdo extraído de um PDF.

PÁGINA 1
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, 
nisl eget ultricies tincidunt, nunc nisl aliquam nisl, eget aliquam nunc
nisl eget nunc. Nullam auctor, nisl eget ultricies tincidunt.

PÁGINA 2
Nullam auctor, nisl eget ultricies tincidunt, nunc nisl aliquam nisl,
eget aliquam nunc nisl eget nunc. Nullam auctor, nisl eget ultricies tincidunt.`;
    
    // Dividir em "páginas" simuladas
    const pages = simulatedText.split('PÁGINA');
    
    // Criar documentos
    const documents: Document[] = pages
      .filter(page => page.trim().length > 0)
      .map((page, index) => {
        const pageNumber = page.match(/^\s*(\d+)/)?.[1] || (index + 1).toString();
        const content = page.replace(/^\s*\d+\s*/, '').trim();
        
        return {
          id: uuidv4(),
          content,
          metadata: {
            title: `${fileName} (Página ${pageNumber})`,
            filename: fileName,
            filetype: 'pdf',
            source: 'upload',
            page: parseInt(pageNumber)
          }
        };
      });
    
    return {
      success: true,
      documents
    };
  } catch (error) {
    return {
      success: false,
      documents: [],
      error: `Erro ao processar arquivo PDF: ${(error as Error).message}`
    };
  }
}

// Processa um arquivo com base no tipo
export async function processFile(file: File): Promise<ProcessingResult> {
  const fileName = file.name;
  const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
  
  switch (fileExtension) {
    case 'txt':
    case 'md':
    case 'markdown':
      return processTextFile(file, fileName);
    case 'pdf':
      return processPdfFile(file, fileName);
    default:
      return {
        success: false,
        documents: [],
        error: `Tipo de arquivo não suportado: ${fileExtension}`
      };
  }
}

export default {
  processFile,
  processTextFile,
  processPdfFile,
  splitTextIntoChunks
}; 