# PDF Unlocker API

API Express para desbloquear arquivos PDF criptografados usando `qpdf`.

## Funcionalidades

- Desbloqueio de PDFs criptografados com senha.

## Tecnologias

- Node.js
- Express
- Multer
- qpdf

## Instalação

1. Clone o repositório:

    ```bash
    git clone <URL_DO_REPOSITÓRIO>
    cd <NOME_DO_REPOSITÓRIO>
    ```

2. Instale as dependências:

    ```bash
    npm install
    ```

3. Instale o `qpdf`:

    No Ubuntu:

    ```bash
    sudo apt-get install qpdf
    ```

## Uso

1. Inicie o servidor:

    ```bash
    npm start
    ```

2. **Endpoint**

    - **POST `/unlock`**

      Desbloqueia um PDF criptografado.

      **Parâmetros**:
      - `file` (form-data): Arquivo PDF criptografado.
      - `data` (form-data): Senha do arquivo PDF.

      **Resposta**:
      - PDF desbloqueado disponível para download como `unlock.pdf`.

3. **Exemplo de Requisição com curl**:

    ```bash
    curl -X POST http://localhost:3000/unlock \
    -F "file=@/caminho/para/seu/arquivo.pdf" \
    -F "data=sua_senha"
    ```

## Contribuição

Contribuições são bem-vindas! Abra issues ou envie pull requests.

## Licença

Licenciado sob a Licença MIT.

