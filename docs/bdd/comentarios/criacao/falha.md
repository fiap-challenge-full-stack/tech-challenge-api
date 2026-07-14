# Cenários BDD - Criação de Comentário (Falha)

## Funcionalidade: Comentar em um post
**Como um** usuário autenticado
**Eu quero** comentar em um post existente
**Para que** eu possa interagir com o conteúdo publicado

### Cenário: Tentar comentar sem autenticação
*   **Dado** que não possuo token de autenticação
*   **Quando** eu envio uma requisição `POST` para `/posts/:postUuid/comentarios`
*   **Então** o sistema deve retornar o status HTTP `401 Unauthorized`
*   **E** a mensagem `{"codigo": "AUTHZ_002", "message": "Usuário não autenticado"}`

### Cenário: Comentar em um post que não existe
*   **Dado** que estou autenticado
*   **E** o `postUuid` informado não corresponde a nenhum post
*   **Quando** eu envio a requisição `POST` para `/posts/:postUuid/comentarios`
*   **Então** o sistema não deve criar o comentário
*   **E** retornar o status HTTP `404 Not Found`
*   **E** a mensagem `{"codigo": "POST_001", "message": "Post não encontrado"}`
