# Cenários BDD - Leitura de Postagem (Validação)

## Funcionalidade: Visualização de Detalhes (Sprint 4)
**Como um** Leitor  
**Eu quero** ler o conteúdo completo de um post específico  
**Para que** eu possa me aprofundar no assunto

### Cenário: Validar formato de UUID
*   **Dado** que eu envio um UUID em formato inválido
*   **Quando** eu envio uma requisição `GET` para `/posts/{uuid-invalido}`
*   **Então** o sistema deve retornar o status HTTP `400 Bad Request`
*   **E** o corpo da resposta deve detalhar o erro de validação do UUID
