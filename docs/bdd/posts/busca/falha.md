# Cenários BDD - Busca de Postagens (Falha)

## Funcionalidade: Busca de Postagens (Sprint 7)
**Como um** Leitor  
**Eu quero** pesquisar postagens por termos específicos  
**Para que** eu encontre rapidamente o conteúdo desejado

### Cenário: Busca sem resultados
*   **Dado** que não existe nenhum post contendo o termo pesquisado
*   **Quando** eu envio uma requisição `GET` para `/posts/search?q=TERMO_INEXISTENTE`
*   **Então** o sistema deve retornar o status HTTP `200 OK`
*   **E** uma lista vazia `[]`
