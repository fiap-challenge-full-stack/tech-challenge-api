# Cenários BDD - Exclusão de Comentário (Sucesso)

## Funcionalidade: Excluir um comentário
**Como um** autor do comentário ou administrador
**Eu quero** remover um comentário
**Para que** eu possa corrigir um engano ou moderar conteúdo indevido

### Cenário: Autor exclui o próprio comentário
*   **Dado** que estou autenticado
*   **E** sou o autor do comentário referenciado
*   **Quando** eu envio uma requisição `DELETE` para `/comentarios/:uuid`
*   **Então** o sistema deve remover o comentário
*   **E** retornar o status HTTP `204 No Content`

### Cenário: Administrador exclui o comentário de outro usuário
*   **Dado** que estou autenticado com papel `admin`
*   **E** o comentário referenciado pertence a outro usuário
*   **Quando** eu envio uma requisição `DELETE` para `/comentarios/:uuid`
*   **Então** o sistema deve remover o comentário
*   **E** retornar o status HTTP `204 No Content`
