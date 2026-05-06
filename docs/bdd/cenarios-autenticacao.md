# Cenários BDD - Autenticação e Autorização

Este documento descreve os comportamentos esperados para o módulo de autenticação e autorização da API.

---

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

---

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

---

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

---

## Funcionalidade: Autorização por Papel
**Como um** Usuário com Papel Específico  
**Eu quero** acessar apenas funcionalidades permitidas ao meu papel  
**Para que** o sistema mantenha a segurança e controle de acesso

### Cenário: Docente acessa rota permitida (criar post)
*   **Dado** que sou um usuário com papel `docente` e possuo token válido
*   **Quando** eu envio uma requisição `POST` para `/posts` com meu token
*   **Então** o middleware de autorização deve permitir o acesso
*   **E** a requisição deve prosseguir para o controller

### Cenário: Admin acessa rota permitida (criar post)
*   **Dado** que sou um usuário com papel `admin` e possuo token válido
*   **Quando** eu envio uma requisição `POST` para `/posts` com meu token
*   **Então** o middleware de autorização deve permitir o acesso
*   **E** a requisição deve prosseguir para o controller

### Cenário: Usuário com papel não permitido tenta acessar rota
*   **Dado** que sou um usuário com papel `aluno` (não permitido para escrita)
*   **Quando** eu envio uma requisição `POST` para `/posts` com meu token
*   **Então** o middleware de autorização deve bloquear a requisição
*   **E** retornar o status HTTP `403 Forbidden`
*   **E** a mensagem `{"message": "Permissão insuficiente"}`

### Cenário: Acessar rota pública sem autenticação
*   **Dado** que não possuo token
*   **Quando** eu envio uma requisição `GET` para `/posts` (rota pública)
*   **Então** a requisição deve ser processada normalmente
*   **E** retornar o status HTTP `200 OK`

---

## Funcionalidade: Estrutura do Token JWT
**Como um** Desenvolvedor  
**Eu quero** que o token JWT contenha informações essenciais do usuário  
**Para que** o middleware possa autenticar e autorizar sem consultar o banco

### Cenário: Token JWT deve conter payload correto
*   **Dado** que faço login com sucesso
*   **Quando** eu decodo o token JWT recebido
*   **Então** o payload deve conter:
    *   `uuid`: identificador único do usuário
    *   `email`: email do usuário
    *   `nome`: nome do usuário
    *   `papel`: papel do usuário (docente, admin)
*   **E** o token deve ter expiração configurada (default: 7d)
*   **E** o token deve ser assinado com `JWT_SECRET` do ambiente

---

## Funcionalidade: Segurança de Senha
**Como um** Usuário  
**Eu quero** que minha senha seja armazenada de forma segura  
**Para que** mesmo em caso de vazamento de banco, minhas credenciais permaneçam protegidas

### Cenário: Senha deve ser armazenada como hash bcrypt
*   **Dado** que registro um usuário com senha `senha123`
*   **Quando** eu consulto o banco de dados
*   **Então** a senha armazenada não deve ser `senha123` em texto plano
*   **E** deve ser um hash bcrypt (60 caracteres, começando com `$2a$` ou `$2b$`)
*   **E** o hash deve ser gerado com salt rounds = 10

### Cenário: Senha nunca deve ser retornada na API
*   **Dado** que faço login ou registro com sucesso
*   **Quando** eu recebo a resposta da API
*   **Então** o corpo da resposta NÃO deve conter o campo `senha` ou `senhaHash`
*   **E** apenas dados públicos (uuid, email, nome, papel, datas) devem ser expostos
