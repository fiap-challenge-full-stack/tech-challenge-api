# Cenários BDD - Leitura de Postagem (Falha)

## Funcionalidade: Visualização de Detalhes (Sprint 4)
**Como um** Leitor  
**Eu quero** ler o conteúdo completo de um post específico  
**Para que** eu possa me aprofundar no assunto

### Cenário: Tentar visualizar post inexistente
*   **Dado** que o UUID informado não consta na base de dados
*   **Quando** eu envio uma requisição `GET` para `/posts/{uuid}`
*   **Então** o sistema deve retornar o status HTTP `404 Not Found`
*   **E** a mensagem `{"message": "Post not found"}`
