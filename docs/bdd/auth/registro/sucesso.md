# Cenários BDD - Registro de Usuário (Sucesso)

## Funcionalidade: Registro de Usuário
**Como um** Docente/Admin  
**Eu quero** me registrar no sistema  
**Para que** eu possa criar e gerenciar postagens

### Cenário: Registrar novo usuário com dados válidos
*   **Dado** que eu forneço email, nome, senha e papel (opcional)
*   **Quando** eu envio uma requisição `POST` para `/auth/registrar` com esses dados
*   **Então** o sistema deve criar o usuário no banco de dados
*   **E** a senha deve ser armazenada como hash (bcrypt)
*   **E** retornar o status HTTP `201 Created`
*   **E** o corpo da resposta deve conter o usuário criado (sem senha) e um token JWT
