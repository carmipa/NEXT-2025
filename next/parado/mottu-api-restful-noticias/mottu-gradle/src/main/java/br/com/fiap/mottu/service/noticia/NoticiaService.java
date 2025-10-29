package br.com.fiap.mottu.service.noticia;

import br.com.fiap.mottu.dto.noticia.NoticiaResponseDto;
import br.com.fiap.mottu.dto.noticia.NoticiaEstatisticasDto;
import br.com.fiap.mottu.dto.noticia.NoticiaJsonDto;
import br.com.fiap.mottu.exception.noticia.NoticiaNotFoundException;
import br.com.fiap.mottu.exception.noticia.NoticiaCaptureException;
import br.com.fiap.mottu.filter.noticia.NoticiaFilter;
import br.com.fiap.mottu.mapper.noticia.NoticiaMapper;
import br.com.fiap.mottu.model.noticia.Noticia;
import br.com.fiap.mottu.repository.noticia.NoticiaRepository;
import br.com.fiap.mottu.specification.noticia.NoticiaSpecification;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class NoticiaService {

    private final NoticiaRepository noticiaRepository;
    private final NoticiaMapper noticiaMapper;
    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();
    
    @Value("${news.linkedin.enabled:false}")
    private boolean linkedinEnabled;
    
    // URLs específicas da Mottu
    private static final String DICAS_MOTTU_URL = "https://dicas.mottu.com.br/";
    private static final String MOTOO_MOTTU_URL = "https://www.motoo.com.br/mottu/sport-110i/noticias/";
    private static final String LINKEDIN_MOTTU_URL = "https://www.linkedin.com/company/mottuapp/";
    private static final String FACEBOOK_MOTTU_URL = "https://www.facebook.com/mottualugueldemotos/";
    private static final String YOUTUBE_MOTTU_URL = "https://www.youtube.com/c/MottuAlugueldemotos";
    private static final String INSTAGRAM_MOTTU_URL = "https://www.instagram.com/mottu_oficial/";
    
    // Stopwords em português brasileiro
    private static final Set<String> STOPWORDS = Set.of(
        "de","da","do","das","dos","para","com","uma","umas","um","uns","por","em",
        "no","na","nos","nas","ao","aos","à","às","e","ou","o","a","as","os","que",
        "se","sem","sob","sobre","entre","como","mais","menos","muito","muitos","muitas",
        "também","já","ser","ter","estar","foi","são","é","sua","seu","suas","seus",
        "este","esta","estes","estas","esse","essa","esses","essas","aquele","aquela",
        "aqueles","aquelas","isso","isto","aquilo","não","nunca","sempre","quando",
        "onde","porque","porquê","então","assim","aqui","ali","lá","hoje","ontem",
        "amanhã","agora","depois","antes","durante","através","dentro","fora","cima",
        "baixo","frente","trás","lado","meio","todo","toda","todos","todas","algum",
        "alguma","alguns","algumas","nenhum","nenhuma","nenhuns","nenhumas","outro",
        "outra","outros","outras","mesmo","mesma","mesmos","mesmas","próprio","própria",
        "próprios","próprias","cada","qual","quais","quem","cujo","cuja","cujos","cujas"
    );
    private static final Map<String, List<String>> CATEGORIA_KEYWORDS = Map.of(
        "EMPRESA", Arrays.asList("empresa", "mottu", "companhia", "corporação", "negócio"),
        "PRODUTO", Arrays.asList("produto", "moto", "scooter", "veículo", "modelo", "lançamento"),
        "PARCERIA", Arrays.asList("parceria", "colaboração", "aliança", "acordo", "joint venture"),
        "INVESTIMENTO", Arrays.asList("investimento", "financiamento", "capital", "fundo", "investidor"),
        "PREMIACAO", Arrays.asList("prêmio", "reconhecimento", "award", "distinção", "honra"),
        "EXPANSAO", Arrays.asList("expansão", "crescimento", "mercado", "internacional", "nova cidade"),
        "TECNOLOGIA", Arrays.asList("tecnologia", "inovação", "digital", "app", "software", "IoT"),
        "SUSTENTABILIDADE", Arrays.asList("sustentabilidade", "verde", "ecológico", "carbono", "meio ambiente"),
        "COMUNIDADE", Arrays.asList("comunidade", "usuário", "cliente", "evento", "encontro"),
        "OUTROS", Arrays.asList("geral", "diversos")
    );
    
    // Palavras-chave para análise de sentimento
    private static final Map<String, List<String>> SENTIMENTO_KEYWORDS = Map.of(
        "POSITIVO", Arrays.asList("sucesso", "crescimento", "inovação", "prêmio", "reconhecimento", "expansão", "parceria", "melhoria"),
        "NEGATIVO", Arrays.asList("problema", "dificuldade", "desafio", "crítica", "reclamação", "atraso", "falha", "crise")
    );

    /**
     * Busca notícias com filtros usando Specification
     * Por padrão, busca notícias dos últimos 6 meses
     */
    @Cacheable(
        value = "noticias",
        key = "T(java.util.Objects).hash(#filter, #pageable.pageNumber, #pageable.pageSize, #pageable.sort.toString())"
    )
    public Page<NoticiaResponseDto> buscarNoticias(NoticiaFilter filter, Pageable pageable) {
        log.info("Buscando notícias com filtros: {}", filter);
        
        // Se não há filtro de data, busca dos últimos 6 meses por padrão
        if (filter == null || (filter.getDataPublicacaoInicio() == null && filter.getDataPublicacaoFim() == null)) {
            log.info("Nenhum filtro de data especificado, buscando notícias dos últimos 6 meses");
            filter = NoticiaFilter.builder()
                    .dataPublicacaoInicio(LocalDateTime.now().minusMonths(6))
                    .build();
        }
        
        Specification<Noticia> spec = NoticiaSpecification.createSpecification(filter);
        Page<Noticia> noticias = noticiaRepository.findAll(spec, pageable);
        
        return noticias.map(NoticiaResponseDto::fromEntity);
    }

    /**
     * Busca notícias com filtros simples (compatibilidade)
     * Por padrão, busca notícias dos últimos 6 meses
     */
    @Cacheable(value = "noticias-simples", key = "#categoria + '_' + #sentimento + '_' + #fonte + '_' + #busca + '_' + #pageable.pageNumber")
    public Page<NoticiaResponseDto> buscarNoticias(
            String categoria,
            String sentimento,
            String fonte,
            String busca,
            Pageable pageable) {

        log.info("Buscando notícias - Categoria: {}, Sentimento: {}, Fonte: {}, Busca: {} (últimos 6 meses)",
                categoria, sentimento, fonte, busca);

        // Criar filtro com data padrão de 6 meses
        NoticiaFilter filter = NoticiaFilter.builder()
                .categoria(categoria)
                .sentimento(sentimento)
                .fonte(fonte)
                .titulo(busca)
                .resumo(busca)
                .dataPublicacaoInicio(LocalDateTime.now().minusMonths(6))
                .build();

        Specification<Noticia> spec = NoticiaSpecification.createSpecification(filter);
        Page<Noticia> noticias = noticiaRepository.findAll(spec, pageable);

        return noticias.map(NoticiaResponseDto::fromEntity);
    }

    /**
     * Obtém estatísticas das notícias
     */
    @Cacheable(value = "estatisticas-noticias", key = "'estatisticas'")
    public NoticiaEstatisticasDto obterEstatisticas() {
        log.info("Obtendo estatísticas das notícias");

        long totalNoticias = noticiaRepository.count();
        long noticiasUltimos6Meses = noticiaRepository.countByDataCapturaAfter(LocalDateTime.now().minusMonths(6));

        // Fonte mais ativa
        List<Object[]> fonteMaisAtiva = noticiaRepository.findFonteMaisAtiva(Pageable.ofSize(1));
        String fonteMaisAtivaStr = fonteMaisAtiva.isEmpty() ? "N/A" : (String) fonteMaisAtiva.get(0)[0];

        // Categoria mais comum
        List<Object[]> categoriaMaisComum = noticiaRepository.findCategoriaMaisComum(Pageable.ofSize(1));
        String categoriaMaisComumStr = categoriaMaisComum.isEmpty() ? "N/A" : categoriaMaisComum.get(0)[0].toString();

        // Contadores específicos
        long noticiasDicasMottu = noticiaRepository.countByFonte("Dicas Mottu");
        long noticiasMotoO = noticiaRepository.countByFonte("MotoO");

        return NoticiaEstatisticasDto.builder()
                .totalNoticias(totalNoticias)
                .noticiasHoje(noticiasUltimos6Meses)
                .fonteMaisAtiva(fonteMaisAtivaStr)
                .categoriaMaisComum(categoriaMaisComumStr)
                .noticiasDicasMottu(noticiasDicasMottu)
                .noticiasMotoO(noticiasMotoO)
                .build();
    }

    /**
     * Captura notícias automaticamente - executa a cada 30 minutos
     */
    @Scheduled(fixedRate = 30 * 60 * 1000) // 30 minutos
    @Transactional
    public void agendarCapturaNoticias() {
        log.info("Iniciando captura agendada de notícias...");
        capturarTodasAsFontes();
        log.info("Captura agendada de notícias finalizada.");
    }

    /**
     * Captura notícias de todas as fontes configuradas
     */
    @Transactional
    public void capturarTodasAsFontes() {
        log.info("Capturando notícias de todas as fontes...");
        
        // Captura individual com tratamento de erro isolado
        try {
            capturarNoticiasDicasMottu();
            log.info("Dicas Mottu capturado com sucesso.");
        } catch (Exception e) {
            log.error("Erro ao capturar notícias do Dicas Mottu", e);
        }

        try {
            capturarNoticiasMotoO();
            log.info("MotoO capturado com sucesso.");
        } catch (Exception e) {
            log.error("Erro ao capturar notícias do MotoO", e);
        }

        if (linkedinEnabled) {
            try {
                capturarNoticiasLinkedIn();
                log.info("LinkedIn Mottu capturado com sucesso.");
            } catch (Exception e) {
                log.error("Erro ao capturar notícias do LinkedIn Mottu", e);
            }
        } else {
            log.info("Captura do LinkedIn desabilitada por configuração.");
        }

        evictCachesPosCaptura(); // Limpa cache após captura
        log.info("Captura de todas as fontes finalizada (com tratamento individual de falhas).");
    }

    @CacheEvict(value = {"noticias", "noticias-simples", "estatisticas-noticias"}, allEntries = true)
    public void evictCachesPosCaptura() {
        log.info("Cache invalidado após captura de notícias");
    }

    /**
     * Normaliza URL para evitar duplicatas "quase iguais"
     */
    private String normalizarUrl(String url) {
        if (url == null) return "";
        String u = url.trim();
        // remove utm e query supérflua
        u = u.replaceAll("[?&](utm_[^=&]+|fbclid|gclid)=[^&]+", "");
        // remove ? no final, & ou #
        u = u.replaceAll("[?&#]+$", "");
        // força https
        u = u.replaceFirst("^http://", "https://");
        // remove barra final (exceto se é domínio puro)
        if (u.length() > 9 && u.endsWith("/")) u = u.substring(0, u.length() - 1);
        return u;
    }

    /**
     * Captura notícias do site Dicas Mottu
     */
    @Transactional
    public void capturarNoticiasDicasMottu() {
        log.info("Capturando notícias do Dicas Mottu: {}", DICAS_MOTTU_URL);
        try {
            Document doc = Jsoup.connect(DICAS_MOTTU_URL)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                    .timeout(10000)
                    .get();
            
            // Tentar diferentes seletores para encontrar artigos
            Elements articles = doc.select("article.post, article, .post, .entry, .article");
            log.info("Encontrados {} artigos no Dicas Mottu", articles.size());

            if (articles.isEmpty()) {
                log.warn("Nenhum artigo encontrado no Dicas Mottu. Tentando seletores alternativos...");
                articles = doc.select("a[href*='/']");
                log.info("Encontrados {} links alternativos", articles.size());
            }

            for (Element article : articles) {
                try {
                    String urlOrigem = "";
                    String titulo = "";
                    String resumo = "";
                    String urlImagem = "";
                    String autor = "";
                    LocalDateTime dataPublicacao = LocalDateTime.now();

                    // Tentar extrair URL
                    Element linkElement = article.select("a").first();
                    if (linkElement != null) {
                        urlOrigem = linkElement.attr("href");
                        if (!urlOrigem.startsWith("http")) {
                            urlOrigem = DICAS_MOTTU_URL + urlOrigem;
                        }
                    } else {
                        continue;
                    }

                    // Normalizar URL para evitar duplicatas
                    urlOrigem = normalizarUrl(urlOrigem);
                    if (urlOrigem.isBlank()) continue;
                    
                    if (noticiaRepository.existsByUrlOrigem(urlOrigem)) {
                        log.debug("Duplicata por URL: {}", urlOrigem);
                        continue;
                    }

                    // Tentar extrair título com diferentes seletores
                    titulo = article.select("h2.entry-title a, h2 a, h1 a, .title a, .entry-title a").text();
                    if (titulo.isEmpty()) {
                        titulo = article.select("a").text();
                    }

                    // Tentar extrair resumo
                    resumo = article.select("div.entry-content p, .excerpt p, .summary p, p").text();
                    if (resumo.length() > 200) {
                        resumo = resumo.substring(0, 200) + "...";
                    }

                    // Tentar extrair imagem
                    urlImagem = article.select("img.wp-post-image, img").attr("src");

                    // Tentar extrair autor
                    autor = article.select("span.author a, .author a, .byline a").text();

                    // Tentar extrair data
                    String dataPublicacaoStr = article.select("time.entry-date, .date, .published").attr("datetime");
                    if (dataPublicacaoStr.isEmpty()) {
                        dataPublicacaoStr = article.select("time.entry-date, .date, .published").text();
                    }
                    dataPublicacao = parseDate(dataPublicacaoStr);

                    String conteudoCompleto = getFullContent(urlOrigem, "div.entry-content, .content, .post-content");

                    String categoria = analisarCategoria(titulo + " " + resumo + " " + conteudoCompleto);
                    String sentimento = analisarSentimento(titulo + " " + resumo + " " + conteudoCompleto);
                    int relevancia = calcularRelevancia(titulo + " " + resumo + " " + conteudoCompleto);

                    NoticiaJsonDto jsonDto = NoticiaJsonDto.builder()
                            .titulo(titulo)
                            .resumo(resumo)
                            .conteudo(conteudoCompleto)
                            .urlOrigem(urlOrigem)
                            .urlImagem(urlImagem)
                            .autor(autor)
                            .dataPublicacao(dataPublicacao)
                            .categoria(categoria)
                            .sentimento(sentimento)
                            .relevancia(relevancia)
                            .visualizacoes(0)
                            .ativo(true)
                            .palavrasChave(extrairPalavrasChave(titulo + " " + resumo))
                            .tags("mottu,noticia")
                            .idioma("pt-BR")
                            .tipoConteudo("noticia")
                            .tamanhoConteudo(conteudoCompleto.length())
                            .hashConteudo(gerarHashConteudo(titulo + urlOrigem))
                            .build();

                    Noticia noticia = Noticia.builder()
                            .urlOrigem(urlOrigem)  // ESSENCIAL para evitar duplicatas
                            .dadosJson(objectMapper.writeValueAsString(jsonDto))
                            .fonte("Dicas Mottu")
                            .dataCaptura(LocalDateTime.now())
                            .ativo(true)
                            .categoria(categoria)
                            .sentimento(sentimento)
                            .relevancia(relevancia)
                            .visualizacoes(0)
                            .build();

                    noticiaRepository.save(noticia);
                    log.info("Notícia do Dicas Mottu salva: {}", titulo);
                } catch (Exception e) {
                    log.warn("Erro ao processar artigo do Dicas Mottu", e);
                }
            }

        } catch (IOException e) {
            log.error("Erro ao conectar com Dicas Mottu", e);
            throw new NoticiaCaptureException("Erro ao capturar notícias do Dicas Mottu", e);
        }
    }

    /**
     * Captura notícias do site MotoO
     */
    @Transactional
    public void capturarNoticiasMotoO() {
        log.info("Capturando notícias do MotoO: {}", MOTOO_MOTTU_URL);
        try {
            Document doc = Jsoup.connect(MOTOO_MOTTU_URL).get();
            Elements articles = doc.select("div.col-md-4.col-sm-6.col-xs-12");

            for (Element article : articles) {
                try {
                    String urlOrigem = article.select("a").first().attr("href");
                    
                    // Normalizar URL para evitar duplicatas
                    urlOrigem = normalizarUrl(urlOrigem);
                    if (urlOrigem.isBlank()) continue;
                    
                    if (noticiaRepository.existsByUrlOrigem(urlOrigem)) {
                        log.debug("Duplicata por URL: {}", urlOrigem);
                        continue;
                    }

                    String titulo = article.select("h3 a").text();
                    String resumo = article.select("p").text();
                    String urlImagem = article.select("img").attr("src");
                    String autor = "MotoO";
                    String dataPublicacaoStr = article.select("span.date").text();
                    LocalDateTime dataPublicacao = parseDateFromPortuguese(dataPublicacaoStr);

                    String conteudoCompleto = getFullContent(urlOrigem, "div.post-content");

                    String categoria = analisarCategoria(titulo + " " + resumo + " " + conteudoCompleto);
                    String sentimento = analisarSentimento(titulo + " " + resumo + " " + conteudoCompleto);
                    int relevancia = calcularRelevancia(titulo + " " + resumo + " " + conteudoCompleto);

                    NoticiaJsonDto jsonDto = NoticiaJsonDto.builder()
                            .titulo(titulo)
                            .resumo(resumo)
                            .conteudo(conteudoCompleto)
                            .urlOrigem(urlOrigem)
                            .urlImagem(urlImagem)
                            .autor(autor)
                            .dataPublicacao(dataPublicacao)
                            .categoria(categoria)
                            .sentimento(sentimento)
                            .relevancia(relevancia)
                            .visualizacoes(0)
                            .ativo(true)
                            .palavrasChave(extrairPalavrasChave(titulo + " " + resumo))
                            .tags("mottu,noticia")
                            .idioma("pt-BR")
                            .tipoConteudo("noticia")
                            .tamanhoConteudo(conteudoCompleto.length())
                            .hashConteudo(gerarHashConteudo(titulo + urlOrigem))
                            .build();

                    Noticia noticia = Noticia.builder()
                            .urlOrigem(urlOrigem)  // ESSENCIAL para evitar duplicatas
                            .dadosJson(objectMapper.writeValueAsString(jsonDto))
                            .fonte("MotoO")
                            .dataCaptura(LocalDateTime.now())
                            .ativo(true)
                            .categoria(categoria)
                            .sentimento(sentimento)
                            .relevancia(relevancia)
                            .visualizacoes(0)
                            .build();

                    noticiaRepository.save(noticia);
                    log.info("Notícia do MotoO salva: {}", titulo);
                } catch (Exception e) {
                    log.warn("Erro ao processar artigo do MotoO", e);
                }
            }

        } catch (IOException e) {
            log.error("Erro ao conectar com MotoO", e);
            throw new NoticiaCaptureException("Erro ao capturar notícias do MotoO", e);
        }
    }

    /**
     * Captura notícias do LinkedIn da Mottu
     */
    @Transactional
    public void capturarNoticiasLinkedIn() {
        log.info("Capturando notícias do LinkedIn Mottu: {}", LINKEDIN_MOTTU_URL);
        try {
            Document doc = Jsoup.connect(LINKEDIN_MOTTU_URL)
                    .userAgent("Mozilla/5.0 (compatible; MottuBot/1.0)")
                    .timeout(15000)
                    .get();
            
            // LinkedIn tem estrutura diferente, vamos tentar diferentes seletores
            Elements posts = doc.select(".feed-shared-update-v2, .occludable-update, .feed-shared-update");
            log.info("Encontrados {} posts no LinkedIn Mottu", posts.size());

            if (posts.isEmpty()) {
                log.warn("Nenhum post encontrado no LinkedIn Mottu. Tentando seletores alternativos...");
                posts = doc.select("[data-urn*='activity']");
                log.info("Encontrados {} posts alternativos", posts.size());
            }

            for (Element post : posts) {
                try {
                    String urlOrigem = "";
                    String titulo = "";
                    String resumo = "";
                    String urlImagem = "";
                    String autor = "Mottu";
                    LocalDateTime dataPublicacao = LocalDateTime.now();

                    // Tentar extrair URL do post
                    Element linkElement = post.select("a[href*='/posts/'], a[href*='/activity/']").first();
                    if (linkElement != null) {
                        urlOrigem = linkElement.attr("href");
                        if (!urlOrigem.startsWith("http")) {
                            urlOrigem = "https://www.linkedin.com" + urlOrigem;
                        }
                    } else {
                        continue;
                    }

                    if (noticiaRepository.existsByUrlOrigem(urlOrigem)) {
                        log.debug("Post já existe, pulando: {}", urlOrigem);
                        continue;
                    }

                    // Tentar extrair título/conteúdo
                    titulo = post.select(".feed-shared-text, .attributed-text-segment-list, .break-words").text();
                    if (titulo.isEmpty()) {
                        titulo = post.select("p, .text-body-medium").text();
                    }

                    // Limitar tamanho do título
                    if (titulo.length() > 200) {
                        titulo = titulo.substring(0, 200) + "...";
                    }

                    // Usar título como resumo também para LinkedIn
                    resumo = titulo;

                    // Tentar extrair imagem
                    urlImagem = post.select("img").attr("src");

                    // Tentar extrair data
                    String dataPublicacaoStr = post.select("time, .feed-shared-actor__subtitle").attr("datetime");
                    if (dataPublicacaoStr.isEmpty()) {
                        dataPublicacaoStr = post.select("time, .feed-shared-actor__subtitle").text();
                    }
                    dataPublicacao = parseDate(dataPublicacaoStr);

                    String conteudoCompleto = titulo; // LinkedIn posts são mais curtos

                    String categoria = analisarCategoria(titulo + " " + resumo + " " + conteudoCompleto);
                    String sentimento = analisarSentimento(titulo + " " + resumo + " " + conteudoCompleto);
                    int relevancia = calcularRelevancia(titulo + " " + resumo + " " + conteudoCompleto, categoria, sentimento);

                    NoticiaJsonDto jsonDto = NoticiaJsonDto.builder()
                            .titulo(titulo)
                            .resumo(resumo)
                            .conteudo(conteudoCompleto)
                            .urlOrigem(urlOrigem)
                            .urlImagem(urlImagem)
                            .autor(autor)
                            .dataPublicacao(dataPublicacao)
                            .categoria(categoria)
                            .sentimento(sentimento)
                            .relevancia(relevancia)
                            .visualizacoes(0)
                            .ativo(true)
                            .palavrasChave(extrairPalavrasChave(titulo + " " + resumo))
                            .tags("mottu,linkedin,post")
                            .idioma("pt-BR")
                            .tipoConteudo("post")
                            .tamanhoConteudo(conteudoCompleto.length())
                            .hashConteudo(gerarHashConteudo(titulo + urlOrigem))
                            .build();

                    Noticia noticia = Noticia.builder()
                            .urlOrigem(urlOrigem)  // ESSENCIAL para evitar duplicatas
                            .dadosJson(objectMapper.writeValueAsString(jsonDto))
                            .fonte("LinkedIn Mottu")
                            .dataCaptura(LocalDateTime.now())
                            .ativo(true)
                            .categoria(categoria)
                            .sentimento(sentimento)
                            .relevancia(relevancia)
                            .visualizacoes(0)
                            .build();

                    noticiaRepository.save(noticia);
                    log.info("Post do LinkedIn Mottu salvo: {}", titulo);
                } catch (Exception e) {
                    log.warn("Erro ao processar post do LinkedIn Mottu", e);
                }
            }

        } catch (IOException e) {
            log.error("Erro ao conectar com LinkedIn Mottu", e);
            throw new NoticiaCaptureException("Erro ao capturar posts do LinkedIn Mottu", e);
        }
    }

    /**
     * Incrementa visualizações de uma notícia
     */
    @Transactional
    public void incrementarVisualizacoes(Long idNoticia) {
        log.info("Incrementando visualizações da notícia ID: {}", idNoticia);

        Noticia noticia = noticiaRepository.findById(idNoticia)
                .orElseThrow(() -> new NoticiaNotFoundException(idNoticia));

        noticia.setVisualizacoes(noticia.getVisualizacoes() + 1);
        noticiaRepository.save(noticia);

        log.info("Visualizações incrementadas para notícia ID: {} - Total: {}",
                idNoticia, noticia.getVisualizacoes());
    }

    // Métodos auxiliares privados
    private LocalDateTime parseDate(String dateString) {
        try {
            return LocalDateTime.parse(dateString, DateTimeFormatter.ISO_DATE_TIME);
        } catch (Exception e) {
            log.warn("Erro ao parsear data ISO: {}, usando data atual.", dateString);
            return LocalDateTime.now();
        }
    }

    private LocalDateTime parseDateFromPortuguese(String dateString) {
        Map<String, String> monthMap = new HashMap<>();
        monthMap.put("janeiro", "01"); monthMap.put("fevereiro", "02"); monthMap.put("março", "03");
        monthMap.put("abril", "04"); monthMap.put("maio", "05"); monthMap.put("junho", "06");
        monthMap.put("julho", "07"); monthMap.put("agosto", "08"); monthMap.put("setembro", "09");
        monthMap.put("outubro", "10"); monthMap.put("novembro", "11"); monthMap.put("dezembro", "12");

        for (Map.Entry<String, String> entry : monthMap.entrySet()) {
            dateString = dateString.replace(" de " + entry.getKey() + " de ", "-" + entry.getValue() + "-");
        }
        
        try {
            return LocalDateTime.parse(dateString + " 00:00:00", DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss"));
        } catch (Exception e) {
            log.warn("Erro ao parsear data em português: {}", dateString, e);
            return LocalDateTime.now();
        }
    }

    private String getFullContent(String url, String selector) throws IOException {
        Document doc = Jsoup.connect(url)
                .userAgent("Mozilla/5.0 (compatible; MottuBot/1.0)")
                .timeout(15000)
                .referrer("https://www.google.com")
                .get();

        Element contentElement = doc.selectFirst(selector);
        if (contentElement == null) return "";

        // Remove ruído comum
        contentElement.select("script,style,noscript,iframe,svg,.ads,.advert,.share,.social").remove();
        
        // Converte quebras de linha e preserva blocos
        contentElement.select("br").append("\\n");
        contentElement.select("p,li,h1,h2,h3,h4").prepend("\\n").append("\\n");

        String raw = contentElement.text();
        String normalized = raw
                .replaceAll("\\\\n\\s*", "\n")
                .replaceAll("\\n{3,}", "\n\n")
                .trim();

        return normalized;
    }

    private String analisarCategoria(String conteudo) {
        String conteudoLower = conteudo.toLowerCase();
        Map<String, Integer> scores = new HashMap<>();

        for (Map.Entry<String, List<String>> entry : CATEGORIA_KEYWORDS.entrySet()) {
            int score = 0;
            for (String keyword : entry.getValue()) {
                if (conteudoLower.contains(keyword)) {
                    score++;
                }
            }
            scores.put(entry.getKey(), score);
        }

        return scores.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("OUTROS");
    }

    private String analisarSentimento(String conteudo) {
        String conteudoLower = conteudo.toLowerCase();
        int positivo = 0;
        int negativo = 0;

        for (String keyword : SENTIMENTO_KEYWORDS.get("POSITIVO")) {
            if (conteudoLower.contains(keyword)) {
                positivo++;
            }
        }

        for (String keyword : SENTIMENTO_KEYWORDS.get("NEGATIVO")) {
            if (conteudoLower.contains(keyword)) {
                negativo++;
            }
        }

        if (positivo > negativo) {
            return "POSITIVO";
        } else if (negativo > positivo) {
            return "NEGATIVO";
        } else {
            return "NEUTRO";
        }
    }

    private int calcularRelevancia(String conteudo) {
        String categoria = analisarCategoria(conteudo);
        String sentimento = analisarSentimento(conteudo);
        return calcularRelevancia(conteudo, categoria, sentimento);
    }

    private int calcularRelevancia(String conteudo, String categoria, String sentimento) {
        String conteudoLower = conteudo.toLowerCase();
        int relevancia = 0;

        List<String> mottuKeywords = Arrays.asList("mottu", "aluguel de motos", "moto por assinatura", "entregadores", "delivery");
        for (String keyword : mottuKeywords) {
            if (conteudoLower.contains(keyword)) {
                relevancia += 20;
            }
        }

        if ("POSITIVO".equals(sentimento)) {
            relevancia += 10;
        }

        if (Set.of("EMPRESA", "PRODUTO", "INVESTIMENTO").contains(categoria)) {
            relevancia += 15;
        }

        return Math.min(relevancia, 100);
    }

    private String extrairPalavrasChave(String texto) {
        return Arrays.stream(texto.toLowerCase(Locale.ROOT).split("\\W+"))
                .filter(w -> w.length() > 3 && !STOPWORDS.contains(w))
                .distinct()
                .limit(12)
                .reduce((a, b) -> a + "," + b)
                .orElse("");
    }

    private String gerarHashConteudo(String conteudo) {
        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(conteudo.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            log.warn("Erro ao gerar hash SHA-256, usando hashCode: {}", e.getMessage());
            return Integer.toString(conteudo.hashCode());
        }
    }
}
