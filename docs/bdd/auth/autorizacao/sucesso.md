# Cenários BDD - Autorização por Papel (Sucesso)

## Funcionalidade: Autorização por Papel
**Como um** Usuário com Papel Específico  
**Eu quero** acessar apenas funcionalidades permitidas ao meu papel  
**Para que** o sistema mantenha a segurança e controle de acesso

### Cenário: Docente acessa rota permitida (criar post)
*   **Dado** que sou um usuário com papel `docente` e possuo token válido
*   **Quando** eu envio uma requisição `POST` para `/posts` com meu token
*   **Então** o middleware de autorização deve permitir o acesso
*   **E** a requisição deve prosseguir para o controller

### Cenário: Admin acessa rota permitida (criar post)
*   **Dado** que sou um usuário com papel `admin` e possuo token válido
*   **Quando** eu envio uma requisição `POST` para `/posts` com meu token
*   **Então** o middleware de autorização deve permitir o acesso
*   **E** a requisição deve prosseguir para o controller

### Cenário: Acessar rota pública sem autenticação
*   **Dado** que não possuo token
*   **Quando** eu envio uma requisição `GET` para `/posts` (rota pública)
*   **Então** a requisição deve ser processada normalmente
*   **E** retornar o status HTTP `200 OK`
