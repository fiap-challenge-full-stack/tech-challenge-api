# Cenários BDD - Exclusão de Postagem (Falha)

## Funcionalidade: Exclusão de Postagem (Sprint 5)
**Como um** Autor/Moderador  
**Eu quero** remover uma postagem do blog  
**Para que** conteúdos irrelevantes sejam retirados

### Cenário: Tentar excluir post inexistente
*   **Dado** que o UUID informado não consta na base de dados
*   **E** estou autenticado
*   **Quando** eu envio uma requisição `DELETE` para `/posts/{uuid}`
*   **Então** o sistema deve retornar o status HTTP `404 Not Found`
*   **E** a mensagem `{"message": "Post not found"}`

### Cenário: Tentar excluir post sem autenticação
*   **Dado** que não possuo token de autenticação
*   **Quando** eu envio uma requisição `DELETE` para `/posts/{uuid}`
*   **Então** o sistema deve retornar o status HTTP `401 Unauthorized`
*   **E** a mensagem `{"message": "Token não fornecido"}`

### Cenário: Usuário não autorizado tenta excluir post
*   **Dado** que sou um usuário com papel `aluno`
*   **E** possuo token válido
*   **Quando** eu envio uma requisição `DELETE` para `/posts/{uuid}` com meu token
*   **Então** o sistema deve retornar o status HTTP `403 Forbidden`
*   **E** a mensagem `{"message": "Permissão insuficiente"}`
