# Cenários BDD - Listagem de Comentários (Falha)

## Funcionalidade: Ler comentários de um post
**Como um** visitante ou usuário autenticado
**Eu quero** visualizar os comentários de um post
**Para que** eu possa acompanhar a discussão

### Cenário: Listar comentários de um post que não existe
*   **Dado** que o `postUuid` informado não corresponde a nenhum post
*   **Quando** eu envio uma requisição `GET` para `/posts/:postUuid/comentarios`
*   **Então** o sistema deve retornar o status HTTP `404 Not Found`
*   **E** a mensagem `{"codigo": "POST_001", "message": "Post não encontrado"}`
