# Cenários BDD - Criação de Postagem (Validação)

## Funcionalidade: Criação de Postagem (Sprint 4)
**Como um** Autor/Docente  
**Eu quero** criar uma nova postagem no blog  
**Para que** eu possa compartilhar conhecimento com os alunos

### Cenário: Tentar criar post com campos inválidos
*   **Dado** que eu envio dados que não respeitam os limites (ex: título < 3 caracteres, conteúdo < 10 caracteres)
*   **E** estou autenticado
*   **Quando** eu envio a requisição `POST` para `/posts`
*   **Então** o sistema não deve salvar o registro
*   **E** retornar o status HTTP `400 Bad Request`
*   **E** o corpo da resposta deve detalhar quais campos falharam na validação

### Cenário: Enviar JSON sintaticamente inválido
*   **Dado** que a requisição contém um corpo JSON malformado (faltando aspas, chaves, etc)
*   **Quando** eu envio a requisição para `/posts`
*   **Então** o sistema deve retornar o status HTTP `400 Bad Request`
*   **E** a mensagem `{"message": "JSON malformado ou inválido"}`
