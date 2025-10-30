"use client";

import { useParams } from 'next/navigation';
import { useState, useRef, ChangeEvent } from 'react';
import { Camera, Loader2, CheckCircle, AlertTriangle, FileImage, Send, RefreshCw } from 'lucide-react';
import { RadarService } from '@/utils/api';
import Image from 'next/image';

type UploadStatus = 'idle' | 'preview' | 'uploading' | 'success' | 'error';

export default function MobileUploadPage() {
    const params = useParams();
    const sessionId = typeof params.sessionId === 'string' ? params.sessionId : null;

    const cameraInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    const [status, setStatus] = useState<UploadStatus>('idle');
    const [message, setMessage] = useState('');

    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    // Converte qualquer imagem para JPEG usando canvas
    const toJpegFile = async (file: File): Promise<File> => {
        try {
            // cria bitmap (rápido) quando disponível
            const bitmap = await createImageBitmap(file);
            const canvas = document.createElement('canvas');
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Canvas 2D não disponível');
            ctx.drawImage(bitmap, 0, 0);

            const blob: Blob = await new Promise((resolve, reject) => {
                canvas.toBlob(
                    (b) => (b ? resolve(b) : reject(new Error('Falha ao gerar JPEG'))),
                    'image/jpeg',
                    0.92
                );
            });

            return new File([blob], (file.name || 'captura').replace(/\.\w+$/, '') + '.jpg', {
                type: 'image/jpeg',
                lastModified: Date.now(),
            });
        } catch {
            // fallback simples: se não conseguir, retorna o próprio arquivo original
            return file;
        }
    };

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Converte para JPEG (evita HEIC/WEBP no backend)
        const jpeg = await toJpegFile(file);
        setImageFile(jpeg);

        const previewUrl = URL.createObjectURL(jpeg);
        setImagePreviewUrl(previewUrl);

        setStatus('preview');
        setMessage('');
    };

    const handleUpload = async () => {
        if (!imageFile || !sessionId) return;

        setStatus('uploading');
        setMessage('A enviar imagem...');

        try {
            const form = new FormData();
            form.append('image', imageFile, imageFile.name);

            await RadarService.uploadImagem(sessionId, form); // envia multipart
            setStatus('success');
            setMessage('Foto enviada com sucesso! Pode fechar esta janela.');
        } catch (error: any) {
            console.error("Erro no upload:", error);
            setStatus('error');
            setMessage(error?.response?.data?.error || 'Ocorreu um erro ao enviar a imagem.');
        }
    };

    const resetSelection = () => {
        setStatus('idle');
        setImageFile(null);
        if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
        setImagePreviewUrl(null);
        setMessage('');
    };

    return (
        <main className="min-h-screen  text-white p-4 flex flex-col items-center justify-center text-center">
            <div className="w-full max-w-sm">
                {/* Inputs ocultos */}
                <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment" // câmera traseira
                    onChange={handleFileChange}
                    className="hidden"
                />
                <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />

                {/* ESTADO INICIAL */}
                {status === 'idle' && (
                    <>
                        <h1 className="text-3xl font-bold text-[var(--color-mottu-light)] mb-2">Capturar Placa</h1>
                        <p className="text-slate-300 mb-8">Tire uma foto ou escolha uma imagem da sua galeria.</p>
                        <div className="space-y-4">
                            <button
                                onClick={() => cameraInputRef.current?.click()}
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 font-semibold text-white bg-[var(--color-mottu-default)] rounded-lg shadow-lg text-lg"
                            >
                                <Camera size={28} />
                                Tirar Foto
                            </button>
                            <button
                                onClick={() => galleryInputRef.current?.click()}
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 font-semibold text-white bg-slate-700 rounded-lg shadow-lg text-lg"
                            >
                                <FileImage size={28} />
                                Escolher da Galeria
                            </button>
                        </div>
                    </>
                )}

                {/* PRÉ-VISUALIZAÇÃO */}
                {status === 'preview' && imagePreviewUrl && (
                    <>
                        <h2 className="text-2xl font-bold text-white mb-4">Pré-visualização</h2>
                        <div className="relative w-full h-64 mb-6 rounded-lg overflow-hidden border-2 border-slate-600">
                            <Image src={imagePreviewUrl} alt="Pré-visualização da placa" fill className="object-contain" />
                        </div>
                        <div className="space-y-3">
                            <button
                                onClick={handleUpload}
                                className="w-full flex items-center justify-center gap-3 px-6 py-3 font-semibold text-white bg-green-600 rounded-lg text-md"
                            >
                                <Send size={20} /> Enviar Foto
                            </button>
                            <button
                                onClick={resetSelection}
                                className="w-full flex items-center justify-center gap-2 px-6 py-2 text-sm text-slate-300 hover:underline"
                            >
                                <RefreshCw size={14} /> Tirar Outra Foto / Escolher Outra
                            </button>
                        </div>
                    </>
                )}

                {/* STATUS */}
                <div className="mt-6 min-h-[80px]">
                    {status === 'uploading' && (
                        <div className="flex flex-col items-center gap-2 text-sky-300">
                            <Loader2 size={32} className="animate-spin" />
                            <p>{message}</p>
                        </div>
                    )}
                    {status === 'success' && (
                        <div className="flex flex-col items-center gap-2 text-green-400">
                            <CheckCircle size={32} />
                            <p>{message}</p>
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="flex flex-col items-center gap-2 text-red-400">
                            <AlertTriangle size={32} />
                            <p className="font-bold">Falha no Envio</p>
                            <p className="text-sm">{message}</p>
                            <button
                                onClick={resetSelection}
                                className="mt-4 px-4 py-2 bg-slate-600 rounded-md text-white"
                            >
                                Tentar Novamente
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
