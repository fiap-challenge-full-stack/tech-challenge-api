# Cenários BDD - Registro de Usuário (Validação)

## Funcionalidade: Registro de Usuário
**Como um** Docente/Admin  
**Eu quero** me registrar no sistema  
**Para que** eu possa criar e gerenciar postagens

### Cenário: Validar formato de email
*   **Dado** que eu envio um email em formato inválido (ex: sem @, sem domínio)
*   **Quando** eu envio a requisição `POST` para `/auth/registrar`
*   **Então** o sistema não deve criar o usuário
*   **E** retornar o status HTTP `400 Bad Request`
*   **E** o corpo da resposta deve detalhar o erro de validação do campo email

### Cenário: Validar campos obrigatórios
*   **Dado** que eu envio a requisição sem um ou mais campos obrigatórios (email, nome, senha)
*   **Quando** eu envio a requisição `POST` para `/auth/registrar`
*   **Então** o sistema não deve criar o usuário
*   **E** retornar o status HTTP `400 Bad Request`
*   **E** o corpo da resposta deve detalhar quais campos estão faltando
