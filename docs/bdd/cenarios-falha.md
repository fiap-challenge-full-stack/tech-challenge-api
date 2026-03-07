# Cenários BDD - Casos de Falha (Edge Cases)

Este documento descreve como a API deve reagir a entradas inválidas ou situações adversas.

---

## Funcionalidade: Criação de Postagem (Sprint 6/Validações)
### Cenário: Tentar criar post sem campos obrigatórios
*   **Dado** que eu tento criar um post sem informar o `titulo`
*   **Quando** eu envio a requisição `POST` para `/posts`
*   **Então** o sistema não deve salvar o registro
*   **E** retornar o status HTTP `400 Bad Request`
*   **E** uma mensagem indicando que o campo é obrigatório.

---

## Funcionalidade: Visualização de Detalhes
### Cenário: Tentar visualizar post inexistente
*   **Dado** que o ID `id-que-nao-existe` não consta na base de dados
*   **Quando** eu envio uma requisição `GET` para `/posts/id-que-nao-existe`
*   **Então** o sistema deve retornar o status HTTP `404 Not Found`
*   **E** a mensagem `{"message": "Post not found"}`.

---

## Funcionalidade: Atualização e Exclusão (Sprint 5)
### Cenário: Tentar atualizar post inexistente
*   **Dado** que o ID `non-existent-789` não consta na base
*   **Quando** eu envio uma requisição `PUT` para `/posts/non-existent-789`
*   **Então** o sistema deve retornar o status HTTP `404 Not Found`
*   **E** a mensagem `{"message": "Post not found"}`.

### Cenário: Tentar deletar post inexistente
*   **Dado** que o ID `non-existent-999` não consta na base
*   **Quando** eu envio uma requisição `DELETE` para `/posts/non-existent-999`
*   **Então** o sistema deve retornar o status HTTP `404 Not Found`
*   **E** a mensagem `{"message": "Post not found"}`.

---

## Funcionalidade: Busca de Postagens (Sprint 7/Busca)
### Cenário: Busca sem resultados
*   **Dado** que não existe nenhum post contendo o termo "XPTO"
*   **Quando** eu envio uma requisição `GET` para `/posts/search?q=XPTO`
*   **Então** o sistema deve retornar o status HTTP `200 OK`
*   **E** uma lista vazia `[]`.
