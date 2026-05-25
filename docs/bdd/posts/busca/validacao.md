# Cenários BDD - Busca de Postagens (Validação)

## Funcionalidade: Busca de Postagens (Sprint 7)
**Como um** Leitor  
**Eu quero** pesquisar postagens por termos específicos  
**Para que** eu encontre rapidamente o conteúdo desejado

### Cenário: Busca sem parâmetro de query
*   **Dado** que eu envio uma requisição sem o parâmetro `q`
*   **Quando** eu envio uma requisição `GET` para `/posts/search`
*   **Então** o sistema deve retornar o status HTTP `400 Bad Request`
*   **E** a mensagem indicando que o parâmetro de busca é obrigatório

### Cenário: Busca com termo muito curto
*   **Dado** que eu envio um termo de busca com menos de 2 caracteres
*   **Quando** eu envio uma requisição `GET` para `/posts/search?q=a`
*   **Então** o sistema deve retornar o status HTTP `400 Bad Request`
*   **E** a mensagem indicando que o termo de busca deve ter pelo menos 2 caracteres
