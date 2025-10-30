"use client";

import { useState } from 'react';
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { API_CONFIG, apiRequest } from '@/config/api';

interface ApiTestResult {
    endpoint: string;
    status: 'success' | 'error' | 'loading';
    message: string;
    data?: any;
}

export default function ApiTest() {
    const [results, setResults] = useState<ApiTestResult[]>([]);
    const [testing, setTesting] = useState(false);

    const testEndpoints = [
        { name: 'Listar Pátios', endpoint: API_CONFIG.ENDPOINTS.PATIO.LISTAR },
        { name: 'Listar Boxes', endpoint: API_CONFIG.ENDPOINTS.BOX.LISTAR },
        { name: 'Listar Veículos', endpoint: API_CONFIG.ENDPOINTS.VEICULO.LISTAR },
        { name: 'Listar Clientes', endpoint: API_CONFIG.ENDPOINTS.CLIENTE.LISTAR },
        { name: 'Dashboard Resumo', endpoint: API_CONFIG.ENDPOINTS.DASHBOARD.RESUMO }
    ];

    const testApi = async () => {
        setTesting(true);
        setResults([]);

        for (const test of testEndpoints) {
            try {
                setResults(prev => [...prev, {
                    endpoint: test.name,
                    status: 'loading',
                    message: 'Testando...'
                }]);

                const data = await apiRequest(test.endpoint);
                
                setResults(prev => prev.map(r => 
                    r.endpoint === test.name 
                        ? { ...r, status: 'success', message: 'Sucesso!', data }
                        : r
                ));
            } catch (error) {
                setResults(prev => prev.map(r => 
                    r.endpoint === test.name 
                        ? { 
                            ...r, 
                            status: 'error', 
                            message: error instanceof Error ? error.message : 'Erro desconhecido' 
                        }
                        : r
                ));
            }
        }

        setTesting(false);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success':
                return <CheckCircle size={16} className="text-green-500" />;
            case 'error':
                return <XCircle size={16} className="text-red-500" />;
            case 'loading':
                return <RefreshCw size={16} className="text-blue-500 animate-spin" />;
            default:
                return <AlertCircle size={16} className="text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success':
                return 'text-green-600';
            case 'error':
                return 'text-red-600';
            case 'loading':
                return 'text-blue-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <div className="neumorphic-container">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{fontFamily: 'Montserrat, sans-serif'}}>
                    Teste de Conectividade da API
                </h3>
                <button
                    onClick={testApi}
                    disabled={testing}
                    className="neumorphic-button-advance flex items-center gap-2"
                >
                    <RefreshCw size={16} className={testing ? 'animate-spin' : ''} />
                    <span>{testing ? 'Testando...' : 'Testar API'}</span>
                </button>
            </div>

            <div className="space-y-3">
                {results.length === 0 && !testing && (
                    <div className="text-center py-8">
                        <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600">Clique em "Testar API" para verificar a conectividade</p>
                    </div>
                )}

                {results.map((result, index) => (
                    <div key={index} className="neumorphic-container p-4">
                        <div className="flex items-center gap-3 mb-2">
                            {getStatusIcon(result.status)}
                            <span className="font-medium">{result.endpoint}</span>
                            <span className={`text-sm ${getStatusColor(result.status)}`}>
                                {result.message}
                            </span>
                        </div>
                        
                        {result.data && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                                <strong>Dados recebidos:</strong> {JSON.stringify(result.data, null, 2).substring(0, 200)}...
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                    <AlertCircle size={16} className="text-blue-500" />
                    <span className="text-sm font-medium text-blue-700">Informações da API</span>
                </div>
                <div className="text-xs text-blue-600 space-y-1">
                    <p><strong>URL Base:</strong> {API_CONFIG.BASE_URL}</p>
                    <p><strong>Swagger UI:</strong> <a href="http://localhost:8080/swagger-ui/index.html#/" target="_blank" rel="noopener noreferrer" className="underline">Abrir Swagger</a></p>
                </div>
            </div>
        </div>
    );
}
