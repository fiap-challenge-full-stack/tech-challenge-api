# Cenários BDD - Exclusão de Comentário (Falha)

## Funcionalidade: Excluir um comentário
**Como um** autor do comentário ou administrador
**Eu quero** remover um comentário
**Para que** eu possa corrigir um engano ou moderar conteúdo indevido

### Cenário: Tentar excluir sem autenticação
*   **Dado** que não possuo token de autenticação
*   **Quando** eu envio uma requisição `DELETE` para `/comentarios/:uuid`
*   **Então** o sistema deve retornar o status HTTP `401 Unauthorized`

### Cenário: Usuário comum tenta excluir comentário de outro usuário
*   **Dado** que estou autenticado, mas não sou o autor do comentário
*   **E** meu papel não é `admin`
*   **Quando** eu envio uma requisição `DELETE` para `/comentarios/:uuid`
*   **Então** o sistema não deve remover o comentário
*   **E** retornar o status HTTP `403 Forbidden`
*   **E** a mensagem `{"codigo": "COM_002", "message": "Operação não permitida para este usuário"}`

### Cenário: Tentar excluir um comentário que não existe
*   **Dado** que estou autenticado
*   **E** o `uuid` informado não corresponde a nenhum comentário
*   **Quando** eu envio uma requisição `DELETE` para `/comentarios/:uuid`
*   **Então** o sistema deve retornar o status HTTP `404 Not Found`
*   **E** a mensagem `{"codigo": "COM_001", "message": "Comentário não encontrado"}`
