# Cenários BDD - Busca de Postagens (Sucesso)

## Funcionalidade: Busca de Postagens (Sprint 7)
**Como um** Leitor  
**Eu quero** pesquisar postagens por termos específicos  
**Para que** eu encontre rapidamente o conteúdo desejado

### Cenário: Pesquisar posts por título ou conteúdo
*   **Dado** que existem posts com o termo "Matemática" no título ou conteúdo
*   **Quando** eu envio uma requisição `GET` para `/posts/search?q=Matemática`
*   **Então** o sistema deve retornar o status HTTP `200 OK`
*   **E** uma lista contendo os posts que deram match com o termo
