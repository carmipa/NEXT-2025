'use client';

import { useState } from 'react';
import Image from 'next/image';
import '@/types/styles/neumorphic.css';

export default function AppDownloadPage() {
  const [qrCodeLoaded, setQrCodeLoaded] = useState(false);

  return (
    <main className="min-h-screen text-white p-6 md:p-12 flex items-center justify-center relative z-20">
      <div className="container max-w-4xl mx-auto text-center">
        <h1 className="text-6xl md:text-7xl font-bold text-white mb-6" style={{fontFamily: 'Montserrat, sans-serif'}}>
          Radar Mottu
        </h1>
        <p className="text-xl md:text-2xl text-slate-300 mb-8" style={{fontFamily: 'Montserrat, sans-serif'}}>
          Baixe nosso app de rastreamento
        </p>
        
        {/* Android Badge */}
        <div className="flex justify-center mb-16">
          <div className="bg-green-600/20 backdrop-blur-sm rounded-xl px-6 py-4 border border-green-500/30 flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.1779 13.8533 7.8508 12 7.8508s-3.5902.3271-5.1367.8949L4.841 5.2426a.416.416 0 00-.5676-.1521.416.416 0 00-.1521.5676l1.9973 3.4592C2.6889 9.1867.3432 11.6586 0 14.761h24c-.3432-3.1024-2.6889-5.5743-6.1185-6.4396"/>
              </svg>
            </div>
            <div className="text-left">
              <div className="text-green-400 font-bold text-lg" style={{fontFamily: 'Montserrat, sans-serif'}}>
                Android
              </div>
              <div className="text-green-300 text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}>
                Compatível apenas com Android
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 md:p-16 border border-white/20 mb-16">
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{fontFamily: 'Montserrat, sans-serif'}}>
              <i className="ion-ios-download mr-3 text-emerald-400"></i>
              App Download
            </h2>
            <p className="text-lg text-gray-300 mb-8" style={{fontFamily: 'Montserrat, sans-serif'}}>
              Escaneie o QR Code abaixo para baixar nosso aplicativo Android de rastreamento
            </p>
          </div>

          {/* QR Code Container */}
          <div className="flex justify-center mb-8">
            <div className="bg-white p-8 rounded-xl shadow-2xl">
              <div className="w-80 h-80 flex items-center justify-center">
                {!qrCodeLoaded && (
                  <div className="animate-pulse">
                    <div className="w-72 h-72 bg-gray-200 rounded-lg"></div>
                  </div>
                )}
                <Image
                  src="/fotos-equipe/qrcod-app.png"
                  alt="QR Code para download do app"
                  width={320}
                  height={320}
                  className={`w-full h-full object-contain rounded-lg transition-opacity duration-500 ${qrCodeLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setQrCodeLoaded(true)}
                />
              </div>
            </div>
          </div>

          {/* Download Info */}
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-4" style={{fontFamily: 'Montserrat, sans-serif'}}>
              Ou acesse diretamente:
            </p>
            <a 
              href="https://drive.google.com/file/d/1vwxqbmOiPhmOjllbNoj7pKdSbM2nrJ6V/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
              style={{fontFamily: 'Montserrat, sans-serif'}}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.1779 13.8533 7.8508 12 7.8508s-3.5902.3271-5.1367.8949L4.841 5.2426a.416.416 0 00-.5676-.1521.416.416 0 00-.1521.5676l1.9973 3.4592C2.6889 9.1867.3432 11.6586 0 14.761h24c-.3432-3.1024-2.6889-5.5743-6.1185-6.4396"/>
              </svg>
              <i className="ion-ios-download text-xl"></i>
              Baixar App do Link
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ion-ios-pulse text-2xl text-emerald-400"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
              Rastreamento Sonar
            </h3>
            <p className="text-gray-400" style={{fontFamily: 'Montserrat, sans-serif'}}>
              Localização precisa usando tecnologia sonar avançada
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ion-ios-navigate text-2xl text-blue-400"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
              Rastreamento Cartesiano
            </h3>
            <p className="text-gray-400" style={{fontFamily: 'Montserrat, sans-serif'}}>
              Coordenadas precisas em sistema cartesiano 3D com latitude e longitude
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ion-ios-camera text-2xl text-purple-400"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
              Identificação de Placa via API
            </h3>
            <p className="text-gray-400" style={{fontFamily: 'Montserrat, sans-serif'}}>
              Reconhecimento automático de placas usando IA
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-orange-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                <circle cx="12" cy="9" r="2"/>
                <path d="M12 1C5.93 1 1 5.93 1 12s4.93 11 11 11 11-4.93 11-11S18.07 1 12 1zm0 20c-4.96 0-9-4.04-9-9s4.04-9 9-9 9 4.04 9 9-4.04 9-9 9z"/>
                <text x="12" y="16" textAnchor="middle" fontSize="3" fill="currentColor">GPS</text>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
              Coordenadas em Tempo Real
            </h3>
            <p className="text-gray-400" style={{fontFamily: 'Montserrat, sans-serif'}}>
              Exibição de latitude e longitude atualizadas em tempo real
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500" style={{fontFamily: 'Montserrat, sans-serif'}}>
            <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.1779 13.8533 7.8508 12 7.8508s-3.5902.3271-5.1367.8949L4.841 5.2426a.416.416 0 00-.5676-.1521.416.416 0 00-.1521.5676l1.9973 3.4592C2.6889 9.1867.3432 11.6586 0 14.761h24c-.3432-3.1024-2.6889-5.5743-6.1185-6.4396"/>
            </svg>
            <span>Versão 1.0.0 • Compatível apenas com Android</span>
          </div>
        </div>
      </div>
    </main>
  );
}
