import { Document } from './embeddings';

// Armazenamento temporário em memória para documentos e embeddings
// Em um cenário real, use um banco de dados
export const documentsStore: {
  documents: Document[];
} = {
  documents: []
};

export default documentsStore;