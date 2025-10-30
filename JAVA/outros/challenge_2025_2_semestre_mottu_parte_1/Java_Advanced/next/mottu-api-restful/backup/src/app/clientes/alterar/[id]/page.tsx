// src/app/clientes/alterar/[id]/page.tsx
"use client";
import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { IMaskInput } from 'react-imask';
import { ClienteRequestDto, ClienteResponseDto } from '@/types/cliente';
import { ClienteService } from '@/utils/api';
import '@/styles/neumorphic.css';

const cleanMaskedValue = (value: string): string => value.replace(/\D/g, '');

export default function AlterarClientePage() {
    const params = useParams();
    const router = useRouter();
    const id = typeof params.id === 'string' ? parseInt(params.id, 10) : null;

    const [formData, setFormData] = useState<ClienteRequestDto>({
        sexo: 'M', nome: '', sobrenome: '', dataNascimento: '', cpf: '',
        profissao: '', estadoCivil: 'Solteiro',
        enderecoRequestDto: { cep: '', numero: 0, complemento: '', observacao: '' },
        contatoRequestDto: {
            email: '', ddd: 0, ddi: 55, telefone1: '',
            telefone2: '', telefone3: '', celular: '',
            outro: '', observacao: '',
        },
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
                        ddd: data.contatoResponseDto?.ddd || 0, ddi: data.contatoResponseDto?.ddi || 55,
                        telefone1: data.contatoResponseDto?.telefone1 || '', celular: data.contatoResponseDto?.celular || '',
                        telefone2: data.contatoResponseDto?.telefone2 || '', telefone3: data.contatoResponseDto?.telefone3 || '',
                        outro: data.contatoResponseDto?.outro || '', observacao: data.contatoResponseDto?.observacao || '',
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
            <main className="flex justify-center items-center min-h-screen bg-black">
                <div className="flex flex-col items-center gap-3 text-sky-300">
                    <i className="ion-ios-sync text-5xl animate-spin"></i>
                    <p className="text-lg" style={{fontFamily: 'Montserrat, sans-serif'}}>Carregando dados do cliente...</p>
                </div>
            </main>
        </>
    );

    return (
        <>
            <NavBar active="clientes" />
            <main className="flex items-center justify-center min-h-screen bg-black text-white px-4 py-10">
                <div className="bg-[var(--color-mottu-default)] p-6 md:p-8 m-4 rounded-lg shadow-xl w-full max-w-4xl">
                    <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center flex items-center justify-center text-white" style={{fontFamily: 'Montserrat, sans-serif'}}>
                        <i className="ion-ios-person-add text-3xl mr-2"></i> Alterar Cliente (ID: {id})
                    </h2>

                    {/* --- BLOCO DE MENSAGENS REMOVIDO DAQUI --- */}

                    <form onSubmit={handleSubmit}>
                        <fieldset className="neumorphic-fieldset mb-6">
                            <legend className="neumorphic-legend" style={{fontFamily: 'Montserrat, sans-serif'}}>Dados Pessoais</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="group">
                                    <label htmlFor="nome" className="neumorphic-label flex items-center gap-1" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <i className="ion-ios-person text-lg"></i> Nome: <span className="text-red-300">*</span>
                                    </label>
                                    <input id="nome" type="text" name="nome" value={formData.nome} onChange={handleChange} required maxLength={100} className="neumorphic-input" style={{fontFamily: 'Montserrat, sans-serif'}} />
                                </div>
                                <div className="group">
                                    <label htmlFor="sobrenome" className="neumorphic-label flex items-center gap-1" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <i className="ion-ios-person text-lg"></i> Sobrenome: <span className="text-red-300">*</span>
                                    </label>
                                    <input id="sobrenome" type="text" name="sobrenome" value={formData.sobrenome} onChange={handleChange} required maxLength={100} className="neumorphic-input" style={{fontFamily: 'Montserrat, sans-serif'}} />
                                </div>
                                <div>
                                    <label htmlFor="sexo" className="neumorphic-label flex items-center gap-1" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <i className="ion-ios-information text-lg"></i> Sexo:
                                    </label>
                                    <select id="sexo" name="sexo" value={formData.sexo} onChange={handleChange} required className="neumorphic-select" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <option value="M">Masculino</option>
                                        <option value="F">Feminino</option>
                                    </select>
                                </div>
                                <div className="group">
                                    <label htmlFor="dataNascimento" className="neumorphic-label flex items-center gap-1" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <i className="ion-ios-calendar text-lg"></i> Nascimento: <span className="text-red-300">*</span>
                                    </label>
                                    <input type="date" id="dataNascimento" name="dataNascimento" value={formData.dataNascimento} onChange={handleChange} required className="neumorphic-input date-input-fix" style={{fontFamily: 'Montserrat, sans-serif'}} />
                                </div>
                                <div>
                                    <label htmlFor="tipoDocumentoDisplay" className="neumorphic-label flex items-center gap-1" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <i className="ion-ios-document text-lg"></i> Documento:
                                    </label>
                                    <select id="tipoDocumentoDisplay" name="tipoDocumentoDisplay" value={tipoDocumentoDisplay} onChange={e => { setTipoDocumentoDisplay(e.target.value); setFormData(prev => ({ ...prev, cpf: '' })); }} required className="neumorphic-select" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <option value="CPF">CPF</option>
                                        <option value="CNPJ">CNPJ</option>
                                    </select>
                                </div>
                                <div className="group">
                                    <label htmlFor="cpf" className="neumorphic-label flex items-center gap-1" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <i className="ion-ios-barcode text-lg"></i> Número:
                                    </label>
                                    <IMaskInput id="cpf" name="cpf" mask={tipoDocumentoDisplay === 'CPF' ? cpfMask : cnpjMask} unmask={false} value={formData.cpf} onAccept={(value: string) => setFormData(prev => ({ ...prev, cpf: value }))} required placeholder={tipoDocumentoDisplay === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00'} className="neumorphic-input" style={{fontFamily: 'Montserrat, sans-serif'}} />
                                </div>
                                <div className="group">
                                    <label htmlFor="profissao" className="neumorphic-label flex items-center gap-1" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <i className="ion-ios-briefcase text-lg"></i> Profissão: <span className="text-red-300">*</span>
                                    </label>
                                    <input type="text" id="profissao" name="profissao" value={formData.profissao} onChange={handleChange} required maxLength={50} className="neumorphic-input" style={{fontFamily: 'Montserrat, sans-serif'}} />
                                </div>
                                <div>
                                    <label htmlFor="estadoCivil" className="neumorphic-label flex items-center gap-1" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <i className="ion-ios-information text-lg"></i> Estado Civil:
                                    </label>
                                    <select id="estadoCivil" name="estadoCivil" value={formData.estadoCivil} onChange={handleChange} required className="neumorphic-select" style={{fontFamily: 'Montserrat, sans-serif'}}>
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

                        <fieldset className="neumorphic-fieldset mb-6">
                            <legend className="neumorphic-legend" style={{fontFamily: 'Montserrat, sans-serif'}}>Contatos</legend>
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                                <div className="group md:col-span-4">
                                    <label htmlFor="email" className="neumorphic-label flex items-center gap-1" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <i className="ion-ios-mail text-lg"></i> E-mail: <span className="text-red-300">*</span>
                                    </label>
                                    <input type="email" id="email" name="contatoRequestDto.email" value={formData.contatoRequestDto.email} onChange={handleChange} required placeholder="exemplo@dominio.com" className="neumorphic-input" style={{fontFamily: 'Montserrat, sans-serif'}} />
                                </div>
                                <div className="group md:col-span-2">
                                    <label htmlFor="celular" className="neumorphic-label flex items-center gap-1" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <i className="ion-ios-call text-lg"></i> Celular: <span className="text-red-300">*</span>
                                    </label>
                                    <IMaskInput id="celular" name="contatoRequestDto.celular" mask="(00) 00000-0000" unmask={false} value={formData.contatoRequestDto.celular} onAccept={(value: string) => setFormData(prev => ({ ...prev, contatoRequestDto: { ...prev.contatoRequestDto, celular: value } }))} required placeholder="(11) 98765-4321" className="neumorphic-input" style={{fontFamily: 'Montserrat, sans-serif'}} />
                                </div>
                                <div className="group md:col-span-1">
                                    <label htmlFor="ddi" className="neumorphic-label flex items-center gap-1" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <i className="ion-ios-call text-lg"></i> DDI: <span className="text-red-300">*</span>
                                    </label>
                                    <input type="number" id="ddi" name="contatoRequestDto.ddi" value={formData.contatoRequestDto.ddi === 0 ? '' : formData.contatoRequestDto.ddi} onChange={e => setFormData(prev => ({ ...prev, contatoRequestDto: { ...prev.contatoRequestDto, ddi: parseInt(e.target.value, 10) || 0 } }))} required min={1} max={999} placeholder="55" className="neumorphic-input" style={{fontFamily: 'Montserrat, sans-serif'}} />
                                </div>
                                <div className="group md:col-span-1">
                                    <label htmlFor="ddd" className="neumorphic-label flex items-center gap-1" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <i className="ion-ios-call text-lg"></i> DDD: <span className="text-red-300">*</span>
                                    </label>
                                    <input type="number" id="ddd" name="contatoRequestDto.ddd" value={formData.contatoRequestDto.ddd === 0 ? '' : formData.contatoRequestDto.ddd} onChange={e => setFormData(prev => ({ ...prev, contatoRequestDto: { ...prev.contatoRequestDto, ddd: parseInt(e.target.value, 10) || 0 } }))} required min={11} max={99} placeholder="11" className="neumorphic-input" style={{fontFamily: 'Montserrat, sans-serif'}} />
                                </div>
                                <div className="group md:col-span-2">
                                    <label htmlFor="telefone1" className="neumorphic-label flex items-center gap-1" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <i className="ion-ios-call text-lg"></i> Telefone Fixo: <span className="text-red-300">*</span>
                                    </label>
                                    <input type="text" id="telefone1" name="contatoRequestDto.telefone1" value={formData.contatoRequestDto.telefone1} onChange={handleChange} required placeholder="5555-4444" className="neumorphic-input" style={{fontFamily: 'Montserrat, sans-serif'}} />
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="telefone2" className="neumorphic-label flex items-center gap-1" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <i className="ion-ios-call text-lg"></i> Telefone 2:
                                    </label>
                                    <input type="text" id="telefone2" name="contatoRequestDto.telefone2" value={formData.contatoRequestDto.telefone2 || ''} onChange={handleChange} maxLength={20} placeholder="Opcional" className="neumorphic-input" style={{fontFamily: 'Montserrat, sans-serif'}} />
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="telefone3" className="neumorphic-label flex items-center gap-1" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <i className="ion-ios-call text-lg"></i> Telefone 3:
                                    </label>
                                    <input type="text" id="telefone3" name="contatoRequestDto.telefone3" value={formData.contatoRequestDto.telefone3 || ''} onChange={handleChange} maxLength={20} placeholder="Opcional" className="neumorphic-input" style={{fontFamily: 'Montserrat, sans-serif'}} />
                                </div>
                                <div className="md:col-span-6">
                                    <label htmlFor="outro" className="neumorphic-label flex items-center gap-1" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <i className="ion-ios-information text-lg"></i> Outro Contato:
                                    </label>
                                    <textarea id="outro" name="contatoRequestDto.outro" rows={2} value={formData.contatoRequestDto.outro || ''} onChange={handleChange} maxLength={100} placeholder="Rede social, recado, etc. (Opcional)" className="neumorphic-textarea" style={{fontFamily: 'Montserrat, sans-serif'}} />
                                </div>
                                <div className="md:col-span-6">
                                    <label htmlFor="observacaoContato" className="neumorphic-label flex items-center gap-1" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <i className="ion-ios-document text-lg"></i> Observação (Contato):
                                    </label>
                                    <textarea id="observacaoContato" name="contatoRequestDto.observacao" rows={2} value={formData.contatoRequestDto.observacao || ''} onChange={handleChange} maxLength={200} placeholder="Observações sobre o contato (Opcional)" className="neumorphic-textarea" style={{fontFamily: 'Montserrat, sans-serif'}} />
                                </div>
                                </div>
                        </fieldset>

                        <fieldset className="neumorphic-fieldset mb-6">
                            <legend className="neumorphic-legend" style={{fontFamily: 'Montserrat, sans-serif'}}>Endereço</legend>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="group">
                                    <label htmlFor="cep" className="neumorphic-label flex items-center gap-1" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <i className="ion-ios-location text-lg"></i> CEP: <span className="text-red-300">*</span>
                                    </label>
                                    <IMaskInput id="cep" name="enderecoRequestDto.cep" mask="00000-000" unmask={false} value={formData.enderecoRequestDto.cep} onAccept={handleCepChange} required placeholder="00000-000" className="neumorphic-input" style={{fontFamily: 'Montserrat, sans-serif'}} />
                                    <p className="mt-1 text-xs text-slate-300 invisible peer-invalid:visible">Campo obrigatório.</p>
                                </div>
                                <div className="group">
                                    <label htmlFor="numero" className="neumorphic-label flex items-center gap-1" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <i className="ion-ios-home text-lg"></i> Número: <span className="text-red-300">*</span>
                                    </label>
                                    <input type="number" id="numero" name="enderecoRequestDto.numero" value={formData.enderecoRequestDto.numero === 0 ? '' : formData.enderecoRequestDto.numero} onChange={e => setFormData(prev => ({ ...prev, enderecoRequestDto: { ...prev.enderecoRequestDto, numero: parseInt(e.target.value, 10) || 0 } }))} required min={1} max={9999999} placeholder="123" className="neumorphic-input" style={{fontFamily: 'Montserrat, sans-serif'}} />
                                    <p className="mt-1 text-xs text-slate-300 invisible peer-invalid:visible">Campo obrigatório.</p>
                                </div>
                                <div>
                                    <label htmlFor="complemento" className="neumorphic-label flex items-center gap-1" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <i className="ion-ios-home text-lg"></i> Complemento:
                                    </label>
                                    <input type="text" id="complemento" name="enderecoRequestDto.complemento" value={formData.enderecoRequestDto.complemento || ''} onChange={handleChange} maxLength={60} placeholder="Apto, bloco, etc. (Opcional)" className="neumorphic-input" style={{fontFamily: 'Montserrat, sans-serif'}} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="neumorphic-label" style={{fontFamily: 'Montserrat, sans-serif'}}>Logradouro:</label>
                                    <input type="text" value={logradouroApi} readOnly className="neumorphic-input" style={{fontFamily: 'Montserrat, sans-serif'}} aria-label="Logradouro preenchido automaticamente" />
                                </div>
                                <div>
                                    <label className="neumorphic-label" style={{fontFamily: 'Montserrat, sans-serif'}}>Bairro:</label>
                                    <input type="text" value={bairroApi} readOnly className="neumorphic-input" style={{fontFamily: 'Montserrat, sans-serif'}} aria-label="Bairro preenchido automaticamente" />
                                </div>
                                <div>
                                    <label className="neumorphic-label" style={{fontFamily: 'Montserrat, sans-serif'}}>Cidade:</label>
                                    <input type="text" value={cidadeApi} readOnly className="neumorphic-input" style={{fontFamily: 'Montserrat, sans-serif'}} placeholder={cidadeApi ? "" : "Preenchido automaticamente pelo CEP"} aria-label="Cidade preenchida automaticamente" />
                                </div>
                                <div>
                                    <label className="neumorphic-label" style={{fontFamily: 'Montserrat, sans-serif'}}>Estado (UF):</label>
                                    <input type="text" value={estadoApi} readOnly className="neumorphic-input" style={{fontFamily: 'Montserrat, sans-serif'}} placeholder={estadoApi ? "" : "Preenchido automaticamente pelo CEP"} aria-label="Estado preenchido automaticamente" />
                                </div>
                                <div>
                                    <label className="neumorphic-label" style={{fontFamily: 'Montserrat, sans-serif'}}>País:</label>
                                    <input type="text" value={paisApi} readOnly className="neumorphic-input" style={{fontFamily: 'Montserrat, sans-serif'}} aria-label="País preenchido automaticamente" />
                                </div>
                                <div className="md:col-span-3">
                                    <label htmlFor="observacaoEndereco" className="neumorphic-label flex items-center gap-1" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <i className="ion-ios-document text-lg"></i> Observação (Endereço):
                                    </label>
                                    <textarea id="observacaoEndereco" name="enderecoRequestDto.observacao" rows={2} value={formData.enderecoRequestDto.observacao || ''} onChange={handleChange} maxLength={200} placeholder="Ponto de referência (Opcional)" className="neumorphic-textarea" style={{fontFamily: 'Montserrat, sans-serif'}} />
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
                                    <i className="ion-ios-checkmark-circle text-xl"></i> <span style={{fontFamily: 'Montserrat, sans-serif'}}>{success}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <button type="submit" className="neumorphic-button-green" disabled={isLoading || isFetching || !!success}>
                                {isLoading ? (
                                    <><i className="ion-ios-sync animate-spin mr-2"></i> Salvando...</>
                                ) : (
                                    <><i className="ion-ios-save mr-2"></i> <span style={{fontFamily: 'Montserrat, sans-serif'}}>Salvar Alterações</span></>
                                )}
                            </button>
                            <Link href="/clientes/listar" className="neumorphic-button">
                                <i className="ion-ios-arrow-back mr-2"></i> <span style={{fontFamily: 'Montserrat, sans-serif'}}>Voltar para Lista</span>
                            </Link>
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