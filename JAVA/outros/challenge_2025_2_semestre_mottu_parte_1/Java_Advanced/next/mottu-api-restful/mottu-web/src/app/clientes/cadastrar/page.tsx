// src/app/clientes/cadastrar/page.tsx
"use client";
import { useState, FormEvent } from 'react';
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
import { ClienteRequestDto } from '@/types/cliente';
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
    
    let length = cleanCnpj.length - 2;
    let numbers = cleanCnpj.substring(0, length);
    let digits = cleanCnpj.substring(length);
    let sum = 0;
    let pos = length - 7;
    
    for (let i = length; i >= 1; i--) {
        sum += parseInt(numbers.charAt(length - i)) * pos--;
        if (pos < 2) pos = 9;
    }
    
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;
    
    length = length + 1;
    numbers = cleanCnpj.substring(0, length);
    sum = 0;
    pos = length - 7;
    
    for (let i = length; i >= 1; i--) {
        sum += parseInt(numbers.charAt(length - i)) * pos--;
        if (pos < 2) pos = 9;
    }
    
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) return false;
    
    return true;
};

type TabType = 'dados-pessoais' | 'cnh' | 'contatos' | 'endereco';

export default function CadastrarClientePage() {
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
    const [tipoDocumentoDisplay, setTipoDocumentoDisplay] = useState("CPF");
    const [activeTab, setActiveTab] = useState<TabType>('dados-pessoais');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
    const [fieldErrors, setFieldErrors] = useState<{[key: string]: boolean}>({});
    const [logradouroViaCep, setLogradouroViaCep] = useState('');
    const [bairroViaCep, setBairroViaCep] = useState('');
    const [cidadeViaCep, setCidadeViaCep] = useState('');
    const [estadoViaCep, setEstadoViaCep] = useState('');
    const [paisViaCep, setPaisViaCep] = useState('Brasil');

    const tabs = [
        { id: 'dados-pessoais' as TabType, label: 'Dados Pessoais', icon: <User className="w-5 h-5" /> },
        { id: 'cnh' as TabType, label: 'CNH', icon: <MdDriveEta className="w-5 h-5" /> },
        { id: 'contatos' as TabType, label: 'Contatos', icon: <Phone className="w-5 h-5" /> },
        { id: 'endereco' as TabType, label: 'Endereço', icon: <MapPin className="w-5 h-5" /> }
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        // Limpar erro do campo quando usuário começar a digitar
        setFieldError(name, false);
        
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
        setValidationErrors({});
        setFieldErrors({});
        setLogradouroViaCep(''); setBairroViaCep(''); setCidadeViaCep(''); setEstadoViaCep(''); setPaisViaCep('Brasil');
    };

    // Função para obter classes CSS baseadas no estado de erro do campo
    const getFieldClasses = (fieldName: string, baseClasses: string = "neumorphic-input") => {
        const hasError = fieldErrors[fieldName];
        return hasError ? `${baseClasses} border-red-500 border-2` : baseClasses;
    };

    // Função para marcar campo como com erro
    const setFieldError = (fieldName: string, hasError: boolean) => {
        setFieldErrors(prev => ({
            ...prev,
            [fieldName]: hasError
        }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        // Validar todas as abas antes de enviar
        const allTabsValid = tabs.every(tab => {
            const originalTab = activeTab;
            setActiveTab(tab.id);
            const isValid = validateCurrentTab();
            setActiveTab(originalTab);
            return isValid;
        });
        
        if (!allTabsValid) {
            setError('❌ Por favor, preencha todos os campos obrigatórios em todas as abas antes de salvar.');
            return;
        }
        
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
            },
            cnhRequestDto: {
                ...formData.cnhRequestDto,
                numeroRegistro: cleanMaskedValue(formData.cnhRequestDto.numeroRegistro),
                // clienteId será definido automaticamente pelo backend
            }
        };

        try {
            const response = await ClienteService.create(clienteDataToSend);
            setSuccess(`✅ Cliente "${response.nome} ${response.sobrenome}" (ID: ${response.idCliente}) cadastrado com sucesso!`);
            resetForm();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: unknown) {
            console.error('Erro ao criar cliente:', err);
            
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as { response: { data: any, status: number } };
                const errorData = axiosError.response.data;
                
                if (errorData.validationErrors) {
                    // Erros de validação específicos
                    const validationMessages = Object.entries(errorData.validationErrors)
                        .map(([field, message]) => `${field}: ${message}`)
                        .join(', ');
                    setError(`❌ Dados inválidos: ${validationMessages}`);
                } else if (errorData.message) {
                    setError(`❌ ${errorData.message}`);
                } else if (errorData.error) {
                    setError(`❌ ${errorData.error}`);
                } else {
                    setError(`❌ Erro ${axiosError.response.status}: Dados inválidos`);
                }
            } else if (err instanceof Error) {
                setError(`❌ Erro ao criar cliente: ${err.message}`);
            } else {
                setError('❌ Erro inesperado ao criar cliente.');
            }
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
            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
                setError(`Erro ViaCEP: ${errorMessage}`);
                setLogradouroViaCep(''); setBairroViaCep(''); setCidadeViaCep(''); setEstadoViaCep(''); setPaisViaCep('Brasil');
            }
        }
    };

    const handleCepChange = (value: string) => {
        setFormData(prev => ({ ...prev, enderecoRequestDto: { ...prev.enderecoRequestDto, cep: value } }));
        fetchCepDetails(value);
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
                
                // Validação do número de registro
                const cleanRegistro = cleanMaskedValue(formData.cnhRequestDto.numeroRegistro);
                if (cleanRegistro.length !== 11) {
                    errors.numeroRegistro = 'Número de registro deve ter 11 dígitos';
                }
                
                // Validação de datas
                if (formData.cnhRequestDto.dataEmissao && formData.cnhRequestDto.dataValidade) {
                    const emissao = new Date(formData.cnhRequestDto.dataEmissao);
                    const validade = new Date(formData.cnhRequestDto.dataValidade);
                    if (emissao >= validade) {
                        errors.dataValidade = 'Data de validade deve ser posterior à data de emissão';
                    }
                }
                break;
                
            case 'contatos':
                if (!formData.contatoRequestDto.email.trim()) {
                    errors.email = 'E-mail é obrigatório';
                } else if (!/\S+@\S+\.\S+/.test(formData.contatoRequestDto.email)) {
                    errors.email = 'E-mail inválido';
                }
                
                if (!formData.contatoRequestDto.celular.trim()) {
                    errors.celular = 'Celular é obrigatório';
                }
                
                if (!formData.contatoRequestDto.telefone1.trim()) {
                    errors.telefone1 = 'Telefone fixo é obrigatório';
                }
                
                if (formData.contatoRequestDto.ddd === 0) {
                    errors.ddd = 'DDD é obrigatório';
                }
                
                if (formData.contatoRequestDto.ddi === 0) {
                    errors.ddi = 'DDI é obrigatório';
                }
                break;
                
            case 'endereco':
                if (!formData.enderecoRequestDto.cep.trim()) {
                    errors.cep = 'CEP é obrigatório';
                } else {
                    const cleanCep = cleanMaskedValue(formData.enderecoRequestDto.cep);
                    if (cleanCep.length !== 8) {
                        errors.cep = 'CEP deve ter 8 dígitos';
                    }
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

    const navigateTab = (direction: 'prev' | 'next') => {
        const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
        
        if (direction === 'next') {
            // Validar aba atual antes de avançar
            if (!validateCurrentTab()) {
                return; // Não avança se houver erros
            }
        }
        
        if (direction === 'prev' && currentIndex > 0) {
            setActiveTab(tabs[currentIndex - 1].id);
            setValidationErrors({}); // Limpar erros ao voltar
        } else if (direction === 'next' && currentIndex < tabs.length - 1) {
            setActiveTab(tabs[currentIndex + 1].id);
            setValidationErrors({}); // Limpar erros ao avançar
        }
    };

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
                                        value={new Date().toISOString().split('T')[0]} 
                                        readOnly disabled
                                        className="neumorphic-input bg-gray-100 text-gray-600 cursor-not-allowed text-lg font-medium" 
                                    />
                                    <p className="mt-2 text-sm text-gray-500 font-medium">📅 Preenchido automaticamente pelo sistema</p>
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
                            <div>
                                <label htmlFor="sexo" className="neumorphic-label flex items-center gap-2">
                                    <Info className="w-5 h-5 text-purple-400" /> Sexo: <span className="text-red-300">*</span>
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
                                    required className="neumorphic-select"
                                >
                                    <option value="CPF">CPF</option>
                                    <option value="CNPJ">CNPJ</option>
                                </select>
                            </div>
                            <div className="group">
                                <label htmlFor="cpf" className="neumorphic-label flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-red-400" /> Número: <span className="text-red-300">*</span>
                                </label>
                                <IMaskInput 
                                    id="cpf" name="cpf" 
                                    mask={tipoDocumentoDisplay === 'CPF' ? cpfMask : cnpjMask} 
                                    unmask={false} value={formData.cpf} 
                                    onAccept={(value: string) => {
                                        setFieldError('cpf', false);
                                        setFormData(prev => ({ ...prev, cpf: value }));
                                    }} 
                                    required 
                                    placeholder={tipoDocumentoDisplay === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00'} 
                                    className={getFieldClasses('cpf')} 
                                />
                                {validationErrors.cpf && (
                                    <p className="mt-1 text-xs text-red-400">{validationErrors.cpf}</p>
                                )}
                            </div>
                            <div className="group">
                                <label htmlFor="profissao" className="neumorphic-label flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-green-400" /> Profissão: <span className="text-red-300">*</span>
                                </label>
                                <input 
                                    type="text" id="profissao" name="profissao" value={formData.profissao} 
                                    onChange={handleChange} required maxLength={50} 
                                    placeholder="Ex: Desenvolvedor(a)" className={`neumorphic-input ${validationErrors.profissao ? 'border-red-500' : ''}`} 
                                />
                                {validationErrors.profissao && (
                                    <p className="mt-1 text-xs text-red-400">{validationErrors.profissao}</p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="estadoCivil" className="neumorphic-label flex items-center gap-2">
                                    <Info className="w-5 h-5 text-purple-400" /> Estado Civil: <span className="text-red-300">*</span>
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
                                    <MdDriveEta className="w-5 h-5 text-blue-400" /> Número de Registro: <span className="text-red-300">*</span>
                                </label>
                                <IMaskInput 
                                    id="numeroRegistro" name="cnhRequestDto.numeroRegistro" 
                                    mask="00000000000" unmask={false} 
                                    value={formData.cnhRequestDto.numeroRegistro} 
                                    onAccept={(value: string) => {
                                        setFieldError('numeroRegistro', false);
                                        setFormData(prev => ({ 
                                            ...prev, 
                                            cnhRequestDto: { ...prev.cnhRequestDto, numeroRegistro: value } 
                                        }));
                                    }} 
                                    required placeholder="12345678901" 
                                    className={getFieldClasses('numeroRegistro')} 
                                />
                                {validationErrors.numeroRegistro && (
                                    <p className="mt-1 text-xs text-red-400">{validationErrors.numeroRegistro}</p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="categoria" className="neumorphic-label flex items-center gap-2">
                                    <MdDriveEta className="w-5 h-5 text-green-400" /> Categoria: <span className="text-red-300">*</span>
                                </label>
                                <select 
                                    id="categoria" name="cnhRequestDto.categoria" 
                                    value={formData.cnhRequestDto.categoria} 
                                    onChange={handleChange} required className="neumorphic-select"
                                >
                                    <option value="A">A - Motocicleta</option>
                                    <option value="B">B - Carro</option>
                                    <option value="C">C - Caminhão</option>
                                    <option value="D">D - Ônibus</option>
                                    <option value="E">E - Carreta</option>
                                    <option value="AB">AB - Moto e Carro</option>
                                    <option value="AC">AC - Moto e Caminhão</option>
                                    <option value="AD">AD - Moto e Ônibus</option>
                                    <option value="AE">AE - Moto e Carreta</option>
                                </select>
                            </div>
                            <div className="group">
                                <label htmlFor="dataEmissao" className="neumorphic-label flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-yellow-400" /> Data de Emissão: <span className="text-red-300">*</span>
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
                        <legend className="neumorphic-legend">Contatos</legend>
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                            <div className="group md:col-span-4">
                                <label htmlFor="email" className="neumorphic-label flex items-center gap-2">
                                    <Mail className="w-5 h-5 text-cyan-400" /> E-mail: <span className="text-red-300">*</span>
                                </label>
                                <input 
                                    type="email" id="email" name="contatoRequestDto.email" 
                                    value={formData.contatoRequestDto.email} onChange={handleChange} required 
                                    placeholder="exemplo@dominio.com" className={getFieldClasses('email')} 
                                />
                                {validationErrors.email && (
                                    <p className="mt-1 text-xs text-red-400">{validationErrors.email}</p>
                                )}
                            </div>
                            <div className="group md:col-span-2">
                                <label htmlFor="celular" className="neumorphic-label flex items-center gap-2">
                                    <Phone className="w-5 h-5 text-green-400" /> Celular: <span className="text-red-300">*</span>
                                </label>
                                <IMaskInput 
                                    id="celular" name="contatoRequestDto.celular" 
                                    mask="(00) 00000-0000" unmask={false} 
                                    value={formData.contatoRequestDto.celular} 
                                    onAccept={(value: string) => setFormData(prev => ({ 
                                        ...prev, 
                                        contatoRequestDto: { ...prev.contatoRequestDto, celular: value } 
                                    }))} 
                                    required placeholder="(11) 98765-4321" className={`neumorphic-input ${validationErrors.celular ? 'border-red-500' : ''}`} 
                                />
                                {validationErrors.celular && (
                                    <p className="mt-1 text-xs text-red-400">{validationErrors.celular}</p>
                                )}
                            </div>
                            <div className="group md:col-span-1">
                                <label htmlFor="ddi" className="neumorphic-label flex items-center gap-2">
                                    <Phone className="w-5 h-5 text-green-400" /> DDI: <span className="text-red-300">*</span>
                                </label>
                                <input 
                                    type="number" id="ddi" name="contatoRequestDto.ddi" 
                                    value={formData.contatoRequestDto.ddi === 0 ? '' : formData.contatoRequestDto.ddi} 
                                    onChange={e => setFormData(prev => ({ 
                                        ...prev, 
                                        contatoRequestDto: { ...prev.contatoRequestDto, ddi: parseInt(e.target.value, 10) || 0 } 
                                    }))} 
                                    required min={1} max={999} placeholder="55" className={`neumorphic-input ${validationErrors.ddi ? 'border-red-500' : ''}`} 
                                />
                                {validationErrors.ddi && (
                                    <p className="mt-1 text-xs text-red-400">{validationErrors.ddi}</p>
                                )}
                            </div>
                            <div className="group md:col-span-1">
                                <label htmlFor="ddd" className="neumorphic-label flex items-center gap-2">
                                    <Phone className="w-5 h-5 text-green-400" /> DDD: <span className="text-red-300">*</span>
                                </label>
                                <input 
                                    type="number" id="ddd" name="contatoRequestDto.ddd" 
                                    value={formData.contatoRequestDto.ddd === 0 ? '' : formData.contatoRequestDto.ddd} 
                                    onChange={e => setFormData(prev => ({ 
                                        ...prev, 
                                        contatoRequestDto: { ...prev.contatoRequestDto, ddd: parseInt(e.target.value, 10) || 0 } 
                                    }))} 
                                    required min={11} max={99} placeholder="11" className={`neumorphic-input ${validationErrors.ddd ? 'border-red-500' : ''}`} 
                                />
                                {validationErrors.ddd && (
                                    <p className="mt-1 text-xs text-red-400">{validationErrors.ddd}</p>
                                )}
                            </div>
                            <div className="group md:col-span-2">
                                <label htmlFor="telefone1" className="neumorphic-label flex items-center gap-2">
                                    <Phone className="w-5 h-5 text-green-400" /> Telefone Fixo: <span className="text-red-300">*</span>
                                </label>
                                <IMaskInput 
                                    id="telefone1" name="contatoRequestDto.telefone1" 
                                    mask="(00) 0000-0000" unmask={false} 
                                    value={formData.contatoRequestDto.telefone1} 
                                    onAccept={(value: string) => setFormData(prev => ({ 
                                        ...prev, 
                                        contatoRequestDto: { ...prev.contatoRequestDto, telefone1: value } 
                                    }))} 
                                    required placeholder="(11) 3333-4444" 
                                    className={`neumorphic-input ${validationErrors.telefone1 ? 'border-red-500' : ''}`} 
                                />
                                {validationErrors.telefone1 && (
                                    <p className="mt-1 text-xs text-red-400">{validationErrors.telefone1}</p>
                                )}
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="telefone2" className="neumorphic-label flex items-center gap-2">
                                    <Phone className="w-5 h-5 text-green-400" /> Telefone 2:
                                </label>
                                <IMaskInput 
                                    id="telefone2" name="contatoRequestDto.telefone2" 
                                    mask="(00) 0000-0000" unmask={false} 
                                    value={formData.contatoRequestDto.telefone2 || ''} 
                                    onAccept={(value: string) => setFormData(prev => ({ 
                                        ...prev, 
                                        contatoRequestDto: { ...prev.contatoRequestDto, telefone2: value } 
                                    }))} 
                                    placeholder="(11) 3333-4444" className="neumorphic-input" 
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="telefone3" className="neumorphic-label flex items-center gap-2">
                                    <Phone className="w-5 h-5 text-green-400" /> Telefone 3:
                                </label>
                                <IMaskInput 
                                    id="telefone3" name="contatoRequestDto.telefone3" 
                                    mask="(00) 0000-0000" unmask={false} 
                                    value={formData.contatoRequestDto.telefone3 || ''} 
                                    onAccept={(value: string) => setFormData(prev => ({ 
                                        ...prev, 
                                        contatoRequestDto: { ...prev.contatoRequestDto, telefone3: value } 
                                    }))} 
                                    placeholder="(11) 3333-4444" className="neumorphic-input" 
                                />
                            </div>
                            <div className="md:col-span-6">
                                <label htmlFor="outro" className="neumorphic-label flex items-center gap-2">
                                    <Info className="w-5 h-5 text-purple-400" /> Outro Contato:
                                </label>
                                <textarea 
                                    id="outro" name="contatoRequestDto.outro" rows={2} 
                                    value={formData.contatoRequestDto.outro || ''} onChange={handleChange} 
                                    maxLength={100} placeholder="Rede social, recado, etc. (Opcional)" 
                                    className="neumorphic-textarea" 
                                />
                            </div>
                            <div className="md:col-span-6">
                                <label htmlFor="observacaoContato" className="neumorphic-label flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-orange-400" /> Observação (Contato):
                                </label>
                                <textarea 
                                    id="observacaoContato" name="contatoRequestDto.observacao" rows={2} 
                                    value={formData.contatoRequestDto.observacao || ''} onChange={handleChange} 
                                    maxLength={200} placeholder="Observações sobre o contato (Opcional)" 
                                    className="neumorphic-textarea" 
                                />
                            </div>
                        </div>
                    </fieldset>
                );

            case 'endereco':
                return (
                    <fieldset className="neumorphic-fieldset">
                        <legend className="neumorphic-legend">Endereço</legend>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="group">
                                <label htmlFor="cep" className="neumorphic-label flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-red-400" /> CEP: <span className="text-red-300">*</span>
                                </label>
                                <IMaskInput 
                                    id="cep" name="enderecoRequestDto.cep" 
                                    mask="00000-000" unmask={false} 
                                    value={formData.enderecoRequestDto.cep} 
                                    onAccept={(value: string) => {
                                        setFieldError('cep', false);
                                        handleCepChange(value);
                                    }} required placeholder="00000-000" 
                                    className={getFieldClasses('cep')} 
                                />
                                {validationErrors.cep && (
                                    <p className="mt-1 text-xs text-red-400">{validationErrors.cep}</p>
                                )}
                            </div>
                            <div className="group">
                                <label htmlFor="numero" className="neumorphic-label flex items-center gap-2">
                                    <Home className="w-5 h-5 text-orange-400" /> Número: <span className="text-red-300">*</span>
                                </label>
                                <input 
                                    type="number" id="numero" name="enderecoRequestDto.numero" 
                                    value={formData.enderecoRequestDto.numero === 0 ? '' : formData.enderecoRequestDto.numero} 
                                    onChange={e => setFormData(prev => ({ 
                                        ...prev, 
                                        enderecoRequestDto: { ...prev.enderecoRequestDto, numero: parseInt(e.target.value, 10) || 0 } 
                                    }))} 
                                    required min={1} max={9999999} placeholder="123" className={`neumorphic-input ${validationErrors.numero ? 'border-red-500' : ''}`} 
                                />
                                {validationErrors.numero && (
                                    <p className="mt-1 text-xs text-red-400">{validationErrors.numero}</p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="complemento" className="neumorphic-label flex items-center gap-2">
                                    <Home className="w-5 h-5 text-orange-400" /> Complemento:
                                </label>
                                <input 
                                    type="text" id="complemento" name="enderecoRequestDto.complemento" 
                                    value={formData.enderecoRequestDto.complemento || ''} onChange={handleChange} 
                                    maxLength={60} placeholder="Apto, bloco, etc. (Opcional)" className="neumorphic-input" 
                                />
                            </div>
                                <div className="md:col-span-2">
                                    <label className="neumorphic-label flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-blue-400" /> Logradouro:
                                    </label>
                                    <input 
                                        type="text" value={logradouroViaCep} readOnly 
                                        className="neumorphic-input bg-gray-100 text-gray-600 cursor-not-allowed" 
                                        aria-label="Logradouro preenchido automaticamente" 
                                    />
                                </div>
                                <div>
                                    <label className="neumorphic-label flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-green-400" /> Bairro:
                                    </label>
                                    <input 
                                        type="text" value={bairroViaCep} readOnly 
                                        className="neumorphic-input bg-gray-100 text-gray-600 cursor-not-allowed" 
                                        aria-label="Bairro preenchido automaticamente" 
                                    />
                                </div>
                                <div>
                                    <label className="neumorphic-label flex items-center gap-2">
                                        <Building className="w-5 h-5 text-purple-400" /> Cidade:
                                    </label>
                                    <input 
                                        type="text" value={cidadeViaCep} readOnly 
                                        className="neumorphic-input bg-gray-100 text-gray-600 cursor-not-allowed" 
                                        placeholder={cidadeViaCep ? "" : "Preenchido automaticamente pelo CEP"} 
                                        aria-label="Cidade preenchida automaticamente" 
                                    />
                                </div>
                                <div>
                                    <label className="neumorphic-label flex items-center gap-2">
                                        <Flag className="w-5 h-5 text-red-400" /> Estado (UF):
                                    </label>
                                    <input 
                                        type="text" value={estadoViaCep} readOnly 
                                        className="neumorphic-input bg-gray-100 text-gray-600 cursor-not-allowed" 
                                        placeholder={estadoViaCep ? "" : "Preenchido automaticamente pelo CEP"} 
                                        aria-label="Estado preenchido automaticamente" 
                                    />
                                </div>
                                <div>
                                    <label className="neumorphic-label flex items-center gap-2">
                                        <Globe className="w-5 h-5 text-cyan-400" /> País:
                                    </label>
                                    <input 
                                        type="text" value={paisViaCep} readOnly 
                                        className="neumorphic-input bg-gray-100 text-gray-600 cursor-not-allowed" 
                                        aria-label="País preenchido automaticamente" 
                                    />
                                </div>
                            <div className="md:col-span-3">
                                <label htmlFor="observacaoEndereco" className="neumorphic-label flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-orange-400" /> Observação (Endereço):
                                </label>
                                <textarea 
                                    id="observacaoEndereco" name="enderecoRequestDto.observacao" rows={2} 
                                    value={formData.enderecoRequestDto.observacao || ''} onChange={handleChange} 
                                    maxLength={200} placeholder="Ponto de referência (Opcional)" 
                                    className="neumorphic-textarea" 
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
        <main className="min-h-screen text-white p-4 md:p-8 pb-32">
                <div className="container mx-auto max-w-4xl">
                    <div className="neumorphic-container p-6 md:p-8">
                        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center flex items-center justify-center text-slate-800 font-montserrat">
                            <i className="ion-ios-person-add mr-2 text-3xl text-[var(--color-mottu-dark)]"></i>
                            Cadastrar Cliente
                        </h2>

                        {/* Navegação por Abas */}
                        <div className="flex flex-wrap gap-2 mb-6 p-2 bg-slate-100 rounded-lg">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-montserrat ${
                                        activeTab === tab.id
                                            ? 'bg-[var(--color-mottu-dark)] text-white shadow-lg'
                                            : 'bg-white text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                    <form onSubmit={handleSubmit}>
                            {renderTabContent()}

                            {/* Mensagens de Validação */}
                            {Object.keys(validationErrors).length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-red-800">
                                                Campos obrigatórios não preenchidos:
                                            </h3>
                                            <div className="mt-2 text-sm text-red-700">
                                                <ul className="list-disc pl-5 space-y-1">
                                                    {Object.values(validationErrors).map((error, index) => (
                                                        <li key={index}>{error}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                            </div>
                            )}

                            {/* Navegação entre Abas */}
                            <div className="flex justify-center items-center gap-4 my-6">
                                <button
                                    type="button"
                                    onClick={() => navigateTab('prev')}
                                    disabled={tabs.findIndex(tab => tab.id === activeTab) === 0}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-montserrat"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                    Anterior
                                </button>
                                
                                <span className="text-slate-600 font-montserrat">
                                    {tabs.findIndex(tab => tab.id === activeTab) + 1} de {tabs.length}
                                </span>
                                
                                <button
                                    type="button"
                                    onClick={() => navigateTab('next')}
                                    disabled={tabs.findIndex(tab => tab.id === activeTab) === tabs.length - 1}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-montserrat"
                                >
                                    Próximo
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Mensagens */}
                            <div className="h-12 my-4">
                            {error && (
                                <div className="relative text-red-200 bg-red-700/80 p-4 rounded border border-red-500" role="alert">
                                    <span className="block sm:inline">{error}</span>
                                        <button 
                                            type="button" 
                                            className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-200 hover:text-red-100" 
                                            onClick={() => setError(null)} 
                                            aria-label="Fechar"
                                        >
                                            <span className="text-2xl">&times;</span>
                                        </button>
                                </div>
                            )}
                            {success && (
                                    <div className="flex items-center justify-center gap-2 text-[var(--color-mottu-dark)] p-3 rounded bg-white/90 border border-[var(--color-mottu-dark)]">
                                        <MdCheckCircle className="text-xl" /> <span>{success}</span>
                                    </div>
                            )}
                        </div>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                                <button 
                                    type="submit" 
                                    className="neumorphic-button-green" 
                                    disabled={isLoading || !!success}
                                >
                                    <i className="ion-ios-save"></i> {isLoading ? 'Salvando...' : 'Salvar Cliente'}
                                </button>
                                <Link href="/clientes/listar" className="neumorphic-button">
                                    <i className="ion-ios-arrow-back"></i> Voltar para Lista
                                </Link>
                            </div>
                    </form>
                    </div>
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