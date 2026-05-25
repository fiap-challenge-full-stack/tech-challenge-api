# Cenários BDD - Login de Usuário (Falha)

## Funcionalidade: Login
**Como um** Usuário Registrado  
**Eu quero** fazer login no sistema  
**Para que** eu possa acessar funcionalidades protegidas

### Cenário: Tentar login com email inexistente
*   **Dado** que o email `naoexiste@fiap.com.br` não está cadastrado
*   **Quando** eu envio uma requisição `POST` para `/auth/login` com esse email
*   **Então** o sistema deve retornar o status HTTP `401 Unauthorized`
*   **E** a mensagem `{"message": "Credenciais inválidas"}`

### Cenário: Tentar login com senha incorreta
*   **Dado** que existe um usuário com email `docente@fiap.com.br` e senha `senha123`
*   **Quando** eu envio uma requisição `POST` para `/auth/login` com senha incorreta
*   **Então** o sistema deve retornar o status HTTP `401 Unauthorized`
*   **E** a mensagem `{"message": "Credenciais inválidas"}`
