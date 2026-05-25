# Cenários BDD - Casos de Falha (Edge Cases)

Este documento descreve como a API deve reagir a entradas inválidas ou situações adversas, seguindo as regras de negócio e validações implementadas.

---

## Funcionalidade: Validação de Dados (Sprint 6)
### Cenário: Tentar criar post com campos inválidos
*   **Dado** que eu envio dados que não respeitam os limites (ex: título < 3 caracteres, conteúdo < 10 caracteres)
*   **Quando** eu envio a requisição `POST` para `/posts`
*   **Então** o sistema não deve salvar o registro
*   **E** retornar o status HTTP `400 Bad Request`
*   **E** o corpo da resposta deve detalhar quais campos falharam na validação.

### Cenário: Enviar JSON sintaticamente inválido
*   **Dado** que a requisição contém um corpo JSON malformado (faltando aspas, chaves, etc)
*   **Quando** eu envio a requisição para qualquer endpoint da API
*   **Então** o sistema deve retornar o status HTTP `400 Bad Request`
*   **E** a mensagem `{"message": "JSON malformado ou inválido"}`.

---

## Funcionalidade: Gerenciamento de Recursos (Sprint 5)
### Cenário: Tentar buscar, atualizar ou deletar post inexistente
*   **Dado** que o UUID informado não consta na base de dados
*   **Quando** eu envio uma requisição `GET`, `PUT` ou `DELETE` para `/posts/{uuid}`
*   **Então** o sistema deve retornar o status HTTP `404 Not Found`
*   **E** a mensagem `{"message": "Post not found"}`.

### Cenário: Atualização sem nenhum campo
*   **Dado** que existe um post com UUID válido
*   **Quando** eu envio uma requisição `PUT` para `/posts/{uuid}` com um objeto JSON vazio `{}`
*   **Então** o sistema deve retornar o status HTTP `400 Bad Request`
*   **E** a mensagem indicando que ao menos um campo deve ser fornecido.

---

## Funcionalidade: Busca de Postagens (Sprint 7)
### Cenário: Busca sem resultados
*   **Dado** que não existe nenhum post contendo o termo pesquisado
*   **Quando** eu envio uma requisição `GET` para `/posts/search?q=TERMO_INEXISTENTE`
*   **Então** o sistema deve retornar o status HTTP `200 OK`
*   **E** uma lista vazia `[]`.
