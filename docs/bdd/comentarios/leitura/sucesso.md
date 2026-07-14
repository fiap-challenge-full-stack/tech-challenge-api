# Cenários BDD - Listagem de Comentários (Sucesso)

## Funcionalidade: Ler comentários de um post
**Como um** visitante ou usuário autenticado
**Eu quero** visualizar os comentários de um post
**Para que** eu possa acompanhar a discussão

### Cenário: Listar comentários de um post existente, sem autenticação
*   **Dado** que o post referenciado existe e possui comentários
*   **Quando** eu envio uma requisição `GET` para `/posts/:postUuid/comentarios` sem token
*   **Então** o sistema deve retornar o status HTTP `200 OK`
*   **E** o corpo da resposta deve conter `{ sucesso: true, dados: [...] }`, ordenados do mais antigo para o mais recente

### Cenário: Listar comentários de um post sem nenhum comentário
*   **Dado** que o post referenciado existe e não possui comentários
*   **Quando** eu envio a requisição `GET` para `/posts/:postUuid/comentarios`
*   **Então** o sistema deve retornar o status HTTP `200 OK`
*   **E** `dados` deve ser um array vazio
