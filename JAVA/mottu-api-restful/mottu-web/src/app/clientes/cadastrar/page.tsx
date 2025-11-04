// src/app/clientes/cadastrar/page.tsx
"use client";
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IMaskInput } from 'react-imask';
import { 
    MdCheckCircle, MdDriveEta
} from 'react-icons/md';
import { 
    User, Mail, MapPin, Calendar, Briefcase,
    CreditCard, FileText, Info, Phone, Home, Building, Flag, Globe,
    ChevronLeft, ChevronRight, CheckCircle
} from 'lucide-react';
import { ClienteRequestDto, ClienteResponseDto } from '@/types/cliente';
import { ClienteService } from '@/utils/api';
import '@/styles/neumorphic.css';

const cleanMaskedValue = (value: string): string => value.replace(/\D/g, '');

// Funções de conversão entre formato brasileiro (DD/MM/YYYY) e formato ISO (YYYY-MM-DD)

// Converte DD/MM/YYYY para YYYY-MM-DD
const converterParaISO = (dataBR: string): string => {
    if (!dataBR) return '';
    // Remove espaços e pega apenas números
    const numeros = dataBR.replace(/\D/g, '');
    if (numeros.length !== 8) return '';
    
    const dia = numeros.substring(0, 2);
    const mes = numeros.substring(2, 4);
    const ano = numeros.substring(4, 8);
    
    return `${ano}-${mes}-${dia}`;
};

// Converte YYYY-MM-DD para DD/MM/YYYY
const converterParaBR = (dataISO: string): string => {
    if (!dataISO) return '';
    // Remove espaços e pega apenas números
    const numeros = dataISO.replace(/\D/g, '');
    if (numeros.length !== 8) return '';
    
    const ano = numeros.substring(0, 4);
    const mes = numeros.substring(4, 6);
    const dia = numeros.substring(6, 8);
    
    return `${dia}/${mes}/${ano}`;
};

// Valida se uma data no formato DD/MM/YYYY é válida
const validarDataBR = (dataBR: string): boolean => {
    if (!dataBR) return false;
    const numeros = dataBR.replace(/\D/g, '');
    if (numeros.length !== 8) return false;
    
    const dia = parseInt(numeros.substring(0, 2), 10);
    const mes = parseInt(numeros.substring(2, 4), 10);
    const ano = parseInt(numeros.substring(4, 8), 10);
    
    // Validações básicas
    if (mes < 1 || mes > 12) return false;
    if (dia < 1 || dia > 31) return false;
    if (ano < 1900 || ano > new Date().getFullYear()) return false;
    
    // Validação de dias por mês
    const diasPorMes = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    // Verifica ano bissexto
    if (mes === 2 && ((ano % 4 === 0 && ano % 100 !== 0) || ano % 400 === 0)) {
        if (dia > 29) return false;
    } else {
        if (dia > diasPorMes[mes - 1]) return false;
    }
    
    return true;
};

// Função para calcular idade a partir da data de nascimento no formato DD/MM/YYYY ou YYYY-MM-DD
const calcularIdade = (dataNascimento: string): number => {
    if (!dataNascimento) return 0;
    
    let dia: number, mes: number, ano: number;
    
    // Verifica se está no formato brasileiro (DD/MM/YYYY)
    if (dataNascimento.includes('/')) {
        const numeros = dataNascimento.replace(/\D/g, '');
        if (numeros.length !== 8) return 0;
        dia = parseInt(numeros.substring(0, 2), 10);
        mes = parseInt(numeros.substring(2, 4), 10);
        ano = parseInt(numeros.substring(4, 8), 10);
    } 
    // Formato ISO (YYYY-MM-DD)
    else if (dataNascimento.includes('-')) {
        const partes = dataNascimento.split('-');
        if (partes.length !== 3) return 0;
        ano = parseInt(partes[0], 10);
        mes = parseInt(partes[1], 10);
        dia = parseInt(partes[2], 10);
    } else {
        return 0;
    }
    
    // Data atual (usando timezone local)
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth() + 1; // Mês em JS é 0-indexed, mas estamos comparando como número normal
    const diaAtual = hoje.getDate();
    
    // Calcular idade baseado na data atual
    let idade = anoAtual - ano;
    
    // Ajusta a idade se ainda não chegou o aniversário este ano
    // Considera mês e dia para cálculo preciso
    if (mesAtual < mes || 
        (mesAtual === mes && diaAtual < dia)) {
        idade--;
    }
    
    return idade;
};

// Função para obter a data máxima permitida (hoje - 18 anos) no formato brasileiro DD/MM/YYYY
const getDataMaximaNascimentoBR = (): string => {
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth() + 1;
    const diaAtual = hoje.getDate();
    
    // Calcular data máxima (hoje - 18 anos)
    const anoMaximo = anoAtual - 18;
    
    // Formatar como DD/MM/YYYY
    const diaFormatado = String(diaAtual).padStart(2, '0');
    const mesFormatado = String(mesAtual).padStart(2, '0');
    
    return `${diaFormatado}/${mesFormatado}/${anoMaximo}`;
};

// Função para validar se a pessoa tem pelo menos 18 anos
const validarIdadeMinima = (dataNascimento: string, idadeMinima: number = 18): boolean => {
    if (!dataNascimento) return false;
    const idade = calcularIdade(dataNascimento);
    return idade >= idadeMinima;
};

