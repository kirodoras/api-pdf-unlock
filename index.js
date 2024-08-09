const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Configuração do multer para armazenamento em 'uploads/'
const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const upload = multer({
    dest: uploadDir,
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
            return cb(new Error('Only PDF files are allowed'));
        }
        cb(null, true);
    }
});

app.post('/unlock', upload.single('file'), (req, res) => {
    if (!req.file || !req.body.data) {
        return res.status(400).send('Arquivo e senha são necessários');
    }

    const filePath = path.join(uploadDir, req.file.filename);
    const password = req.body.data;

    console.log('Arquivo recebido:', req.file);
    console.log('Caminho do arquivo:', filePath);

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error(`Arquivo não encontrado: ${filePath}`);
            return res.status(500).send('Arquivo não encontrado');
        }

        const decryptedFilePath = path.join(uploadDir, 'decrypted.pdf');
        const finalOutputPath = path.join(uploadDir, 'unlock.pdf');

        exec(`qpdf --decrypt --password=${password} ${filePath} ${decryptedFilePath}`, (err, stdout, stderr) => {
            if (err) {
                console.error(`Erro ao descriptografar o PDF: ${stderr}`);
                return res.status(500).send('Falha ao descriptografar o PDF');
            }

            if (stderr) {
                console.error(`qpdf stderr: ${stderr}`);
            }

            console.log(`qpdf stdout: ${stdout}`);

            fs.access(decryptedFilePath, fs.constants.F_OK, (err) => {
                if (err) {
                    console.error(`Arquivo descriptografado não encontrado: ${decryptedFilePath}`);
                    return res.status(500).send('Arquivo descriptografado não encontrado');
                }

                fs.rename(decryptedFilePath, finalOutputPath, (err) => {
                    if (err) {
                        console.error(`Erro ao salvar o PDF descriptografado: ${err}`);
                        return res.status(500).send('Falha ao salvar o PDF descriptografado');
                    }

                    res.download(finalOutputPath, 'unlock.pdf', (err) => {
                        if (err) {
                            console.error(`Erro ao enviar o PDF: ${err}`);
                        }

                        // Limpeza de arquivos temporários após um breve intervalo
                        setTimeout(() => {
                            fs.unlink(filePath, (err) => {
                                if (err) console.error(`Erro ao remover o arquivo original: ${err}`);
                            });
                            fs.unlink(finalOutputPath, (err) => {
                                if (err) console.error(`Erro ao remover o arquivo final: ${err}`);
                            });
                        }, 1000); // 1 segundo para garantir que o download foi concluído
                    });
                });
            });
        });
    });
});

app.get('/', (req, res) => {
    res.send('API de desbloqueio de PDF');
});

app.listen(port, () => {
    console.log(`API ouvindo na porta ${port}`);
});

