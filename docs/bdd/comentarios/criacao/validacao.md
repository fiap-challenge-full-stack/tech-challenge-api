# Cenários BDD - Criação de Comentário (Validação)

## Funcionalidade: Comentar em um post
**Como um** usuário autenticado
**Eu quero** comentar em um post existente
**Para que** eu possa interagir com o conteúdo publicado

### Cenário: Tentar comentar com conteúdo muito curto
*   **Dado** que eu envio um `conteudo` com menos de 3 caracteres
*   **E** estou autenticado
*   **Quando** eu envio a requisição `POST` para `/posts/:postUuid/comentarios`
*   **Então** o sistema não deve salvar o comentário
*   **E** retornar o status HTTP `400 Bad Request`
*   **E** o corpo da resposta deve detalhar o campo `conteudo` em `errors`

### Cenário: Tentar comentar com conteúdo muito longo
*   **Dado** que eu envio um `conteudo` com mais de 1000 caracteres
*   **E** estou autenticado
*   **Quando** eu envio a requisição `POST` para `/posts/:postUuid/comentarios`
*   **Então** o sistema deve retornar o status HTTP `400 Bad Request`

### Cenário: Enviar corpo sem o campo conteudo
*   **Dado** que o corpo da requisição não contém `conteudo`
*   **E** estou autenticado
*   **Quando** eu envio a requisição `POST` para `/posts/:postUuid/comentarios`
*   **Então** o sistema deve retornar o status HTTP `400 Bad Request`

### Cenário: Tentar informar autoria manualmente
*   **Dado** que eu envio `autorUuid` ou `autorNome` no corpo da requisição
*   **Quando** o comentário é criado
*   **Então** esses campos devem ser ignorados
*   **E** a autoria deve ser sempre derivada do usuário autenticado (sessão/token)
