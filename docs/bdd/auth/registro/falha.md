# Cenários BDD - Registro de Usuário (Falha)

## Funcionalidade: Registro de Usuário
**Como um** Docente/Admin  
**Eu quero** me registrar no sistema  
**Para que** eu possa criar e gerenciar postagens

### Cenário: Tentar registrar com email já existente
*   **Dado** que já existe um usuário com o email `docente@fiap.com.br`
*   **Quando** eu envio uma requisição `POST` para `/auth/registrar` com o mesmo email
*   **Então** o sistema não deve criar o usuário
*   **E** retornar o status HTTP `409 Conflict`
*   **E** a mensagem `{"message": "Usuário já existe"}`

### Cenário: Tentar registrar com senha fraca
*   **Dado** que eu envio uma senha com menos de 6 caracteres
*   **Quando** eu envio a requisição `POST` para `/auth/registrar`
*   **Então** o sistema não deve criar o usuário
*   **E** retornar o status HTTP `400 Bad Request`
*   **E** o corpo da resposta deve detalhar o erro de validação
