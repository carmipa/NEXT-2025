require('dotenv').config(); // Carrega variáveis do .env

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { ImageAnnotatorClient } = require('@google-cloud/vision');

const app = express();
const port = 3000;

app.use(cors());

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      console.log('Diretório "uploads" não encontrado. Criando...');
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const filename = Date.now() + path.extname(file.originalname);
    cb(null, filename);
  },
});

const upload = multer({ storage: storage });

// CÓDIGO ATUALIZADO: Função aprimorada para lidar com texto fragmentado
function extrairPlaca(textoCompleto) {
    // 1. LIMPEZA TOTAL: Remove TODOS os espaços e quebras de linha do texto
    const textoLimpo = textoCompleto.replace(/\s/g, '').toUpperCase();
    
    const placaRegexMercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/; // LLLNLNN
    const correcaoParaLetra = { '0': 'O', '1': 'I', '8': 'B', '5': 'S', '2': 'Z' };
    const correcaoParaNumero = { 'O': '0', 'I': '1', 'B': '8', 'S': '5', 'Z': '2', 'G': '0' };

    // 2. JANELA DESLIZANTE: Percorre o texto limpo procurando por um trecho de 7 caracteres
    for (let i = 0; i <= textoLimpo.length - 7; i++) {
        // Pega um candidato de 7 caracteres
        const candidato = textoLimpo.substring(i, i + 7);

        // --- A lógica de correção que você já tinha, agora aplicada a cada candidato ---

        // Tentativa 1: Checar se o candidato já corresponde ao padrão
        if (placaRegexMercosul.test(candidato)) {
            console.log(`Placa encontrada diretamente: ${candidato}`);
            return candidato;
        }

        // Tentativa 2: Aplicar correções posicionais e checar novamente
        let chars = candidato.split('');
        let corrigidaChars = [...chars];

        // Posições 0, 1, 2: Deve ser Letra
        for (let j of [0, 1, 2]) {
            if (/[0-9]/.test(corrigidaChars[j]) && correcaoParaLetra[corrigidaChars[j]]) {
                corrigidaChars[j] = correcaoParaLetra[corrigidaChars[j]];
            }
        }
        // Posição 3: Deve ser Número
        if (/[A-Z]/.test(corrigidaChars[3]) && correcaoParaNumero[corrigidaChars[3]]) {
            corrigidaChars[3] = correcaoParaNumero[corrigidaChars[3]];
        }
        // Posição 4: Deve ser Letra
        if (/[0-9]/.test(corrigidaChars[4]) && correcaoParaLetra[corrigidaChars[4]]) {
            corrigidaChars[4] = correcaoParaLetra[corrigidaChars[4]];
        }
        // Posições 5, 6: Deve ser Número
        for (let j of [5, 6]) {
            if (/[A-Z]/.test(corrigidaChars[j]) && correcaoParaNumero[corrigidaChars[j]]) {
                corrigidaChars[j] = correcaoParaNumero[corrigidaChars[j]];
            }
        }

        const placaCorrigida = corrigidaChars.join('');
        
        if (placaRegexMercosul.test(placaCorrigida)) {
            // Loga apenas se houve mudança, para não poluir o console
            if (candidato !== placaCorrigida) { 
                console.log(`Candidato OCR: '${candidato}', Tentativa corrigida: '${placaCorrigida}'`);
            }
            console.log(`Placa encontrada após correção: ${placaCorrigida}`);
            return placaCorrigida;
        }
    }

    console.warn('Nenhuma placa válida (Mercosul LLLNLNN) encontrada após tentativas.');
    return null;
}


// Endpoint para upload e OCR
app.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    console.error('Erro: Nenhum arquivo foi enviado');
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }

  const imagePath = req.file.path;
  console.log('Imagem recebida:', imagePath);

  const client = new ImageAnnotatorClient();

  try {
    const [result] = await client.textDetection(imagePath);
    const textAnnotations = result.textAnnotations;

    if (!textAnnotations || textAnnotations.length === 0) {
      return res.json({
        placa: null,
        mensagem: 'Nenhum texto foi detectado na imagem.',
      });
    }

    const recognizedText = textAnnotations[0].description;
    console.log('Texto detectado pelo OCR:\n', recognizedText);

    const placa = extrairPlaca(recognizedText);

    res.json({
      placa,
      mensagem: placa ? 'Placa identificada com sucesso.' : 'Não foi possível identificar a placa automaticamente.',
    });

  } catch (error) {
    console.error('Erro ao usar Google Vision API:', error.message, error.stack);
    res.status(500).json({ error: 'Erro ao processar imagem com Google Vision API' });
  }
});

// Servir a pasta de uploads publicamente
app.use('/uploads', express.static('uploads'));

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor backend rodando em http://localhost:${port}`);
});