# Cenários BDD - Login de Usuário (Validação)

## Funcionalidade: Login
**Como um** Usuário Registrado  
**Eu quero** fazer login no sistema  
**Para que** eu possa acessar funcionalidades protegidas

### Cenário: Validar campos obrigatórios no login
*   **Dado** que eu envio a requisição sem email ou senha
*   **Quando** eu envio a requisição `POST` para `/auth/login`
*   **Então** o sistema deve retornar o status HTTP `400 Bad Request`
*   **E** o corpo da resposta deve detalhar quais campos estão faltando

### Cenário: Validar formato de email no login
*   **Dado** que eu envio um email em formato inválido
*   **Quando** eu envio a requisição `POST` para `/auth/login`
*   **Então** o sistema deve retornar o status HTTP `400 Bad Request`
*   **E** o corpo da resposta deve detalhar o erro de validação do campo email
