# Cenários BDD - Exclusão de Postagem (Validação)

## Funcionalidade: Exclusão de Postagem (Sprint 5)
**Como um** Autor/Moderador  
**Eu quero** remover uma postagem do blog  
**Para que** conteúdos irrelevantes sejam retirados

### Cenário: Validar formato de UUID na exclusão
*   **Dado** que eu envio um UUID em formato inválido
*   **E** estou autenticado
*   **Quando** eu envio uma requisição `DELETE` para `/posts/{uuid-invalido}`
*   **Então** o sistema deve retornar o status HTTP `400 Bad Request`
*   **E** o corpo da resposta deve detalhar o erro de validação do UUID
