# Cenários BDD - Login de Usuário (Sucesso)

## Funcionalidade: Login
**Como um** Usuário Registrado  
**Eu quero** fazer login no sistema  
**Para que** eu possa acessar funcionalidades protegidas

### Cenário: Fazer login com credenciais válidas
*   **Dado** que existe um usuário com email `docente@fiap.com.br` e senha `senha123`
*   **Quando** eu envio uma requisição `POST` para `/auth/login` com essas credenciais
*   **Então** o sistema deve validar as credenciais
*   **E** retornar o status HTTP `200 OK`
*   **E** o corpo da resposta deve conter o usuário (sem senha) e um token JWT válido
*   **E** o token deve ser enviado em cookie HttpOnly
