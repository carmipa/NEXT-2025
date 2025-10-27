// src/app/clientes/alterar/[id]/page.tsx
"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { IMaskInput } from 'react-imask';
import {
    MdEdit, MdPerson, MdBadge, MdCalendarToday, MdWork, MdPhone, MdEmail, MdLocationOn, MdHome,
    MdErrorOutline, MdCheckCircle, MdInfo, MdSave, MdArrowBack
} from 'react-icons/md';
import { User, Mail, MapPin, Tag, Calendar, Briefcase, Loader2, AlertCircle } from 'lucide-react';

// Interfaces dos DTOs
import { ClienteRequestDto, ClienteResponseDto, EnderecoRequestDto, ContatoRequestDto } from '@/types/cliente';
import { ClienteService } from '@/utils/api';

// Função auxiliar para limpar máscaras
const cleanMaskedValue = (value: string): string =>
    value.replace(/\D/g, '');

export default function AlterarClientePage() {
    const params = useParams();
    const router = useRouter();
    const idParam = params?.id;
    const id = typeof idParam === 'string' ? parseInt(idParam, 10) : null;

    const [formData, setFormData] = useState<ClienteRequestDto>({
        sexo: 'M', nome: '', sobrenome: '', dataNascimento: '', cpf: '',
        profissao: '', estadoCivil: 'Solteiro',
        enderecoRequestDto: { cep: '', numero: 0, complemento: '', observacao: '' },
        contatoRequestDto: { email: '', ddd: 0, ddi: 0, telefone1: '', celular: '', outro: '', observacao: '' },
    });

    const [tipoDocumentoDisplay, setTipoDocumentoDisplay] = useState("CPF"); // 'CPF' | 'CNPJ'

    const [isLoading, setIsLoading] = useState(false); // Para submissão
    const [isFetching, setIsFetching] = useState(true); // Para carregar dados iniciais
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Busca inicial dos dados do cliente
    useEffect(() => {
        if (!id) {
            setError("ID do cliente não fornecido na URL.");
            setIsFetching(false);
            return;
        }
        const fetchData = async () => {
            setIsFetching(true);
            setError(null);
            try {
                const data: ClienteResponseDto = await ClienteService.getById(id);

                setFormData({
                    sexo: data.sexo || 'M',
                    nome: data.nome || '',
                    sobrenome: data.sobrenome || '',
                    dataNascimento: data.dataNascimento ? data.dataNascimento.split('T')[0] : '', // Formata para input type="date"
                    cpf: data.cpf || '',
                    profissao: data.profissao || '',
                    estadoCivil: data.estadoCivil as ClienteRequestDto['estadoCivil'] || 'Solteiro',
                    enderecoRequestDto: {
                        idEndereco: data.enderecoResponseDto?.idEndereco, // Importante para o backend saber qual endereço atualizar
                        cep: data.enderecoResponseDto?.cep || '',
                        numero: data.enderecoResponseDto?.numero || 0,
                        complemento: data.enderecoResponseDto?.complemento || '',
                        observacao: data.enderecoResponseDto?.observacao || '',
                        // Campos de ViaCEP preenchidos pelo backend não são enviados aqui
                    },
                    contatoRequestDto: {
                        idContato: data.contatoResponseDto?.idContato, // Importante para o backend saber qual contato atualizar
                        email: data.contatoResponseDto?.email || '',
                        ddd: data.contatoResponseDto?.ddd || 0,
                        ddi: data.contatoResponseDto?.ddi || 0,
                        telefone1: data.contatoResponseDto?.telefone1 || '',
                        telefone2: data.contatoResponseDto?.telefone2 || '',
                        telefone3: data.contatoResponseDto?.telefone3 || '',
                        celular: data.contatoResponseDto?.celular || '',
                        outro: data.contatoResponseDto?.outro || '',
                        observacao: data.contatoResponseDto?.observacao || '',
                    },
                });
                // Ajusta o tipo de documento para exibir corretamente no campo de máscara
                setTipoDocumentoDisplay(data.cpf?.length === 11 ? "CPF" : "CNPJ");

            } catch (err: any) {
                setError(err.response?.data?.message || err.message || "Falha ao carregar dados para edição.");
                console.error("Erro detalhado no fetch inicial:", err);
            } finally {
                setIsFetching(false);
            }
        };
        fetchData();
    }, [id]);

    // Handler genérico para campos do formData
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        // Lidar com campos aninhados usando split de nome (ex: 'enderecoRequestDto.cep')
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...((prev as any)[parent] || {}),
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Handler para o envio do formulário atualizado
    const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (id === null) {
            setError("ID do cliente inválido para salvar.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        // Limpeza e conversão de valores para envio
        const clienteDataToSend: ClienteRequestDto = {
            ...formData,
            cpf: cleanMaskedValue(formData.cpf),
            contatoRequestDto: {
                ...formData.contatoRequestDto,
                celular: cleanMaskedValue(formData.contatoRequestDto.celular),
                ddd: parseInt(formData.contatoRequestDto.ddd.toString(), 10) || 0,
                ddi: parseInt(formData.contatoRequestDto.ddi.toString(), 10) || 0,
            },
            enderecoRequestDto: {
                ...formData.enderecoRequestDto,
                cep: cleanMaskedValue(formData.enderecoRequestDto.cep),
                numero: parseInt(formData.enderecoRequestDto.numero.toString(), 10) || 0,
            }
        };

        console.log("Enviando payload para ATUALIZAR Cliente:", JSON.stringify(clienteDataToSend, null, 2));

        try {
            const updatedCliente: ClienteResponseDto = await ClienteService.update(id, clienteDataToSend);
            setSuccess(`✅ Cliente "${updatedCliente.nome} ${updatedCliente.sobrenome}" (ID: ${updatedCliente.idCliente}) atualizado com sucesso!`);
            setTimeout(() => { setSuccess(null); router.push('/clientes/listar'); }, 2000);
        } catch (err: any) {
            setError(`❌ ${err.response?.data?.message || err.message || 'Falha ao salvar alterações.'}`);
            console.error("Erro detalhado:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const cpfMask = "000.000.000-00";
    const cnpjMask = "00.000.000/0000-00";

    if (isFetching) {
        return (
            <>
                <NavBar active="clientes-alterar" />
                <main className="container mx-auto p-8 flex justify-center items-center min-h-screen bg-[#012A46]">
                    <div className="flex flex-col items-center">
                        <Loader2 className="h-12 w-12 animate-spin text-sky-400" />
                        <p className="mt-3 text-sky-300 text-lg">Carregando dados do cliente...</p>
                    </div>
                </main>
            </>
        );
    }

    if (error && !isFetching && (!formData.nome || formData.nome === '')) { // Erro grave ao carregar dados iniciais
        return (
            <>
                <NavBar active="clientes-alterar" />
                <main className="container mx-auto p-8 flex justify-center items-center min-h-screen bg-[#012A46]">
                    <div className="bg-slate-900 p-8 rounded-lg shadow-xl text-center">
                        <AlertCircle className="text-5xl text-red-400 mx-auto mb-4" />
                        <p className="text-red-400 text-lg mb-6">{error}</p>
                        <Link href="/clientes/listar" className="px-6 py-3 bg-sky-600 text-white rounded-md shadow hover:bg-sky-700">Voltar para Lista</Link>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <NavBar active="clientes-alterar" />

            <main className="flex items-center justify-center min-h-screen bg-[#012A46] text-white px-4 py-10">
                <div className="bg-slate-900 p-6 md:p-8 rounded-lg shadow-xl w-full max-w-4xl">
                    <h2 className="flex items-center justify-center text-2xl md:text-3xl font-bold mb-6">
                        <MdEdit className="mr-2 text-3xl" />
                        Alterar Cliente (ID: {id})
                    </h2>

                    {error && (
                        <div className="relative mb-4 text-red-400 bg-red-900/50 p-4 rounded border border-red-500" role="alert">
                            <span className="block sm:inline">{error}</span>
                            <button
                                type="button"
                                className="absolute top-0 right-0 px-4 py-3 text-red-400 hover:text-red-200"
                                onClick={() => setError(null)}
                                aria-label="Fechar"
                            >
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>
                    )}

                    {success && (
                        <div className="flex items-center justify-center gap-2 text-green-400 p-3 rounded bg-green-900/30 border border-green-700">
                            <MdCheckCircle className="text-xl" /> <span>{success}</span>
                        </div>
                    )}

                    <form onSubmit={handleUpdate}>
                        {/* Dados Pessoais */}
                        <fieldset className="mb-6 border border-slate-700 p-4 rounded">
                            <legend className="text-xl font-semibold mb-2 px-2">Dados Pessoais</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Nome */}
                                <div>
                                    <label htmlFor="nome" className="block mb-1 flex items-center gap-1">
                                        <User size={16} /> Nome:
                                    </label>
                                    <input
                                        id="nome"
                                        type="text"
                                        name="nome"
                                        value={formData.nome}
                                        onChange={handleChange}
                                        required
                                        maxLength={100}
                                        className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-sky-500 h-10"
                                    />
                                </div>
                                {/* Sobrenome */}
                                <div>
                                    <label htmlFor="sobrenome" className="block mb-1 flex items-center gap-1">
                                        <User size={16} /> Sobrenome:
                                    </label>
                                    <input
                                        id="sobrenome"
                                        type="text"
                                        name="sobrenome"
                                        value={formData.sobrenome}
                                        onChange={handleChange}
                                        required
                                        maxLength={100}
                                        className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-sky-500 h-10"
                                    />
                                </div>
                                {/* Sexo */}
                                <div>
                                    <label htmlFor="sexo" className="block mb-1 flex items-center gap-1">
                                        <MdInfo size={16} /> Sexo:
                                    </label>
                                    <select
                                        id="sexo"
                                        name="sexo"
                                        value={formData.sexo}
                                        onChange={handleChange}
                                        required
                                        className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-sky-500 h-10"
                                    >
                                        <option value="M">Masculino</option>
                                        <option value="H">Feminino</option>
                                    </select>
                                </div>
                                {/* Data de Nascimento */}
                                <div>
                                    <label htmlFor="dataNascimento" className="block mb-1 flex items-center gap-1">
                                        <Calendar size={16} /> Nascimento:
                                    </label>
                                    <input
                                        type="date"
                                        id="dataNascimento"
                                        name="dataNascimento"
                                        value={formData.dataNascimento}
                                        onChange={handleChange}
                                        required
                                        className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-sky-500 date-input-fix h-10"
                                    />
                                </div>
                                {/* Tipo de Documento (para máscara) */}
                                <div>
                                    <label htmlFor="tipoDocumentoDisplay" className="block mb-1 flex items-center gap-1">
                                        <MdBadge size={16} /> Documento:
                                    </label>
                                    <select
                                        id="tipoDocumentoDisplay"
                                        name="tipoDocumentoDisplay"
                                        value={tipoDocumentoDisplay}
                                        onChange={e => {
                                            setTipoDocumentoDisplay(e.target.value);
                                            setFormData(prev => ({ ...prev, cpf: '' }));
                                        }}
                                        required
                                        className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-sky-500 h-10"
                                    >
                                        <option value="CPF">CPF</option>
                                        <option value="CNPJ">CNPJ</option>
                                    </select>
                                </div>
                                {/* Número do Documento (CPF) */}
                                <div>
                                    <label htmlFor="cpf" className="block mb-1 flex items-center gap-1">
                                        <MdBadge size={16} /> Número:
                                    </label>
                                    <IMaskInput
                                        id="cpf"
                                        name="cpf"
                                        mask={tipoDocumentoDisplay === 'CPF' ? cpfMask : cnpjMask}
                                        unmask={false}
                                        value={formData.cpf}
                                        onAccept={(value: string) => setFormData(prev => ({ ...prev, cpf: value }))}
                                        required
                                        placeholder={tipoDocumentoDisplay === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00'}
                                        className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-sky-500 h-10"
                                    />
                                </div>
                                {/* Profissão */}
                                <div>
                                    <label htmlFor="profissao" className="block mb-1 flex items-center gap-1">
                                        <Briefcase size={16} /> Profissão:
                                    </label>
                                    <input
                                        type="text"
                                        id="profissao"
                                        name="profissao"
                                        value={formData.profissao}
                                        onChange={handleChange}
                                        required
                                        maxLength={50}
                                        className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-sky-500 h-10"
                                    />
                                </div>
                                {/* Estado Civil */}
                                <div>
                                    <label htmlFor="estadoCivil" className="block mb-1 flex items-center gap-1">
                                        <MdInfo size={16} /> Estado Civil:
                                    </label>
                                    <select
                                        id="estadoCivil"
                                        name="estadoCivil"
                                        value={formData.estadoCivil}
                                        onChange={handleChange}
                                        required
                                        className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-sky-500 h-10"
                                    >
                                        <option value="Solteiro">Solteiro</option>
                                        <option value="Casado">Casado</option>
                                        <option value="Divorciado">Divorciado</option>
                                        <option value="Viúvo">Viúvo</option>
                                        <option value="Separado">Separado</option>
                                        <option value="União Estável">União Estável</option>
                                    </select>
                                </div>
                            </div>
                        </fieldset>

                        {/* Contatos */}
                        <fieldset className="mb-6 border border-slate-700 p-4 rounded">
                            <legend className="text-xl font-semibold mb-2 px-2">Contatos</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Celular */}
                                <div>
                                    <label htmlFor="celular" className="block mb-1 flex items-center gap-1">
                                        <MdPhone size={16} /> Celular:
                                    </label>
                                    <IMaskInput
                                        id="celular"
                                        name="contatoRequestDto.celular"
                                        mask="(00) 00000-0000"
                                        unmask={false}
                                        value={formData.contatoRequestDto.celular}
                                        onAccept={(value: string) => setFormData(prev => ({
                                            ...prev,
                                            contatoRequestDto: { ...prev.contatoRequestDto, celular: value }
                                        }))}
                                        required
                                        placeholder="(99) 99999-9999"
                                        className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-sky-500 h-10"
                                    />
                                </div>
                                {/* E-mail */}
                                <div>
                                    <label htmlFor="email" className="block mb-1 flex items-center gap-1">
                                        <Mail size={16} /> E-mail:
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="contatoRequestDto.email"
                                        value={formData.contatoRequestDto.email}
                                        onChange={e => setFormData(prev => ({
                                            ...prev,
                                            contatoRequestDto: { ...prev.contatoRequestDto, email: e.target.value }
                                        }))}
                                        required
                                        placeholder="exemplo@dominio.com"
                                        className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-sky-500 h-10"
                                    />
                                </div>
                                {/* DDD */}
                                <div>
                                    <label htmlFor="ddd" className="block mb-1 text-sm font-medium text-slate-300 flex items-center gap-1">
                                        <MdPhone size={16} /> DDD:
                                    </label>
                                    <input
                                        type="number"
                                        id="ddd"
                                        name="contatoRequestDto.ddd"
                                        value={formData.contatoRequestDto.ddd === 0 ? '' : formData.contatoRequestDto.ddd}
                                        onChange={e => setFormData(prev => ({
                                            ...prev,
                                            contatoRequestDto: { ...prev.contatoRequestDto, ddd: parseInt(e.target.value, 10) || 0 }
                                        }))}
                                        required
                                        min={11}
                                        max={99}
                                        placeholder="99"
                                        className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-sky-500 h-10"
                                    />
                                </div>
                                {/* DDI */}
                                <div>
                                    <label htmlFor="ddi" className="block mb-1 text-sm font-medium text-slate-300 flex items-center gap-1">
                                        <MdPhone size={16} /> DDI:
                                    </label>
                                    <input
                                        type="number"
                                        id="ddi"
                                        name="contatoRequestDto.ddi"
                                        value={formData.contatoRequestDto.ddi === 0 ? '' : formData.contatoRequestDto.ddi}
                                        onChange={e => setFormData(prev => ({
                                            ...prev,
                                            contatoRequestDto: { ...prev.contatoRequestDto, ddi: parseInt(e.target.value, 10) || 0 }
                                        }))}
                                        required
                                        min={1}
                                        max={999}
                                        placeholder="55"
                                        className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-sky-500 h-10"
                                    />
                                </div>
                                {/* Telefone 1 */}
                                <div className="md:col-span-2">
                                    <label htmlFor="telefone1" className="block mb-1 flex items-center gap-1">
                                        <MdPhone size={16} /> Telefone 1:
                                    </label>
                                    <input
                                        type="text"
                                        id="telefone1"
                                        name="contatoRequestDto.telefone1"
                                        value={formData.contatoRequestDto.telefone1}
                                        onChange={handleChange}
                                        required
                                        maxLength={20}
                                        className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-sky-500 h-10"
                                    />
                                </div>
                                {/* Telefone 2 (opcional) */}
                                <div>
                                    <label htmlFor="telefone2" className="block mb-1 text-sm font-medium text-slate-300 flex items-center gap-1">
                                        <MdPhone size={16} /> Telefone 2:
                                    </label>
                                    <input
                                        type="text"
                                        id="telefone2"
                                        name="contatoRequestDto.telefone2"
                                        value={formData.contatoRequestDto.telefone2 || ''}
                                        onChange={handleChange}
                                        maxLength={20}
                                        className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-sky-500 h-10"
                                    />
                                </div>
                                {/* Telefone 3 (opcional) */}
                                <div>
                                    <label htmlFor="telefone3" className="block mb-1 text-sm font-medium text-slate-300 flex items-center gap-1">
                                        <MdPhone size={16} /> Telefone 3:
                                    </label>
                                    <input
                                        type="text"
                                        id="telefone3"
                                        name="contatoRequestDto.telefone3"
                                        value={formData.contatoRequestDto.telefone3 || ''}
                                        onChange={handleChange}
                                        maxLength={20}
                                        className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-sky-500 h-10"
                                    />
                                </div>
                                {/* Outro Contato (opcional) */}
                                <div className="md:col-span-2">
                                    <label htmlFor="outro" className="block mb-1 flex items-center gap-1">
                                        <MdInfo size={16} /> Outro Contato:
                                    </label>
                                    <textarea
                                        id="outro"
                                        name="contatoRequestDto.outro"
                                        rows={2}
                                        value={formData.contatoRequestDto.outro || ''}
                                        onChange={handleChange}
                                        maxLength={100}
                                        className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-sky-500"
                                    />
                                </div>
                            </div>
                        </fieldset>

                        {/* Endereço */}
                        <fieldset className="mb-6 border border-slate-700 p-4 rounded">
                            <legend className="text-xl font-semibold mb-2 px-2">Endereço</legend>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* CEP */}
                                <div>
                                    <label htmlFor="cep" className="block mb-1 flex items-center gap-1">
                                        <MapPin size={16} /> CEP:
                                    </label>
                                    <IMaskInput
                                        id="cep"
                                        name="enderecoRequestDto.cep"
                                        mask="00000-000"
                                        unmask={false}
                                        value={formData.enderecoRequestDto.cep}
                                        onAccept={handleCepChange}
                                        required
                                        placeholder="00000-000"
                                        className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-sky-500 h-10"
                                    />
                                </div>
                                {/* Número da Casa */}
                                <div>
                                    <label htmlFor="numero" className="block mb-1 flex items-center gap-1">
                                        <MdHome size={16} /> Número:
                                    </label>
                                    <input
                                        type="number"
                                        id="numero"
                                        name="enderecoRequestDto.numero"
                                        value={formData.enderecoRequestDto.numero === 0 ? '' : formData.enderecoRequestDto.numero}
                                        onChange={e => setFormData(prev => ({
                                            ...prev,
                                            enderecoRequestDto: { ...prev.enderecoRequestDto, numero: parseInt(e.target.value, 10) || 0 }
                                        }))}
                                        required
                                        min={1}
                                        max={9999999}
                                        placeholder="123"
                                        className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-sky-500 h-10"
                                    />
                                </div>
                                {/* Complemento (opcional) */}
                                <div>
                                    <label htmlFor="complemento" className="block mb-1 flex items-center gap-1">
                                        <MdHome size={16} /> Complemento:
                                    </label>
                                    <input
                                        type="text"
                                        id="complemento"
                                        name="enderecoRequestDto.complemento"
                                        value={formData.enderecoRequestDto.complemento || ''}
                                        onChange={handleChange}
                                        maxLength={60}
                                        className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-sky-500 h-10"
                                    />
                                </div>
                                {/* Observação (opcional) */}
                                <div className="md:col-span-3">
                                    <label htmlFor="observacaoEndereco" className="block mb-1 flex items-center gap-1">
                                        <Text size={16} /> Observação (Endereço):
                                    </label>
                                    <textarea
                                        id="observacaoEndereco"
                                        name="enderecoRequestDto.observacao"
                                        rows={2}
                                        value={formData.enderecoRequestDto.observacao || ''}
                                        onChange={handleChange}
                                        maxLength={200}
                                        className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-sky-500"
                                    />
                                </div>
                            </div>
                        </fieldset>

                        {/* Botões de Ação */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <button
                                type="submit"
                                className={`flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-green-600 rounded-md shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-opacity duration-300 ${isLoading || isFetching ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isLoading || isFetching}
                            >
                                <MdSave size={20} /> {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                            <Link href="/clientes/listar" className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-slate-600 rounded-md shadow hover:bg-slate-700 text-center focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900">
                                <MdArrowBack size={20} /> Voltar para Lista
                            </Link>
                        </div>
                    </form>
                </div>
            </main>
            <style jsx global>{`
                .date-input-fix::-webkit-calendar-picker-indicator { filter: invert(0.8); cursor: pointer; }
                input[type="date"]:required:invalid::-webkit-datetime-edit { color: transparent; }
                input[type="date"]:focus::-webkit-datetime-edit { color: white !important; }
                input[type="date"]::-webkit-datetime-edit { color: white; }
            `}</style>
        </>
    );
}