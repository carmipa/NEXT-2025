'use client';
import { useState } from 'react';
import MapFIAP from '@/components/MapFIAP';

export default function ContactMapSection() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviado, setEnviado] = useState<null | "ok" | "erro">(null);

  const emailProviders = [
    { 
      id: 'gmail', 
      name: 'Gmail', 
      icon: 'ion-logo-google', 
      color: 'bg-red-500'
    },
    { 
      id: 'outlook', 
      name: 'Outlook', 
      icon: 'ion-logo-windows', 
      color: 'bg-blue-500'
    },
    { 
      id: 'yahoo', 
      name: 'Yahoo Mail', 
      icon: 'ion-ios-mail', 
      color: 'bg-purple-500'
    },
    { 
      id: 'icloud', 
      name: 'iCloud Mail', 
      icon: 'ion-logo-apple', 
      color: 'bg-gray-600'
    },
    { 
      id: 'zoho', 
      name: 'Zoho Mail', 
      icon: 'ion-ios-briefcase', 
      color: 'bg-orange-500'
    },
    { 
      id: 'proton', 
      name: 'Proton Mail', 
      icon: 'ion-ios-lock', 
      color: 'bg-indigo-500'
    },
    { 
      id: 'locaweb', 
      name: 'Locaweb', 
      icon: 'ion-ios-cloud', 
      color: 'bg-green-600'
    },
    { 
      id: 'uol', 
      name: 'UOL Host', 
      icon: 'ion-ios-browsers', 
      color: 'bg-yellow-600'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email || !mensagem) {
      setEnviado("erro");
      return;
    }
    setEnviado("ok");
  };

  const handleEmailProvider = (provider: any) => {
    const assunto = encodeURIComponent("Contato via Site Mottu");
    const corpo = encodeURIComponent(`Nome: ${nome}\nEmail: ${email}\n\nMensagem:\n${mensagem}`);
    
    let url = '';
    
    // Yahoo Mail usa mailto (não tem URL de compose funcional)
    if (provider.id === 'yahoo') {
      url = `mailto:contato@mottu.com?subject=${assunto}&body=${corpo}`;
    } else if (provider.id === 'gmail') {
      url = `https://mail.google.com/mail/?view=cm&fs=1&to=contato@mottu.com&su=${assunto}&body=${corpo}`;
    } else if (provider.id === 'outlook') {
      url = `https://outlook.live.com/mail/0/deeplink/compose?to=contato@mottu.com&subject=${assunto}&body=${corpo}`;
    } else {
      // Para outros provedores, usar mailto
      url = `mailto:contato@mottu.com?subject=${assunto}&body=${corpo}`;
    }
    
    window.open(url, '_blank');
  };
  return (
    <section className="pcw-row">
      {/* ESQUERDA: FORM */}
      <form className="pcw-form" onSubmit={handleSubmit}>
        <div className="pcw-heading">Envie uma Mensagem</div>

        <label className="pcw-label" htmlFor="pcwName">Seu Nome</label>
        <input 
          className="pcw-input" 
          id="pcwName" 
          name="name" 
          type="text" 
          placeholder="Digite seu nome" 
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required 
        />

        <label className="pcw-label" htmlFor="pcwEmail">Seu E-mail</label>
        <input 
          className="pcw-input" 
          id="pcwEmail" 
          name="email" 
          type="email" 
          placeholder="seu@email.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
        />

        <label className="pcw-label" htmlFor="pcwMessage">Mensagem</label>
        <textarea 
          className="pcw-textarea" 
          id="pcwMessage" 
          name="message" 
          rows={4} 
          placeholder="Escreva sua mensagem..." 
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          required 
        />

        <button className="pcw-button" type="submit">Validar Formulário</button>
        
        {enviado === "erro" && (
          <div className="pcw-feedback text-red-500">
            Preencha todos os campos.
          </div>
        )}

        {enviado === "ok" && (
          <>
            <div className="pcw-feedback text-green-500">
              Formulário válido! Escolha seu provedor:
            </div>
            <div className="grid grid-cols-4 gap-2 mt-3">
              {emailProviders.map((provider) => (
                <button
                  key={provider.id}
                  type="button"
                  onClick={() => handleEmailProvider(provider)}
                  className={`${provider.color} hover:opacity-80 text-white p-3 rounded-lg transition-all duration-300 hover:scale-105 flex flex-col items-center justify-center`}
                  title={provider.name}
                >
                  <i className={`${provider.icon} text-2xl`}></i>
                </button>
              ))}
            </div>
            <div className="text-xs text-gray-500 mt-2 text-center">
              Enviar para: <strong>contato@mottu.com</strong>
            </div>
          </>
        )}
      </form>

      {/* DIREITA: MAPA */}
      <div className="h-full flex flex-col">
        <MapFIAP />
      </div>
    </section>
  );
}
