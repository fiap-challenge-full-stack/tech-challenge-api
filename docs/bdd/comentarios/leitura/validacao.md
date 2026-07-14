# Cenários BDD - Listagem de Comentários (Validação)

## Funcionalidade: Ler comentários de um post
**Como um** visitante ou usuário autenticado
**Eu quero** visualizar os comentários de um post
**Para que** eu possa acompanhar a discussão

### Cenário: Validar formato de UUID do post
*   **Dado** que eu envio um `postUuid` em formato inválido
*   **Quando** eu envio uma requisição `GET` para `/posts/{uuid-invalido}/comentarios`
*   **Então** o sistema deve retornar o status HTTP `400 Bad Request`
*   **E** o corpo da resposta deve conter `{"codigo": "VAL_001", "message": "ID do post inválido. Deve ser um UUID válido."}`
