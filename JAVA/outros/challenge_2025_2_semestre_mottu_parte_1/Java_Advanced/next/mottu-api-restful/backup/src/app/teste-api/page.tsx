'use client';

import NavBar from '@/components/nav-bar';
import '@/types/styles/neumorphic.css';

/**
 * Página de Ferramentas de API e Documentação
 * Acesso ao Swagger UI e testes de integração
 */
export default function TesteApiPage() {
  const swaggerUrl = 'http://localhost:8080/swagger-ui/index.html';

  return (
    <>
      <NavBar />
      <main className="min-h-screen text-white p-4 md:p-8">
        <div className="container mx-auto">
          {/* Header */}
          <div className="bg-[var(--color-mottu-default)] p-6 md:p-8 rounded-lg shadow-xl mb-8">
            <div className="flex items-center gap-4 mb-4">
              <i className="ion-ios-code text-5xl text-yellow-500"></i>
              <div>
                <h1 className="text-4xl font-bold text-white" style={{fontFamily: 'Montserrat, sans-serif'}}>
                  Ferramentas de API
                </h1>
                <p className="text-xl text-slate-300 mt-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                  Documentação interativa e testes de endpoints da API REST
                </p>
              </div>
            </div>
          </div>

          {/* Card Principal - Swagger UI */}
          <div className="grid md:grid-cols-1 gap-6 mb-8">
            <div className="neumorphic-fieldset p-8 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
              <legend className="neumorphic-legend flex items-center gap-4 mb-6" style={{fontFamily: 'Montserrat, sans-serif'}}>
                <i className="ion-ios-cloud text-emerald-600 text-4xl"></i>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
                    Swagger UI - Documentação Interativa
                    <span className="text-sm bg-emerald-600 text-white px-3 py-1 rounded-full">Recomendado</span>
                  </h2>
                  <p className="text-slate-600 text-lg">
                    Interface completa para explorar, testar e documentar todos os endpoints da API REST
                  </p>
                </div>
              </legend>

              <div className="neumorphic-container p-6 mb-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                  <i className="ion-ios-checkmark-circle text-green-500 text-xl"></i>
                  Recursos Disponíveis:
                </h3>
                <ul className="space-y-3 text-slate-600">
                  <li className="flex items-start gap-2">
                    <i className="ion-ios-checkmark text-green-500 mt-1"></i>
                    <span style={{fontFamily: 'Montserrat, sans-serif'}}><strong className="text-slate-800">Documentação Completa:</strong> Todos os endpoints com descrições detalhadas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="ion-ios-checkmark text-green-500 mt-1"></i>
                    <span style={{fontFamily: 'Montserrat, sans-serif'}}><strong className="text-slate-800">Testes em Tempo Real:</strong> Execute requisições diretamente da interface</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="ion-ios-checkmark text-green-500 mt-1"></i>
                    <span style={{fontFamily: 'Montserrat, sans-serif'}}><strong className="text-slate-800">Schemas e Modelos:</strong> Visualize estruturas de dados JSON</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="ion-ios-checkmark text-green-500 mt-1"></i>
                    <span style={{fontFamily: 'Montserrat, sans-serif'}}><strong className="text-slate-800">Autenticação:</strong> Teste endpoints protegidos com autorização</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="ion-ios-checkmark text-green-500 mt-1"></i>
                    <span style={{fontFamily: 'Montserrat, sans-serif'}}><strong className="text-slate-800">Respostas Detalhadas:</strong> Status codes, headers e corpo da resposta</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={swaggerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 neumorphic-button-green flex items-center justify-center gap-3 px-6 py-4 text-lg transition-all duration-300 hover:scale-105"
                >
                  <i className="ion-ios-open text-xl"></i>
                  <span style={{fontFamily: 'Montserrat, sans-serif'}}>Abrir Swagger UI</span>
                </a>
                <button
                  onClick={() => navigator.clipboard.writeText(swaggerUrl)}
                  className="neumorphic-button flex items-center justify-center gap-2 px-6 py-4 transition-all duration-300 hover:scale-105"
                >
                  <i className="ion-ios-document text-xl"></i>
                  <span style={{fontFamily: 'Montserrat, sans-serif'}}>Copiar URL</span>
                </button>
              </div>

              <div className="mt-6 neumorphic-container p-4">
                <p className="text-slate-600 text-sm flex items-center gap-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                  <i className="ion-ios-open text-blue-500 text-lg"></i>
                  <strong>URL:</strong> 
                  <code className="bg-slate-200 px-2 py-1 rounded text-slate-800">{swaggerUrl}</code>
                </p>
              </div>
            </div>
          </div>

          {/* Cards de Informação */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Endpoints Principais */}
            <div className="neumorphic-container p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20">
              <div className="flex items-center gap-3 mb-4">
                <i className="ion-ios-cloud text-3xl text-blue-500"></i>
                <h3 className="text-xl font-bold text-slate-800" style={{fontFamily: 'Montserrat, sans-serif'}}>Endpoints Principais</h3>
              </div>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li>• <strong className="text-slate-800" style={{fontFamily: 'Montserrat, sans-serif'}}>Clientes:</strong> /api/clientes</li>
                <li>• <strong className="text-slate-800" style={{fontFamily: 'Montserrat, sans-serif'}}>Veículos:</strong> /api/veiculos</li>
                <li>• <strong className="text-slate-800" style={{fontFamily: 'Montserrat, sans-serif'}}>Pátios:</strong> /api/patios</li>
                <li>• <strong className="text-slate-800" style={{fontFamily: 'Montserrat, sans-serif'}}>Zonas:</strong> /api/zonas</li>
                <li>• <strong className="text-slate-800" style={{fontFamily: 'Montserrat, sans-serif'}}>Boxes:</strong> /api/boxes</li>
                <li>• <strong className="text-slate-800" style={{fontFamily: 'Montserrat, sans-serif'}}>Dashboard:</strong> /api/dashboard</li>
              </ul>
            </div>

            {/* Métodos HTTP */}
            <div className="neumorphic-container p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20">
              <div className="flex items-center gap-3 mb-4">
                <i className="ion-ios-code text-3xl text-green-500"></i>
                <h3 className="text-xl font-bold text-slate-800" style={{fontFamily: 'Montserrat, sans-serif'}}>Métodos HTTP</h3>
              </div>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li className="flex items-center gap-2">
                  <span className="bg-green-600 text-white px-2 py-0.5 rounded text-xs font-bold">GET</span>
                  <span style={{fontFamily: 'Montserrat, sans-serif'}}>Listar e buscar recursos</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-bold">POST</span>
                  <span style={{fontFamily: 'Montserrat, sans-serif'}}>Criar novos recursos</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="bg-yellow-600 text-white px-2 py-0.5 rounded text-xs font-bold">PUT</span>
                  <span style={{fontFamily: 'Montserrat, sans-serif'}}>Atualizar recursos</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="bg-red-600 text-white px-2 py-0.5 rounded text-xs font-bold">DELETE</span>
                  <span style={{fontFamily: 'Montserrat, sans-serif'}}>Remover recursos</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="bg-purple-600 text-white px-2 py-0.5 rounded text-xs font-bold">PATCH</span>
                  <span style={{fontFamily: 'Montserrat, sans-serif'}}>Atualização parcial</span>
                </li>
              </ul>
            </div>

            {/* Status Codes */}
            <div className="neumorphic-container p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20">
              <div className="flex items-center gap-3 mb-4">
                <i className="ion-ios-bug text-3xl text-orange-500"></i>
                <h3 className="text-xl font-bold text-slate-800" style={{fontFamily: 'Montserrat, sans-serif'}}>Status Codes</h3>
              </div>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">200</span> <span style={{fontFamily: 'Montserrat, sans-serif'}}>Sucesso</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">201</span> <span style={{fontFamily: 'Montserrat, sans-serif'}}>Criado</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600 font-bold">204</span> <span style={{fontFamily: 'Montserrat, sans-serif'}}>Sem conteúdo</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-yellow-600 font-bold">400</span> <span style={{fontFamily: 'Montserrat, sans-serif'}}>Requisição inválida</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-orange-600 font-bold">404</span> <span style={{fontFamily: 'Montserrat, sans-serif'}}>Não encontrado</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-600 font-bold">500</span> <span style={{fontFamily: 'Montserrat, sans-serif'}}>Erro interno</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="neumorphic-fieldset p-6">
            <legend className="neumorphic-legend flex items-center gap-2 mb-4" style={{fontFamily: 'Montserrat, sans-serif'}}>
              <i className="ion-ios-document text-yellow-500 text-2xl"></i>
              Como Usar o Swagger UI
            </legend>
            <div className="grid md:grid-cols-2 gap-6 text-slate-600">
              <div>
                <h4 className="text-lg font-semibold text-slate-800 mb-3" style={{fontFamily: 'Montserrat, sans-serif'}}>1. Explorar Endpoints</h4>
                <p className="text-sm leading-relaxed" style={{fontFamily: 'Montserrat, sans-serif'}}>
                  Navegue pelas seções (Controllers) para ver todos os endpoints disponíveis. 
                  Cada endpoint mostra o método HTTP, caminho e descrição.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-slate-800 mb-3" style={{fontFamily: 'Montserrat, sans-serif'}}>2. Testar Requisições</h4>
                <p className="text-sm leading-relaxed" style={{fontFamily: 'Montserrat, sans-serif'}}>
                  Clique em "Try it out" para testar um endpoint. Preencha os parâmetros 
                  necessários e clique em "Execute" para ver a resposta em tempo real.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-slate-800 mb-3" style={{fontFamily: 'Montserrat, sans-serif'}}>3. Visualizar Schemas</h4>
                <p className="text-sm leading-relaxed" style={{fontFamily: 'Montserrat, sans-serif'}}>
                  Role até o final da página para ver os schemas de dados (DTOs). 
                  Isso mostra a estrutura exata dos objetos JSON usados na API.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-slate-800 mb-3" style={{fontFamily: 'Montserrat, sans-serif'}}>4. Autenticar Requisições</h4>
                <p className="text-sm leading-relaxed" style={{fontFamily: 'Montserrat, sans-serif'}}>
                  Se necessário, use o botão "Authorize" no topo para configurar 
                  tokens de autenticação para endpoints protegidos.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 mb-8 neumorphic-container p-6 text-center">
            <p className="text-slate-600 flex items-center justify-center gap-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
              <i className="ion-ios-checkmark-circle text-green-500 text-xl"></i>
              <strong>Servidor API:</strong> 
              <code className="bg-slate-200 px-2 py-1 rounded text-slate-800">http://localhost:8080</code>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

