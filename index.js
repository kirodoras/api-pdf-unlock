import express from 'express';
import multer from 'multer';
import { exec } from 'child_process';
import { join } from 'path';
import { existsSync, mkdirSync, access, constants, rename, unlink } from 'fs';

const app = express();
const port = 3000;

const uploadDir = join(__dirname, 'uploads');

if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir);
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

    const filePath = join(uploadDir, req.file.filename);
    const password = req.body.data;

    console.log('Arquivo recebido:', req.file);
    console.log('Caminho do arquivo:', filePath);

    access(filePath, constants.F_OK, (err) => {
        if (err) {
            console.error(`Arquivo não encontrado: ${filePath}`);
            return res.status(500).send('Arquivo não encontrado');
        }

        const decryptedFilePath = join(uploadDir, 'decrypted.pdf');
        const finalOutputPath = join(uploadDir, 'unlock.pdf');

        exec(`qpdf --decrypt --password=${password} ${filePath} ${decryptedFilePath}`, (err, stdout, stderr) => {
            if (err) {
                console.error(`Erro ao descriptografar o PDF: ${stderr}`);
                return res.status(500).send('Falha ao descriptografar o PDF');
            }

            if (stderr) {
                console.error(`qpdf stderr: ${stderr}`);
            }

            console.log(`qpdf stdout: ${stdout}`);

            access(decryptedFilePath, constants.F_OK, (err) => {
                if (err) {
                    console.error(`Arquivo descriptografado não encontrado: ${decryptedFilePath}`);
                    return res.status(500).send('Arquivo descriptografado não encontrado');
                }

                rename(decryptedFilePath, finalOutputPath, (err) => {
                    if (err) {
                        console.error(`Erro ao salvar o PDF descriptografado: ${err}`);
                        return res.status(500).send('Falha ao salvar o PDF descriptografado');
                    }

                    res.download(finalOutputPath, 'unlock.pdf', (err) => {
                        if (err) {
                            console.error(`Erro ao enviar o PDF: ${err}`);
                        }

                        setTimeout(() => {
                            unlink(filePath, (err) => {
                                if (err) console.error(`Erro ao remover o arquivo original: ${err}`);
                            });
                            unlink(finalOutputPath, (err) => {
                                if (err) console.error(`Erro ao remover o arquivo final: ${err}`);
                            });
                        }, 1000);
                    });
                });
            });
        });
    });
});

app.get('/', (req, res) => {
    res.send({
        message: 'API de desbloqueio de PDF',
        endpoints: {
            unlock: {
                method: 'POST',
                url: '/unlock',
                description: 'Desbloqueia um PDF criptografado',
                parameters: {
                    file: 'Arquivo PDF',
                    data: 'Senha do arquivo PDF'
                }
            }
        }
    });
});

app.listen(port, () => {
    console.log(`API ouvindo na porta ${port}`);
});

