# Cenários BDD - Exclusão de Postagem (Sucesso)

## Funcionalidade: Exclusão de Postagem (Sprint 5)
**Como um** Autor/Moderador  
**Eu quero** remover uma postagem do blog  
**Para que** conteúdos irrelevantes sejam retirados

### Cenário: Excluir um post por UUID
*   **Dado** que existe um post com o UUID `ce104344-319f-42ed-9759-90080c60f7a2`
*   **E** estou autenticado como docente ou admin
*   **Quando** eu envio uma requisição `DELETE` para `/posts/ce104344-319f-42ed-9759-90080c60f7a2`
*   **Então** o sistema deve remover o post permanentemente do banco de dados
*   **E** retornar o status HTTP `204 No Content`
