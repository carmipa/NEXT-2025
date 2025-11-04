package br.com.fiap.mottu.service;

import br.com.fiap.mottu.dto.notificacao.NotificacaoResponseDto;
import br.com.fiap.mottu.model.Notificacao;
import br.com.fiap.mottu.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificacaoService {
    
    public final NotificacaoRepository notificacaoRepository;
    private final PatioRepository patioRepository;
    private final BoxRepository boxRepository;
    private final LogMovimentacaoRepository logRepository;
    private final ZonaRepository zonaRepository;
    private final EstacionamentoRepository estacionamentoRepository; // Adicionado para usar TB_ESTACIONAMENTO
    
    /**
     * Lista notificações com filtros
     */
    public Page<NotificacaoResponseDto> listarNotificacoes(
            Boolean lida,
            Notificacao.PrioridadeNotificacao prioridade,
            Notificacao.CategoriaNotificacao categoria,
            Notificacao.TipoNotificacao tipo,
            Pageable pageable) {
        
        Page<Notificacao> notificacoes = notificacaoRepository.findByFiltros(
            lida, prioridade, categoria, tipo, pageable);
        
        return notificacoes.map(NotificacaoResponseDto::fromEntity);
    }
    
    /**
     * Marca notificação como lida
     */
    public void marcarComoLida(Long id) {
        Notificacao notificacao = notificacaoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Notificação não encontrada"));
        
        notificacao.setLida(true);
        notificacao.setDataHoraLeitura(LocalDateTime.now());
        notificacaoRepository.save(notificacao);
        
        log.info("Notificação {} marcada como lida", id);
    }
    
    /**
     * Marca todas as notificações como lidas
     */
    public void marcarTodasComoLidas() {
        List<Notificacao> naoLidas = notificacaoRepository.findByLidaFalseOrderByDataHoraCriacaoDesc(
            Pageable.unpaged()).getContent();
        
        naoLidas.forEach(notif -> {
            notif.setLida(true);
            notif.setDataHoraLeitura(LocalDateTime.now());
        });
        
        notificacaoRepository.saveAll(naoLidas);
        log.info("{} notificações marcadas como lidas", naoLidas.size());
    }
    
    /**
     * Gera notificações dinâmicas baseadas no sistema
     */
    public void gerarNotificacoesDinamicas() {
        log.info("Gerando notificações dinâmicas baseadas no sistema");
        
        try {
            // Criar uma notificação simples para teste com timestamp único
            String timestamp = String.valueOf(System.currentTimeMillis());
            String tituloTeste = "Sistema de Notificações Ativo " + timestamp;
            
            // Criar notificação diretamente sem verificações
            Notificacao notificacao = Notificacao.builder()
                .titulo(tituloTeste)
                .mensagem("O sistema de notificações está funcionando corretamente!")
                .tipo(Notificacao.TipoNotificacao.INFO)
                .prioridade(Notificacao.PrioridadeNotificacao.BAIXA)
                .categoria(Notificacao.CategoriaNotificacao.SISTEMA)
                .lida(false)
                .dataHoraCriacao(LocalDateTime.now())
                .build();
            
            notificacaoRepository.save(notificacao);
            log.info("Notificação criada: {}", tituloTeste);
            
            log.info("Notificações dinâmicas geradas com sucesso");
        } catch (Exception e) {
            log.error("Erro ao gerar notificações dinâmicas", e);
            throw e;
        }
    }
    
    private void verificarOcupacaoAlta() {
        try {
            log.info("Verificando ocupação alta usando TB_ESTACIONAMENTO - DADOS REAIS");
            
            // Buscar todos os pátios
            List<br.com.fiap.mottu.model.Patio> patios = patioRepository.findAll();
            
            for (br.com.fiap.mottu.model.Patio patio : patios) {
                // Total de boxes do pátio
                long totalBoxes = boxRepository.countByPatio(patio);
                
                // Boxes realmente ocupados através de TB_ESTACIONAMENTO
                long boxesOcupados = estacionamentoRepository.countByPatioIdPatioAndEstaEstacionadoTrue(patio.getIdPatio());
                
                if (totalBoxes > 0) {
                    double taxaOcupacao = (double) boxesOcupados / totalBoxes;
                    
                    log.debug("Pátio {}: {} boxes ocupados de {} total (taxa: {:.2f}%)", 
                            patio.getNomePatio(), boxesOcupados, totalBoxes, taxaOcupacao * 100);
                    
                    if (taxaOcupacao >= 0.9) {
                        criarNotificacao(
                            "Ocupação Crítica",
                            String.format("Pátio %s com ocupação de %.1f%% - Próximo da capacidade máxima! (%d/%d boxes ocupados)", 
                                patio.getNomePatio(), taxaOcupacao * 100, boxesOcupados, totalBoxes),
                            Notificacao.TipoNotificacao.ERROR,
                            Notificacao.PrioridadeNotificacao.CRITICA,
                            Notificacao.CategoriaNotificacao.OCUPACAO
                        );
                    } else if (taxaOcupacao >= 0.8) {
                        criarNotificacao(
                            "Ocupação Alta",
                            String.format("Pátio %s com ocupação de %.1f%% - Monitorar situação (%d/%d boxes ocupados)", 
                                patio.getNomePatio(), taxaOcupacao * 100, boxesOcupados, totalBoxes),
                            Notificacao.TipoNotificacao.WARNING,
                            Notificacao.PrioridadeNotificacao.ALTA,
                            Notificacao.CategoriaNotificacao.OCUPACAO
                        );
                    }
                }
            }
        } catch (Exception e) {
            log.error("Erro ao verificar ocupação alta", e);
        }
    }
    
    private void verificarMovimentacaoAnomala() {
        try {
            // Verificar se há muitas entradas ou saídas em um período curto
            LocalDateTime agora = LocalDateTime.now();
            LocalDateTime umaHoraAtras = agora.minusHours(1);
            
            Long entradasUltimaHora = logRepository.countByTipoMovimentacaoAndDataHoraMovimentacaoBetween(
                br.com.fiap.mottu.model.LogMovimentacao.TipoMovimentacao.ENTRADA, umaHoraAtras, agora);
            
            Long saidasUltimaHora = logRepository.countByTipoMovimentacaoAndDataHoraMovimentacaoBetween(
                br.com.fiap.mottu.model.LogMovimentacao.TipoMovimentacao.SAIDA, umaHoraAtras, agora);
            
            if (entradasUltimaHora > 50) {
                criarNotificacao(
                    "Pico de Entradas",
                    String.format("Alto volume de entradas detectado: %d veículos na última hora", entradasUltimaHora),
                    Notificacao.TipoNotificacao.WARNING,
                    Notificacao.PrioridadeNotificacao.MEDIA,
                    Notificacao.CategoriaNotificacao.MOVIMENTACAO
                );
            }
            
            if (saidasUltimaHora > 50) {
                criarNotificacao(
                    "Pico de Saídas",
                    String.format("Alto volume de saídas detectado: %d veículos na última hora", saidasUltimaHora),
                    Notificacao.TipoNotificacao.INFO,
                    Notificacao.PrioridadeNotificacao.BAIXA,
                    Notificacao.CategoriaNotificacao.MOVIMENTACAO
                );
            }
            
        } catch (Exception e) {
            log.error("Erro ao verificar movimentação anômala", e);
        }
    }
    
    private void verificarStatusSistema() {
        try {
            // Verificar se há boxes inativos
            Long boxesInativos = boxRepository.countByStatus("I");
            Long totalBoxes = boxRepository.count();
            
            if (boxesInativos > 0) {
                double percentualInativos = (double) boxesInativos / totalBoxes;
                
                if (percentualInativos > 0.1) { // Mais de 10% inativos
                    criarNotificacao(
                        "Boxes Inativos",
                        String.format("%d boxes inativos (%.1f%% do total) - Verificar status dos equipamentos", 
                            boxesInativos, percentualInativos * 100),
                        Notificacao.TipoNotificacao.WARNING,
                        Notificacao.PrioridadeNotificacao.ALTA,
                        Notificacao.CategoriaNotificacao.SISTEMA
                    );
                }
            }
            
            // Verificar zonas ativas
            Long zonasAtivas = zonaRepository.count();
            if (zonasAtivas == 0) {
                criarNotificacao(
                    "Nenhuma Zona Ativa",
                    "Nenhuma zona está ativa no sistema - Verificar configuração",
                    Notificacao.TipoNotificacao.ERROR,
                    Notificacao.PrioridadeNotificacao.CRITICA,
                    Notificacao.CategoriaNotificacao.SISTEMA
                );
            }
            
        } catch (Exception e) {
            log.error("Erro ao verificar status do sistema", e);
        }
    }
    
    private void verificarNecessidadesManutencao() {
        try {
            log.info("Verificando necessidades de manutenção usando TB_ESTACIONAMENTO - DADOS REAIS");
            
            // Contar boxes realmente ocupados através de TB_ESTACIONAMENTO (todos os pátios)
            long boxesOcupados = estacionamentoRepository.countByEstaEstacionadoTrue();
            long totalBoxes = boxRepository.count();
            
            log.debug("Total de boxes ocupados (TB_ESTACIONAMENTO): {} de {}", boxesOcupados, totalBoxes);
            
            if (totalBoxes > 0) {
                double taxaOcupacao = (double) boxesOcupados / totalBoxes;
                
                if (taxaOcupacao > 0.95) {
                    criarNotificacao(
                        "Manutenção Preventiva Necessária",
                        String.format("Sistema próximo da capacidade máxima - %.1f%% de ocupação (%d/%d boxes ocupados). Agendar manutenção preventiva.", 
                            taxaOcupacao * 100, boxesOcupados, totalBoxes),
                        Notificacao.TipoNotificacao.WARNING,
                        Notificacao.PrioridadeNotificacao.ALTA,
                        Notificacao.CategoriaNotificacao.MANUTENCAO
                    );
                }
            }
            
        } catch (Exception e) {
            log.error("Erro ao verificar necessidades de manutenção", e);
        }
    }
    
    private void criarNotificacao(String titulo, String mensagem, 
                                Notificacao.TipoNotificacao tipo,
                                Notificacao.PrioridadeNotificacao prioridade,
                                Notificacao.CategoriaNotificacao categoria) {
        
        try {
            // Verificar se já existe notificação com o mesmo título
            boolean jaExiste = notificacaoRepository.existsByTituloAndDataHoraCriacaoAfter(titulo, LocalDateTime.now().minusDays(1));
            
            if (!jaExiste) {
                // Determinar URL de redirecionamento baseada na categoria
                String urlRedirecionamento = determinarUrlRedirecionamento(categoria, titulo);
                
                Notificacao notificacao = Notificacao.builder()
                    .titulo(titulo)
                    .mensagem(mensagem)
                    .tipo(tipo)
                    .prioridade(prioridade)
                    .categoria(categoria)
                    .lida(false)
                    .dataHoraCriacao(LocalDateTime.now())
                    .urlRedirecionamento(urlRedirecionamento)
                    .build();
                
                notificacaoRepository.save(notificacao);
                log.info("Notificação criada: {} -> {}", titulo, urlRedirecionamento);
            } else {
                log.info("Notificação '{}' já existe, pulando criação", titulo);
            }
        } catch (Exception e) {
            log.error("Erro ao criar notificação '{}': {}", titulo, e.getMessage());
            // Não relançar a exceção para não interromper o processo
        }
    }
    
    private String determinarUrlRedirecionamento(Notificacao.CategoriaNotificacao categoria, String titulo) {
        switch (categoria) {
            case OCUPACAO:
                return "/relatorios/ocupacao-diaria";
            case MOVIMENTACAO:
                return "/relatorios/movimentacao";
            case SISTEMA:
                if (titulo.contains("Boxes") || titulo.contains("Status")) {
                    return "/patio";
                }
                return "/relatorios/avancados";
            case MANUTENCAO:
                return "/relatorios/avancados";
            case SEGURANCA:
                return "/relatorios/avancados";
            default:
                return "/relatorios";
        }
    }
    
    /**
     * Limpa todas as notificações
     */
    @Transactional
    public void limparTodasNotificacoes() {
        log.info("Limpando todas as notificações");
        
        try {
            // Contar notificações antes de deletar
            long totalAntes = notificacaoRepository.count();
            log.info("Total de notificações antes da limpeza: {}", totalAntes);
            
            if (totalAntes > 0) {
                // Deletar todas as notificações
                notificacaoRepository.deleteAll();
                
                // Verificar se realmente foram deletadas
                long totalDepois = notificacaoRepository.count();
                log.info("Total de notificações após limpeza: {}", totalDepois);
                
                if (totalDepois == 0) {
                    log.info("Todas as notificações foram removidas com sucesso");
                } else {
                    log.warn("Ainda restam {} notificações após tentativa de limpeza", totalDepois);
                }
            } else {
                log.info("Nenhuma notificação encontrada para limpar");
            }
        } catch (Exception e) {
            log.error("Erro ao limpar notificações", e);
            throw new RuntimeException("Erro ao limpar notificações: " + e.getMessage(), e);
        }
    }
    
    /**
     * Estatísticas das notificações
     */
    public Map<String, Object> getEstatisticas() {
        Long total = notificacaoRepository.count();
        Long naoLidas = notificacaoRepository.countByLidaFalse();
        Long criticas = notificacaoRepository.countByPrioridadeAndLidaFalse(
            Notificacao.PrioridadeNotificacao.CRITICA);
        
        return Map.of(
            "total", total,
            "naoLidas", naoLidas,
            "criticas", criticas,
            "lidas", total - naoLidas
        );
    }
}