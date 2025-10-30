// src/app/clientes/alterar/[id]/page.tsx
"use client";
import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { IMaskInput } from 'react-imask';
import { 
    MdCheckCircle, MdDriveEta
} from 'react-icons/md';
import { 
    User, Mail, MapPin, Calendar, Briefcase,
    CreditCard, FileText, Info, Phone, Home, Building, Flag, Globe,
    ChevronLeft, ChevronRight
} from 'lucide-react';
import { ClienteRequestDto, ClienteResponseDto } from '@/types/cliente';
import { ClienteService } from '@/utils/api';
import '@/styles/neumorphic.css';

const cleanMaskedValue = (value: string): string => value.replace(/\D/g, '');

// Função para validar CPF
const validateCPF = (cpf: string): boolean => {
    const cleanCpf = cpf.replace(/\D/g, '');
    
    if (cleanCpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cleanCpf)) return false; // Todos os dígitos iguais
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cleanCpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cleanCpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf.charAt(10))) return false;
    
    return true;
};

// Função para validar CNPJ
const validateCNPJ = (cnpj: string): boolean => {
    const cleanCnpj = cnpj.replace(/\D/g, '');
    
    if (cleanCnpj.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(cleanCnpj)) return false; // Todos os dígitos iguais
    
    let sum = 0;
    let weight = 2;
    for (let i = 11; i >= 0; i--) {
        sum += parseInt(cleanCnpj.charAt(i)) * weight;
        weight = weight === 9 ? 2 : weight + 1;
    }
    let remainder = sum % 11;
    const digit1 = remainder < 2 ? 0 : 11 - remainder;
    
    if (digit1 !== parseInt(cleanCnpj.charAt(12))) return false;
    
    sum = 0;
    weight = 2;
    for (let i = 12; i >= 0; i--) {
        sum += parseInt(cleanCnpj.charAt(i)) * weight;
        weight = weight === 9 ? 2 : weight + 1;
    }
    remainder = sum % 11;
    const digit2 = remainder < 2 ? 0 : 11 - remainder;
    
    return digit2 === parseInt(cleanCnpj.charAt(13));
};

type TabType = 'dados-pessoais' | 'cnh' | 'contatos' | 'endereco';

