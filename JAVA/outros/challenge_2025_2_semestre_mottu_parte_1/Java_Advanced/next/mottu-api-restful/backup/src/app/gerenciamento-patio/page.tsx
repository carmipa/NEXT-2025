// src/app/gerenciamento-patio/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import HierarchicalNavigation from '@/components/HierarchicalNavigation';
import { PatioService, ZonaService, BoxService } from '@/utils/api';
import { PatioResponseDto } from '@/types/patio';
import { ZonaResponseDto } from '@/types/zona';
import { BoxResponseDto } from '@/types/box';
import '@/types/styles/neumorphic.css';

type ViewLevel = 'patio' | 'zona' | 'box';
type ViewType = 'cards' | 'table';
interface SelectedPatio {
    idPatio: number;
    nomePatio: string;
    status: string;
}
interface SelectedZona {
    idZona: number;
    nome: string;
}

// Hook customizado para Debounce
function useDebounce(value: string, delay: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

// Componente de Paginação
interface PaginationComponentProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (itemsPerPage: number) => void;
}

const PaginationComponent = ({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange, onItemsPerPageChange }: PaginationComponentProps) => {
    return (
        <div className="mt-6 flex flex-col items-center gap-4">
            {/* Informações da paginação */}
            <div className="text-sm text-slate-400">
                Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} itens
            </div>
            
            {/* Controles de paginação */}
            <div className="flex items-center gap-4">
                {/* Botão Anterior */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === 1
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                    }`}
                >
                    <i className="ion-ios-arrow-back"></i> <span style={{fontFamily: 'Montserrat, sans-serif'}}>Anterior</span>
                </button>

                {/* Página atual */}
                <div className="flex items-center gap-2 text-sm text-slate-300">
                    <span>Página {currentPage} de {totalPages}</span>
                </div>

                {/* Botão Próximo */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === totalPages
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                    }`}
                >
                    <span style={{fontFamily: 'Montserrat, sans-serif'}}>Próximo</span> <i className="ion-ios-arrow-forward"></i>
                </button>
            </div>

            {/* Controle de Itens por Página */}
            <div className="flex items-center gap-2 text-sm text-slate-400">
                <span>Itens por página:</span>
                <select
                    value={itemsPerPage}
                    onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                    className="px-2 py-1 rounded bg-slate-700 text-white text-sm border border-slate-600"
                    title="Selecionar quantidade de itens por página"
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                </select>
            </div>

        </div>
    );
};

