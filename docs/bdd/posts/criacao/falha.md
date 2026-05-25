# Cenários BDD - Criação de Postagem (Falha)

## Funcionalidade: Criação de Postagem (Sprint 4)
**Como um** Autor/Docente  
**Eu quero** criar uma nova postagem no blog  
**Para que** eu possa compartilhar conhecimento com os alunos

### Cenário: Tentar criar post sem autenticação
*   **Dado** que não possuo token de autenticação
*   **Quando** eu envio uma requisição `POST` para `/posts`
*   **Então** o sistema deve retornar o status HTTP `401 Unauthorized`
*   **E** a mensagem `{"message": "Token não fornecido"}`

### Cenário: Usuário não autorizado tenta criar post
*   **Dado** que sou um usuário com papel `aluno`
*   **E** possuo token válido
*   **Quando** eu envio uma requisição `POST` para `/posts` com meu token
*   **Então** o sistema deve retornar o status HTTP `403 Forbidden`
*   **E** a mensagem `{"message": "Permissão insuficiente"}`
