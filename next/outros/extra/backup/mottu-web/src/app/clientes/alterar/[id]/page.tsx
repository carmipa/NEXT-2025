// src/app/clientes/alterar/[id]/page.tsx
"use client";
import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { IMaskInput } from 'react-imask';
import { MdEdit, MdSave, MdArrowBack, MdErrorOutline, MdCheckCircle, MdInfo, MdBadge, MdHome, MdPhone } from 'react-icons/md';
import { User, Mail, MapPin, Calendar, Briefcase, Loader2, AlertCircle, Text as LucideText } from 'lucide-react';
import { ClienteRequestDto, ClienteResponseDto } from '@/types/cliente';
import { ClienteService } from '@/utils/api';

const cleanMaskedValue = (value: string): string => value.replace(/\D/g, '');

export default function AlterarClientePage() {
    const params = useParams();
    const router = useRouter();
    const id = typeof params.id === 'string' ? parseInt(params.id, 10) : null;

    const [formData, setFormData] = useState<ClienteRequestDto>({
        sexo: 'M', nome: '', sobrenome: '', dataNascimento: '', cpf: '',
        profissao: '', estadoCivil: 'Solteiro',
        enderecoRequestDto: { cep: '', numero: 0, complemento: '', observacao: '' },
        contatoRequestDto: { email: '', ddd: 0, ddi: 0, telefone1: '', celular: '' },
    });

    const [tipoDocumentoDisplay, setTipoDocumentoDisplay] = useState("CPF");
    const [logradouroApi, setLogradouroApi] = useState('');
    const [bairroApi, setBairroApi] = useState('');
    const [cidadeApi, setCidadeApi] = useState('');
    const [estadoApi, setEstadoApi] = useState('');
    const [paisApi, setPaisApi] = useState('Brasil');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setError("ID do cliente não fornecido na URL.");
            setIsFetching(false); return;
        }
        const fetchData = async () => {
            setIsFetching(true); setError(null);
            try {
                const data: ClienteResponseDto = await ClienteService.getById(id);
                setFormData({
                    sexo: data.sexo || 'M', nome: data.nome || '', sobrenome: data.sobrenome || '',
                    dataNascimento: data.dataNascimento ? data.dataNascimento.split('T')[0] : '',
                    cpf: data.cpf || '', profissao: data.profissao || '',
                    estadoCivil: data.estadoCivil as ClienteRequestDto['estadoCivil'] || 'Solteiro',
                    enderecoRequestDto: {
                        idEndereco: data.enderecoResponseDto?.idEndereco, cep: data.enderecoResponseDto?.cep || '',
                        numero: data.enderecoResponseDto?.numero || 0, complemento: data.enderecoResponseDto?.complemento || '',
                        observacao: data.enderecoResponseDto?.observacao || '',
                    },
                    contatoRequestDto: {
                        idContato: data.contatoResponseDto?.idContato, email: data.contatoResponseDto?.email || '',
                        ddd: data.contatoResponseDto?.ddd || 0, ddi: data.contatoResponseDto?.ddi || 0,
                        telefone1: data.contatoResponseDto?.telefone1 || '', celular: data.contatoResponseDto?.celular || '',
                    },
                });

                setTipoDocumentoDisplay(data.cpf?.length === 11 ? "CPF" : "CNPJ");

                setLogradouroApi(data.enderecoResponseDto?.logradouro || ''); setBairroApi(data.enderecoResponseDto?.bairro || '');
                setCidadeApi(data.enderecoResponseDto?.cidade || ''); setEstadoApi(data.enderecoResponseDto?.estado || '');
                setPaisApi(data.enderecoResponseDto?.pais || 'Brasil');
            } catch (err: any) {
                setError(err.response?.data?.message || err.message || "Falha ao carregar dados para edição.");
            } finally {
                setIsFetching(false);
            }
        };
        fetchData();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({ ...prev, [parent as keyof ClienteRequestDto]: { ...((prev[parent as keyof ClienteRequestDto] as object) || {}), [child]: value } }));
        } else {
            setFormData(prev => ({ ...prev, [name as keyof ClienteRequestDto]: value }));
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
                setLogradouroApi(data.logradouro || '');
                setBairroApi(data.bairro || '');
                setCidadeApi(data.localidade || '');
                setEstadoApi(data.uf || '');
                setPaisApi('Brasil');
            } catch (err: any) {
                setError(`Erro ViaCEP: ${err.message}`);
            }
        }
    };

    const handleCepChange = (value: string) => {
        setFormData(prev => ({ ...prev, enderecoRequestDto: { ...prev.enderecoRequestDto, cep: value } }));
        fetchCepDetails(value);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (id === null) { setError("ID do cliente inválido para salvar."); return; }

        setIsLoading(true); setError(null); setSuccess(null);

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
            const updatedCliente: ClienteResponseDto = await ClienteService.update(id, clienteDataToSend);
            setSuccess(`✅ Cliente "${updatedCliente.nome} ${updatedCliente.sobrenome}" atualizado com sucesso!`);
            setTimeout(() => { setSuccess(null); router.push('/clientes/listar'); }, 3000);
        } catch (err: any) {
            setError(`❌ ${err.response?.data?.message || err.message || 'Falha ao salvar alterações.'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const cpfMask = "000.000.000-00";
    const cnpjMask = "00.000.000/0000-00";

    if (isFetching) return (
        <>
            <NavBar active="clientes" />
            <main className="flex justify-center items-center min-h-screen bg-black"><Loader2 className="h-12 w-12 animate-spin text-[var(--color-mottu-light)]" /></main>
        </>
    );

    return (
        <>
            <NavBar active="clientes" />
            <main className="flex items-center justify-center min-h-screen bg-black text-white px-4 py-10">
                <div className="bg-[var(--color-mottu-default)] p-6 md:p-8 m-4 rounded-lg shadow-xl w-full max-w-4xl">
                    <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center flex items-center justify-center text-white">
                        <MdEdit className="inline-block mr-2 text-3xl" /> Alterar Cliente (ID: {id})
                    </h2>

                    {/* --- BLOCO DE MENSAGENS REMOVIDO DAQUI --- */}

                    <form onSubmit={handleSubmit}>
                        <fieldset className="mb-6 border border-[var(--color-mottu-light)]/40 p-4 rounded">
                            <legend className="text-xl font-semibold mb-2 px-2 text-white">Dados Pessoais</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="group"><label htmlFor="nome" className="block mb-1 flex items-center gap-1 text-white"><User size={16} /> Nome: <span className="text-red-300">*</span></label><input id="nome" type="text" name="nome" value={formData.nome} onChange={handleChange} required maxLength={100} className="peer w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 h-10 required:invalid:border-red-500" /></div>
                                <div className="group"><label htmlFor="sobrenome" className="block mb-1 flex items-center gap-1 text-white"><User size={16} /> Sobrenome: <span className="text-red-300">*</span></label><input id="sobrenome" type="text" name="sobrenome" value={formData.sobrenome} onChange={handleChange} required maxLength={100} className="peer w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 h-10 required:invalid:border-red-500" /></div>
                                <div><label htmlFor="sexo" className="block mb-1 flex items-center gap-1 text-white"><MdInfo size={16} /> Sexo:</label><select id="sexo" name="sexo" value={formData.sexo} onChange={handleChange} required className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 h-10"><option value="M">Masculino</option><option value="F">Feminino</option></select></div>
                                <div className="group"><label htmlFor="dataNascimento" className="block mb-1 flex items-center gap-1 text-white"><Calendar size={16} /> Nascimento: <span className="text-red-300">*</span></label><input type="date" id="dataNascimento" name="dataNascimento" value={formData.dataNascimento} onChange={handleChange} required className="peer w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 date-input-fix h-10" /></div>
                                <div><label htmlFor="tipoDocumentoDisplay" className="block mb-1 flex items-center gap-1 text-white"><MdBadge size={16} /> Documento:</label><select id="tipoDocumentoDisplay" name="tipoDocumentoDisplay" value={tipoDocumentoDisplay} onChange={e => { setTipoDocumentoDisplay(e.target.value); setFormData(prev => ({ ...prev, cpf: '' })); }} required className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 h-10"><option value="CPF">CPF</option><option value="CNPJ">CNPJ</option></select></div>
                                <div className="group"><label htmlFor="cpf" className="block mb-1 flex items-center gap-1 text-white"><MdBadge size={16} /> Número:</label><IMaskInput id="cpf" name="cpf" mask={tipoDocumentoDisplay === 'CPF' ? cpfMask : cnpjMask} unmask={false} value={formData.cpf} onAccept={(value: string) => setFormData(prev => ({ ...prev, cpf: value }))} required placeholder={tipoDocumentoDisplay === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00'} className="peer w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 h-10 required:invalid:border-red-500" /></div>
                                <div className="group"><label htmlFor="profissao" className="block mb-1 flex items-center gap-1 text-white"><Briefcase size={16} /> Profissão: <span className="text-red-300">*</span></label><input type="text" id="profissao" name="profissao" value={formData.profissao} onChange={handleChange} required maxLength={50} className="peer w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 h-10 required:invalid:border-red-500" /></div>
                                <div><label htmlFor="estadoCivil" className="block mb-1 flex items-center gap-1 text-white"><MdInfo size={16} /> Estado Civil:</label><select id="estadoCivil" name="estadoCivil" value={formData.estadoCivil} onChange={handleChange} required className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 h-10"><option value="Solteiro">Solteiro</option><option value="Casado">Casado</option><option value="Divorciado">Divorciado</option><option value="Viúvo">Viúvo</option><option value="Separado">Separado</option><option value="União Estável">União Estável</option></select></div>
                            </div>
                        </fieldset>

                        <fieldset className="mb-6 border border-[var(--color-mottu-light)]/40 p-4 rounded">
                            <legend className="text-xl font-semibold mb-2 px-2 text-white">Endereço e Contato</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="group lg:col-span-1"><label htmlFor="cep" className="block mb-1 flex items-center gap-1 text-white"><MapPin size={16} /> CEP: <span className="text-red-300">*</span></label><IMaskInput id="cep" name="enderecoRequestDto.cep" mask="00000-000" unmask={false} value={formData.enderecoRequestDto.cep} onAccept={handleCepChange} required placeholder="00000-000" className="peer w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 h-10 required:invalid:border-red-500" /></div>
                                <div className="group lg:col-span-1"><label htmlFor="numero" className="block mb-1 flex items-center gap-1 text-white"><MdHome size={16} /> Número: <span className="text-red-300">*</span></label><input type="number" id="numero" name="enderecoRequestDto.numero" value={formData.enderecoRequestDto.numero === 0 ? '' : formData.enderecoRequestDto.numero} onChange={handleChange} required min={1} max={9999999} placeholder="123" className="peer w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 h-10 required:invalid:border-red-500" /></div>
                                <div className="lg:col-span-1"><label htmlFor="complemento" className="block mb-1 flex items-center gap-1 text-white"><MdHome size={16} /> Complemento:</label><input type="text" id="complemento" name="enderecoRequestDto.complemento" value={formData.enderecoRequestDto.complemento || ''} onChange={handleChange} maxLength={60} placeholder="Apto, bloco, etc. (Opcional)" className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 h-10" /></div>
                                <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2 border-t border-slate-700/50 pt-4">
                                    <div className="lg:col-span-2"><label className="block mb-1 text-white text-sm">Logradouro:</label><input type="text" value={logradouroApi} readOnly className="w-full p-2 rounded bg-gray-100 text-gray-700 border border-gray-300 cursor-not-allowed h-10" /></div>
                                    <div className="lg:col-span-1"><label className="block mb-1 text-white text-sm">Bairro:</label><input type="text" value={bairroApi} readOnly className="w-full p-2 rounded bg-gray-100 text-gray-700 border border-gray-300 cursor-not-allowed h-10" /></div>
                                    <div className="lg:col-span-1"><label className="block mb-1 text-white text-sm">Cidade:</label><input type="text" value={cidadeApi} readOnly className="w-full p-2 rounded bg-gray-100 text-gray-700 border border-gray-300 cursor-not-allowed h-10" /></div>
                                    <div className="lg:col-span-1"><label className="block mb-1 text-white text-sm">Estado (UF):</label><input type="text" value={estadoApi} readOnly className="w-full p-2 rounded bg-gray-100 text-gray-700 border border-gray-300 cursor-not-allowed h-10" /></div>
                                </div>
                                <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 border-t border-slate-700/50 pt-4">
                                    <div className="group"><label htmlFor="celular" className="block mb-1 flex items-center gap-1 text-white"><MdPhone size={16} /> Celular: <span className="text-red-300">*</span></label><IMaskInput id="celular" name="contatoRequestDto.celular" mask="(00) 00000-0000" unmask={false} value={formData.contatoRequestDto.celular} onAccept={(value: string) => setFormData(prev => ({ ...prev, contatoRequestDto: { ...prev.contatoRequestDto, celular: value } }))} required className="peer w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 h-10 required:invalid:border-red-500" /></div>
                                    <div className="group"><label htmlFor="email" className="block mb-1 flex items-center gap-1 text-white"><Mail size={16} /> E-mail: <span className="text-red-300">*</span></label><input type="email" id="email" name="contatoRequestDto.email" value={formData.contatoRequestDto.email} onChange={handleChange} required className="peer w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 h-10 required:invalid:border-red-500" /></div>
                                </div>
                            </div>
                        </fieldset>

                        {/* --- CORREÇÃO: Bloco de mensagens movido para cá, para aparecer perto dos botões --- */}
                        <div className="h-12 my-4"> {/* Container para mensagens para evitar que o layout "pule" */}
                            {error && (
                                <div className="relative text-red-200 bg-red-700/80 p-4 rounded border border-red-500" role="alert">
                                    <span className="block sm:inline">{error}</span>
                                    <button type="button" className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-200 hover:text-red-100" onClick={() => setError(null)} aria-label="Fechar"><span className="text-2xl">&times;</span></button>
                                </div>
                            )}
                            {success && (
                                <div className="flex items-center justify-center gap-2 text-[var(--color-mottu-dark)] p-3 rounded bg-white/90 border border-[var(--color-mottu-dark)]">
                                    <MdCheckCircle className="text-xl" /> <span>{success}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <button type="submit" className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-[var(--color-mottu-dark)] rounded-md shadow hover:bg-opacity-80 transition-colors duration-200 disabled:opacity-50" disabled={isLoading || isFetching || !!success}><MdSave size={20} /> {isLoading ? 'Salvando...' : 'Salvar Alterações'}</button>
                            <Link href="/clientes/listar" className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-[var(--color-mottu-dark)] bg-white rounded-md shadow hover:bg-gray-100"><MdArrowBack size={20} /> Voltar para Lista</Link>
                        </div>
                    </form>
                </div>
            </main>
            <style jsx global>{`
                .date-input-fix::-webkit-calendar-picker-indicator { cursor: pointer; }
                input[type="date"]:required:invalid::-webkit-datetime-edit { color: transparent; }
                input[type="date"]:focus::-webkit-datetime-edit { color: #1e293b !important; }
                input[type="date"]::-webkit-datetime-edit { color: #1e293b; }
            `}</style>
        </>
    );
}