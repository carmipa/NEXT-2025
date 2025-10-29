// Caminho: src/app/patio/cadastrar/page.tsx
"use client";

import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
import { PatioService, EnderecoService } from '@/utils/api';
import { PatioRequestDto, PatioResponseDto } from '@/types/patio';
import { ContatoRequestDto } from '@/types/contato';
import { EnderecoRequestDto } from '@/types/endereco';
import { MdAdd, MdSave, MdArrowBack, MdErrorOutline, MdCheckCircle } from 'react-icons/md';
import { Building, Calendar, Text, Phone, Home } from 'lucide-react';

export default function CadastrarPatioPage() {
	const initialState: PatioRequestDto = {
		nomePatio: '',
		observacao: '',
		status: 'A',
		contato: undefined,
		endereco: undefined,
	};

	const [formData, setFormData] = useState<PatioRequestDto>(initialState);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	// Estados para contato e endereço do pátio
	const [contatoPatio, setContatoPatio] = useState<ContatoRequestDto>({
		email: '',
		ddd: 11,
		ddi: 55,
		telefone1: '',
		telefone2: '',
		telefone3: '',
		celular: '',
		outro: '',
		observacao: '',
	});

	const [enderecoPatio, setEnderecoPatio] = useState<EnderecoRequestDto>({
		cep: '',
		numero: 0,
		complemento: '',
		observacao: '',
	});

	// Estados para dados do ViaCEP
	const [dadosViaCep, setDadosViaCep] = useState({
		logradouro: '',
		bairro: '',
		cidade: '',
		estado: '',
		pais: 'Brasil',
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	// Função para buscar dados do CEP
	const buscarCep = async (cep: string) => {
		const cleanCep = cep.replace(/\D/g, '');
		if (cleanCep.length === 8) {
			try {
				const dados = await EnderecoService.buscarCep(cleanCep);
				setDadosViaCep(dados);
				setEnderecoPatio(prev => ({ ...prev, cep: cleanCep }));
			} catch (err: any) {
				setError(`Erro ao buscar CEP: ${err.message}`);
			}
		}
	};

	// Handler para mudança no CEP
	const handleCepChange = (value: string) => {
		setEnderecoPatio(prev => ({ ...prev, cep: value }));
		buscarCep(value);
	};

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);
		setSuccess(null);
		try {
			// Monta o payload com status obrigatório e, opcionalmente, contato/endereço aninhados
			const payload: PatioRequestDto = { ...formData };
			if (contatoPatio.email && contatoPatio.celular) {
				payload.contato = contatoPatio;
			}
			if (enderecoPatio.cep && enderecoPatio.numero && dadosViaCep.logradouro) {
				payload.endereco = { ...enderecoPatio, ...dadosViaCep } as any;
			}

			const createdPatio = await PatioService.create(payload);
			setSuccess(`Pátio "${createdPatio.nomePatio}" cadastrado com sucesso!`);
			setFormData(initialState);
			setContatoPatio({
				email: '',
				ddd: 11,
				ddi: 55,
				telefone1: '',
				telefone2: '',
				telefone3: '',
				celular: '',
				outro: '',
				observacao: '',
			});
			setEnderecoPatio({
				cep: '',
				numero: 0,
				complemento: '',
				observacao: '',
			});
			setDadosViaCep({
				logradouro: '',
				bairro: '',
				cidade: '',
				estado: '',
				pais: 'Brasil',
			});
		} catch (err: any) {
			setError(err.response?.data?.message || 'Falha ao cadastrar pátio.');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<main className="min-h-screen text-white p-4 md:p-8 flex items-center justify-center relative z-20">
				<div className="container max-w-3xl mx-auto bg-[var(--color-mottu-default)] p-6 md:p-8 rounded-lg shadow-xl neumorphic-container">
					<h1 className="text-2xl md:text-3xl font-bold text-white flex items-center justify-center mb-6">
						<MdAdd size={32} className="mr-3" />
						Cadastrar Novo Pátio
					</h1>

					

					<form onSubmit={handleSubmit} className="space-y-6">
						{/* --- Seção de Dados do Pátio --- */}
						<fieldset className="neumorphic-fieldset">
							<legend className="neumorphic-legend">Informações do Pátio</legend>
							<div className="space-y-4 pt-2">
								<div className="group">
									<label htmlFor="nomePatio" className="neumorphic-label"><Building size={16}/> Nome do Pátio <span className="text-red-300">*</span></label>
									<input type="text" id="nomePatio" name="nomePatio" value={formData.nomePatio} onChange={handleChange} required placeholder="Ex: Pátio Guarulhos Central" maxLength={50} className="neumorphic-input h-10 peer required:invalid:border-red-500" />
									<p className="mt-1 text-xs text-slate-300 invisible peer-invalid:visible">Campo obrigatório.</p>
								</div>

								<div className="group">
									<label htmlFor="dataCadastro" className="neumorphic-label"><Calendar size={16}/> Data de Cadastro</label>
									<input 
										type="date" 
										id="dataCadastro" 
										value={new Date().toISOString().split('T')[0]} 
										readOnly 
										className="neumorphic-input h-10 neumorphic-input-disabled cursor-not-allowed" 
										title="Data de cadastro preenchida automaticamente pelo sistema"
									/>
									<p className="mt-1 text-xs text-slate-300">Preenchido automaticamente pelo sistema</p>
								</div>
								<div>
									<label htmlFor="observacao" className="neumorphic-label"><Text size={16}/> Observação</label>
									<textarea id="observacao" name="observacao" value={formData.observacao || ''} onChange={handleChange} rows={3} placeholder="Alguma observação sobre o pátio..." className="neumorphic-textarea" />
								</div>
							</div>
						</fieldset>

						{/* --- Seção de Contato do Pátio --- */}
						<fieldset className="neumorphic-fieldset">
							<legend className="neumorphic-legend flex items-center gap-2"><Phone size={16}/> Contato do Pátio</legend>
							<div className="bg-black/20 p-4 rounded-md mb-2 space-y-3 neumorphic-container">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
									<div>
										<label className="neumorphic-label">Email *</label>
										<input type="email" value={contatoPatio.email} onChange={(e) => setContatoPatio(prev => ({ ...prev, email: e.target.value }))} className="neumorphic-input h-8 text-sm" placeholder="email@exemplo.com" />
									</div>
									<div>
										<label className="neumorphic-label">Celular *</label>
										<input type="tel" value={contatoPatio.celular} onChange={(e) => setContatoPatio(prev => ({ ...prev, celular: e.target.value }))} className="neumorphic-input h-8 text-sm" placeholder="11999999999" />
									</div>
									<div>
										<label className="neumorphic-label">DDD</label>
										<input type="number" value={contatoPatio.ddd} onChange={(e) => setContatoPatio(prev => ({ ...prev, ddd: parseInt(e.target.value) || 11 }))} className="neumorphic-input h-8 text-sm" aria-label="DDD do telefone" />
									</div>
									<div>
										<label className="neumorphic-label">DDI</label>
										<input type="number" value={contatoPatio.ddi} onChange={(e) => setContatoPatio(prev => ({ ...prev, ddi: parseInt(e.target.value) || 55 }))} className="neumorphic-input h-8 text-sm" aria-label="DDI do telefone" />
									</div>
									<div>
										<label className="neumorphic-label">Telefone 1</label>
										<input type="tel" value={contatoPatio.telefone1} onChange={(e) => setContatoPatio(prev => ({ ...prev, telefone1: e.target.value }))} className="neumorphic-input h-8 text-sm" aria-label="Telefone 1" />
									</div>
									<div>
										<label className="neumorphic-label">Telefone 2</label>
										<input type="tel" value={contatoPatio.telefone2} onChange={(e) => setContatoPatio(prev => ({ ...prev, telefone2: e.target.value }))} className="neumorphic-input h-8 text-sm" aria-label="Telefone 2" />
									</div>
									<div>
										<label className="neumorphic-label">Telefone 3</label>
										<input type="tel" value={contatoPatio.telefone3} onChange={(e) => setContatoPatio(prev => ({ ...prev, telefone3: e.target.value }))} className="neumorphic-input h-8 text-sm" aria-label="Telefone 3" />
									</div>
									<div>
										<label className="neumorphic-label">Outro</label>
										<input type="text" value={contatoPatio.outro} onChange={(e) => setContatoPatio(prev => ({ ...prev, outro: e.target.value }))} className="neumorphic-input h-8 text-sm" aria-label="Outro contato" />
									</div>
								</div>
								<div>
									<label className="neumorphic-label">Observação</label>
									<textarea value={contatoPatio.observacao} onChange={(e) => setContatoPatio(prev => ({ ...prev, observacao: e.target.value }))} className="neumorphic-textarea h-16 text-sm" placeholder="Observações sobre o contato..." />
								</div>
							</div>
						</fieldset>

						{/* --- Seção de Endereço do Pátio --- */}
						<fieldset className="neumorphic-fieldset">
							<legend className="neumorphic-legend flex items-center gap-2"><Home size={16}/> Endereço do Pátio</legend>
							<div className="bg-black/20 p-4 rounded-md mb-2 space-y-3 neumorphic-container">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
									<div>
										<label className="neumorphic-label">CEP *</label>
										<input type="text" value={enderecoPatio.cep} onChange={(e) => handleCepChange(e.target.value)} className="neumorphic-input h-8 text-sm" placeholder="00000-000" maxLength={9} />
									</div>
									<div>
										<label className="neumorphic-label">Número *</label>
										<input type="number" value={enderecoPatio.numero} onChange={(e) => setEnderecoPatio(prev => ({ ...prev, numero: parseInt(e.target.value) || 0 }))} className="neumorphic-input h-8 text-sm" placeholder="123" />
									</div>
									<div>
										<label className="neumorphic-label">Logradouro</label>
										<input type="text" value={dadosViaCep.logradouro} readOnly className="neumorphic-input h-8 text-sm neumorphic-input-disabled" placeholder="Preenchido automaticamente" aria-label="Logradouro preenchido automaticamente" />
									</div>
									<div>
										<label className="neumorphic-label">Bairro</label>
										<input type="text" value={dadosViaCep.bairro} readOnly className="neumorphic-input h-8 text-sm neumorphic-input-disabled" placeholder="Preenchido automaticamente" aria-label="Bairro preenchido automaticamente" />
									</div>
									<div>
										<label className="neumorphic-label">Cidade</label>
										<input type="text" value={dadosViaCep.cidade} readOnly className="neumorphic-input h-8 text-sm neumorphic-input-disabled" placeholder={dadosViaCep.cidade ? "" : "Preenchido automaticamente"} aria-label="Cidade preenchida automaticamente" />
									</div>
									<div>
										<label className="neumorphic-label">Estado</label>
										<input type="text" value={dadosViaCep.estado} readOnly className="neumorphic-input h-8 text-sm neumorphic-input-disabled" placeholder={dadosViaCep.estado ? "" : "Preenchido automaticamente"} aria-label="Estado preenchido automaticamente" />
									</div>
									<div className="md:col-span-2">
										<label className="neumorphic-label">Complemento</label>
										<input type="text" value={enderecoPatio.complemento} onChange={(e) => setEnderecoPatio(prev => ({ ...prev, complemento: e.target.value }))} className="neumorphic-input h-8 text-sm" placeholder="Apartamento, sala, etc." />
									</div>
								</div>
								<div>
									<label className="neumorphic-label">Observação</label>
									<textarea value={enderecoPatio.observacao} onChange={(e) => setEnderecoPatio(prev => ({ ...prev, observacao: e.target.value }))} className="neumorphic-textarea h-16 text-sm" placeholder="Observações sobre o endereço..." />
								</div>
							</div>
					</fieldset>
					
					{/* Mensagens de erro/sucesso posicionadas acima dos botões */}
					<div className="mt-4 space-y-3">
						{error && <div className="flex items-center gap-2 text-sm text-red-700 p-3 rounded-md bg-red-100 border border-red-300"><MdErrorOutline className="text-xl" /> <span>{error}</span></div>}
						{success && <div className="flex items-center gap-2 text-sm text-green-700 p-3 rounded-md bg-green-100 border border-green-300"><MdCheckCircle className="text-xl" /> <span>{success}</span></div>}
					</div>

						<div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
							<button type="submit" disabled={isLoading} className="neumorphic-button !bg-[var(--color-mottu-dark)] hover:!bg-opacity-80 text-white w-full sm:w-auto">
								<MdSave size={20} /> {isLoading ? 'Salvando...' : 'Salvar Pátio'}
							</button>
							<Link href="/patio/listar" className="neumorphic-button w-full sm:w-auto flex items-center justify-center gap-2">
								<MdArrowBack size={20} /> Voltar para Lista
							</Link>
						</div>
					</form>
				</div>
			</main>
		</>
	);
}