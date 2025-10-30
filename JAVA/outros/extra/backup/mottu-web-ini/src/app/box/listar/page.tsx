// src/app/box/listar/page.tsx
"use client";

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { BoxService } from '@/utils/api';
import NavBar from '@/components/nav-bar';
import {
    MdList, MdAdd, MdSearch, MdErrorOutline, MdEdit, MdDelete,
    MdFilterList, MdCalendarToday, MdInfo, MdCheckCircle
} from 'react-icons/md';
import { Hash } from 'lucide-react';

// Interfaces dos DTOs e Filtro
import { BoxResponseDto, BoxFilter } from '@/types/box';

export default function ListarBoxesPage() {
    const [boxes, setBoxes] = useState<BoxResponseDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Estado para os filtros
    const [filter, setFilter] = useState<BoxFilter>({
        nome: '',
        status: '',
        dataEntradaInicio: '',
        dataEntradaFim: '',
        dataSaidaInicio: '',
        dataSaidaFim: '',
        observacao: '',
    });

    // Funções de formatação
    const formatDate = (dateString: string | null | undefined): string => {
        if (!dateString) return '-';
        try {
            // Adiciona 'T00:00:00Z' e 'timeZone: 'UTC'' para garantir que a data seja interpretada corretamente
            // e formatada para a localidade do usuário sem problemas de fuso horário inesperados.
            return new Date(dateString + 'T00:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC' });
        } catch (e) {
            console.error("Erro ao formatar data:", dateString, e);
            return 'Inválida';
        }
    };

    // Função para buscar os boxes da API com filtros
    const fetchBoxes = async (e?: FormEvent) => {
        if (e) e.preventDefault(); // Previne recarregamento da página se for submit de form

        setIsLoading(true);
        setError(null);
        setSuccessMessage(null); // Limpa mensagens de sucesso anteriores ao buscar

        try {
            // Chama o serviço com os parâmetros de filtro. O Axios (ou fetch com URLSearchParams)
            // converterá o objeto `filter` em query parameters para a URL.
            const data = await BoxService.getAll(filter);
            setBoxes(data);
        } catch (err: any) {
            // Erros do Axios geralmente vêm em `err.response.data.message` ou `err.message`
            setError(err.response?.data?.message || err.message || 'Erro ao carregar boxes. Tente novamente.');
            console.error("Erro detalhado:", err);
            setBoxes([]); // Limpa a lista em caso de erro
        } finally {
            setIsLoading(false);
        }
    };

    // Efeito para carregar os boxes na montagem do componente (e aplicar filtros)
    // O fetch inicial é feito com os valores de filtro vazios do estado inicial.
    useEffect(() => {
        fetchBoxes();
    }, []); // Array de dependências vazio para rodar apenas uma vez na montagem. O botão "Aplicar Filtros" chamará `WorkspaceBoxes` manualmente.

    // Handler para mudanças nos inputs de filtro
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFilter((prevFilter) => ({
            ...prevFilter,
            [name]: value,
        }));
    };

    // Handler para deleção de um box
    const handleDelete = async (id: number, nomeBox: string) => {
        if (window.confirm(`Tem certeza que deseja deletar o Box "${nomeBox}" (ID: ${id})?`)) {
            setIsLoading(true); // Mostra loading enquanto deleta (afeta a tabela inteira)
            setError(null); // Limpa erro anterior
            try {
                await BoxService.delete(id);
                setSuccessMessage(`Box "${nomeBox}" (ID: ${id}) deletado com sucesso!`);
                fetchBoxes(); // Recarrega a lista após a exclusão
                setTimeout(() => setSuccessMessage(null), 5000); // Limpa a mensagem de sucesso
            } catch (err: any) {
                setError(err.response?.data?.message || err.message || 'Erro ao deletar box.');
                console.error("Erro detalhado:", err);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <>
            <NavBar active="boxes-listar" /> {/* Certifique-se de que 'boxes-listar' está definido na sua NavBarProps */}
            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h1 className="flex items-center gap-2 text-2xl md:text-3xl font-bold text-center sm:text-left">
                        <MdList className="text-3xl text-sky-400" /> Lista de Boxes
                    </h1>
                    <Link href="/box/cadastrar"> {/* Caminho para a página de cadastro */}
                        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md shadow whitespace-nowrap">
                            <MdAdd size={18} /> Novo Box
                        </button>
                    </Link>
                </div>

                {/* Formulário de Filtros */}
                <form onSubmit={fetchBoxes} className="mb-6 p-4 bg-slate-800 rounded-lg shadow-md flex flex-wrap gap-4 items-end">
                    <div>
                        <label htmlFor="nome" className="text-sm text-slate-300 block mb-1">Nome:</label>
                        <input
                            type="text"
                            id="nome"
                            name="nome"
                            value={filter.nome}
                            onChange={handleFilterChange}
                            className="p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white"
                            placeholder="Parte do nome"
                        />
                    </div>
                    <div>
                        <label htmlFor="status" className="text-sm text-slate-300 block mb-1">Status:</label>
                        <select
                            id="status"
                            name="status"
                            value={filter.status}
                            onChange={handleFilterChange}
                            className="p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white min-w-[100px]"
                        >
                            <option value="">Todos</option>
                            <option value="L">Livre</option>
                            <option value="O">Ocupado</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="dataEntradaInicio" className="text-sm text-slate-300 block mb-1">Entrada (Início):</label>
                        <input
                            type="date"
                            id="dataEntradaInicio"
                            name="dataEntradaInicio"
                            value={filter.dataEntradaInicio}
                            onChange={handleFilterChange}
                            className="p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white date-input-fix"
                        />
                    </div>
                    <div>
                        <label htmlFor="dataEntradaFim" className="text-sm text-slate-300 block mb-1">Entrada (Fim):</label>
                        <input
                            type="date"
                            id="dataEntradaFim"
                            name="dataEntradaFim"
                            value={filter.dataEntradaFim}
                            onChange={handleFilterChange}
                            className="p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white date-input-fix"
                        />
                    </div>
                    {/* Você pode adicionar mais campos de filtro aqui conforme o BoxFilter.java (ex: dataSaidaInicio, dataSaidaFim, observacao) */}
                    <button type="submit" className="p-2 h-10 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md flex items-center gap-2 px-4">
                        <MdSearch size={20} /> Aplicar Filtros
                    </button>
                </form>

                {/* Mensagens de Feedback */}
                {isLoading && <p className="text-center text-sky-300 py-10">Carregando boxes...</p>}
                {error && (
                    <div className="relative max-w-3xl mx-auto mb-6 text-red-400 bg-red-900/50 p-4 pr-10 rounded border border-red-500" role="alert">
                        <MdErrorOutline className="inline mr-2" />{error}
                        <button type="button" className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-400 hover:text-red-200" onClick={() => setError(null)} aria-label="Fechar"><span className="text-xl" aria-hidden="true">&times;</span></button>
                    </div>
                )}
                {successMessage && (
                    <div className="relative max-w-3xl mx-auto mb-6 text-green-400 bg-green-900/50 p-4 pr-10 rounded border border-green-500" role="alert">
                        <MdCheckCircle className="inline mr-2" />{successMessage}
                        <button type="button" className="absolute top-0 bottom-0 right-0 px-4 py-3 text-green-400 hover:text-green-200" onClick={() => setSuccessMessage(null)} aria-label="Fechar"><span className="text-xl" aria-hidden="true">&times;</span></button>
                    </div>
                )}

                {/* Tabela de Boxes */}
                {!isLoading && !error && boxes.length === 0 && (
                    <p className="text-center text-slate-400 py-10 bg-slate-900 rounded-lg shadow-xl">Nenhum box encontrado para os critérios informados.</p>
                )}
                {!isLoading && boxes.length > 0 && (
                    <div className="overflow-x-auto bg-slate-900 rounded-lg shadow">
                        <table className="min-w-full table-auto">
                            <thead className="bg-slate-800 border-b border-slate-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider flex items-center gap-1"><Hash size={14}/> ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Nome</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Data Entrada</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Data Saída</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Observação</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-300 uppercase tracking-wider">Ações</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                            {boxes.map((box) => (
                                <tr key={box.idBox} className="hover:bg-slate-800/50">
                                    <td className="px-6 py-4 whitespace-nowrap">{box.idBox}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{box.nome}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{box.status === 'L' ? 'Livre' : 'Ocupado'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(box.dataEntrada)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(box.dataSaida)}</td>
                                    <td className="px-6 py-4 whitespace-normal max-w-xs truncate" title={box.observacao || ''}>{box.observacao || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center space-x-2 flex items-center justify-center">
                                        <Link href={`/box/alterar/${box.idBox}`}> {/* Caminho para a página de alteração */}
                                            <button className="px-3 py-1 text-sm bg-yellow-500 hover:bg-yellow-600 text-black rounded flex items-center gap-1">
                                                <MdEdit size={14} /> Editar
                                            </button>
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(box.idBox, box.nome)}
                                            className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded flex items-center gap-1"
                                        >
                                            <MdDelete size={14} /> Deletar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
            {/* Estilos globais para input de data */}
            <style jsx global>{`
                .date-input-fix::-webkit-calendar-picker-indicator { filter: invert(0.8); cursor: pointer; }
                input[type="date"]:required:invalid::-webkit-datetime-edit { color: transparent; }
                input[type="date"]:focus::-webkit-datetime-edit { color: white !important; }
                input[type="date"]::-webkit-datetime-edit { color: white; }
            `}</style>
        </>
    );
}