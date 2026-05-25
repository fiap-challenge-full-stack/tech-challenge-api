# Cenários BDD - Autorização por Papel (Validação)

## Funcionalidade: Autenticação em Rotas Protegidas
**Como um** Usuário Autenticado  
**Eu quero** acessar rotas protegidas com meu token  
**Para que** eu possa criar/editar/excluir postagens

### Cenário: Acessar rota protegida com token válido
*   **Dado** que eu possuo um token JWT válido obtido no login
*   **Quando** eu envio uma requisição `POST` para `/posts` com header `Authorization: Bearer {token}`
*   **Então** o middleware deve validar o token
*   **E** a requisição deve prosseguir para o controller

### Cenário: Acessar rota protegida sem token
*   **Dado** que eu não possuo token
*   **Quando** eu envio uma requisição `POST` para `/posts` sem header `Authorization`
*   **Então** o middleware deve bloquear a requisição
*   **E** retornar o status HTTP `401 Unauthorized`
*   **E** a mensagem `{"message": "Token não fornecido"}`

### Cenário: Acessar rota protegida com token inválido
*   **Dado** que eu possuo um token JWT malformado ou expirado
*   **Quando** eu envio uma requisição `POST` para `/posts` com header `Authorization: Bearer {token-invalido}`
*   **Então** o middleware deve bloquear a requisição
*   **E** retornar o status HTTP `401 Unauthorized`
*   **E** a mensagem `{"message": "Token inválido ou expirado"}`

### Cenário: Acessar rota protegida com token no formato incorreto
*   **Dado** que eu envio o token sem o prefixo `Bearer `
*   **Quando** eu envio uma requisição `POST` para `/posts` com header `Authorization: {token}`
*   **Então** o middleware deve bloquear a requisição
*   **E** retornar o status HTTP `401 Unauthorized`
*   **E** a mensagem `{"message": "Token não fornecido"}`
