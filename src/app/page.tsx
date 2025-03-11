'use client';

import Link from 'next/link';
import { BookOpen, MessageCircle, Search, ArrowRight, FileUp, Database } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              RAG com Gemini
            </h1>
            <p className="mt-6 text-xl max-w-3xl mx-auto">
              Sistema de Retrieval-Augmented Generation utilizando 
              <span className="font-semibold"> Gemini Embedding Exp-03-07</span> e 
              <span className="font-semibold"> Gemini Flash</span>
            </p>
            <div className="mt-10 flex justify-center gap-x-6">
              <Link 
                href="/rag" 
                className="rounded-md bg-white px-4 py-3 text-base font-medium text-indigo-700 shadow-sm hover:bg-indigo-50"
              >
                Experimente agora
              </Link>
              <Link
                href="/docs-search"
                className="rounded-md bg-indigo-500 px-4 py-3 text-base font-medium text-white hover:bg-indigo-600"
              >
                Busca em documentos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Recursos principais
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Conheça as principais funcionalidades do nosso sistema RAG
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <FileUp className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-medium text-gray-900">Upload de documentos</h3>
                <p className="mt-2 text-base text-gray-600">
                  Faça upload de arquivos nos formatos TXT, PDF e Markdown para criar sua base de conhecimento.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-medium text-gray-900">Embeddings semânticos</h3>
                <p className="mt-2 text-base text-gray-600">
                  Utiliza Gemini Embedding Exp-03-07 para encontrar informações relevantes com precisão semântica.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-medium text-gray-900">Respostas contextuais</h3>
                <p className="mt-2 text-base text-gray-600">
                  Gera respostas precisas com base nos documentos relevantes usando Gemini Flash.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <Database className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-medium text-gray-900">Gerenciamento de documentos</h3>
                <p className="mt-2 text-base text-gray-600">
                  Interface intuitiva para gerenciar sua base de conhecimento com facilidade.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-medium text-gray-900">Citação de fontes</h3>
                <p className="mt-2 text-base text-gray-600">
                  Visualize as fontes utilizadas para gerar cada resposta, com trechos relevantes dos documentos.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <ArrowRight className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-medium text-gray-900">Streaming de respostas</h3>
                <p className="mt-2 text-base text-gray-600">
                  Visualize as respostas sendo geradas em tempo real para uma experiência mais fluida.
                </p>
                <div className="mt-auto pt-4">
                  <Link href="/rag" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                    Experimente agora
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interfaces section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Duas interfaces para escolher
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Escolha a interface que melhor se adapta às suas necessidades
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Interface 1 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-indigo-700 px-6 py-10 text-center">
                <h3 className="text-2xl font-bold text-white">RAG Classic</h3>
                <p className="mt-2 text-indigo-200">
                  Interface tradicional com chat e visualização lateral de documentos
                </p>
              </div>
              <div className="px-6 py-8">
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      Layout de chat tradicional
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      Painel lateral para gerenciamento de documentos
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      Visualização de fontes inline
                    </p>
                  </li>
                </ul>
                <div className="mt-8">
                  <Link href="/rag" className="block w-full bg-indigo-600 text-center py-3 px-4 rounded-md text-white font-medium hover:bg-indigo-700">
                    Acessar RAG Classic
                  </Link>
                </div>
              </div>
            </div>

            {/* Interface 2 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-blue-700 px-6 py-10 text-center">
                <h3 className="text-2xl font-bold text-white">Docs Search</h3>
                <p className="mt-2 text-blue-200">
                  Interface moderna com foco na pesquisa de documentos
                </p>
              </div>
              <div className="px-6 py-8">
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      Navegação por abas (Chat e Documentos)
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      Visualização de fontes em cards laterais
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      Design moderno com grid responsivo
                    </p>
                  </li>
                </ul>
                <div className="mt-8">
                  <Link href="/docs-search" className="block w-full bg-blue-600 text-center py-3 px-4 rounded-md text-white font-medium hover:bg-blue-700">
                    Acessar Docs Search
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
