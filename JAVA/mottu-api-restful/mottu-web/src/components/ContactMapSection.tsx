'use client';
import { useState } from 'react';
import MapFIAP from '@/components/MapFIAP';

export default function ContactMapSection() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviado, setEnviado] = useState<null | "ok" | "erro">(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email || !mensagem) {
      setEnviado("erro");
      return;
    }
    setEnviado("ok");
  };

  const handleGmailClick = () => {
    const assunto = encodeURIComponent("Contato via Site Mottu");
    const corpo = encodeURIComponent(`Nome: ${nome}\nEmail: ${email}\n\nMensagem:\n${mensagem}`);
    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=contato@mottu.com&su=${assunto}&body=${corpo}`;
    window.open(url, '_blank');
  };

  const handleOutlookClick = () => {
    const assunto = encodeURIComponent("Contato via Site Mottu");
    const corpo = encodeURIComponent(`Nome: ${nome}\nEmail: ${email}\n\nMensagem:\n${mensagem}`);
    const url = `https://outlook.live.com/mail/0/deeplink/compose?to=contato@mottu.com&subject=${assunto}&body=${corpo}`;
    window.open(url, '_blank');
  };

  const handleGenericEmailClick = () => {
    const assunto = encodeURIComponent("Contato via Site Mottu");
    const corpo = encodeURIComponent(`Nome: ${nome}\nEmail: ${email}\n\nMensagem:\n${mensagem}`);
    const url = `mailto:contato@mottu.com?subject=${assunto}&body=${corpo}`;
    window.open(url, '_blank');
  };
  return (
    <section className="pcw-row">
      {/* ESQUERDA: FORM */}
      <form className="pcw-form" onSubmit={handleSubmit}>
        <div className="pcw-heading">Envie uma Mensagem</div>

        <label className="pcw-label flex items-center gap-2" htmlFor="pcwName">
          <i className="ion-ios-person text-blue-400"></i>
          <span>Seu Nome</span>
        </label>
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

        <label className="pcw-label flex items-center gap-2" htmlFor="pcwEmail">
          <i className="ion-ios-mail text-green-400"></i>
          <span>Seu E-mail</span>
        </label>
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

        <label className="pcw-label flex items-center gap-2" htmlFor="pcwMessage">
          <i className="ion-ios-chatbubbles text-purple-400"></i>
          <span>Mensagem</span>
        </label>
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
              Formulário válido! Escolha como enviar:
            </div>
            <div className="grid grid-cols-1 gap-2 mt-2">
              <button
                type="button"
                onClick={handleGmailClick}
                className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 text-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.904.732-1.636 1.636-1.636h3.819v9.273L12 8.155l6.545 4.939V3.821h3.819A1.636 1.636 0 0 1 24 5.457z"/>
                </svg>
                Gmail
              </button>
              <button
                type="button"
                onClick={handleOutlookClick}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 text-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.462 11.85l4.538 2.9v-5.8l-4.538 2.9zM12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/>
                </svg>
                Outlook
              </button>
              <button
                type="button"
                onClick={handleGenericEmailClick}
                className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 text-sm"
              >
                <i className="ion-ios-mail text-lg"></i>
                Email
              </button>
            </div>
          </>
        )}
      </form>

      {/* DIREITA: MAPA */}
      <div className="h-full">
        <MapFIAP />
      </div>
    </section>
  );
}
