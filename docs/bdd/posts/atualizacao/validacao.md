# Cenários BDD - Atualização de Postagem (Validação)

## Funcionalidade: Atualização de Postagem (Sprint 5)
**Como um** Autor  
**Eu quero** editar um post já existente  
**Para que** eu possa corrigir erros ou atualizar informações

### Cenário: Atualização sem nenhum campo
*   **Dado** que existe um post com UUID válido
*   **E** estou autenticado
*   **Quando** eu envio uma requisição `PUT` para `/posts/{uuid}` com um objeto JSON vazio `{}`
*   **Então** o sistema deve retornar o status HTTP `400 Bad Request`
*   **E** a mensagem indicando que ao menos um campo deve ser fornecido

### Cenário: Atualizar com campos inválidos
*   **Dado** que existe um post com UUID válido
*   **E** estou autenticado
*   **Quando** eu envio uma requisição `PUT` para `/posts/{uuid}` com dados inválidos (título < 3 caracteres)
*   **Então** o sistema deve retornar o status HTTP `400 Bad Request`
*   **E** o corpo da resposta deve detalhar quais campos falharam na validação
