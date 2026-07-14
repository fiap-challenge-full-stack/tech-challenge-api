# Cenários BDD - Exclusão de Comentário (Validação)

## Funcionalidade: Excluir um comentário
**Como um** autor do comentário ou administrador
**Eu quero** remover um comentário
**Para que** eu possa corrigir um engano ou moderar conteúdo indevido

### Cenário: Validar formato de UUID do comentário
*   **Dado** que eu envio um `uuid` em formato inválido
*   **E** estou autenticado
*   **Quando** eu envio uma requisição `DELETE` para `/comentarios/{uuid-invalido}`
*   **Então** o sistema deve retornar o status HTTP `400 Bad Request`
*   **E** o corpo da resposta deve conter `{"codigo": "VAL_001", "message": "ID do comentário inválido. Deve ser um UUID válido."}`
