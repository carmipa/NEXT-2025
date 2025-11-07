// src/app/ajuda/qrcode/page.tsx
"use client";

import Image from 'next/image';
import '@/types/styles/neumorphic.css';
import ParticleBackground from '@/components/particula/ParticleBackground';

export default function QRCodePage() {
    return (
        <section className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950 to-black">
            {/* Sistema de Partículas */}
            <ParticleBackground />
            
            {/* Background com efeito de gradiente */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent z-[1]"></div>
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] z-[1]"></div>

            <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
                {/* Header */}
                <div className="text-center mb-8 sm:mb-12">
                    <div className="inline-flex items-center gap-3 mb-4 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30">
                        <i className="ion-ios-qr-scanner text-3xl sm:text-4xl text-emerald-400"></i>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-400 via-green-400 to-cyan-400 bg-clip-text text-transparent font-montserrat">
                            QR Code NEXT
                        </h1>
                    </div>
                    <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto mt-4 font-montserrat">
                        Acesse nossa aplicação na VPS através do QR Code abaixo
                    </p>
                </div>

                {/* Card Principal com QR Code */}
                <div className="max-w-2xl mx-auto">
                    <div className="neumorphic-card rounded-3xl p-6 sm:p-8 lg:p-12 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl">
                        {/* QR Code Container */}
                        <div className="flex flex-col items-center space-y-6">
                            {/* QR Code Image */}
                            <div className="relative group">
                                {/* Glow effect */}
                                <div className="absolute -inset-4 bg-gradient-to-r from-emerald-600 via-green-600 to-cyan-600 rounded-3xl opacity-75 blur-2xl group-hover:opacity-100 transition-opacity duration-500"></div>
                                
                                {/* Image Container */}
                                <div className="relative bg-white rounded-2xl p-6 shadow-2xl">
                                    <Image
                                        src="/fotos-equipe/qr-code-pagina.png"
                                        alt="QR Code - Acesse a aplicação NEXT na VPS"
                                        width={400}
                                        height={400}
                                        className="w-full h-auto max-w-xs sm:max-w-sm mx-auto"
                                        priority
                                    />
                                </div>
                            </div>

                            {/* Informações */}
                            <div className="text-center space-y-4 w-full">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
                                    <i className="ion-ios-checkmark-circle text-2xl text-green-400"></i>
                                    <span className="text-sm sm:text-base font-semibold text-green-300 font-montserrat">
                                        Sistema Online
                                    </span>
                                </div>

                                {/* URL do servidor */}
                                <div className="bg-black/30 rounded-xl p-4 border border-emerald-500/20">
                                    <p className="text-xs sm:text-sm text-gray-400 mb-2 font-montserrat">
                                        Servidor VPS:
                                    </p>
                                    <div className="flex items-center justify-center gap-2 flex-wrap">
                                        <i className="ion-ios-globe text-cyan-400 text-xl"></i>
                                        <code className="text-sm sm:text-base font-mono text-cyan-300 font-semibold">
                                            http://72.61.219.15:3000
                                        </code>
                                    </div>
                                </div>

                                {/* Instruções */}
                                <div className="mt-6 p-4 bg-gradient-to-r from-emerald-900/20 to-blue-900/20 rounded-xl border border-emerald-500/20">
                                    <h3 className="text-lg font-semibold text-emerald-300 mb-3 flex items-center justify-center gap-2 font-montserrat">
                                        <i className="ion-ios-information-circle text-xl"></i>
                                        Como usar
                                    </h3>
                                    <ol className="text-left text-sm sm:text-base text-gray-300 space-y-2 max-w-md mx-auto font-montserrat">
                                        <li className="flex items-start gap-2">
                                            <span className="text-emerald-400 font-bold">1.</span>
                                            <span>Abra o aplicativo de câmera do seu celular</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-emerald-400 font-bold">2.</span>
                                            <span>Aponte para o QR Code acima</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-emerald-400 font-bold">3.</span>
                                            <span>Toque na notificação que aparecer</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-emerald-400 font-bold">4.</span>
                                            <span>Você será redirecionado para a aplicação</span>
                                        </li>
                                    </ol>
                                </div>

                                {/* Link direto */}
                                <div className="mt-6">
                                    <a
                                        href="http://72.61.219.15:3000"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-emerald-500/50 font-montserrat"
                                    >
                                        <i className="ion-ios-globe text-xl"></i>
                                        Acessar Diretamente
                                        <i className="ion-ios-arrow-forward text-xl"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Informações Adicionais */}
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 backdrop-blur-sm rounded-xl p-4 border border-emerald-500/20 text-center">
                            <i className="ion-ios-speedometer text-3xl text-emerald-400 mb-2"></i>
                            <h4 className="text-sm font-semibold text-emerald-300 mb-1 font-montserrat">Rápido</h4>
                            <p className="text-xs text-gray-400 font-montserrat">Acesso instantâneo</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 backdrop-blur-sm rounded-xl p-4 border border-green-500/20 text-center">
                            <i className="ion-ios-lock text-3xl text-green-400 mb-2"></i>
                            <h4 className="text-sm font-semibold text-green-300 mb-1 font-montserrat">Seguro</h4>
                            <p className="text-xs text-gray-400 font-montserrat">Servidor dedicado</p>
                        </div>
                        <div className="bg-gradient-to-br from-teal-900/30 to-teal-800/20 backdrop-blur-sm rounded-xl p-4 border border-teal-500/20 text-center">
                            <i className="ion-ios-phone-portrait text-3xl text-teal-400 mb-2"></i>
                            <h4 className="text-sm font-semibold text-teal-300 mb-1 font-montserrat">Mobile</h4>
                            <p className="text-xs text-gray-400 font-montserrat">100% responsivo</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