// Função para validar CPF (recebe string já limpa, sem máscara)
const validateCPF = (cpf: string): boolean => {
    // Remove caracteres não numéricos caso ainda tenha
    const cleanCpf = cpf.replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos
    if (cleanCpf.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais (ex: 111.111.111-11)
    if (/^(\d)\1{10}$/.test(cleanCpf)) return false;
    
    // Valida primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cleanCpf.charAt(i), 10) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf.charAt(9), 10)) return false;
    
    // Valida segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cleanCpf.charAt(i), 10) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf.charAt(10), 10)) return false;
    
    return true;
};

// Função para validar CNPJ
const validateCNPJ = (cnpj: string): boolean => {
    const cleanCnpj = cnpj.replace(/\D/g, '');
    
    if (cleanCnpj.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(cleanCnpj)) return false; // Todos os dígitos iguais
    
    let length = cleanCnpj.length - 2;
    let numbers = cleanCnpj.substring(0, length);
    const digits = cleanCnpj.substring(length);
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
    const router = useRouter();
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
    const [salvamentoConcluido, setSalvamentoConcluido] = useState(false);
    const [clienteSalvo, setClienteSalvo] = useState<ClienteResponseDto | null>(null);
    const [logradouroViaCep, setLogradouroViaCep] = useState('');
    const [bairroViaCep, setBairroViaCep] = useState('');
    const [cidadeViaCep, setCidadeViaCep] = useState('');
    const [estadoViaCep, setEstadoViaCep] = useState('');
    const [paisViaCep, setPaisViaCep] = useState('Brasil');
    // Estado para rastrear quais abas foram validadas/completadas
    const [completedTabs, setCompletedTabs] = useState<Set<TabType>>(new Set(['dados-pessoais']));

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
        
        // Limpar erro de validação específico deste campo
        setValidationErrors(prev => {
            const newErrors = { ...prev };
            // Remove erro se o campo não contém '.' (campos simples)
            if (!name.includes('.')) {
                delete newErrors[name];
                // Também remove erros com prefixo de aba
                Object.keys(newErrors).forEach(key => {
                    if (key.includes(`: ${name}`) || key === name) {
                        delete newErrors[key];
                    }
                });
            } else {
                // Para campos aninhados, remover pela última parte do nome
                const fieldName = name.split('.').pop() || '';
                Object.keys(newErrors).forEach(key => {
                    if (key.includes(`: ${fieldName}`) || key === fieldName) {
                        delete newErrors[key];
                    }
                });
            }
            return newErrors;
        });
        
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
        
        // Proteção contra múltiplas submissões simultâneas
        if (isLoading) {
            console.log('Submissão já em andamento, ignorando novo clique.');
            return;
        }
        
        // Validar todas as abas antes de enviar
        const allErrors: {[key: string]: string} = {};
        let allTabsValid = true;
        
        for (const tab of tabs) {
            const tabErrors: {[key: string]: string} = {};
            let tabValid = true;
            
            // Validar cada aba explicitamente
            switch (tab.id) {
                case 'dados-pessoais':
                    if (!formData.nome?.trim()) { tabErrors.nome = 'Nome é obrigatório'; tabValid = false; }
                    if (!formData.sobrenome?.trim()) { tabErrors.sobrenome = 'Sobrenome é obrigatório'; tabValid = false; }
                    if (!formData.sexo || (formData.sexo !== 'M' && formData.sexo !== 'F')) {
                        tabErrors.sexo = 'Sexo inválido. Deve ser "M" (Masculino) ou "F" (Feminino).';
                        tabValid = false;
                    }
                    if (!formData.dataNascimento) {
                        tabErrors.dataNascimento = 'Data de nascimento é obrigatória';
                        tabValid = false;
                    } else {
                        // Validar formato brasileiro DD/MM/YYYY
                        if (!validarDataBR(formData.dataNascimento)) {
                            tabErrors.dataNascimento = 'Data inválida. Use o formato DD/MM/YYYY.';
                            tabValid = false;
                        } else {
                            // Validar se a pessoa tem pelo menos 18 anos
                            const idade = calcularIdade(formData.dataNascimento);
                            if (idade < 18) {
                                tabErrors.dataNascimento = 'A pessoa deve ter pelo menos 18 anos de idade.';
                                tabValid = false;
                            }
                        }
                    }
                    if (!formData.cpf?.trim()) {
                        tabErrors.cpf = 'CPF/CNPJ é obrigatório';
                        tabValid = false;
                    } else {
                        const cleanCpf = cleanMaskedValue(formData.cpf);
                        if (tipoDocumentoDisplay === 'CPF') {
                            if (cleanCpf.length !== 11) {
                                tabErrors.cpf = 'CPF deve ter 11 dígitos';
                                tabValid = false;
                            } else if (!validateCPF(cleanCpf)) {
                                tabErrors.cpf = 'CPF inválido. Verifique os dígitos digitados.';
                                tabValid = false;
                            }
                        } else if (tipoDocumentoDisplay === 'CNPJ') {
                            if (cleanCpf.length !== 14) {
                                tabErrors.cpf = 'CNPJ deve ter 14 dígitos';
                                tabValid = false;
                            } else if (!validateCNPJ(cleanCpf)) {
                                tabErrors.cpf = 'CNPJ inválido. Verifique os dígitos digitados.';
                                tabValid = false;
                            }
                        }
                    }
                    if (!formData.profissao?.trim()) { tabErrors.profissao = 'Profissão é obrigatória'; tabValid = false; }
                    break;
                    
                case 'cnh':
                    if (!formData.cnhRequestDto?.numeroRegistro?.trim()) {
                        tabErrors.numeroRegistro = 'Número de registro é obrigatório';
                        tabValid = false;
                    } else {
                        const cleanRegistro = cleanMaskedValue(formData.cnhRequestDto.numeroRegistro);
                        if (cleanRegistro.length !== 11) {
                            tabErrors.numeroRegistro = 'Número de registro deve ter 11 dígitos';
                            tabValid = false;
                        }
                    }
                    if (!formData.cnhRequestDto?.dataEmissao) {
                        tabErrors.dataEmissao = 'Data de emissão é obrigatória';
                        tabValid = false;
                    }
                    if (!formData.cnhRequestDto?.dataValidade) {
                        tabErrors.dataValidade = 'Data de validade é obrigatória';
                        tabValid = false;
                    } else if (formData.cnhRequestDto.dataEmissao && formData.cnhRequestDto.dataValidade) {
                        const emissao = new Date(formData.cnhRequestDto.dataEmissao);
                        const validade = new Date(formData.cnhRequestDto.dataValidade);
                        if (emissao >= validade) {
                            tabErrors.dataValidade = 'Data de validade deve ser posterior à data de emissão';
                            tabValid = false;
                        }
                    }
                    break;
                    
                case 'contatos':
                    if (!formData.contatoRequestDto?.email?.trim()) {
                        tabErrors.email = 'E-mail é obrigatório';
                        tabValid = false;
                    } else if (!/\S+@\S+\.\S+/.test(formData.contatoRequestDto.email)) {
                        tabErrors.email = 'E-mail inválido';
                        tabValid = false;
                    }
                    if (!formData.contatoRequestDto?.celular?.trim()) {
                        tabErrors.celular = 'Celular é obrigatório';
                        tabValid = false;
                    }
                    if (!formData.contatoRequestDto?.telefone1?.trim()) {
                        tabErrors.telefone1 = 'Telefone fixo é obrigatório';
                        tabValid = false;
                    }
                    if (!formData.contatoRequestDto?.ddd || formData.contatoRequestDto.ddd === 0) {
                        tabErrors.ddd = 'DDD é obrigatório';
                        tabValid = false;
                    }
                    if (!formData.contatoRequestDto?.ddi || formData.contatoRequestDto.ddi === 0) {
                        tabErrors.ddi = 'DDI é obrigatório';
                        tabValid = false;
                    }
                    break;
                    
                case 'endereco':
                    if (!formData.enderecoRequestDto?.cep?.trim()) {
                        tabErrors.cep = 'CEP é obrigatório';
                        tabValid = false;
                    } else {
                        const cleanCep = cleanMaskedValue(formData.enderecoRequestDto.cep);
                        if (cleanCep.length !== 8) {
                            tabErrors.cep = 'CEP deve ter 8 dígitos';
                            tabValid = false;
                        } else if (!logradouroViaCep || !cidadeViaCep || !estadoViaCep) {
                            tabErrors.cep = 'CEP inválido ou não encontrado. Por favor, verifique o CEP digitado.';
                            tabValid = false;
                        }
                    }
                    if (!formData.enderecoRequestDto?.numero || formData.enderecoRequestDto.numero === 0) {
                        tabErrors.numero = 'Número é obrigatório';
                        tabValid = false;
                    }
                    break;
            }
            
            if (!tabValid) {
                allTabsValid = false;
                // Adicionar prefixo do nome da aba aos erros
                Object.entries(tabErrors).forEach(([key, value]) => {
                    allErrors[`${tab.label}: ${key}`] = value;
                });
            }
        }
        
        // Se houver erros, mostrar e destacar na aba atual e PARAR AQUI
        if (!allTabsValid) {
            setValidationErrors(allErrors);
            // Marcar campos com erro para styling
            const newFieldErrors: {[key: string]: boolean} = {};
            Object.keys(allErrors).forEach(key => {
                const fieldName = key.split(': ')[1] || key;
                newFieldErrors[fieldName] = true;
            });
            setFieldErrors(newFieldErrors);
            
            // Ir para a primeira aba com erro
            for (const tab of tabs) {
                if (!validateCurrentTab(tab.id)) {
                    setActiveTab(tab.id);
                    break;
                }
            }
            
            setError('❌ Por favor, preencha todos os campos obrigatórios em todas as abas antes de salvar.');
            setIsLoading(false); // Garantir que isLoading está false
            return; // RETORNAR IMEDIATAMENTE - NÃO CONTINUAR
        }
        
        // VALIDAÇÃO ADICIONAL: Garantir que não há erros antes de prosseguir
        if (Object.keys(validationErrors).length > 0) {
            setError('❌ Existem erros de validação. Por favor, corrija antes de salvar.');
            setIsLoading(false);
            return;
        }
        
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        // Validar e garantir que o sexo está no formato correto (M ou F)
        if (!formData.sexo || (formData.sexo !== 'M' && formData.sexo !== 'F')) {
            setError('❌ Sexo inválido. Deve ser "M" (Masculino) ou "F" (Feminino).');
            setIsLoading(false);
            return;
        }

        // Converter data de nascimento de DD/MM/YYYY (formato brasileiro) para YYYY-MM-DD (formato ISO para backend)
        let dataNascimentoISO = '';
        if (formData.dataNascimento) {
            // Validar formato brasileiro antes de converter
            if (!validarDataBR(formData.dataNascimento)) {
                setError('❌ Formato de data de nascimento inválido. Use o formato DD/MM/YYYY.');
                setIsLoading(false);
                return;
            }
            // Converter para formato ISO (YYYY-MM-DD) para enviar ao backend
            dataNascimentoISO = converterParaISO(formData.dataNascimento);
            if (!dataNascimentoISO) {
                setError('❌ Erro ao converter data de nascimento. Verifique o formato DD/MM/YYYY.');
                setIsLoading(false);
                return;
            }
        } else {
            setError('❌ Data de nascimento é obrigatória.');
            setIsLoading(false);
            return;
        }

        const clienteDataToSend: ClienteRequestDto = {
            ...formData,
            sexo: formData.sexo as 'M' | 'F', // Garantir tipo correto
            dataNascimento: dataNascimentoISO, // Converter para formato ISO (YYYY-MM-DD) para backend
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
                logradouro: logradouroViaCep || '',
                bairro: bairroViaCep || '',
                cidade: cidadeViaCep || '',
                estado: estadoViaCep || '',
                pais: paisViaCep || 'Brasil',
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
            setClienteSalvo(response);
            setSalvamentoConcluido(true);
            
            // Não redirecionar automaticamente, mostrar tela de resumo
        } catch (err: unknown) {
            console.error('Erro ao criar cliente:', err);
            
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as { response: { data: any, status: number } };
                const errorData = axiosError.response.data;
                const status = axiosError.response.status;
                
                // Erro 409 (Conflict) - Dados duplicados
                if (status === 409) {
                    let mensagemErro = '❌ ';
                    if (errorData.message) {
                        // Extrair qual campo está duplicado da mensagem
                        if (errorData.message.includes('CPF')) {
                            mensagemErro += `Este CPF já está cadastrado no sistema. Por favor, verifique o CPF digitado ou entre em contato com o suporte.`;
                            // Destacar o campo CPF
                            setFieldError('cpf', true);
                        } else if (errorData.message.includes('email')) {
                            mensagemErro += `Este e-mail já está cadastrado no sistema. Por favor, use outro e-mail ou recupere sua conta.`;
                            // Destacar o campo email
                            setFieldError('email', true);
                        } else if (errorData.message.includes('CNH') || errorData.message.includes('registro')) {
                            mensagemErro += `Este número de registro da CNH já está cadastrado no sistema. Por favor, verifique o número digitado.`;
                            // Destacar o campo numeroRegistro
                            setFieldError('numeroRegistro', true);
                        } else {
                            mensagemErro += errorData.message;
                        }
                    } else if (errorData.error) {
                        mensagemErro += `${errorData.error}. Dados duplicados detectados.`;
                    } else {
                        mensagemErro += 'Os dados informados já existem no sistema. Verifique se não há duplicação.';
                    }
                    setError(mensagemErro);
                } 
                // Erro 400 (Bad Request) - Validação
                else if (status === 400 && errorData.validationErrors) {
                    // Erros de validação específicos
                    const validationMessages = Object.entries(errorData.validationErrors)
                        .map(([field, message]) => `${field}: ${message}`)
                        .join(', ');
                    setError(`❌ Dados inválidos: ${validationMessages}`);
                    
                    // Destacar campos com erro
                    Object.keys(errorData.validationErrors).forEach(field => {
                        setFieldError(field, true);
                    });
                } 
                // Outros erros
                else if (errorData.message) {
                    setError(`❌ ${errorData.message}`);
                } else if (errorData.error) {
                    setError(`❌ ${errorData.error}`);
                } else {
                    setError(`❌ Erro ${status}: ${status === 409 ? 'Dados duplicados' : 'Dados inválidos'}`);
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

    const validateCurrentTab = (tabToValidate?: TabType): boolean => {
        const tab = tabToValidate || activeTab;
        const errors: {[key: string]: string} = {};
        
        // Limpa erros anteriores
        setValidationErrors({});
        
        switch (tab) {
            case 'dados-pessoais':
                if (!formData.nome?.trim()) errors.nome = 'Nome é obrigatório';
                if (!formData.sobrenome?.trim()) errors.sobrenome = 'Sobrenome é obrigatório';
                if (!formData.sexo || (formData.sexo !== 'M' && formData.sexo !== 'F')) {
                    errors.sexo = 'Sexo inválido. Deve ser "M" (Masculino) ou "F" (Feminino).';
                }
                if (!formData.dataNascimento) {
                    errors.dataNascimento = 'Data de nascimento é obrigatória';
                } else {
                    // Validar formato brasileiro DD/MM/YYYY
                    if (!validarDataBR(formData.dataNascimento)) {
                        errors.dataNascimento = 'Data inválida. Use o formato DD/MM/YYYY.';
                    } else {
                        // Validar se a pessoa tem pelo menos 18 anos
                        const idade = calcularIdade(formData.dataNascimento);
                        if (idade < 18) {
                            errors.dataNascimento = 'A pessoa deve ter pelo menos 18 anos de idade.';
                        }
                    }
                }
                if (!formData.cpf?.trim()) {
                    errors.cpf = 'CPF/CNPJ é obrigatório';
                } else {
                    // Validação de CPF/CNPJ
                    const cleanCpf = cleanMaskedValue(formData.cpf);
                    if (tipoDocumentoDisplay === 'CPF') {
                        if (cleanCpf.length !== 11) {
                            errors.cpf = 'CPF deve ter 11 dígitos';
                        } else if (!validateCPF(cleanCpf)) {
                            errors.cpf = 'CPF inválido. Verifique os dígitos digitados.';
                        }
                    } else if (tipoDocumentoDisplay === 'CNPJ') {
                        if (cleanCpf.length !== 14) {
                            errors.cpf = 'CNPJ deve ter 14 dígitos';
                        } else if (!validateCNPJ(cleanCpf)) {
                            errors.cpf = 'CNPJ inválido. Verifique os dígitos digitados.';
                        }
                    }
                }
                if (!formData.profissao?.trim()) errors.profissao = 'Profissão é obrigatória';
                break;
                
            case 'cnh':
                if (!formData.cnhRequestDto?.numeroRegistro?.trim()) {
                    errors.numeroRegistro = 'Número de registro é obrigatório';
                } else {
                    // Validação do número de registro
                    const cleanRegistro = cleanMaskedValue(formData.cnhRequestDto.numeroRegistro);
                    if (cleanRegistro.length !== 11) {
                        errors.numeroRegistro = 'Número de registro deve ter 11 dígitos';
                    }
                }
                if (!formData.cnhRequestDto?.dataEmissao) {
                    errors.dataEmissao = 'Data de emissão é obrigatória';
                }
                if (!formData.cnhRequestDto?.dataValidade) {
                    errors.dataValidade = 'Data de validade é obrigatória';
                } else if (formData.cnhRequestDto.dataEmissao && formData.cnhRequestDto.dataValidade) {
                    // Validação de datas
                    const emissao = new Date(formData.cnhRequestDto.dataEmissao);
                    const validade = new Date(formData.cnhRequestDto.dataValidade);
                    if (emissao >= validade) {
                        errors.dataValidade = 'Data de validade deve ser posterior à data de emissão';
                    }
                }
                break;
                
            case 'contatos':
                if (!formData.contatoRequestDto?.email?.trim()) {
                    errors.email = 'E-mail é obrigatório';
                } else if (!/\S+@\S+\.\S+/.test(formData.contatoRequestDto.email)) {
                    errors.email = 'E-mail inválido';
                }
                
                if (!formData.contatoRequestDto?.celular?.trim()) {
                    errors.celular = 'Celular é obrigatório';
                }
                
                if (!formData.contatoRequestDto?.telefone1?.trim()) {
                    errors.telefone1 = 'Telefone fixo é obrigatório';
                }
                
                if (!formData.contatoRequestDto?.ddd || formData.contatoRequestDto.ddd === 0) {
                    errors.ddd = 'DDD é obrigatório';
                }
                
                if (!formData.contatoRequestDto?.ddi || formData.contatoRequestDto.ddi === 0) {
                    errors.ddi = 'DDI é obrigatório';
                }
                break;
                
            case 'endereco':
                if (!formData.enderecoRequestDto?.cep?.trim()) {
                    errors.cep = 'CEP é obrigatório';
                } else {
                    const cleanCep = cleanMaskedValue(formData.enderecoRequestDto.cep);
                    if (cleanCep.length !== 8) {
                        errors.cep = 'CEP deve ter 8 dígitos';
                    } else if (!logradouroViaCep || !cidadeViaCep || !estadoViaCep) {
                        errors.cep = 'CEP inválido ou não encontrado. Por favor, verifique o CEP digitado.';
                    }
                }
                
                if (!formData.enderecoRequestDto?.numero || formData.enderecoRequestDto.numero === 0) {
                    errors.numero = 'Número é obrigatório';
                }
                break;
        }
        
        // Só atualizar os erros se estiver validando a aba ativa
        if (!tabToValidate) {
            setValidationErrors(errors);
            
            // Marcar campos com erro para styling
            const newFieldErrors: {[key: string]: boolean} = {};
            Object.keys(errors).forEach(key => {
                newFieldErrors[key] = true;
            });
            setFieldErrors(prev => ({ ...prev, ...newFieldErrors }));
        }
        
        // Se validou com sucesso, marca a aba como completa
        if (Object.keys(errors).length === 0) {
            setCompletedTabs(prev => new Set([...prev, tab]));
        }
        
        return Object.keys(errors).length === 0;
    };

    // Função para verificar se uma aba pode ser acessada
    const canAccessTab = (tabId: TabType): boolean => {
        const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
        const targetIndex = tabs.findIndex(tab => tab.id === tabId);
        
        // Sempre pode voltar para abas anteriores
        if (targetIndex < currentIndex) {
            return true;
        }
        
        // Se é a aba atual, sempre pode acessar
        if (targetIndex === currentIndex) {
            return true;
        }
        
        // Se está avançando, precisa ter completado todas as abas anteriores à aba alvo
        // (incluindo a aba atual se estiver na sequência)
        if (targetIndex > currentIndex) {
            // Verifica se todas as abas anteriores à aba alvo estão completas
            // Incluindo verificar se a aba atual está completa
            for (let i = 0; i < targetIndex; i++) {
                if (!completedTabs.has(tabs[i].id)) {
                    return false;
                }
            }
            return true;
        }
        
        return false;
    };

    // Função para navegar para uma aba específica (com validação)
    const navigateToTab = (tabId: TabType) => {
        const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
        const targetIndex = tabs.findIndex(tab => tab.id === tabId);
        
        // Se está voltando, sempre permite
        if (targetIndex < currentIndex) {
            setActiveTab(tabId);
            setValidationErrors({});
            setError(null);
            return;
        }
        
        // Se é a aba atual, não faz nada
        if (targetIndex === currentIndex) {
            return;
        }
        
        // Se está avançando, valida a aba atual primeiro
        if (targetIndex === currentIndex + 1) {
            const isValid = validateCurrentTab();
            if (isValid) {
                setActiveTab(tabId);
                setValidationErrors({});
                setError(null);
            } else {
                setError("Por favor, preencha todos os campos obrigatórios antes de avançar.");
            }
        } else if (targetIndex > currentIndex) {
            // Tentando pular abas - não permite
            setError("Por favor, complete as abas anteriores antes de avançar.");
        }
    };

    const navigateTab = (direction: 'prev' | 'next') => {
        const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
        
        if (direction === 'prev' && currentIndex > 0) {
            navigateToTab(tabs[currentIndex - 1].id);
        } else if (direction === 'next' && currentIndex < tabs.length - 1) {
            navigateToTab(tabs[currentIndex + 1].id);
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                                <IMaskInput 
                                    id="dataNascimento" 
                                    name="dataNascimento" 
                                    mask="00/00/0000"
                                    unmask={false}
                                    value={formData.dataNascimento || ''}
                                    onAccept={(value: string) => {
                                        // Atualiza o estado com o valor formatado DD/MM/YYYY
                                        setFormData(prev => ({ ...prev, dataNascimento: value }));
                                        
                                        // Limpa erros antigos ao começar a digitar/mudar
                                        setFieldError('dataNascimento', false);
                                        setValidationErrors(prev => {
                                            const newErrors = { ...prev };
                                            delete newErrors.dataNascimento;
                                            return newErrors;
                                        });
                                        
                                        // Validação em tempo real se tiver valor completo
                                        if (value && value.replace(/\D/g, '').length === 8) {
                                            // Valida formato brasileiro
                                            if (!validarDataBR(value)) {
                                                setValidationErrors(prev => ({
                                                    ...prev,
                                                    dataNascimento: 'Data inválida. Verifique o formato DD/MM/YYYY.'
                                                }));
                                                setFieldError('dataNascimento', true);
                                            } else {
                                                // Valida idade mínima
                                                const idade = calcularIdade(value);
                                                if (idade < 18) {
                                                    setValidationErrors(prev => ({
                                                        ...prev,
                                                        dataNascimento: 'A pessoa deve ter pelo menos 18 anos de idade.'
                                                    }));
                                                    setFieldError('dataNascimento', true);
                                                }
                                            }
                                        }
                                    }}
                                    onBlur={(e) => {
                                        const blurValue = (e.target as HTMLInputElement).value;
                                        
                                        // Validação ao perder o foco
                                        if (blurValue && blurValue.replace(/\D/g, '').length === 8) {
                                            // Valida formato brasileiro
                                            if (!validarDataBR(blurValue)) {
                                                setValidationErrors(prev => ({
                                                    ...prev,
                                                    dataNascimento: 'Data inválida. Verifique o formato DD/MM/YYYY.'
                                                }));
                                                setFieldError('dataNascimento', true);
                                            } else {
                                                // Valida idade mínima
                                                const idade = calcularIdade(blurValue);
                                                if (idade < 18) {
                                                    setValidationErrors(prev => ({
                                                        ...prev,
                                                        dataNascimento: 'A pessoa deve ter pelo menos 18 anos de idade.'
                                                    }));
                                                    setFieldError('dataNascimento', true);
                                                } else {
                                                    // Idade OK, limpa erros (se houver)
                                                    setFieldError('dataNascimento', false);
                                                    setValidationErrors(prev => {
                                                        const newErrors = { ...prev };
                                                        delete newErrors.dataNascimento;
                                                        return newErrors;
                                                    });
                                                }
                                            }
                                        } else if (blurValue && blurValue.replace(/\D/g, '').length > 0) {
                                            // Data incompleta
                                            setValidationErrors(prev => ({
                                                ...prev,
                                                dataNascimento: 'Data incompleta. Use o formato DD/MM/YYYY.'
                                            }));
                                            setFieldError('dataNascimento', true);
                                        } else {
                                            // Se o campo ficou vazio, marca como erro (pois é obrigatório)
                                            setValidationErrors(prev => ({
                                                ...prev,
                                                dataNascimento: 'Data de nascimento é obrigatória.'
                                            }));
                                            setFieldError('dataNascimento', true);
                                        }
                                    }}
                                    placeholder="DD/MM/AAAA"
                                    required 
                                    className={`neumorphic-input ${fieldErrors.dataNascimento || validationErrors.dataNascimento ? 'border-red-500 border-2' : ''}`}
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Formato: DD/MM/AAAA | Data máxima permitida: {getDataMaximaNascimentoBR()} (idade mínima: 18 anos)
                                </p>
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
                                        // Limpar erro de validação quando usuário está digitando
                                        setValidationErrors(prev => {
                                            const newErrors = { ...prev };
                                            delete newErrors.cpf;
                                            return newErrors;
                                        });
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
                                    <option value="Solteiro">Solteiro(a)</option>
                                    <option value="Casado">Casado(a)</option>
                                    <option value="Divorciado">Divorciado(a)</option>
                                    <option value="Viúvo">Viúvo(a)</option>
                                    <option value="Separado">Separado(a)</option>
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
                            <div className="group sm:col-span-2 lg:col-span-2 xl:col-span-4">
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
                            <div className="group sm:col-span-1 lg:col-span-1 xl:col-span-2">
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
                            <div className="group sm:col-span-1 lg:col-span-1 xl:col-span-2">
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
                            <div className="sm:col-span-2 lg:col-span-3 xl:col-span-6">
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
                            <div className="sm:col-span-2 lg:col-span-3 xl:col-span-6">
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
                                <div className="sm:col-span-1 lg:col-span-2">
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
                            <div className="sm:col-span-2 lg:col-span-3">
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

    // Se o salvamento foi concluído, mostrar tela de relatório/resumo
    if (salvamentoConcluido && clienteSalvo) {
        return (
            <main className="min-h-screen text-white p-3 sm:p-4 md:p-6 lg:p-8 pb-24 sm:pb-32">
                <div className="container mx-auto max-w-4xl">
                    <div className="neumorphic-container p-4 sm:p-6 md:p-8">
                        {/* Cabeçalho de Sucesso */}
                        <div className="text-center p-6 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 shadow-lg mb-6">
                            <div className="flex items-center justify-center mb-3">
                                <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-500" />
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                                Cliente Cadastrado com Sucesso!
                            </h2>
                            <p className="text-slate-600 text-lg">
                                ID: <strong className="text-emerald-600">{clienteSalvo.idCliente}</strong>
                            </p>
                        </div>

                        {/* Relatório/Resumo dos Dados */}
                        <div className="space-y-6">
                            {/* Dados Pessoais */}
                            <div className="neumorphic-fieldset p-4 sm:p-6">
                                <legend className="neumorphic-legend flex items-center font-montserrat text-sm sm:text-base">
                                    <User className="w-5 h-5 mr-2 text-cyan-400" /> Dados Pessoais
                                </legend>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-3 mt-4">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-blue-500" />
                                        <span className="text-slate-700 font-medium"><strong>Nome Completo:</strong> {clienteSalvo.nome} {clienteSalvo.sobrenome}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="w-4 h-4 text-blue-500" />
                                        <span className="text-slate-700 font-medium"><strong>CPF:</strong> {clienteSalvo.cpf}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-blue-500" />
                                        <span className="text-slate-700 font-medium"><strong>Data de Nascimento:</strong> {new Date(clienteSalvo.dataNascimento).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Info className="w-4 h-4 text-blue-500" />
                                        <span className="text-slate-700 font-medium"><strong>Sexo:</strong> {clienteSalvo.sexo === 'M' ? 'Masculino' : 'Feminino'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-blue-500" />
                                        <span className="text-slate-700 font-medium"><strong>Profissão:</strong> {clienteSalvo.profissao}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Info className="w-4 h-4 text-blue-500" />
                                        <span className="text-slate-700 font-medium"><strong>Estado Civil:</strong> {clienteSalvo.estadoCivil}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Dados de Contato */}
                            <div className="neumorphic-fieldset p-4 sm:p-6">
                                <legend className="neumorphic-legend flex items-center font-montserrat text-sm sm:text-base">
                                    <Phone className="w-5 h-5 mr-2 text-emerald-400" /> Contato
                                </legend>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-3 mt-4">
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-green-500" />
                                        <span className="text-slate-700 font-medium"><strong>E-mail:</strong> {clienteSalvo.contatoResponseDto.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-green-500" />
                                        <span className="text-slate-700 font-medium"><strong>Celular:</strong> {clienteSalvo.contatoResponseDto.celular}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-green-500" />
                                        <span className="text-slate-700 font-medium"><strong>Telefone Fixo:</strong> {clienteSalvo.contatoResponseDto.telefone1}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-green-500" />
                                        <span className="text-slate-700 font-medium"><strong>DDI/DDD:</strong> +{clienteSalvo.contatoResponseDto.ddi} ({clienteSalvo.contatoResponseDto.ddd})</span>
                                    </div>
                                </div>
                            </div>

                            {/* Dados de CNH */}
                            {clienteSalvo.cnhResponseDto && (
                                <div className="neumorphic-fieldset p-4 sm:p-6">
                                    <legend className="neumorphic-legend flex items-center font-montserrat text-sm sm:text-base">
                                        <MdDriveEta className="w-5 h-5 mr-2 text-purple-400" /> CNH
                                    </legend>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-3 mt-4">
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="w-4 h-4 text-purple-500" />
                                            <span className="text-slate-700 font-medium"><strong>Nº Registro:</strong> {clienteSalvo.cnhResponseDto.numeroRegistro}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MdDriveEta className="w-4 h-4 text-purple-500" />
                                            <span className="text-slate-700 font-medium"><strong>Categoria:</strong> {clienteSalvo.cnhResponseDto.categoria}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-purple-500" />
                                            <span className="text-slate-700 font-medium"><strong>Data Emissão:</strong> {new Date(clienteSalvo.cnhResponseDto.dataEmissao).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-purple-500" />
                                            <span className="text-slate-700 font-medium"><strong>Data Validade:</strong> {new Date(clienteSalvo.cnhResponseDto.dataValidade).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Endereço */}
                            <div className="neumorphic-fieldset p-4 sm:p-6">
                                <legend className="neumorphic-legend flex items-center font-montserrat text-sm sm:text-base">
                                    <MapPin className="w-5 h-5 mr-2 text-rose-400" /> Endereço
                                </legend>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-3 mt-4">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-red-500" />
                                        <span className="text-slate-700 font-medium"><strong>CEP:</strong> {clienteSalvo.enderecoResponseDto.cep}</span>
                                    </div>
                                    <div className="flex items-center gap-2 sm:col-span-2">
                                        <Home className="w-4 h-4 text-red-500" />
                                        <span className="text-slate-700 font-medium"><strong>Endereço:</strong> {clienteSalvo.enderecoResponseDto.logradouro}, {clienteSalvo.enderecoResponseDto.numero}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-red-500" />
                                        <span className="text-slate-700 font-medium"><strong>Bairro:</strong> {clienteSalvo.enderecoResponseDto.bairro}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Building className="w-4 h-4 text-red-500" />
                                        <span className="text-slate-700 font-medium"><strong>Cidade/UF:</strong> {clienteSalvo.enderecoResponseDto.cidade}/{clienteSalvo.enderecoResponseDto.estado}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Flag className="w-4 h-4 text-red-500" />
                                        <span className="text-slate-700 font-medium"><strong>País:</strong> {clienteSalvo.enderecoResponseDto.pais}</span>
                                    </div>
                                    {clienteSalvo.enderecoResponseDto.complemento && (
                                        <div className="flex items-center gap-2 sm:col-span-2">
                                            <Home className="w-4 h-4 text-red-500" />
                                            <span className="text-slate-700 font-medium"><strong>Complemento:</strong> {clienteSalvo.enderecoResponseDto.complemento}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Botão de Ação */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-6 mt-6 border-t border-slate-300">
                            <Link 
                                href="/clientes/listar"
                                className="group relative bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 lg:py-4 px-6 lg:px-8 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-orange-400 hover:border-orange-300 flex items-center justify-center gap-2"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                                <div className="relative flex items-center gap-2">
                                    <i className="ion-ios-arrow-back text-lg"></i>
                                    <span className="text-sm lg:text-base font-black">VOLTAR À LISTA</span>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <>
        <main className="min-h-screen text-white p-3 sm:p-4 md:p-6 lg:p-8 pb-24 sm:pb-32">
                <div className="container mx-auto max-w-4xl">
                    <div className="neumorphic-container p-4 sm:p-6 md:p-8">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-center flex items-center justify-center text-slate-800 font-montserrat">
                            <i className="ion-ios-person-add mr-2 text-2xl sm:text-3xl text-indigo-500"></i>
                            <span className="hidden sm:inline">Cadastrar Cliente</span>
                            <span className="sm:hidden">Novo Cliente</span>
                        </h2>

                        {/* Navegação por Abas */}
                        <div className="flex flex-wrap gap-1 sm:gap-2 mb-4 sm:mb-6 p-2 bg-slate-100 rounded-lg">
                            {tabs.map((tab, index) => {
                                const isActive = activeTab === tab.id;
                                const isCompleted = completedTabs.has(tab.id);
                                const isAccessible = canAccessTab(tab.id);
                                const tabIndex = tabs.findIndex(t => t.id === tab.id);
                                const currentIndex = tabs.findIndex(t => t.id === activeTab);
                                
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => navigateToTab(tab.id)}
                                        disabled={!isAccessible && !isActive}
                                        className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg transition-all duration-200 font-montserrat text-xs sm:text-sm relative ${
                                            isActive
                                                ? 'bg-[var(--color-mottu-dark)] text-white shadow-lg'
                                                : isCompleted && isAccessible
                                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-2 border-emerald-300'
                                                : isAccessible
                                                ? 'bg-white text-slate-600 hover:bg-slate-200'
                                                : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                                        }`}
                                        title={
                                            !isAccessible && !isActive
                                                ? 'Complete as abas anteriores antes de acessar esta aba'
                                                : isCompleted
                                                ? 'Aba completada'
                                                : ''
                                        }
                                    >
                                        {tab.icon}
                                        <span className="hidden sm:inline">{tab.label}</span>
                                        <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                                        {isCompleted && !isActive && (
                                            <i className="ion-ios-checkmark-circle text-emerald-600 ml-1 text-base"></i>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                    {/* Mensagem informativa sobre campos obrigatórios */}
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-2">
                            <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-blue-800">
                                <p className="font-medium mb-1">Campos obrigatórios:</p>
                                <p>Os campos marcados com <span className="text-red-500 font-bold">*</span> são obrigatórios e devem ser preenchidos antes de salvar.</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                            {renderTabContent()}

                            {/* Mensagens de Validação */}
                            {Object.keys(validationErrors).length > 0 && (
                                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-4 shadow-md">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <svg className="h-6 w-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3 flex-1">
                                            <h3 className="text-base font-bold text-red-800 mb-2">
                                                ⚠️ Atenção: Campos obrigatórios não preenchidos
                                            </h3>
                                            <p className="text-sm text-red-600 mb-2">
                                                Por favor, preencha os seguintes campos antes de salvar:
                                            </p>
                                            <div className="mt-2 text-sm text-red-700 bg-red-100 rounded p-2">
                                                <ul className="list-disc pl-5 space-y-1">
                                                    {Object.entries(validationErrors).map(([key, error], index) => (
                                                        <li key={index} className="font-medium">{error}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                            </div>
                            )}

                            {/* Navegação entre Abas */}
                            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 my-4 sm:my-6">
                                <button
                                    type="button"
                                    onClick={() => navigateTab('prev')}
                                    disabled={tabs.findIndex(tab => tab.id === activeTab) === 0}
                                    className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-montserrat text-sm sm:text-base"
                                >
                                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="hidden sm:inline">Anterior</span>
                                    <span className="sm:hidden">Ant</span>
                                </button>
                                
                                <span className="text-slate-600 font-montserrat text-sm sm:text-base">
                                    {tabs.findIndex(tab => tab.id === activeTab) + 1} de {tabs.length}
                                </span>
                                
                                <button
                                    type="button"
                                    onClick={() => navigateTab('next')}
                                    disabled={tabs.findIndex(tab => tab.id === activeTab) === tabs.length - 1}
                                    className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-montserrat text-sm sm:text-base"
                                >
                                    <span className="hidden sm:inline">Próximo</span>
                                    <span className="sm:hidden">Próx</span>
                                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
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

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4">
                                <button 
                                    type="submit" 
                                    className="group relative bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3 lg:py-4 px-6 lg:px-8 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-emerald-400 hover:border-emerald-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    disabled={isLoading || !!success || !!salvamentoConcluido || Object.keys(validationErrors).length > 0}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                                    <div className="relative flex items-center gap-2">
                                        <i className="ion-ios-save text-lg"></i>
                                        <span className="text-sm lg:text-base font-black">{isLoading ? 'SALVANDO...' : 'SALVAR CLIENTE'}</span>
                                    </div>
                                </button>
                                <Link href="/clientes/listar" className="group relative bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 lg:py-4 px-6 lg:px-8 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-orange-400 hover:border-orange-300 flex items-center justify-center gap-2">
                                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                                    <div className="relative flex items-center gap-2">
                                        <i className="ion-ios-arrow-back text-lg"></i>
                                        <span className="text-sm lg:text-base font-black">VOLTAR PARA LISTA</span>
                                    </div>
                                </Link>
                            </div>
                    </form>
                    </div>
                </div>
            </main>
            <style jsx global>{`
                .date-input-fix::-webkit-calendar-picker-indicator { cursor: pointer; }
                
                /* A linha problemática foi removida. */
                
                /* Esta regra garante que o texto fique visível ao focar */
                input[type="date"]:focus::-webkit-datetime-edit { color: #1e293b !important; }
                
                /* Esta regra garante que o texto fique visível em estado normal */
                input[type="date"]::-webkit-datetime-edit { color: #1e293b; }
            `}</style>
        </>
    );
}