export default function GerenciamentoPatioPage() {
    const searchParams = useSearchParams();

    const [currentView, setCurrentView] = useState<ViewLevel>('patio');
    const [viewType, setViewType] = useState<ViewType>('cards');
    const [selectedPatio, setSelectedPatio] = useState<SelectedPatio | null>(null);
    const [selectedZona, setSelectedZona] = useState<SelectedZona | null>(null);

    const [patios, setPatios] = useState<PatioResponseDto[]>([]);
    const [zonas, setZonas] = useState<ZonaResponseDto[]>([]);
    const [boxes, setBoxes] = useState<BoxResponseDto[]>([]);

    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Estados para paginação
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // Funções de paginação
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        // Scroll para o topo quando mudar de página
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Reset da página quando mudar de view ou dados
    useEffect(() => {
        setCurrentPage(1);
    }, [currentView, searchTerm]);

    // Função para mudar itens por página
    const handleItemsPerPageChange = (newItemsPerPage: number) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1); // Reset para primeira página
    };

    // Função para paginar dados
    const getPaginatedData = (data: any[]) => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return data.slice(startIndex, endIndex);
    };

    const getTotalPages = (data: any[]) => {
        return Math.ceil(data.length / itemsPerPage);
    };

    const loadPatios = useCallback(async (filtroNome?: string) => {
        setLoading(true);
        setError(null);
        try {
            const filter = filtroNome ? { nomePatio: filtroNome } : {};
            const response = await PatioService.listarPaginadoFiltrado(filter, 0, 100);
            setPatios(response.content || []);
        } catch (err: any) {
            setError('Erro ao carregar pátios: ' + (err.message || 'Erro desconhecido'));
        } finally {
            setLoading(false);
        }
    }, []);

    // Carregar pátios na inicialização
    useEffect(() => {
        loadPatios(debouncedSearchTerm);
    }, [debouncedSearchTerm, loadPatios]);

    // Verificar parâmetros da URL para seleção automática do pátio
    useEffect(() => {
        const patioId = searchParams.get('patioId');
        const patioStatus = searchParams.get('patioStatus');
        const zonaId = searchParams.get('zonaId');
        
        if (patioId && patioStatus) {
            // Buscar dados do pátio
            PatioService.getById(parseInt(patioId)).then((patio) => {
                const selectedPatioData = {
                    idPatio: patio.idPatio,
                    nomePatio: patio.nomePatio,
                    status: patio.status
                };
                setSelectedPatio(selectedPatioData);
                
                if (zonaId) {
                    // Se há zona selecionada, ir direto para boxes
                    setCurrentView('box');
                    loadBoxes(selectedPatioData);
                } else {
                    // Senão, ir para zonas
                    setCurrentView('zona');
                    loadZonas(selectedPatioData);
                }
            }).catch((err) => {
                console.error('Erro ao carregar pátio:', err);
            });
        }
    }, [searchParams]);

    const loadZonas = async (patio: SelectedPatio) => {
        setLoading(true);
        setError(null);
        try {
            const response = await ZonaService.listarPorPatio(patio.idPatio, patio.status, 0, 100);
            setZonas(response.content || []);
        } catch (err: any) {
            setError('Erro ao carregar zonas: ' + (err.message || 'Erro desconhecido'));
        } finally {
            setLoading(false);
        }
    };

    const loadBoxes = async (patio: SelectedPatio) => {
        setLoading(true);
        setError(null);
        try {
            const response = await BoxService.listarPorPatio(patio.idPatio, patio.status, 0, 100);
            setBoxes(response.content || []);
        } catch (err: any) {
            setError('Erro ao carregar boxes: ' + (err.message || 'Erro desconhecido'));
        } finally {
            setLoading(false);
        }
    };

    const handlePatioSelect = (patio: PatioResponseDto) => {
        const selectedPatioData = {
            idPatio: patio.idPatio,
            nomePatio: patio.nomePatio,
            status: patio.status
        };
        setSelectedPatio(selectedPatioData);
        setSelectedZona(null);
        setCurrentView('zona');
        loadZonas(selectedPatioData);
    };

    const handleZonaSelect = (zona: ZonaResponseDto) => {
        const selectedZonaData = { idZona: zona.idZona, nome: zona.nome };
        setSelectedZona(selectedZonaData);
        setCurrentView('box');
        if (selectedPatio) {
            loadBoxes(selectedPatio);
        }
    };

    const handleBack = () => {
        if (currentView === 'box') {
            setCurrentView('zona');
            setSelectedZona(null);
        } else if (currentView === 'zona') {
            setCurrentView('patio');
            setSelectedPatio(null);
            setZonas([]);
        }
    };

    const handleHome = () => {
        setCurrentView('patio');
        setSelectedPatio(null);
        setSelectedZona(null);
        setZonas([]);
        setBoxes([]);
    };

    // CORREÇÃO 1: Adicionando um fallback seguro para a função
    const getCreateUrl = () => {
        if (currentView === 'patio') return '/patio/novo-assistente';
        if (currentView === 'zona' && selectedPatio) return `/zona/cadastrar?patioId=${selectedPatio.idPatio}&patioStatus=${selectedPatio.status}&patioNome=${encodeURIComponent(selectedPatio.nomePatio)}`;
        if (currentView === 'box' && selectedPatio) return `/box/cadastrar?patioId=${selectedPatio.idPatio}&patioStatus=${selectedPatio.status}&patioNome=${encodeURIComponent(selectedPatio.nomePatio)}`;
        return '#'; // Fallback seguro que não retorna undefined
    };

    const getEditUrl = (id: number) => {
        if (currentView === 'patio') return `/patio/alterar/${id}`;
        if (currentView === 'zona' && selectedPatio) return `/zona/alterar/${id}?patioId=${selectedPatio.idPatio}&patioStatus=${selectedPatio.status}`;
        if (currentView === 'box' && selectedPatio) return `/box/alterar/${id}?patioId=${selectedPatio.idPatio}&patioStatus=${selectedPatio.status}`;
        return '#';
    };

    const getDetailsUrl = (id: number) => {
        if (currentView === 'patio') return `/patio/detalhes/${id}`;
        if (currentView === 'zona') return `/zona/detalhes/${id}`;
        if (currentView === 'box') return `/box/detalhes/${id}`;
        return '#';
    };

    const handleDelete = async (id: number, type: ViewLevel) => {
        if (!confirm(`Tem certeza que deseja excluir este ${type}?`)) return;
        try {
            if (type === 'patio') {
                await PatioService.delete(id);
                setPatios(prev => prev.filter(p => p.idPatio !== id));
            } else if (type === 'zona' && selectedPatio) {
                await ZonaService.deletePorPatio(selectedPatio.idPatio, selectedPatio.status, id);
                setZonas(prev => prev.filter(z => z.idZona !== id));
            } else if (type === 'box' && selectedPatio) {
                await BoxService.deletePorPatio(selectedPatio.idPatio, selectedPatio.status, id);
                setBoxes(prev => prev.filter(b => b.idBox !== id));
            }
        } catch (err: any) {
            setError(`Erro ao excluir ${type}: ` + (err.message || 'Erro desconhecido'));
        }
    };


    // Função para renderizar tabela de pátios
    const renderPatiosTable = (data: PatioResponseDto[]) => (
        <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow-lg">
                <thead className="bg-slate-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Nome</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">ID</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Cadastro</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Contato</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Endereço</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {data.map((patio) => (
                        <tr 
                            key={patio.idPatio} 
                            className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                                selectedPatio?.idPatio === patio.idPatio ? 'bg-green-50 border-l-4 border-green-500' : ''
                            }`}
                            onClick={() => handlePatioSelect(patio)}
                        >
                            <td className="px-4 py-3">
                                <div className="flex items-center">
                                    <Building size={16} className="text-slate-500 mr-2" />
                                    <span className="font-medium text-slate-900">{patio.nomePatio}</span>
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    patio.status === 'A' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    {patio.status === 'A' ? 'Ativo' : 'Inativo'}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">{patio.idPatio}</td>
                            <td className="px-4 py-3 text-sm text-slate-600">
                                {new Date(patio.dataCadastro).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center text-sm">
                                    <i className="ion-ios-call mr-1"></i>
                                    {patio.contato ? 'Sim' : 'Não'}
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center text-sm">
                                    <i className="ion-ios-home mr-1"></i>
                                    {patio.endereco ? 'Sim' : 'Não'}
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex justify-center items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                    <Link href={getDetailsUrl(patio.idPatio)} className="p-1 rounded text-blue-600 hover:bg-blue-100" title="Ver Detalhes">
                                        <Eye size={16}/>
                                    </Link>
                                    <Link href={getEditUrl(patio.idPatio)} className="p-1 rounded text-yellow-500 hover:bg-yellow-100" title="Editar">
                                        <Edit size={16}/>
                                    </Link>
                                    <button onClick={() => handleDelete(patio.idPatio, 'patio')} className="p-1 rounded text-red-500 hover:bg-red-100" title="Excluir">
                                        <i className="ion-ios-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    // Função para renderizar tabela de zonas
    const renderZonasTable = (data: ZonaResponseDto[]) => (
        <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow-lg">
                <thead className="bg-slate-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Nome</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">ID</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Observação</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {data.map((zona) => (
                        <tr key={zona.idZona} className="hover:bg-slate-50">
                            <td className="px-4 py-3">
                                <div className="flex items-center">
                                    <MapPin size={16} className="text-slate-500 mr-2" />
                                    <span className="font-medium text-slate-900">{zona.nome}</span>
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    zona.status === 'A' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    {zona.status === 'A' ? 'Ativo' : 'Inativo'}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">{zona.idZona}</td>
                            <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">
                                {zona.observacao || '-'}
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex justify-center items-center gap-1">
                                    <Link href={`/zona/detalhes/${zona.idZona}`} className="p-1 rounded text-blue-600 hover:bg-blue-100" title="Ver Detalhes">
                                        <Eye size={16}/>
                                    </Link>
                                    <Link href={`/zona/alterar/${zona.idZona}`} className="p-1 rounded text-yellow-500 hover:bg-yellow-100" title="Editar">
                                        <Edit size={16}/>
                                    </Link>
                                    <button onClick={() => handleDelete(zona.idZona, 'zona')} className="p-1 rounded text-red-500 hover:bg-red-100" title="Excluir">
                                        <i className="ion-ios-trash"></i>
                                    </button>
                                    <button onClick={() => handleZonaSelect(zona)} className="p-1 rounded text-green-600 hover:bg-green-100" title="Ver Boxes">
                                        <i className="ion-ios-grid"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    // Função para renderizar tabela de boxes
    const renderBoxesTable = (data: BoxResponseDto[]) => (
        <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow-lg">
                <thead className="bg-slate-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Nome</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">ID</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Data Entrada</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Observação</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {data.map((box) => (
                        <tr key={box.idBox} className="hover:bg-slate-50">
                            <td className="px-4 py-3">
                                <div className="flex items-center">
                                    <Grid3X3 size={16} className="text-slate-500 mr-2" />
                                    <span className="font-medium text-slate-900">{box.nome}</span>
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    box.status === 'L' ? 'bg-green-100 text-green-800' : 
                                    box.status === 'O' ? 'bg-red-100 text-red-800' : 
                                    'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {box.status === 'L' ? 'Livre' : 
                                     box.status === 'O' ? 'Ocupado' : 
                                     box.status}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">{box.idBox}</td>
                            <td className="px-4 py-3 text-sm text-slate-600">
                                {box.dataEntrada ? new Date(box.dataEntrada).toLocaleDateString() : '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">
                                {box.observacao || '-'}
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex justify-center items-center gap-1">
                                    <Link href={`/box/detalhes/${box.idBox}`} className="p-1 rounded text-blue-600 hover:bg-blue-100" title="Ver Detalhes">
                                        <Eye size={16}/>
                                    </Link>
                                    <Link href={`/box/alterar/${box.idBox}`} className="p-1 rounded text-yellow-500 hover:bg-yellow-100" title="Editar">
                                        <Edit size={16}/>
                                    </Link>
                                    <button onClick={() => handleDelete(box.idBox, 'box')} className="p-1 rounded text-red-500 hover:bg-red-100" title="Excluir">
                                        <i className="ion-ios-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderContent = () => {
        if (loading) {
            return <div className="text-center py-8 text-slate-300">Carregando...</div>;
        }
        if (error) {
            return <div className="text-center py-8 text-red-400">{error}</div>;
        }

        let data: any[] = [];
        
        if (currentView === 'patio') {
            data = patios.filter(p => p.nomePatio.toLowerCase().includes(searchTerm.toLowerCase()));
        } else if (currentView === 'zona') {
            data = zonas.filter(z => 
                z.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (z.observacao && z.observacao.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        } else if (currentView === 'box') {
            data = boxes.filter(b => 
                b.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (b.observacao && b.observacao.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Aplicar paginação
        const totalPages = getTotalPages(data);
        const paginatedData = getPaginatedData(data);

        if (data.length === 0) {
            return (
                <div className="text-center py-12">
                    <p className="text-slate-300">
                        {searchTerm
                            ? `Nenhum ${currentView} encontrado para "${searchTerm}"`
                            : `Nenhum ${currentView} cadastrado ainda.`
                        }
                    </p>
                </div>
            );
        }

        if (currentView === 'patio') {
            if (viewType === 'table') {
                return (
                    <>
                        {renderPatiosTable(paginatedData as PatioResponseDto[])}
                        {data.length > 0 && (
                            <PaginationComponent 
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={data.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={handlePageChange}
                                onItemsPerPageChange={handleItemsPerPageChange}
                            />
                        )}
                    </>
                );
            }
            
            return (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(paginatedData as PatioResponseDto[]).map((patio) => (
                        <div key={patio.idPatio} className={`rounded-lg shadow-lg p-5 flex flex-col justify-between transition-all hover:shadow-2xl hover:scale-105 cursor-pointer ${
                            selectedPatio?.idPatio === patio.idPatio 
                                ? 'bg-green-50 border-2 border-green-500' 
                                : 'bg-white text-slate-800'
                        }`} onClick={() => handlePatioSelect(patio)}>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-lg font-bold text-[var(--color-mottu-dark)] truncate">{patio.nomePatio}</h4>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${patio.status === 'A' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {patio.status === 'A' ? 'Ativo' : 'Inativo'}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 mb-2">ID: {patio.idPatio} | Cadastro: {new Date(patio.dataCadastro).toLocaleDateString()}</p>
                                <div className="text-sm text-slate-600 space-y-1">
                                    <p className="flex items-center gap-1"><i className="ion-ios-call"></i> Contato: <strong>{patio.contato ? 'Sim' : 'Não'}</strong></p>
                                    <p className="flex items-center gap-1"><i className="ion-ios-home"></i> Endereço: <strong>{patio.endereco ? 'Sim' : 'Não'}</strong></p>
                                </div>
                                <div className="mt-3 p-2 bg-slate-50 rounded-md">
                                    {selectedPatio?.idPatio === patio.idPatio ? (
                                        <p className="text-xs text-green-600 text-center font-semibold">✓ Pátio selecionado - Abas habilitadas</p>
                                    ) : (
                                        <p className="text-xs text-red-600 text-center font-semibold">🔗 Clique no card para gerenciar zonas e boxes</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-end items-center gap-2 border-t border-slate-200 pt-3 mt-4" onClick={(e) => e.stopPropagation()}>
                                <Link href={getDetailsUrl(patio.idPatio)} className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition-colors" title="Ver Detalhes"><i className="ion-ios-eye"></i></Link>
                                <Link href={getEditUrl(patio.idPatio)} className="p-2 rounded-full text-yellow-500 hover:bg-yellow-100 transition-colors" title="Editar"><i className="ion-ios-create"></i></Link>
                                <button onClick={() => handleDelete(patio.idPatio, 'patio')} className="p-2 rounded-full text-red-500 hover:bg-red-100 transition-colors" title="Excluir"><i className="ion-ios-trash"></i></button>
                            </div>
                        </div>
                    ))}
                    </div>
                    {data.length > 0 && (
                        <PaginationComponent 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={data.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={handlePageChange}
                            onItemsPerPageChange={handleItemsPerPageChange}
                        />
                    )}
                </>
            );
        }

        if (currentView === 'zona') {
            if (viewType === 'table') {
                return (
                    <>
                        {renderZonasTable(paginatedData as ZonaResponseDto[])}
                        {data.length > 0 && (
                            <PaginationComponent 
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={data.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={handlePageChange}
                                onItemsPerPageChange={handleItemsPerPageChange}
                            />
                        )}
                    </>
                );
            }
            
            return (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(paginatedData as any[]).map((zona) => (
                        <div key={zona.idZona} className="bg-white text-slate-800 rounded-lg shadow-lg p-5 flex flex-col justify-between transition-all hover:shadow-2xl hover:scale-105">
                            <div>
                                <h4 className="text-lg font-bold text-[var(--color-mottu-dark)] truncate">{zona.nome}</h4>
                                <p className="text-xs text-slate-500 mb-2">ID: {zona.idZona} | Status: {zona.status}</p>
                                {zona.observacao && (
                                    <p className="text-sm text-slate-600 mt-2">{zona.observacao}</p>
                                )}
                            </div>
                            <div className="flex justify-end items-center gap-2 border-t border-slate-200 pt-3 mt-4">
                                <Link href={`/zona/detalhes/${zona.idZona}`} className="p-2 rounded-full text-blue-600 hover:bg-blue-100" title="Ver Detalhes"><i className="ion-ios-eye"></i></Link>
                                <Link href={`/zona/alterar/${zona.idZona}`} className="p-2 rounded-full text-yellow-500 hover:bg-yellow-100" title="Editar"><i className="ion-ios-create"></i></Link>
                                <button onClick={() => handleDelete(zona.idZona, 'zona')} className="p-2 rounded-full text-red-500 hover:bg-red-100" title="Excluir"><i className="ion-ios-trash"></i></button>
                                <button onClick={() => handleZonaSelect(zona)} className="p-2 rounded-full text-green-600 hover:bg-green-100" title="Ver Boxes"><i className="ion-ios-grid"></i></button>
                            </div>
                        </div>
                    ))}
                    </div>
                    {data.length > 0 && (
                        <PaginationComponent 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={data.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={handlePageChange}
                            onItemsPerPageChange={handleItemsPerPageChange}
                        />
                    )}
                </>
            );
        }

        if (currentView === 'box') {
            if (viewType === 'table') {
                return (
                    <>
                        {renderBoxesTable(paginatedData as BoxResponseDto[])}
                        {data.length > 0 && (
                            <PaginationComponent 
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={data.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={handlePageChange}
                                onItemsPerPageChange={handleItemsPerPageChange}
                            />
                        )}
                    </>
                );
            }
            
            return (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(paginatedData as any[]).map((box) => (
                        <div key={box.idBox} className="bg-white text-slate-800 rounded-lg shadow-lg p-5 flex flex-col justify-between transition-all hover:shadow-2xl hover:scale-105">
                            <div>
                                <h4 className="text-lg font-bold text-[var(--color-mottu-dark)] truncate">{box.nome}</h4>
                                <p className="text-xs text-slate-500 mb-2">ID: {box.idBox} | Status: {box.status}</p>
                                {box.observacao && (
                                    <p className="text-sm text-slate-600 mt-2">{box.observacao}</p>
                                )}
                                {box.dataEntrada && (
                                    <p className="text-xs text-slate-500 mt-1">
                                        Entrada: {new Date(box.dataEntrada).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                            <div className="flex justify-end items-center gap-2 border-t border-slate-200 pt-3 mt-4">
                                <Link href={`/box/detalhes/${box.idBox}`} className="p-2 rounded-full text-blue-600 hover:bg-blue-100" title="Ver Detalhes"><i className="ion-ios-eye"></i></Link>
                                <Link href={`/box/alterar/${box.idBox}`} className="p-2 rounded-full text-yellow-500 hover:bg-yellow-100" title="Editar"><i className="ion-ios-create"></i></Link>
                                <button onClick={() => handleDelete(box.idBox, 'box')} className="p-2 rounded-full text-red-500 hover:bg-red-100" title="Excluir"><i className="ion-ios-trash"></i></button>
                            </div>
                        </div>
                    ))}
                    </div>
                    {data.length > 0 && (
                        <PaginationComponent 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={data.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={handlePageChange}
                            onItemsPerPageChange={handleItemsPerPageChange}
                        />
                    )}
                </>
            );
        }

        return null;
    };

    // CORREÇÃO 2: Lógica para desabilitar o botão "+ Novo"
    const isCreateDisabled = (currentView === 'zona' && !selectedPatio) || (currentView === 'box' && !selectedPatio);


    return (
        <>
            <NavBar active="gerenciamento-patio" />
            <main className="min-h-screen text-white p-4 md:p-8">
                <div className="container mx-auto bg-[var(--color-mottu-default)] p-6 md:p-8 rounded-lg shadow-xl">
                    <HierarchicalNavigation
                        currentLevel={currentView}
                        selectedPatio={selectedPatio}
                        selectedZona={selectedZona}
                        onPatioSelect={handlePatioSelect as any}
                        onZonaSelect={handleZonaSelect as any}
                        onBack={handleBack}
                        onHome={handleHome}
                    />

                    {/* Seletor de Visualização - Centralizado */}
                    <div className="flex justify-center my-6">
                        <div className="flex bg-zinc-800 rounded-lg p-1">
                            <button
                                onClick={() => setViewType('cards')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                                    viewType === 'cards' 
                                        ? 'bg-emerald-600 text-white' 
                                        : 'text-zinc-400 hover:text-white'
                                }`}
                                title="Visualização em Cards"
                            >
                                <i className="ion-ios-grid"></i>
                                <span style={{fontFamily: 'Montserrat, sans-serif'}}>Cards</span>
                            </button>
                            <button
                                onClick={() => setViewType('table')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                                    viewType === 'table' 
                                        ? 'bg-emerald-600 text-white' 
                                        : 'text-zinc-400 hover:text-white'
                                }`}
                                title="Visualização em Tabela"
                            >
                                <i className="ion-ios-list"></i>
                                <span style={{fontFamily: 'Montserrat, sans-serif'}}>Tabela</span>
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-black/20 rounded-lg">
                        {selectedPatio && (
                            <div className="mb-4 p-3 bg-green-900/30 border border-green-500/30 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <i className="ion-ios-home text-green-400 text-xl"></i>
                                        <span className="text-green-200 font-semibold">
                                            Gerenciando: {selectedPatio.nomePatio}
                                        </span>
                                        <span className="text-xs text-green-300">
                                            (ID: {selectedPatio.idPatio})
                                        </span>
                                    </div>
                                    <button 
                                        onClick={handleHome}
                                        className="text-green-400 hover:text-green-300 text-sm underline"
                                    >
                                        <span style={{fontFamily: 'Montserrat, sans-serif'}}>Voltar aos Pátios</span>
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setCurrentView('patio')} 
                                    className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 hover:scale-105 ${
                                        currentView === 'patio' ? 'bg-white text-black' : 'bg-slate-700 text-white hover:bg-slate-600'
                                    }`}
                                >
                                    <span style={{fontFamily: 'Montserrat, sans-serif'}}>Pátios</span>
                                </button>
                                <button 
                                    onClick={() => {
                                        if (selectedPatio) {
                                            setCurrentView('zona');
                                            loadZonas(selectedPatio);
                                        }
                                    }} 
                                    disabled={!selectedPatio} 
                                    className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 hover:scale-105 ${
                                        currentView === 'zona' ? 'bg-white text-black' : 'bg-slate-700 text-white hover:bg-slate-600'
                                    } ${!selectedPatio ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    <span style={{fontFamily: 'Montserrat, sans-serif'}}>Zonas</span>
                                </button>
                                <button 
                                    onClick={() => {
                                        if (selectedPatio) {
                                            setCurrentView('box');
                                            loadBoxes(selectedPatio);
                                        }
                                    }} 
                                    disabled={!selectedPatio} 
                                    className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 hover:scale-105 ${
                                        currentView === 'box' ? 'bg-white text-black' : 'bg-slate-700 text-white hover:bg-slate-600'
                                    } ${!selectedPatio ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    <span style={{fontFamily: 'Montserrat, sans-serif'}}>Boxes</span>
                                </button>
                            </div>
                            <div className="flex gap-2 mt-3 sm:mt-0">
                                <div className="relative">
                                    <i className="ion-ios-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none text-xl"></i>
                                    <input
                                        type="text"
                                        placeholder={`Buscar ${currentView}s...`}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full sm:w-64 pl-10 pr-8 py-2 bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 h-10"
                                    />
                                    {searchTerm && (
                                        <button 
                                            onClick={() => setSearchTerm('')} 
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-800"
                                            title="Limpar busca"
                                            aria-label="Limpar busca"
                                        >
                                            <i className="ion-ios-close text-lg"></i>
                                        </button>
                                    )}
                                </div>

                                
                                {/* CORREÇÃO 2: Aplicando a lógica de desativação */}
                                <Link
                                    href={getCreateUrl()}
                                    onClick={(e) => { if (isCreateDisabled) e.preventDefault(); }}
                                    className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-[var(--color-mottu-dark)] bg-white rounded-md shadow hover:bg-gray-100 transition-colors h-10 ${isCreateDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    aria-disabled={isCreateDisabled}
                                    tabIndex={isCreateDisabled ? -1 : undefined}
                                >
                                    <i className="ion-ios-add"></i> <span style={{fontFamily: 'Montserrat, sans-serif'}}>Novo</span>
                                </Link>
                            </div>
                        </div>
                        
                        {renderContent()}
                    </div>
                </div>
            </main>
        </>
    );
}