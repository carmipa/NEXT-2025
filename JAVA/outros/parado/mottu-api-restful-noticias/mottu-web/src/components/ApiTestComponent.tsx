'use client';

import { useState } from 'react';
import { PatioService, ZonaService, BoxService } from '@/utils/api';
import { PatioResponseDto } from '@/types/patio';

/**
 * Componente de teste para verificar a integração da API hierárquica
 * Este componente será removido após os testes
 */
export default function ApiTestComponent() {
  const [patios, setPatios] = useState<PatioResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testPatioList = async () => {
    try {
      setLoading(true);
      setError(null);
      addTestResult('🔄 Testando listagem de pátios...');
      
      const response = await PatioService.listarPaginadoFiltrado({}, 0, 10);
      setPatios(response.content || []);
      addTestResult(`✅ Pátios carregados: ${response.content?.length || 0}`);
      
      return response.content || [];
    } catch (err: any) {
      const errorMsg = `❌ Erro ao carregar pátios: ${err.message}`;
      setError(errorMsg);
      addTestResult(errorMsg);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const testZonaHierarchical = async () => {
    if (patios.length === 0) {
      addTestResult('⚠️ Nenhum pátio disponível para testar zonas');
      return;
    }

    const patio = patios[0];
    try {
      addTestResult(`🔄 Testando zonas do pátio: ${patio.nomePatio} (ID: ${patio.idPatio})`);
      
      // Simulando status do pátio (você pode ajustar conforme sua lógica)
      const patioStatus = 'ATIVO';
      
      const response = await ZonaService.listarPorPatio(patio.idPatio, patioStatus, 0, 10);
      addTestResult(`✅ Zonas carregadas: ${response.content?.length || 0}`);
      
    } catch (err: any) {
      const errorMsg = `❌ Erro ao carregar zonas: ${err.message}`;
      addTestResult(errorMsg);
    }
  };

  const testBoxHierarchical = async () => {
    if (patios.length === 0) {
      addTestResult('⚠️ Nenhum pátio disponível para testar boxes');
      return;
    }

    const patio = patios[0];
    try {
      addTestResult(`🔄 Testando boxes do pátio: ${patio.nomePatio} (ID: ${patio.idPatio})`);
      
      // Simulando status do pátio
      const patioStatus = 'ATIVO';
      
      const response = await BoxService.listarPorPatio(patio.idPatio, patioStatus, 0, 10);
      addTestResult(`✅ Boxes carregados: ${response.content?.length || 0}`);
      
    } catch (err: any) {
      const errorMsg = `❌ Erro ao carregar boxes: ${err.message}`;
      addTestResult(errorMsg);
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    addTestResult('🚀 Iniciando testes de integração da API...');
    
    const patiosList = await testPatioList();
    if (patiosList.length > 0) {
      await testZonaHierarchical();
      await testBoxHierarchical();
    }
    
    addTestResult('🏁 Testes concluídos!');
  };

  return (
    <div className="bg-white text-slate-800 p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-[var(--color-mottu-dark)] mb-4">
        🧪 Teste de Integração da API Hierárquica
      </h2>
      
      <div className="space-y-4">
        <div className="flex gap-4">
          <button
            onClick={runAllTests}
            disabled={loading}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? '🔄 Testando...' : '🚀 Executar Todos os Testes'}
          </button>
          
          <button
            onClick={testPatioList}
            disabled={loading}
            className="btn-outline disabled:opacity-50"
          >
            🏢 Testar Pátios
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Erro:</strong> {error}
          </div>
        )}

        <div className="bg-slate-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">📋 Resultados dos Testes:</h3>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-slate-500 italic">Nenhum teste executado ainda</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>

        {patios.length > 0 && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">🏢 Pátios Carregados:</h3>
            <div className="space-y-2">
              {patios.map(patio => (
                <div key={patio.idPatio} className="flex items-center gap-2">
                  <span className="text-xs bg-slate-200 px-2 py-1 rounded">ID: {patio.idPatio}</span>
                  <span className="font-medium">{patio.nomePatio}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


