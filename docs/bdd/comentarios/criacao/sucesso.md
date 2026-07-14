# Cenários BDD - Criação de Comentário (Sucesso)

## Funcionalidade: Comentar em um post
**Como um** usuário autenticado (docente, aluno ou admin)
**Eu quero** comentar em um post existente
**Para que** eu possa interagir com o conteúdo publicado

### Cenário: Comentar em um post existente com dados válidos
*   **Dado** que estou autenticado, com qualquer papel (docente, aluno ou admin)
*   **E** o post referenciado existe
*   **Quando** eu envio uma requisição `POST` para `/posts/:postUuid/comentarios` com um conteúdo válido
*   **Então** o sistema deve salvar o comentário associado ao post e ao meu usuário
*   **E** retornar o status HTTP `201 Created`
*   **E** o corpo da resposta deve conter `{ sucesso: true, dados: { uuid, postUuid, autorUuid, autorNome, conteudo, criadoEm, atualizadoEm } }`
