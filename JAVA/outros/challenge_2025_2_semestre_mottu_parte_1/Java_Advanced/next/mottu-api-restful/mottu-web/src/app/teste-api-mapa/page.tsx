"use client";

import { useEffect, useState } from 'react';

export default function TesteApiMapa() {
    const [dados, setDados] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const testarApi = async () => {
            try {
                console.log('🔍 Testando API do mapa...');
                
                // Testar Limão (patioId=1)
                const responseLimao = await fetch('/api/vagas/mapa?patioId=1');
                console.log('📊 Response Limão:', responseLimao);
                
                if (!responseLimao.ok) {
                    throw new Error(`Erro HTTP: ${responseLimao.status}`);
                }
                
                const dataLimao = await responseLimao.json();
                console.log('📊 Dados Limão:', dataLimao);
                
                // Testar Guarulhos (patioId=2)
                const responseGuarulhos = await fetch('/api/vagas/mapa?patioId=2');
                console.log('📊 Response Guarulhos:', responseGuarulhos);
                
                if (!responseGuarulhos.ok) {
                    throw new Error(`Erro HTTP: ${responseGuarulhos.status}`);
                }
                
                const dataGuarulhos = await responseGuarulhos.json();
                console.log('📊 Dados Guarulhos:', dataGuarulhos);
                
                setDados({
                    limao: dataLimao,
                    guarulhos: dataGuarulhos
                });
                
            } catch (err: any) {
                console.error('❌ Erro ao testar API:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        testarApi();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl font-bold mb-4">Teste API Mapa</h1>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="text-center mt-2">Testando API...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl font-bold mb-4">Teste API Mapa</h1>
                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                        <h2 className="text-red-800 font-bold">❌ Erro</h2>
                        <p className="text-red-600">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-4">Teste API Mapa</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h2 className="text-lg font-bold mb-2">🏍️ Limão</h2>
                        <div className="text-sm text-gray-600">
                            <p><strong>Total de boxes:</strong> {dados?.limao?.boxes?.length || 0}</p>
                            <p><strong>Ocupados:</strong> {dados?.limao?.boxes?.filter((b: any) => b.status === 'O').length || 0}</p>
                            <p><strong>Livres:</strong> {dados?.limao?.boxes?.filter((b: any) => b.status === 'L').length || 0}</p>
                        </div>
                        <details className="mt-2">
                            <summary className="cursor-pointer text-blue-600">Ver dados completos</summary>
                            <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto max-h-40">
                                {JSON.stringify(dados?.limao, null, 2)}
                            </pre>
                        </details>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h2 className="text-lg font-bold mb-2">🏍️ Guarulhos</h2>
                        <div className="text-sm text-gray-600">
                            <p><strong>Total de boxes:</strong> {dados?.guarulhos?.boxes?.length || 0}</p>
                            <p><strong>Ocupados:</strong> {dados?.guarulhos?.boxes?.filter((b: any) => b.status === 'O').length || 0}</p>
                            <p><strong>Livres:</strong> {dados?.guarulhos?.boxes?.filter((b: any) => b.status === 'L').length || 0}</p>
                        </div>
                        <details className="mt-2">
                            <summary className="cursor-pointer text-blue-600">Ver dados completos</summary>
                            <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto max-h-40">
                                {JSON.stringify(dados?.guarulhos, null, 2)}
                            </pre>
                        </details>
                    </div>
                </div>
                
                <div className="mt-6 bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <h3 className="font-bold text-blue-800">💡 Instruções</h3>
                    <ul className="text-sm text-blue-700 mt-2 space-y-1">
                        <li>• Abra o DevTools (F12) e vá para a aba Console</li>
                        <li>• Verifique se aparecem os logs de teste da API</li>
                        <li>• Se não aparecer dados, o problema está na API</li>
                        <li>• Se aparecer dados, o problema está no frontend</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
