// src/app/clientes/cadastrar/page.tsx
"use client";

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { IMaskInput } from 'react-imask';
import {
    MdPersonAddAlt1, MdPerson, MdBadge, MdCalendarToday, MdWork, MdPhone, MdEmail, MdLocationOn, MdHome,
    MdErrorOutline, MdCheckCircle, MdInfo,
    MdSave,
    MdArrowBack
} from 'react-icons/md';
import { User, Mail, MapPin, Tag, Calendar, Briefcase, Text as LucideText } from 'lucide-react';

// Interfaces dos DTOs
import { ClienteRequestDto, EnderecoRequestDto, ContatoRequestDto } from '@/types/cliente';
import { ClienteService } from '@/utils/api';

// Função auxiliar para limpar máscaras (remover não-dígitos)
const cleanMaskedValue = (value: string): string => value.replace(/\D/g, '');

export default function CadastrarClientePage() {
    const today = new Date().toISOString().split('T')[0];
    const initialState: ClienteRequestDto = {
        nome: "",
        sobrenome: "",
        sexo: "M",
        dataNascimento: "",
        cpf: "",
        profissao: "",
        estadoCivil: "Solteiro",

        enderecoRequestDto: {
            cep: "",
            numero: 0,
            complemento: "",
            observacao: "",
        },
        contatoRequestDto: {
            email: "",
            ddd: 0,
            ddi: 55,
            telefone1: "",
            telefone2: "",
            telefone3: "",
            celular: "",
            outro: "",
            observacao: "",
        },
    };

    const [formData, setFormData] = useState<ClienteRequestDto>(initialState);
    const [tipoDocumentoDisplay, setTipoDocumentoDisplay] = useState("CPF");

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // ESTADOS ADICIONAIS PARA OS CAMPOS DO ENDEREÇO PREENCHIDOS PELA VIACEP NO FRONTEND
    const [logradouroViaCep, setLogradouroViaCep] = useState('');
    const [bairroViaCep, setBairroViaCep] = useState('');
    const [cidadeViaCep, setCidadeViaCep] = useState('');
    const [estadoViaCep, setEstadoViaCep] = useState('');
    const [paisViaCep, setPaisViaCep] = useState('Brasil');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent as keyof ClienteRequestDto]: {
                    ...(prev[parent as keyof ClienteRequestDto] as object || {}),
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name as keyof ClienteRequestDto]: value }));
        }
    };

    const resetForm = () => {
        setFormData({ ...initialState });
        setTipoDocumentoDisplay("CPF");
        setError(null);
        setSuccess(null);
        setLogradouroViaCep('');
        setBairroViaCep('');
        setCidadeViaCep('');
        setEstadoViaCep('');
        setPaisViaCep('Brasil');
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

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

        try {
            const response = await ClienteService.create(clienteDataToSend);
            setSuccess(`✅ Cliente "${response.nome} ${response.sobrenome}" (ID: ${response.idCliente}) cadastrado com sucesso!`);
            resetForm();
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError(`❌ ${err.response?.data?.message || err.message || 'Falha ao cadastrar cliente.'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCepDetails = async (cepValue: string) => {
        const cleanCep = cepValue.replace(/\D/g, '');
        if (cleanCep.length === 8) {
            setError(null);
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
                if (!response.ok) throw new Error(`Erro ao buscar CEP: ${response.statusText}`);
                const data = await response.json();
                if (data.erro) throw new Error("CEP não encontrado ou inválido.");
                setLogradouroViaCep(data.logradouro || '');
                setBairroViaCep(data.bairro || '');
                setCidadeViaCep(data.localidade || '');
                setEstadoViaCep(data.uf || '');
                setPaisViaCep('Brasil');
            } catch (err: any) {
                setError(`Erro ViaCEP: ${err.message}`);
                setLogradouroViaCep(''); setBairroViaCep(''); setCidadeViaCep(''); setEstadoViaCep(''); setPaisViaCep('Brasil');
            }
        }
    };

    const handleCepChange = async (value: string) => {
        setFormData(prev => ({
            ...prev,
            enderecoRequestDto: { ...prev.enderecoRequestDto, cep: value }
        }));
        fetchCepDetails(value);
    };

    const cpfMask = "000.000.000-00";
    const cnpjMask = "00.000.000/0000-00";

    return (
        <>
            <NavBar active="clientes-cadastrar" />
            <main className="flex items-center justify-center min-h-screen bg-black text-white px-4 py-10">
                <div className="bg-[var(--color-mottu-default)] p-6 md:p-8 m-4 rounded-lg shadow-xl w-full max-w-4xl">
                    <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center flex items-center justify-center text-white">
                        <MdPersonAddAlt1 className="inline-block mr-2 text-3xl" />
                        Cadastrar Cliente
                    </h2>

                    {error && (
                        <div className="relative mb-4 text-red-200 bg-red-700/80 p-4 rounded border border-red-500" role="alert">
                            <span className="block sm:inline">{error}</span>
                            <button type="button" className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-200 hover:text-red-100" onClick={() => setError(null)} aria-label="Fechar">
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>
                    )}
                    {success && (
                        <div className="flex items-center justify-center gap-2 text-[var(--color-mottu-dark)] p-3 rounded bg-white/90 border border-[var(--color-mottu-dark)]">
                            <MdCheckCircle className="text-xl" /> <span>{success}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <fieldset className="mb-6 border border-[var(--color-mottu-light)]/40 p-4 rounded"> {/* Borda do fieldset ajustada */}
                            <legend className="text-xl font-semibold mb-2 px-2 text-white">Dados Pessoais</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Nome */}
                                <div>
                                    <label htmlFor="nome" className="block mb-1 flex items-center gap-1 text-white"><User size={16} /> Nome:</label>
                                    <input id="nome" type="text" name="nome" value={formData.nome} onChange={handleChange} required maxLength={100} className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 h-10 placeholder:text-gray-400" />
                                </div>
                                {/* Sobrenome */}
                                <div>
                                    <label htmlFor="sobrenome" className="block mb-1 flex items-center gap-1 text-white"><User size={16} /> Sobrenome:</label>
                                    <input id="sobrenome" type="text" name="sobrenome" value={formData.sobrenome} onChange={handleChange} required maxLength={100} className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 h-10 placeholder:text-gray-400" />
                                </div>
                                {/* Sexo */}
                                <div>
                                    <label htmlFor="sexo" className="block mb-1 flex items-center gap-1 text-white"><MdInfo size={16} /> Sexo:</label>
                                    <select id="sexo" name="sexo" value={formData.sexo} onChange={handleChange} required className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 h-10">
                                        <option value="M">Masculino</option>
                                        <option value="F">Feminino</option>
                                    </select>
                                </div>
                                {/* Data de Nascimento */}
                                <div>
                                    <label htmlFor="dataNascimento" className="block mb-1 flex items-center gap-1 text-white"><Calendar size={16} /> Nascimento:</label>
                                    <input type="date" id="dataNascimento" name="dataNascimento" value={formData.dataNascimento} onChange={handleChange} required className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 date-input-fix h-10" />
                                </div>
                                {/* Tipo de Documento */}
                                <div>
                                    <label htmlFor="tipoDocumentoDisplay" className="block mb-1 flex items-center gap-1 text-white"><MdBadge size={16} /> Documento:</label>
                                    <select id="tipoDocumentoDisplay" name="tipoDocumentoDisplay" value={tipoDocumentoDisplay} onChange={e => { setTipoDocumentoDisplay(e.target.value); setFormData(prev => ({ ...prev, cpf: '' })); }} required className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 h-10">
                                        <option value="CPF">CPF</option>
                                        <option value="CNPJ">CNPJ</option>
                                    </select>
                                </div>
                                {/* Número do Documento (CPF/CNPJ) */}
                                <div>
                                    <label htmlFor="cpf" className="block mb-1 flex items-center gap-1 text-white"><MdBadge size={16} /> Número:</label>
                                    <IMaskInput id="cpf" name="cpf" mask={tipoDocumentoDisplay === 'CPF' ? cpfMask : cnpjMask} unmask={false} value={formData.cpf} onAccept={(value: string) => setFormData(prev => ({ ...prev, cpf: value }))} required placeholder={tipoDocumentoDisplay === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00'} className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 h-10 placeholder:text-gray-400" />
                                </div>
                                {/* Profissão */}
                                <div>
                                    <label htmlFor="profissao" className="block mb-1 flex items-center gap-1 text-white"><Briefcase size={16} /> Profissão:</label>
                                    <input type="text" id="profissao" name="profissao" value={formData.profissao} onChange={handleChange} required maxLength={50} className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 h-10 placeholder:text-gray-400" />
                                </div>
                                {/* Estado Civil */}
                                <div>
                                    <label htmlFor="estadoCivil" className="block mb-1 flex items-center gap-1 text-white"><MdInfo size={16} /> Estado Civil:</label>
                                    <select id="estadoCivil" name="estadoCivil" value={formData.estadoCivil} onChange={handleChange} required className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 h-10">
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

                        <fieldset className="mb-6 border border-[var(--color-mottu-light)]/40 p-4 rounded"> {/* Borda do fieldset ajustada */}
                            <legend className="text-xl font-semibold mb-2 px-2 text-white">Contatos</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Celular */}
                                <div>
                                    <label htmlFor="celular" className="block mb-1 flex items-center gap-1 text-white"><MdPhone size={16} /> Celular:</label>
                                    <IMaskInput id="celular" name="contatoRequestDto.celular" mask="(00) 00000-0000" unmask={false} value={formData.contatoRequestDto.celular} onAccept={(value: string) => setFormData(prev => ({ ...prev, contatoRequestDto: { ...prev.contatoRequestDto, celular: value } }))} required placeholder="(99) 99999-9999" className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 h-10 placeholder:text-gray-400" />
                                </div>
                                {/* E-mail */}
                                <div>
                                    <label htmlFor="email" className="block mb-1 flex items-center gap-1 text-white"><Mail size={16} /> E-mail:</label>
                                    <input type="email" id="email" name="contatoRequestDto.email" value={formData.contatoRequestDto.email} onChange={handleChange} required placeholder="exemplo@dominio.com" className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 h-10 placeholder:text-gray-400" />
                                </div>
                                {/* DDD */}
                                <div>
                                    <label htmlFor="ddd" className="block mb-1 text-sm font-medium text-white flex items-center gap-1"><MdPhone size={16} /> DDD:</label>
                                    <input type="number" id="ddd" name="contatoRequestDto.ddd" value={formData.contatoRequestDto.ddd === 0 ? '' : formData.contatoRequestDto.ddd} onChange={e => setFormData(prev => ({ ...prev, contatoRequestDto: { ...prev.contatoRequestDto, ddd: parseInt(e.target.value, 10) || 0 } }))} required min={11} max={99} placeholder="99" className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 h-10 placeholder:text-gray-400" />
                                </div>
                                {/* DDI */}
                                <div>
                                    <label htmlFor="ddi" className="block mb-1 text-sm font-medium text-white flex items-center gap-1"><MdPhone size={16} /> DDI:</label>
                                    <input type="number" id="ddi" name="contatoRequestDto.ddi" value={formData.contatoRequestDto.ddi === 0 ? '' : formData.contatoRequestDto.ddi} onChange={e => setFormData(prev => ({ ...prev, contatoRequestDto: { ...prev.contatoRequestDto, ddi: parseInt(e.target.value, 10) || 0 } }))} required min={1} max={999} placeholder="55" className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 h-10 placeholder:text-gray-400" />
                                </div>
                                {/* Telefone 1 */}
                                <div className="md:col-span-2">
                                    <label htmlFor="telefone1" className="block mb-1 flex items-center gap-1 text-white"><MdPhone size={16} /> Telefone 1:</label>
                                    <input type="text" id="telefone1" name="contatoRequestDto.telefone1" value={formData.contatoRequestDto.telefone1} onChange={handleChange} required maxLength={20} className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 h-10 placeholder:text-gray-400" />
                                </div>
                                {/* Outros telefones e contato */}
                                <div>
                                    <label htmlFor="telefone2" className="block mb-1 text-sm font-medium text-white flex items-center gap-1"><MdPhone size={16} /> Telefone 2:</label>
                                    <input type="text" id="telefone2" name="contatoRequestDto.telefone2" value={formData.contatoRequestDto.telefone2 || ''} onChange={handleChange} maxLength={20} className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 h-10 placeholder:text-gray-400" />
                                </div>
                                <div>
                                    <label htmlFor="telefone3" className="block mb-1 text-sm font-medium text-white flex items-center gap-1"><MdPhone size={16} /> Telefone 3:</label>
                                    <input type="text" id="telefone3" name="contatoRequestDto.telefone3" value={formData.contatoRequestDto.telefone3 || ''} onChange={handleChange} maxLength={20} className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 h-10 placeholder:text-gray-400" />
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="outro" className="block mb-1 flex items-center gap-1 text-white"><MdInfo size={16} /> Outro Contato:</label>
                                    <textarea id="outro" name="contatoRequestDto.outro" rows={2} value={formData.contatoRequestDto.outro || ''} onChange={handleChange} maxLength={100} className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 placeholder:text-gray-400" />
                                </div>
                            </div>
                        </fieldset>

                        <fieldset className="mb-6 border border-[var(--color-mottu-light)]/40 p-4 rounded"> {/* Borda do fieldset ajustada */}
                            <legend className="text-xl font-semibold mb-2 px-2 text-white">Endereço</legend>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* CEP */}
                                <div>
                                    <label htmlFor="cep" className="block mb-1 flex items-center gap-1 text-white"><MapPin size={16} /> CEP:</label>
                                    <IMaskInput id="cep" name="enderecoRequestDto.cep" mask="00000-000" unmask={false} value={formData.enderecoRequestDto.cep} onAccept={handleCepChange} required placeholder="00000-000" className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 h-10 placeholder:text-gray-400" />
                                </div>
                                {/* Número */}
                                <div>
                                    <label htmlFor="numero" className="block mb-1 flex items-center gap-1 text-white"><MdHome size={16} /> Número:</label>
                                    <input type="number" id="numero" name="enderecoRequestDto.numero" value={formData.enderecoRequestDto.numero === 0 ? '' : formData.enderecoRequestDto.numero} onChange={e => setFormData(prev => ({ ...prev, enderecoRequestDto: { ...prev.enderecoRequestDto, numero: parseInt(e.target.value, 10) || 0 } }))} required min={1} max={9999999} placeholder="123" className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 h-10 placeholder:text-gray-400" />
                                </div>
                                {/* Complemento */}
                                <div>
                                    <label htmlFor="complemento" className="block mb-1 flex items-center gap-1 text-white"><MdHome size={16} /> Complemento:</label>
                                    <input type="text" id="complemento" name="enderecoRequestDto.complemento" value={formData.enderecoRequestDto.complemento || ''} onChange={handleChange} maxLength={60} className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 h-10 placeholder:text-gray-400" />
                                </div>
                                {/* Campos ViaCEP */}
                                <div className="md:col-span-2">
                                    <label htmlFor="logradouro" className="block mb-1 flex items-center gap-1 text-white"><MdLocationOn size={16} /> Logradouro:</label>
                                    <input type="text" id="logradouro" name="logradouro" value={logradouroViaCep} readOnly className="w-full p-2 rounded bg-gray-100 text-gray-700 border border-gray-300 cursor-not-allowed h-10" />
                                </div>
                                <div>
                                    <label htmlFor="bairro" className="block mb-1 flex items-center gap-1 text-white"><MdLocationOn size={16} /> Bairro:</label>
                                    <input type="text" id="bairro" name="bairro" value={bairroViaCep} readOnly className="w-full p-2 rounded bg-gray-100 text-gray-700 border border-gray-300 cursor-not-allowed h-10" />
                                </div>
                                <div>
                                    <label htmlFor="cidade" className="block mb-1 flex items-center gap-1 text-white"><MdLocationOn size={16} /> Cidade:</label>
                                    <input type="text" id="cidade" name="cidade" value={cidadeViaCep} readOnly className="w-full p-2 rounded bg-gray-100 text-gray-700 border border-gray-300 cursor-not-allowed h-10" />
                                </div>
                                <div>
                                    <label htmlFor="estado" className="block mb-1 flex items-center gap-1 text-white"><MdLocationOn size={16} /> Estado (UF):</label>
                                    <input type="text" id="estado" name="estado" value={estadoViaCep} readOnly maxLength={2} className="w-full p-2 rounded bg-gray-100 text-gray-700 border border-gray-300 cursor-not-allowed h-10" />
                                </div>
                                <div>
                                    <label htmlFor="pais" className="block mb-1 flex items-center gap-1 text-white"><MdLocationOn size={16} /> País:</label>
                                    <input type="text" id="pais" name="pais" value={paisViaCep} readOnly className="w-full p-2 rounded bg-gray-100 text-gray-700 border border-gray-300 cursor-not-allowed h-10" />
                                </div>
                                {/* Observação Endereço */}
                                <div className="md:col-span-3">
                                    <label htmlFor="observacaoEndereco" className="block mb-1 flex items-center gap-1 text-white"><LucideText size={16} /> Observação (Endereço):</label>
                                    <textarea id="observacaoEndereco" name="enderecoRequestDto.observacao" rows={2} value={formData.enderecoRequestDto.observacao || ''} onChange={handleChange} maxLength={200} className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 placeholder:text-gray-400" />
                                </div>
                            </div>
                        </fieldset>

                        {/* Botões de Ação com novo estilo */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <button
                                type="submit"
                                className={`flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-[var(--color-mottu-dark)] rounded-md shadow hover:bg-[var(--color-mottu-default)] focus:outline-none focus:ring-2 focus:ring-[var(--color-mottu-default)] focus:ring-offset-2 focus:ring-offset-[var(--color-mottu-default)] transition-colors duration-200 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isLoading}
                            >
                                <MdSave size={20} /> {isLoading ? 'Salvando...' : 'Salvar Cliente'}
                            </button>
                            <Link
                                href="/clientes/listar"
                                className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-[var(--color-mottu-default)] bg-white rounded-md shadow border border-[var(--color-mottu-default)] hover:bg-gray-50 hover:text-[var(--color-mottu-dark)] hover:border-[var(--color-mottu-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--color-mottu-dark)] focus:ring-offset-2 focus:ring-offset-[var(--color-mottu-default)] transition-colors duration-200"
                            >
                                <MdArrowBack size={20} /> Voltar para Lista
                            </Link>
                        </div>
                    </form>
                </div>
            </main>
            <style jsx global>{`
                .date-input-fix::-webkit-calendar-picker-indicator { cursor: pointer; }
                input[type="date"]:required:invalid::-webkit-datetime-edit { color: transparent; }
                input[type="date"]:focus::-webkit-datetime-edit { color: #1e293b !important; } /* text-slate-900 */
                input[type="date"]::-webkit-datetime-edit { color: #1e293b; } /* text-slate-900 */
            `}</style>
        </>
    );
}