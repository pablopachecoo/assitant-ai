import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Tipo para representar um documento com embedding
export interface Document {
  id: string;
  content: string;
  metadata: {
    title: string;
    filename?: string;
    filetype?: string;
    page?: number;
    source?: string;
    [key: string]: any;
  };
  embedding?: number[];
}

// Cliente do Gemini AI
let genAI: GoogleGenerativeAI | null = null;

// Inicializa o cliente Gemini
export function initializeGeminiClient(apiKey: string) {
  genAI = new GoogleGenerativeAI(apiKey);
  return genAI;
}

// Obtém o modelo de embeddings
export function getEmbeddingModel() {
  if (!genAI) {
    throw new Error('Gemini client não inicializado. Chame initializeGeminiClient primeiro.');
  }
  
  // Usando o modelo de embeddings Exp-03-07
  return genAI.getGenerativeModel({ model: "embedding-001" });
}

// Gera embeddings para um texto
export async function generateEmbedding(text: string): Promise<number[]> {
  const model = getEmbeddingModel();
  const result = await model.embedContent(text);
  return result.embedding.values;
}

// Gera embeddings para uma lista de documentos
export async function generateEmbeddingsForDocuments(documents: Document[]): Promise<Document[]> {
  return await Promise.all(documents.map(async (doc) => {
    const embedding = await generateEmbedding(doc.content);
    return { ...doc, embedding };
  }));
}

// Calcula a similaridade de cosseno entre dois vetores
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Os vetores devem ter o mesmo tamanho');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

// Busca documentos similares
export async function searchSimilarDocuments(
  query: string,
  documents: Document[],
  topK: number = 5
): Promise<{ document: Document; similarity: number }[]> {
  if (!documents.length) return [];
  
  // Gerar embedding para a consulta
  const queryEmbedding = await generateEmbedding(query);
  
  // Calcular similaridade para cada documento
  const documentsWithSimilarity = documents
    .filter(doc => doc.embedding)
    .map(doc => ({
      document: doc,
      similarity: cosineSimilarity(queryEmbedding, doc.embedding!)
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
  
  return documentsWithSimilarity;
}

// Obtém o modelo Gemini Flash para geração
export function getGeminiFlashModel() {
  if (!genAI) {
    throw new Error('Gemini client não inicializado. Chame initializeGeminiClient primeiro.');
  }
  
  return genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash",
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
    ],
  });
}

export default {
  initializeGeminiClient,
  getEmbeddingModel,
  generateEmbedding,
  generateEmbeddingsForDocuments,
  cosineSimilarity,
  searchSimilarDocuments,
  getGeminiFlashModel
} 