export default function AlterarClientePage() {
    const params = useParams();
    const router = useRouter();
    const id = typeof params.id === 'string' ? parseInt(params.id, 10) : null;

    const initialState: ClienteRequestDto = {
        nome: "", sobrenome: "", sexo: "M", dataNascimento: "", cpf: "",
        profissao: "", estadoCivil: "Solteiro",
        enderecoRequestDto: { cep: "", numero: 0, complemento: "", observacao: "" },
        contatoRequestDto: {
            email: "", ddd: 0, ddi: 55, telefone1: "",
            telefone2: "", telefone3: "", celular: "",
            outro: "", observacao: "",
        },
        cnhRequestDto: {
            dataEmissao: "", dataValidade: "", numeroRegistro: "",
            categoria: "B"
        }
    };

    const [formData, setFormData] = useState<ClienteRequestDto>(initialState);
    const [activeTab, setActiveTab] = useState<TabType>('dados-pessoais');
    const [tipoDocumentoDisplay, setTipoDocumentoDisplay] = useState("CPF");
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
    const [fieldErrors, setFieldErrors] = useState<{[key: string]: boolean}>({});
    
    // Estados para dados do CEP
    const [logradouroViaCep, setLogradouroViaCep] = useState('');
    const [bairroViaCep, setBairroViaCep] = useState('');
    const [cidadeViaCep, setCidadeViaCep] = useState('');
    const [estadoViaCep, setEstadoViaCep] = useState('');
    const [paisViaCep, setPaisViaCep] = useState('Brasil');

    // Estado para data de cadastro (somente leitura)
    const [dataCadastro, setDataCadastro] = useState<string>('');

    const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
        { id: 'dados-pessoais', label: 'Dados Pessoais', icon: <User className="w-4 h-4" /> },
        { id: 'cnh', label: 'CNH', icon: <CreditCard className="w-4 h-4" /> },
        { id: 'contatos', label: 'Contatos', icon: <Mail className="w-4 h-4" /> },
        { id: 'endereco', label: 'Endereço', icon: <MapPin className="w-4 h-4" /> }
    ];


    const getFieldClasses = (fieldName: string, baseClasses: string = "neumorphic-input") => {
        const hasError = fieldErrors[fieldName];
        return hasError ? `${baseClasses} border-red-500 border-2` : baseClasses;
    };

    const setFieldError = (fieldName: string, hasError: boolean) => {
        setFieldErrors(prev => ({
            ...prev,
            [fieldName]: hasError
        }));
    };

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
                    cnhRequestDto: {
                        dataEmissao: data.cnhResponseDto?.dataEmissao ? data.cnhResponseDto.dataEmissao.split('T')[0] : '',
                        dataValidade: data.cnhResponseDto?.dataValidade ? data.cnhResponseDto.dataValidade.split('T')[0] : '',
                        numeroRegistro: data.cnhResponseDto?.numeroRegistro || '',
                        categoria: data.cnhResponseDto?.categoria as 'A' | 'B' | 'C' | 'D' | 'E' | 'AB' | 'AC' | 'AD' | 'AE' || 'B'
                    }
                });

                // Definir data de cadastro (somente leitura)
                setDataCadastro(data.dataCadastro ? data.dataCadastro.split('T')[0] : '');

                setTipoDocumentoDisplay(data.cpf?.length === 11 ? "CPF" : "CNPJ");

                // Preencher dados do CEP
                setLogradouroViaCep(data.enderecoResponseDto?.logradouro || '');
                setBairroViaCep(data.enderecoResponseDto?.bairro || '');
                setCidadeViaCep(data.enderecoResponseDto?.cidade || '');
                setEstadoViaCep(data.enderecoResponseDto?.estado || '');
                setPaisViaCep(data.enderecoResponseDto?.pais || 'Brasil');
            } catch (err: unknown) {
                const errorMessage = err && typeof err === 'object' && 'response' in err 
                    ? (err as { response: { data: { message?: string } } }).response?.data?.message
                    : err && typeof err === 'object' && 'message' in err 
                    ? (err as { message: string }).message
                    : "Falha ao carregar dados para edição.";
                setError(errorMessage || "Falha ao carregar dados para edição.");
            } finally {
                setIsFetching(false);
            }
        };
        fetchData();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFieldError(name, false); // Clear error when user starts typing
        
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent as keyof ClienteRequestDto]: {
                    ...((prev[parent as keyof ClienteRequestDto] as object) || {}),
                    [child]: value
                }
            }));
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
                if (data.erro) throw new Error('CEP não encontrado');
                
                setLogradouroViaCep(data.logradouro || '');
                setBairroViaCep(data.bairro || '');
                setCidadeViaCep(data.localidade || '');
                setEstadoViaCep(data.uf || '');
                setPaisViaCep('Brasil');
            } catch (err: unknown) {
                const errorMessage = err && typeof err === 'object' && 'message' in err 
                    ? (err as { message: string }).message
                    : "Erro desconhecido ao buscar CEP";
                setError(`Erro ao buscar CEP: ${errorMessage}`);
                setLogradouroViaCep(''); setBairroViaCep(''); setCidadeViaCep(''); setEstadoViaCep(''); setPaisViaCep('Brasil');
            }
        }
    };

    const validateCurrentTab = (): boolean => {
        const errors: {[key: string]: string} = {};
        
        switch (activeTab) {
            case 'dados-pessoais':
                if (!formData.nome.trim()) errors.nome = 'Nome é obrigatório';
                if (!formData.sobrenome.trim()) errors.sobrenome = 'Sobrenome é obrigatório';
                if (!formData.dataNascimento) errors.dataNascimento = 'Data de nascimento é obrigatória';
                if (!formData.cpf.trim()) errors.cpf = 'CPF/CNPJ é obrigatório';
                if (!formData.profissao.trim()) errors.profissao = 'Profissão é obrigatória';
                
                // Validação de CPF/CNPJ
                const cleanCpf = cleanMaskedValue(formData.cpf);
                if (cleanCpf.length !== 11 && tipoDocumentoDisplay === 'CPF') {
                    errors.cpf = 'CPF deve ter 11 dígitos';
                } else if (cleanCpf.length !== 14 && tipoDocumentoDisplay === 'CNPJ') {
                    errors.cpf = 'CNPJ deve ter 14 dígitos';
                } else if (cleanCpf.length === 11 && tipoDocumentoDisplay === 'CPF') {
                    if (!validateCPF(formData.cpf)) {
                        errors.cpf = 'CPF inválido';
                    }
                } else if (cleanCpf.length === 14 && tipoDocumentoDisplay === 'CNPJ') {
                    if (!validateCNPJ(formData.cpf)) {
                        errors.cpf = 'CNPJ inválido';
                    }
                }
                break;
                
            case 'cnh':
                if (!formData.cnhRequestDto.numeroRegistro.trim()) {
                    errors.numeroRegistro = 'Número de registro é obrigatório';
                }
                if (!formData.cnhRequestDto.dataEmissao) {
                    errors.dataEmissao = 'Data de emissão é obrigatória';
                }
                if (!formData.cnhRequestDto.dataValidade) {
                    errors.dataValidade = 'Data de validade é obrigatória';
                }
                if (formData.cnhRequestDto.dataEmissao && formData.cnhRequestDto.dataValidade) {
                    const dataEmissao = new Date(formData.cnhRequestDto.dataEmissao);
                    const dataValidade = new Date(formData.cnhRequestDto.dataValidade);
                    if (dataValidade <= dataEmissao) {
                        errors.dataValidade = 'Data de validade deve ser posterior à data de emissão';
                    }
                }
                break;
                
            case 'contatos':
                if (!formData.contatoRequestDto.email.trim()) {
                    errors.email = 'Email é obrigatório';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contatoRequestDto.email)) {
                    errors.email = 'Email inválido';
                }
                if (!formData.contatoRequestDto.celular.trim()) {
                    errors.celular = 'Celular é obrigatório';
                }
                if (!formData.contatoRequestDto.telefone1.trim()) {
                    errors.telefone1 = 'Telefone é obrigatório';
                }
                if (formData.contatoRequestDto.ddi === 0) {
                    errors.ddi = 'DDI é obrigatório';
                }
                break;
                
            case 'endereco':
                if (!formData.enderecoRequestDto.cep.trim()) {
                    errors.cep = 'CEP é obrigatório';
                } else if (cleanMaskedValue(formData.enderecoRequestDto.cep).length !== 8) {
                    errors.cep = 'CEP deve ter 8 dígitos';
                }
                if (formData.enderecoRequestDto.numero === 0) {
                    errors.numero = 'Número é obrigatório';
                }
                break;
        }
        
        setValidationErrors(errors);
        
        // Marcar campos com erro para styling
        const newFieldErrors: {[key: string]: boolean} = {};
        Object.keys(errors).forEach(key => {
            newFieldErrors[key] = true;
        });
        setFieldErrors(prev => ({ ...prev, ...newFieldErrors }));
        
        return Object.keys(errors).length === 0;
    };

    const nextTab = () => {
        if (validateCurrentTab()) {
            const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
            if (currentIndex < tabs.length - 1) {
                setActiveTab(tabs[currentIndex + 1].id);
            }
        }
    };

    const prevTab = () => {
        const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
        if (currentIndex > 0) {
            setActiveTab(tabs[currentIndex - 1].id);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        
        // Validar todas as abas antes de submeter
        let allValid = true;
        for (const tab of tabs) {
            setActiveTab(tab.id);
            if (!validateCurrentTab()) {
                allValid = false;
            }
        }
        
        if (!allValid) {
            setError('Por favor, corrija os erros em todas as abas antes de continuar.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await ClienteService.update(id!, formData);
            setSuccess('Cliente atualizado com sucesso!');
            setTimeout(() => {
                router.push('/clientes/listar');
            }, 2000);
        } catch (err: unknown) {
            console.error('Erro ao atualizar cliente:', err);
            
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as { response: { data: unknown, status: number } };
                const errorData = axiosError.response.data;
                
                if (errorData && typeof errorData === 'object' && 'validationErrors' in errorData) {
                    const validationMessages = Object.entries(errorData.validationErrors as Record<string, string>)
                        .map(([field, message]) => `${field}: ${message}`)
                        .join(', ');
                    setError(`❌ Dados inválidos: ${validationMessages}`);
                    const newFieldErrors: {[key: string]: boolean} = {};
                    Object.keys(errorData.validationErrors as Record<string, string>).forEach(key => {
                        newFieldErrors[key] = true;
                    });
                    setFieldErrors(newFieldErrors);
                } else if (errorData && typeof errorData === 'object' && 'message' in errorData) {
                    setError(`❌ ${errorData.message}`);
                } else if (errorData && typeof errorData === 'object' && 'error' in errorData) {
                    setError(`❌ ${errorData.error}`);
                } else {
                    setError(`❌ Erro ${axiosError.response.status}: Dados inválidos`);
                }
            } else if (err instanceof Error) {
                setError(`❌ Erro ao atualizar cliente: ${err.message}`);
            } else {
                setError('❌ Erro inesperado ao atualizar cliente.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
        <>
            <main className="flex justify-center items-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-mottu-light)] mx-auto"></div>
                        <p className="mt-4 text-white">Carregando dados do cliente...</p>
                    </div>
                </main>
            </>
        );
    }

    if (error && !formData.nome) {
        return (
            <>
                <main className="flex justify-center items-center min-h-screen p-4">
                    <div className="text-center bg-red-900/50 p-8 rounded-lg max-w-md">
                        <p className="text-red-400 mb-4">{error}</p>
                        <Link href="/clientes/listar" className="text-blue-400 hover:underline">
                            ← Voltar para lista de clientes
                        </Link>
                </div>
            </main>
        </>
    );
    }

    const cpfMask = "000.000.000-00";
    const cnpjMask = "00.000.000/0000-00";

    const renderTabContent = () => {
        switch (activeTab) {
            case 'dados-pessoais':
    return (
        <>
                        {/* Data de Cadastro - Campo isolado acima dos dados pessoais */}
                        <div className="mb-6">
                            <div className="neumorphic-card p-4">
                                <div className="group">
                                    <label htmlFor="dataCadastro" className="neumorphic-label flex items-center gap-2 text-lg font-semibold">
                                        <Calendar className="w-6 h-6 text-green-400" /> Data de Cadastro:
                                    </label>
                                    <input 
                                        type="date" id="dataCadastro" name="dataCadastro" 
                                        value={dataCadastro} 
                                        readOnly disabled
                                        className="neumorphic-input bg-gray-100 text-gray-600 cursor-not-allowed text-lg font-medium" 
                                    />
                                    <p className="mt-2 text-sm text-gray-500 font-medium">📅 Data de cadastro (não editável)</p>
                                </div>
                            </div>
                        </div>

                        <fieldset className="neumorphic-fieldset">
                            <legend className="neumorphic-legend">Dados Pessoais</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="group">
                                    <label htmlFor="nome" className="neumorphic-label flex items-center gap-2">
                                        <User className="w-5 h-5 text-blue-400" /> Nome: <span className="text-red-300">*</span>
                                    </label>
                                    <input 
                                        id="nome" type="text" name="nome" value={formData.nome} 
                                        onChange={handleChange} required maxLength={100} 
                                        placeholder="Ex: João" className={getFieldClasses('nome')} 
                                    />
                                    {validationErrors.nome && (
                                        <p className="mt-1 text-xs text-red-400">{validationErrors.nome}</p>
                                    )}
                                </div>
                                <div className="group">
                                    <label htmlFor="sobrenome" className="neumorphic-label flex items-center gap-2">
                                        <User className="w-5 h-5 text-blue-400" /> Sobrenome: <span className="text-red-300">*</span>
                                    </label>
                                    <input 
                                        id="sobrenome" type="text" name="sobrenome" value={formData.sobrenome} 
                                        onChange={handleChange} required maxLength={100} 
                                        placeholder="Ex: da Silva" className={getFieldClasses('sobrenome')} 
                                    />
                                    {validationErrors.sobrenome && (
                                        <p className="mt-1 text-xs text-red-400">{validationErrors.sobrenome}</p>
                                    )}
                                </div>
                                <div className="group">
                                    <label htmlFor="sexo" className="neumorphic-label flex items-center gap-2">
                                        <User className="w-5 h-5 text-pink-400" /> Sexo: <span className="text-red-300">*</span>
                                    </label>
                                    <select id="sexo" name="sexo" value={formData.sexo} onChange={handleChange} required className="neumorphic-select">
                                        <option value="M">Masculino</option>
                                        <option value="F">Feminino</option>
                                    </select>
                                </div>
                                <div className="group">
                                    <label htmlFor="dataNascimento" className="neumorphic-label flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-yellow-400" /> Nascimento: <span className="text-red-300">*</span>
                                    </label>
                                    <input 
                                        type="date" id="dataNascimento" name="dataNascimento" 
                                        value={formData.dataNascimento} onChange={handleChange} required 
                                        className={`neumorphic-input date-input-fix ${validationErrors.dataNascimento ? 'border-red-500' : ''}`} 
                                    />
                                    {validationErrors.dataNascimento && (
                                        <p className="mt-1 text-xs text-red-400">{validationErrors.dataNascimento}</p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="tipoDocumentoDisplay" className="neumorphic-label flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-orange-400" /> Documento: <span className="text-red-300">*</span>
                                    </label>
                                    <select 
                                        id="tipoDocumentoDisplay" name="tipoDocumentoDisplay" 
                                        value={tipoDocumentoDisplay} 
                                        onChange={e => {
                                            setTipoDocumentoDisplay(e.target.value);
                                            setFormData(prev => ({ ...prev, cpf: '' }));
                                        }}
                                        className="neumorphic-select"
                                    >
                                        <option value="CPF">CPF</option>
                                        <option value="CNPJ">CNPJ</option>
                                    </select>
                                </div>
                                <div className="group">
                                    <label htmlFor="cpf" className="neumorphic-label flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-orange-400" /> Número: <span className="text-red-300">*</span>
                                    </label>
                                    <IMaskInput
                                        mask={tipoDocumentoDisplay === 'CPF' ? cpfMask : cnpjMask}
                                        value={formData.cpf}
                                        onAccept={(value) => setFormData(prev => ({ ...prev, cpf: value }))}
                                        className={getFieldClasses('cpf')}
                                        placeholder={tipoDocumentoDisplay === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00'}
                                    />
                                    {validationErrors.cpf && (
                                        <p className="mt-1 text-xs text-red-400">{validationErrors.cpf}</p>
                                    )}
                                </div>
                                <div className="group">
                                    <label htmlFor="profissao" className="neumorphic-label flex items-center gap-2">
                                        <Briefcase className="w-5 h-5 text-indigo-400" /> Profissão: <span className="text-red-300">*</span>
                                    </label>
                                    <input 
                                        id="profissao" type="text" name="profissao" value={formData.profissao} 
                                        onChange={handleChange} required maxLength={100} 
                                        placeholder="Ex: Engenheiro" className={getFieldClasses('profissao')} 
                                    />
                                    {validationErrors.profissao && (
                                        <p className="mt-1 text-xs text-red-400">{validationErrors.profissao}</p>
                                    )}
                                </div>
                                <div className="group">
                                    <label htmlFor="estadoCivil" className="neumorphic-label flex items-center gap-2">
                                        <User className="w-5 h-5 text-purple-400" /> Estado Civil: <span className="text-red-300">*</span>
                                    </label>
                                    <select id="estadoCivil" name="estadoCivil" value={formData.estadoCivil} onChange={handleChange} required className="neumorphic-select">
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
                    </>
                );

            case 'cnh':
                return (
                    <fieldset className="neumorphic-fieldset">
                        <legend className="neumorphic-legend">Dados da CNH</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="group">
                                <label htmlFor="numeroRegistro" className="neumorphic-label flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-purple-400" /> Número de Registro: <span className="text-red-300">*</span>
                                </label>
                                <input 
                                    id="numeroRegistro" type="text" name="cnhRequestDto.numeroRegistro" 
                                    value={formData.cnhRequestDto.numeroRegistro} onChange={handleChange} required 
                                    maxLength={20} placeholder="Ex: 12345678901" 
                                    className={getFieldClasses('numeroRegistro')} 
                                />
                                {validationErrors.numeroRegistro && (
                                    <p className="mt-1 text-xs text-red-400">{validationErrors.numeroRegistro}</p>
                                )}
                            </div>
                            <div className="group">
                                <label htmlFor="categoria" className="neumorphic-label flex items-center gap-2">
                                    <MdDriveEta className="w-5 h-5 text-green-400" /> Categoria:
                                </label>
                                <select 
                                    id="categoria" name="cnhRequestDto.categoria" 
                                    value={formData.cnhRequestDto.categoria} onChange={handleChange} 
                                    className="neumorphic-select"
                                >
                                    <option value="A">A - Moto</option>
                                    <option value="B">B - Carro</option>
                                    <option value="C">C - Caminhão</option>
                                    <option value="D">D - Ônibus</option>
                                    <option value="E">E - Carreta</option>
                                    <option value="AB">AB - Moto + Carro</option>
                                    <option value="AC">AC - Moto + Caminhão</option>
                                    <option value="AD">AD - Moto + Ônibus</option>
                                    <option value="AE">AE - Moto + Carreta</option>
                                </select>
                            </div>
                            <div className="group">
                                <label htmlFor="dataEmissao" className="neumorphic-label flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-blue-400" /> Data de Emissão: <span className="text-red-300">*</span>
                                </label>
                                <input 
                                    type="date" id="dataEmissao" name="cnhRequestDto.dataEmissao" 
                                    value={formData.cnhRequestDto.dataEmissao} onChange={handleChange} required 
                                    className={`neumorphic-input date-input-fix ${validationErrors.dataEmissao ? 'border-red-500' : ''}`} 
                                />
                                {validationErrors.dataEmissao && (
                                    <p className="mt-1 text-xs text-red-400">{validationErrors.dataEmissao}</p>
                                )}
                            </div>
                            <div className="group">
                                <label htmlFor="dataValidade" className="neumorphic-label flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-red-400" /> Data de Validade: <span className="text-red-300">*</span>
                                </label>
                                <input 
                                    type="date" id="dataValidade" name="cnhRequestDto.dataValidade" 
                                    value={formData.cnhRequestDto.dataValidade} onChange={handleChange} required 
                                    className={`neumorphic-input date-input-fix ${validationErrors.dataValidade ? 'border-red-500' : ''}`} 
                                />
                                {validationErrors.dataValidade && (
                                    <p className="mt-1 text-xs text-red-400">{validationErrors.dataValidade}</p>
                                )}
                            </div>
                        </div>
                    </fieldset>
                );

            case 'contatos':
                return (
                    <fieldset className="neumorphic-fieldset">
                        <legend className="neumorphic-legend">Dados de Contato</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="group">
                                <label htmlFor="email" className="neumorphic-label flex items-center gap-2">
                                    <Mail className="w-5 h-5 text-green-400" /> Email: <span className="text-red-300">*</span>
                                    </label>
                                <input 
                                    id="email" type="email" name="contatoRequestDto.email" 
                                    value={formData.contatoRequestDto.email} onChange={handleChange} required 
                                    maxLength={100} placeholder="Ex: joao@email.com" 
                                    className={getFieldClasses('email')} 
                                />
                                {validationErrors.email && (
                                    <p className="mt-1 text-xs text-red-400">{validationErrors.email}</p>
                                )}
                                </div>
                            <div className="group">
                                <label htmlFor="celular" className="neumorphic-label flex items-center gap-2">
                                        <Phone className="w-5 h-5 text-green-400" /> Celular: <span className="text-red-300">*</span>
                                    </label>
                                <input 
                                    id="celular" type="text" name="contatoRequestDto.celular" 
                                    value={formData.contatoRequestDto.celular} onChange={handleChange} required 
                                    maxLength={20} placeholder="Ex: (11) 99999-9999" 
                                    className={getFieldClasses('celular')} 
                                />
                                {validationErrors.celular && (
                                    <p className="mt-1 text-xs text-red-400">{validationErrors.celular}</p>
                                )}
                                </div>
                            <div className="group">
                                <label htmlFor="telefone1" className="neumorphic-label flex items-center gap-2">
                                    <Phone className="w-5 h-5 text-green-400" /> Telefone: <span className="text-red-300">*</span>
                                    </label>
                                <input 
                                    id="telefone1" type="text" name="contatoRequestDto.telefone1" 
                                    value={formData.contatoRequestDto.telefone1} onChange={handleChange} required 
                                    maxLength={20} placeholder="Ex: (11) 3333-4444" 
                                    className={getFieldClasses('telefone1')} 
                                />
                                {validationErrors.telefone1 && (
                                    <p className="mt-1 text-xs text-red-400">{validationErrors.telefone1}</p>
                                )}
                                </div>
                            <div className="group">
                                <label htmlFor="telefone2" className="neumorphic-label flex items-center gap-2">
                                    <Phone className="w-5 h-5 text-blue-400" /> Telefone 2:
                                    </label>
                                <IMaskInput
                                    mask="(00) 0000-0000"
                                    value={formData.contatoRequestDto.telefone2}
                                    onAccept={(value) => setFormData(prev => ({ 
                                        ...prev, 
                                        contatoRequestDto: { ...prev.contatoRequestDto, telefone2: value }
                                    }))}
                                    className="neumorphic-input"
                                    placeholder="(11) 3333-4444"
                                />
                                </div>
                            <div className="group">
                                <label htmlFor="telefone3" className="neumorphic-label flex items-center gap-2">
                                    <Phone className="w-5 h-5 text-purple-400" /> Telefone 3:
                                    </label>
                                <IMaskInput
                                    mask="(00) 0000-0000"
                                    value={formData.contatoRequestDto.telefone3}
                                    onAccept={(value) => setFormData(prev => ({ 
                                        ...prev, 
                                        contatoRequestDto: { ...prev.contatoRequestDto, telefone3: value }
                                    }))}
                                    className="neumorphic-input"
                                    placeholder="(11) 3333-4444"
                                />
                                </div>
                            <div className="group">
                                <label htmlFor="ddi" className="neumorphic-label flex items-center gap-2">
                                    <Globe className="w-5 h-5 text-green-400" /> DDI: <span className="text-red-300">*</span>
                                    </label>
                                <input 
                                    id="ddi" type="number" name="contatoRequestDto.ddi" 
                                    value={formData.contatoRequestDto.ddi} onChange={handleChange} required 
                                    min="1" max="999" placeholder="Ex: 55" 
                                    className={getFieldClasses('ddi')} 
                                />
                                {validationErrors.ddi && (
                                    <p className="mt-1 text-xs text-red-400">{validationErrors.ddi}</p>
                                )}
                                </div>
                            <div className="group">
                                <label htmlFor="ddd" className="neumorphic-label flex items-center gap-2">
                                    <Phone className="w-5 h-5 text-green-400" /> DDD:
                                    </label>
                                <input 
                                    id="ddd" type="number" name="contatoRequestDto.ddd" 
                                    value={formData.contatoRequestDto.ddd} onChange={handleChange} 
                                    min="11" max="99" placeholder="Ex: 11" 
                                    className="neumorphic-input" 
                                />
                                </div>
                            <div className="group md:col-span-2">
                                <label htmlFor="outro" className="neumorphic-label flex items-center gap-2">
                                    <Info className="w-5 h-5 text-gray-400" /> Outro:
                                    </label>
                                <input 
                                    id="outro" type="text" name="contatoRequestDto.outro" 
                                    value={formData.contatoRequestDto.outro} onChange={handleChange} 
                                    maxLength={100} placeholder="Ex: WhatsApp, Telegram" 
                                    className="neumorphic-input" 
                                />
                                </div>
                            <div className="group md:col-span-2">
                                <label htmlFor="observacao" className="neumorphic-label flex items-center gap-2">
                                    <Info className="w-5 h-5 text-gray-400" /> Observação:
                                    </label>
                                <textarea 
                                    id="observacao" name="contatoRequestDto.observacao" 
                                    value={formData.contatoRequestDto.observacao} onChange={handleChange} 
                                    maxLength={500} placeholder="Informações adicionais sobre o contato" 
                                    className="neumorphic-input" rows={3}
                                />
                                </div>
                                </div>
                        </fieldset>
                );

            case 'endereco':
                return (
                    <fieldset className="neumorphic-fieldset">
                        <legend className="neumorphic-legend">Dados de Endereço</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="group">
                                <label htmlFor="cep" className="neumorphic-label flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-red-400" /> CEP: <span className="text-red-300">*</span>
                                    </label>
                                <IMaskInput
                                    mask="00000-000"
                                    value={formData.enderecoRequestDto.cep}
                                    onAccept={(value) => {
                                        setFormData(prev => ({ 
                                            ...prev, 
                                            enderecoRequestDto: { ...prev.enderecoRequestDto, cep: value }
                                        }));
                                        fetchCepDetails(value);
                                    }}
                                    className={getFieldClasses('cep')}
                                    placeholder="00000-000"
                                />
                                {validationErrors.cep && (
                                    <p className="mt-1 text-xs text-red-400">{validationErrors.cep}</p>
                                )}
                                </div>
                                <div className="group">
                                <label htmlFor="numero" className="neumorphic-label flex items-center gap-2">
                                    <Home className="w-5 h-5 text-red-400" /> Número: <span className="text-red-300">*</span>
                                    </label>
                                <input 
                                    id="numero" type="number" name="enderecoRequestDto.numero" 
                                    value={formData.enderecoRequestDto.numero} onChange={handleChange} required 
                                    min="1" placeholder="Ex: 123" 
                                    className={getFieldClasses('numero')} 
                                />
                                {validationErrors.numero && (
                                    <p className="mt-1 text-xs text-red-400">{validationErrors.numero}</p>
                                )}
                                </div>
                            <div className="group md:col-span-2">
                                <label htmlFor="logradouro" className="neumorphic-label flex items-center gap-2">
                                    <Building className="w-5 h-5 text-red-400" /> Logradouro:
                                    </label>
                                <input 
                                    id="logradouro" type="text" value={logradouroViaCep} 
                                    readOnly className="neumorphic-input bg-gray-100 text-gray-600 cursor-not-allowed" 
                                    placeholder="Preenchido automaticamente pelo CEP"
                                />
                                </div>
                            <div className="group">
                                <label htmlFor="bairro" className="neumorphic-label flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-red-400" /> Bairro:
                                </label>
                                <input 
                                    id="bairro" type="text" value={bairroViaCep} 
                                    readOnly className="neumorphic-input bg-gray-100 text-gray-600 cursor-not-allowed" 
                                    placeholder="Preenchido automaticamente pelo CEP"
                                />
                                </div>
                            <div className="group">
                                <label htmlFor="cidade" className="neumorphic-label flex items-center gap-2">
                                    <Building className="w-5 h-5 text-red-400" /> Cidade:
                                </label>
                                <input 
                                    id="cidade" type="text" value={cidadeViaCep} 
                                    readOnly className="neumorphic-input bg-gray-100 text-gray-600 cursor-not-allowed" 
                                    placeholder="Preenchido automaticamente pelo CEP"
                                />
                                </div>
                            <div className="group">
                                <label htmlFor="estado" className="neumorphic-label flex items-center gap-2">
                                    <Flag className="w-5 h-5 text-red-400" /> Estado:
                                </label>
                                <input 
                                    id="estado" type="text" value={estadoViaCep} 
                                    readOnly className="neumorphic-input bg-gray-100 text-gray-600 cursor-not-allowed" 
                                    placeholder="Preenchido automaticamente pelo CEP"
                                />
                                </div>
                            <div className="group">
                                <label htmlFor="pais" className="neumorphic-label flex items-center gap-2">
                                    <Globe className="w-5 h-5 text-red-400" /> País:
                                </label>
                                <input 
                                    id="pais" type="text" value={paisViaCep} 
                                    readOnly className="neumorphic-input bg-gray-100 text-gray-600 cursor-not-allowed" 
                                    placeholder="Preenchido automaticamente pelo CEP"
                                />
                                </div>
                            <div className="group md:col-span-2">
                                <label htmlFor="complemento" className="neumorphic-label flex items-center gap-2">
                                    <Info className="w-5 h-5 text-gray-400" /> Complemento:
                                </label>
                                <input 
                                    id="complemento" type="text" name="enderecoRequestDto.complemento" 
                                    value={formData.enderecoRequestDto.complemento} onChange={handleChange} 
                                    maxLength={100} placeholder="Ex: Apartamento 101, Bloco A" 
                                    className="neumorphic-input" 
                                />
                                </div>
                            <div className="group md:col-span-2">
                                <label htmlFor="observacaoEndereco" className="neumorphic-label flex items-center gap-2">
                                    <Info className="w-5 h-5 text-gray-400" /> Observação:
                                    </label>
                                <textarea 
                                    id="observacaoEndereco" name="enderecoRequestDto.observacao" 
                                    value={formData.enderecoRequestDto.observacao} onChange={handleChange} 
                                    maxLength={500} placeholder="Informações adicionais sobre o endereço" 
                                    className="neumorphic-input" rows={3}
                                />
                                </div>
                            </div>
                        </fieldset>
                );

            default:
                return null;
        }
    };

    return (
        <>
            <main className="min-h-screen text-white p-4 md:p-8">
                <div className="container max-w-4xl mx-auto neumorphic-container p-6 md:p-8">
                    <div className="mb-8">
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Alterar Cliente (ID: {id})</h1>
                        <p className="text-slate-300">Edite as informações do cliente</p>
                    </div>

                            {error && (
                        <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
                            <p className="text-red-400">{error}</p>
                                </div>
                            )}

                            {success && (
                        <div className="mb-6 p-4 bg-green-900/20 border border-green-500/50 rounded-lg">
                            <p className="text-green-400">{success}</p>
                                </div>
                            )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Tabs */}
                    <div className="neumorphic-card p-6">
                        <div className="flex flex-wrap gap-2 mb-6">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                        activeTab === tab.id
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="min-h-[400px]">
                            {renderTabContent()}
                        </div>

                        {/* Validation Errors */}
                        {Object.keys(validationErrors).length > 0 && (
                            <div className="mt-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
                                <h4 className="font-medium text-red-400 mb-2">Corrija os seguintes erros:</h4>
                                <ul className="text-sm text-red-300 space-y-1">
                                    {Object.entries(validationErrors).map(([field, message]) => (
                                        <li key={field}>• {message}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-700">
                            <button
                                type="button"
                                onClick={prevTab}
                                disabled={tabs.findIndex(tab => tab.id === activeTab) === 0}
                                className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Anterior
                            </button>

                            <div className="flex items-center gap-2">
                                {tabs.map((tab, index) => (
                                    <div
                                        key={tab.id}
                                        className={`w-3 h-3 rounded-full ${
                                            tabs.findIndex(t => t.id === activeTab) >= index
                                                ? 'bg-blue-500'
                                                : 'bg-gray-300'
                                        }`}
                                    />
                                ))}
                            </div>

                            {activeTab === tabs[tabs.length - 1].id ? (
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="neumorphic-button-green"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Salvando...
                                        </>
                                    ) : (
                                        <>
                                            <MdCheckCircle className="w-4 h-4" />
                                            Salvar Alterações
                                        </>
                                    )}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={nextTab}
                                    className="neumorphic-button"
                                >
                                    Próximo
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
}