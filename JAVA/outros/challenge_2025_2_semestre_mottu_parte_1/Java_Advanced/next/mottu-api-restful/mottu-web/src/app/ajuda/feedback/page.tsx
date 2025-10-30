"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import '@/types/styles/neumorphic.css';

export default function FeedbackPage() {
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        tipo: '',
        urgencia: '',
        mensagem: '',
        url: typeof window !== 'undefined' ? window.location.href : ''
    });
    const [imagens, setImagens] = useState<File[]>([]);
    const [previewImagens, setPreviewImagens] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const tiposFeedback = [
        { value: 'bug', label: 'Bug/Erro', description: 'Algo não está funcionando', icon: 'ion-ios-bug', color: 'text-red-400' },
        { value: 'melhoria', label: 'Sugestão', description: 'Ideia para melhorar o sistema', icon: 'ion-ios-bulb', color: 'text-yellow-400' },
        { value: 'duvida', label: 'Dúvida', description: 'Preciso de ajuda', icon: 'ion-ios-help-circle', color: 'text-blue-400' },
        { value: 'elogio', label: 'Elogio', description: 'Gostei de algo', icon: 'ion-ios-heart', color: 'text-green-400' }
    ];

    const niveisUrgencia = [
        { value: 'baixa', label: 'Baixa', color: 'text-green-400', icon: 'ion-ios-checkmark-circle' },
        { value: 'media', label: 'Média', color: 'text-yellow-400', icon: 'ion-ios-warning' },
        { value: 'alta', label: 'Alta', color: 'text-orange-400', icon: 'ion-ios-alert' },
        { value: 'critica', label: 'Crítica', color: 'text-red-400', icon: 'ion-ios-flame' }
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const newImagens = [...imagens, ...files];
        setImagens(newImagens);

        // Criar previews
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImagens(prev => [...prev, e.target?.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        const newImagens = imagens.filter((_, i) => i !== index);
        const newPreviews = previewImagens.filter((_, i) => i !== index);
        setImagens(newImagens);
        setPreviewImagens(newPreviews);
    };

    const detectEmailClient = () => {
        const userAgent = navigator.userAgent.toLowerCase();
        const platform = navigator.platform.toLowerCase();
        
        // 1. Detectar se está no Gmail (mais provável que use Gmail)
        if (window.location.hostname.includes('gmail') || 
            document.referrer.includes('gmail') ||
            localStorage.getItem('gmail_user')) {
            return 'gmail';
        }
        
        // 2. Detectar se está no Outlook (mais provável que use Outlook)
        if (window.location.hostname.includes('outlook') || 
            document.referrer.includes('outlook') ||
            localStorage.getItem('outlook_user')) {
            return 'outlook';
        }
        
        // 3. Detectar sistema operacional e preferências
        if (platform.includes('win')) {
            // Windows - tentar Outlook primeiro, depois Gmail
            return 'outlook';
        } else if (platform.includes('mac')) {
            // Mac - tentar Gmail primeiro, depois Apple Mail
            return 'gmail';
        } else if (platform.includes('linux')) {
            // Linux - Gmail é mais comum
            return 'gmail';
        }
        
        // 4. Detectar navegador
        if (userAgent.includes('chrome')) {
            return 'gmail'; // Chrome users geralmente usam Gmail
        } else if (userAgent.includes('edge') || userAgent.includes('msie')) {
            return 'outlook'; // Edge/IE users podem preferir Outlook
        }
        
        // 5. Fallback baseado em estatísticas globais
        return 'gmail'; // Gmail é o mais usado globalmente
    };

    const emailProviders = [
        { 
            id: 'gmail', 
            name: 'Gmail', 
            icon: 'ion-logo-google', 
            color: 'bg-red-500', 
            url: 'https://mail.google.com/mail/?view=cm&fs=1&to=rm557881@fiap.com.br',
            popularity: 'Extremamente Alta',
            focus: 'Pessoal e Profissional'
        },
        { 
            id: 'outlook', 
            name: 'Outlook', 
            icon: 'ion-logo-microsoft', 
            color: 'bg-blue-500', 
            url: 'https://outlook.live.com/mail/0/deeplink/compose?to=rm557881@fiap.com.br',
            popularity: 'Extremamente Alta',
            focus: 'Pessoal e Profissional'
        },
        { 
            id: 'yahoo', 
            name: 'Yahoo Mail', 
            icon: 'ion-logo-yahoo', 
            color: 'bg-purple-500', 
            url: 'https://mail.yahoo.com/',
            popularity: 'Média',
            focus: 'Pessoal'
        },
        { 
            id: 'icloud', 
            name: 'iCloud Mail', 
            icon: 'ion-logo-apple', 
            color: 'bg-gray-600', 
            url: 'https://www.icloud.com/mail/compose?to=rm557881@fiap.com.br',
            popularity: 'Média',
            focus: 'Pessoal (Apple)'
        },
        { 
            id: 'zoho', 
            name: 'Zoho Mail', 
            icon: 'ion-ios-mail', 
            color: 'bg-orange-500', 
            url: 'https://mail.zoho.com/zm/#compose?to=rm557881@fiap.com.br',
            popularity: 'Crescente',
            focus: 'Profissional + Privacidade'
        },
        { 
            id: 'proton', 
            name: 'Proton Mail', 
            icon: 'ion-ios-shield', 
            color: 'bg-indigo-500', 
            url: 'https://mail.proton.me/u/0/compose?to=rm557881@fiap.com.br',
            popularity: 'Crescente',
            focus: 'Segurança + Criptografia'
        },
        { 
            id: 'locaweb', 
            name: 'Locaweb', 
            icon: 'ion-ios-business', 
            color: 'bg-green-600', 
            url: 'https://webmail.locaweb.com.br/compose?to=rm557881@fiap.com.br',
            popularity: 'Alta (Empresarial)',
            focus: 'Profissional / Corporativo'
        },
        { 
            id: 'uol', 
            name: 'UOL Host', 
            icon: 'ion-ios-globe', 
            color: 'bg-yellow-600', 
            url: 'https://webmail.uol.com.br/compose?to=rm557881@fiap.com.br',
            popularity: 'Alta (Empresarial)',
            focus: 'Profissional / Corporativo'
        }
    ];

    const handleEmailProvider = (provider: any) => {
        const assunto = encodeURIComponent("Feedback do Sistema Mottu");
        const corpo = encodeURIComponent(`Nome: ${formData.nome}\nEmail: ${formData.email}\nTipo: ${formData.tipo || 'Não especificado'}\nUrgência: ${formData.urgencia || 'Não especificada'}\nURL: ${formData.url}\n\nMensagem:\n${formData.mensagem}`);
        
        let url = '';
        
        // Yahoo Mail usa mailto (não tem URL de compose funcional)
        if (provider.id === 'yahoo') {
            url = `mailto:rm557881@fiap.com.br?subject=${assunto}&body=${corpo}`;
        } else {
            url = `${provider.url}&su=${assunto}&body=${corpo}`;
        }
        
        window.open(url, '_blank');
        
        console.log('Feedback enviado via:', provider.name, {
            ...formData,
            imagens: imagens.map(f => f.name),
            timestamp: new Date().toISOString()
        });

        setIsSubmitted(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Validar se todos os campos obrigatórios estão preenchidos
            if (!formData.nome || !formData.email || !formData.mensagem) {
                alert('Por favor, preencha todos os campos obrigatórios.');
                setIsSubmitting(false);
                return;
            }

            // Detectar o melhor cliente de email
            const emailClient = detectEmailClient();
            const assunto = encodeURIComponent("Feedback do Sistema Mottu");
            const corpo = encodeURIComponent(`Nome: ${formData.nome}\nEmail: ${formData.email}\nTipo: ${formData.tipo || 'Não especificado'}\nUrgência: ${formData.urgencia || 'Não especificada'}\nURL: ${formData.url}\n\nMensagem:\n${formData.mensagem}`);
            
            // Tentar abrir o cliente detectado
            let url = '';
            
            switch (emailClient) {
                case 'gmail':
                    url = `https://mail.google.com/mail/?view=cm&fs=1&to=rm557881@fiap.com.br&su=${assunto}&body=${corpo}`;
                    break;
                case 'outlook':
                    url = `https://outlook.live.com/mail/0/deeplink/compose?to=rm557881@fiap.com.br&subject=${assunto}&body=${corpo}`;
                    break;
                default:
                    // Fallback para mailto (cliente padrão do sistema)
                    url = `mailto:rm557881@fiap.com.br?subject=${assunto}&body=${corpo}`;
            }
            
            // Tentar abrir o cliente de email detectado
            const emailWindow = window.open(url, '_blank');
            
            // Verificar se a janela foi bloqueada ou não abriu
            if (!emailWindow || emailWindow.closed || typeof emailWindow.closed == 'undefined') {
                // Se não abriu, mostrar opções manuais
                const userChoice = confirm(
                    `Não foi possível abrir automaticamente o ${emailClient === 'gmail' ? 'Gmail' : emailClient === 'outlook' ? 'Outlook' : 'cliente de email'}.\n\n` +
                    'Clique em OK para tentar Gmail ou Cancelar para tentar Outlook.'
                );
                
                if (userChoice) {
                    // Tentar Gmail
                    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=rm557881@fiap.com.br&su=${assunto}&body=${corpo}`, '_blank');
                } else {
                    // Tentar Outlook
                    window.open(`https://outlook.live.com/mail/0/deeplink/compose?to=rm557881@fiap.com.br&subject=${assunto}&body=${corpo}`, '_blank');
                }
            }
            
            console.log('Feedback enviado via:', emailClient, {
                ...formData,
                imagens: imagens.map(f => f.name),
                timestamp: new Date().toISOString()
            });

            setIsSubmitted(true);
        } catch (error) {
            console.error('Erro ao enviar feedback:', error);
            alert('Erro ao processar o feedback. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGmailClick = () => {
        const assunto = encodeURIComponent("Feedback do Sistema Mottu");
        const corpo = encodeURIComponent(`Nome: ${formData.nome}\nEmail: ${formData.email}\nTipo: ${formData.tipo}\nUrgência: ${formData.urgencia}\nURL: ${formData.url}\n\nMensagem:\n${formData.mensagem}`);
        const url = `https://mail.google.com/mail/?view=cm&fs=1&to=rm557881@fiap.com.br&su=${assunto}&body=${corpo}`;
        window.open(url, '_blank');
    };

    const handleOutlookClick = () => {
        const assunto = encodeURIComponent("Feedback do Sistema Mottu");
        const corpo = encodeURIComponent(`Nome: ${formData.nome}\nEmail: ${formData.email}\nTipo: ${formData.tipo}\nUrgência: ${formData.urgencia}\nURL: ${formData.url}\n\nMensagem:\n${formData.mensagem}`);
        const url = `https://outlook.live.com/mail/0/deeplink/compose?to=rm557881@fiap.com.br&subject=${assunto}&body=${corpo}`;
        window.open(url, '_blank');
    };

    const handleGenericEmailClick = () => {
        const assunto = encodeURIComponent("Feedback do Sistema Mottu");
        const corpo = encodeURIComponent(`Nome: ${formData.nome}\nEmail: ${formData.email}\nTipo: ${formData.tipo}\nUrgência: ${formData.urgencia}\nURL: ${formData.url}\n\nMensagem:\n${formData.mensagem}`);
        const url = `mailto:rm557881@fiap.com.br?subject=${assunto}&body=${corpo}`;
        window.open(url, '_blank');
    };

    if (isSubmitted) {
        return (
            <main className="min-h-screen text-white p-6 md:p-12 flex items-center justify-center">
                <div className="container max-w-2xl mx-auto text-center">
                    <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-slate-700">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i className="ion-ios-checkmark text-green-400 text-3xl"></i>
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-4" style={{fontFamily: 'Montserrat, sans-serif'}}>
                            Feedback Enviado!
                        </h1>
                        <p className="text-xl text-slate-300 mb-8" style={{fontFamily: 'Montserrat, sans-serif'}}>
                            Obrigado pelo seu feedback. Nossa equipe analisará sua mensagem e responderá em breve.
                        </p>
                        <button
                            onClick={() => {
                                setIsSubmitted(false);
                                setFormData({
                                    nome: '',
                                    email: '',
                                    tipo: '',
                                    urgencia: '',
                                    mensagem: '',
                                    url: typeof window !== 'undefined' ? window.location.href : ''
                                });
                                setImagens([]);
                                setPreviewImagens([]);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-medium transition-all duration-300 hover:scale-105 flex items-center mx-auto"
                        >
                            <i className="ion-ios-refresh mr-2"></i>
                            Enviar Novo Feedback
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen text-white p-6 md:p-12">
            <div className="container max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{fontFamily: 'Montserrat, sans-serif'}}>
                        <i className="ion-ios-chatbubbles text-blue-400 mr-3"></i>
                        Feedback
                    </h1>
                    <p className="text-xl text-slate-300" style={{fontFamily: 'Montserrat, sans-serif'}}>
                        Sua opinião é importante para melhorarmos o sistema
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Informações Pessoais */}
                    <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-2xl p-6 border border-slate-700">
                        <h3 className="text-xl font-semibold text-white mb-6 flex items-center" style={{fontFamily: 'Montserrat, sans-serif'}}>
                            <i className="ion-ios-person text-blue-400 mr-3"></i>
                            Informações Pessoais
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">Nome *</label>
                                <input
                                    type="text"
                                    name="nome"
                                    value={formData.nome}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    placeholder="Digite seu nome"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    placeholder="seu@email.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tipo de Feedback */}
                    <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-2xl p-6 border border-slate-700">
                        <h3 className="text-xl font-semibold text-white mb-6 flex items-center" style={{fontFamily: 'Montserrat, sans-serif'}}>
                            <i className="ion-ios-flag text-purple-400 mr-3"></i>
                            Tipo de Feedback *
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {tiposFeedback.map((tipo) => (
                                <label key={tipo.value} className="relative">
                                    <input
                                        type="radio"
                                        name="tipo"
                                        value={tipo.value}
                                        checked={formData.tipo === tipo.value}
                                        onChange={handleInputChange}
                                        className="sr-only"
                                    />
                                    <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                                        formData.tipo === tipo.value 
                                            ? 'border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/25' 
                                            : 'border-slate-600 hover:border-slate-500 bg-slate-700/30'
                                    }`}>
                                        <div className="font-medium text-white text-lg flex items-center">
                                            <i className={`${tipo.icon} ${tipo.color} mr-2`}></i>
                                            {tipo.label}
                                        </div>
                                        <div className="text-sm text-slate-300 mt-1">{tipo.description}</div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Urgência */}
                    <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-2xl p-6 border border-slate-700">
                        <h3 className="text-xl font-semibold text-white mb-6 flex items-center" style={{fontFamily: 'Montserrat, sans-serif'}}>
                            <i className="ion-ios-warning text-orange-400 mr-3"></i>
                            Nível de Urgência
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {niveisUrgencia.map((nivel) => (
                                <label key={nivel.value} className="relative">
                                    <input
                                        type="radio"
                                        name="urgencia"
                                        value={nivel.value}
                                        checked={formData.urgencia === nivel.value}
                                        onChange={handleInputChange}
                                        className="sr-only"
                                    />
                                    <div className={`p-4 border-2 rounded-lg cursor-pointer text-center transition-all duration-300 ${
                                        formData.urgencia === nivel.value 
                                            ? 'border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/25' 
                                            : 'border-slate-600 hover:border-slate-500 bg-slate-700/30'
                                    }`}>
                                        <div className={`font-medium text-lg flex items-center justify-center ${nivel.color}`}>
                                            <i className={`${nivel.icon} mr-2`}></i>
                                            {nivel.label}
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Mensagem */}
                    <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-2xl p-6 border border-slate-700">
                        <h3 className="text-xl font-semibold text-white mb-6 flex items-center" style={{fontFamily: 'Montserrat, sans-serif'}}>
                            <i className="ion-ios-chatbubble text-cyan-400 mr-3"></i>
                            Mensagem *
                        </h3>
                        <textarea
                            name="mensagem"
                            value={formData.mensagem}
                            onChange={handleInputChange}
                            required
                            rows={6}
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                            placeholder="Escreva sua mensagem..."
                        />
                    </div>

                    {/* Upload de Imagens */}
                    <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-2xl p-6 border border-slate-700">
                        <h3 className="text-xl font-semibold text-white mb-6 flex items-center" style={{fontFamily: 'Montserrat, sans-serif'}}>
                            <i className="ion-ios-camera text-pink-400 mr-3"></i>
                            Imagens (Opcional)
                        </h3>
                        <div className="space-y-6">
                            <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-slate-500 transition-colors">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 flex items-center mx-auto"
                                >
                                    <i className="ion-ios-cloud-upload mr-2"></i>
                                    Selecionar Imagens
                                </button>
                                <p className="text-sm text-slate-400 mt-3">
                                    Máximo 5 imagens • PNG, JPG, GIF até 5MB cada
                                </p>
                            </div>

                            {/* Preview das Imagens */}
                            {previewImagens.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {previewImagens.map((preview, index) => (
                                        <div key={index} className="relative group">
                                            <Image
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                width={200}
                                                height={150}
                                                className="w-full h-32 object-cover rounded-lg border border-slate-600"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* URL Atual */}
                    <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-2xl p-6 border border-slate-700">
                        <h3 className="text-xl font-semibold text-white mb-6 flex items-center" style={{fontFamily: 'Montserrat, sans-serif'}}>
                            <i className="ion-ios-link text-indigo-400 mr-3"></i>
                            Localização do Problema
                        </h3>
                        <input
                            type="url"
                            name="url"
                            value={formData.url}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            placeholder="URL onde ocorreu o problema"
                        />
                        <p className="text-sm text-gray-400 mt-3">
                            Esta URL será preenchida automaticamente com a página atual
                        </p>
                    </div>

                    {/* Provedores de Email */}
                    <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-2xl p-6 border border-slate-700">
                        <h3 className="text-xl font-semibold text-white mb-6 flex items-center" style={{fontFamily: 'Montserrat, sans-serif'}}>
                            <i className="ion-ios-mail text-cyan-400 mr-3"></i>
                            Escolha seu Provedor de Email
                        </h3>
                        <p className="text-sm text-gray-400 mb-6">
                            Selecione o provedor de email que você usa para enviar o feedback:
                        </p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {emailProviders.map((provider) => (
                                <button
                                    key={provider.id}
                                    type="button"
                                    onClick={() => handleEmailProvider(provider)}
                                    className={`${provider.color} hover:opacity-80 text-white p-3 rounded-lg transition-all duration-300 hover:scale-105 flex flex-col items-center space-y-1`}
                                >
                                    <i className={`${provider.icon} text-lg`}></i>
                                    <span className="font-medium text-xs">{provider.name}</span>
                                    <span className="text-xs opacity-75">{provider.popularity}</span>
                                </button>
                            ))}
                        </div>
                        
                        <div className="mt-6 text-xs text-gray-500 text-center">
                            <i className="ion-ios-information-circle mr-1"></i>
                            Todos os provedores enviarão para: <strong>rm557881@fiap.com.br</strong>
                        </div>
                    </div>

                    {/* Botão de Envio Automático */}
                    <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-2xl p-6 border border-slate-700">
                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center" style={{fontFamily: 'Montserrat, sans-serif'}}>
                            <i className="ion-ios-flash text-yellow-400 mr-3"></i>
                            Envio Automático
                        </h3>
                        <p className="text-sm text-gray-400 mb-6">
                            Ou deixe o sistema detectar automaticamente seu provedor de email:
                        </p>
                        
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-400">
                                * Campos obrigatórios
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-gray-200 hover:bg-gray-300 disabled:bg-gray-600 text-gray-800 px-8 py-4 rounded-full font-medium transition-all duration-300 hover:scale-105 flex items-center disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-800 mr-3"></div>
                                        Detectando...
                                    </>
                                ) : (
                                    <>
                                        <i className="ion-ios-flash mr-2"></i>
                                        Envio Automático
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </main>
    );
}