# Cenários BDD - Autorização por Papel (Falha)

## Funcionalidade: Autorização por Papel
**Como um** Usuário com Papel Específico  
**Eu quero** acessar apenas funcionalidades permitidas ao meu papel  
**Para que** o sistema mantenha a segurança e controle de acesso

### Cenário: Usuário com papel não permitido tenta acessar rota
*   **Dado** que sou um usuário com papel `aluno` (não permitido para escrita)
*   **Quando** eu envio uma requisição `POST` para `/posts` com meu token
*   **Então** o middleware de autorização deve bloquear a requisição
*   **E** retornar o status HTTP `403 Forbidden`
*   **E** a mensagem `{"message": "Permissão insuficiente"}`
