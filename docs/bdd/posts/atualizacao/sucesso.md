# Cenários BDD - Atualização de Postagem (Sucesso)

## Funcionalidade: Atualização de Postagem (Sprint 5)
**Como um** Autor  
**Eu quero** editar um post já existente  
**Para que** eu possa corrigir erros ou atualizar informações

### Cenário: Atualizar dados de um post existente
*   **Dado** que existe um post com o UUID `ce104344-319f-42ed-9759-90080c60f7a2`
*   **E** eu possuo novos dados válidos para atualização
*   **E** estou autenticado como docente ou admin
*   **Quando** eu envio uma requisição `PUT` para `/posts/ce104344-319f-42ed-9759-90080c60f7a2` com os novos dados
*   **Então** o sistema deve atualizar as informações no banco de dados
*   **E** retornar o status HTTP `200 OK`
*   **E** atualizar o campo `updatedAt`
