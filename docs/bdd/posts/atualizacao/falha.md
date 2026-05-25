# Cenários BDD - Atualização de Postagem (Falha)

## Funcionalidade: Atualização de Postagem (Sprint 5)
**Como um** Autor  
**Eu quero** editar um post já existente  
**Para que** eu possa corrigir erros ou atualizar informações

### Cenário: Tentar atualizar post inexistente
*   **Dado** que o UUID informado não consta na base de dados
*   **E** estou autenticado
*   **Quando** eu envio uma requisição `PUT` para `/posts/{uuid}`
*   **Então** o sistema deve retornar o status HTTP `404 Not Found`
*   **E** a mensagem `{"message": "Post not found"}`

### Cenário: Tentar atualizar post sem autenticação
*   **Dado** que não possuo token de autenticação
*   **Quando** eu envio uma requisição `PUT` para `/posts/{uuid}`
*   **Então** o sistema deve retornar o status HTTP `401 Unauthorized`
*   **E** a mensagem `{"message": "Token não fornecido"}`

### Cenário: Usuário não autorizado tenta atualizar post
*   **Dado** que sou um usuário com papel `aluno`
*   **E** possuo token válido
*   **Quando** eu envio uma requisição `PUT` para `/posts/{uuid}` com meu token
*   **Então** o sistema deve retornar o status HTTP `403 Forbidden`
*   **E** a mensagem `{"message": "Permissão insuficiente"}`
