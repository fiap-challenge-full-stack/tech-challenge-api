# Cenários BDD - Casos de Sucesso (Happy Path)

Este documento descreve os comportamentos esperados para as funcionalidades da API de Blog em cenários ideais.

---

## Funcionalidade: Criação de Postagem (Sprint 4)
**Como um** Autor/Docente  
**Eu quero** criar uma nova postagem no blog  
**Para que** eu possa compartilhar conhecimento com os alunos

### Cenário: Criar um post com dados válidos
*   **Dado** que eu possuo os dados do post (título, conteúdo e autor)
*   **Quando** eu envio uma requisição `POST` para `/posts` com esses dados
*   **Então** o sistema deve salvar o post no banco de dados
*   **E** retornar o status HTTP `201 Created`
*   **E** o corpo da resposta deve conter o `id` gerado e a data de criação.

---

## Funcionalidade: Listagem de Postagens (Sprint 4)
**Como um** Leitor  
**Eu quero** visualizar todas as postagens  
**Para que** eu possa escolher qual ler

### Cenário: Listar todos os posts existentes
*   **Dado** que existem postagens cadastradas no sistema
*   **Quando** eu envio uma requisição `GET` para `/posts`
*   **Então** o sistema deve retornar o status HTTP `200 OK`
*   **E** uma lista contendo todos os posts em formato JSON.

---

## Funcionalidade: Visualização de Detalhes (Sprint 4)
**Como um** Leitor  
**Eu quero** ler o conteúdo completo de um post específico  
**Para que** eu possa me aprofundar no assunto

### Cenário: Visualizar post por ID válido
*   **Dado** que existe um post com o ID `123-abc`
*   **Quando** eu envio uma requisição `GET` para `/posts/123-abc`
*   **Então** o sistema deve retornar o status HTTP `200 OK`
*   **E** o conteúdo completo deste post específico.

---

## Funcionalidade: Atualização de Postagem (Sprint 5)
**Como um** Autor  
**Eu quero** editar um post já existente  
**Para que** eu possa corrigir erros ou atualizar informações

### Cenário: Atualizar título e conteúdo de um post
*   **Dado** que existe um post com o ID `abc-123`
*   **E** eu possuo novos dados para o título e conteúdo
*   **Quando** eu envio uma requisição `PUT` para `/posts/abc-123` com os novos dados
*   **Então** o sistema deve atualizar as informações no banco de dados
*   **E** retornar o status HTTP `200 OK`
*   **E** o corpo da resposta deve conter o post atualizado.

---

## Funcionalidade: Exclusão de Postagem (Sprint 5)
**Como um** Autor/Moderador  
**Eu quero** remover uma postagem do blog  
**Para que** conteúdos irrelevantes sejam retirados

### Cenário: Excluir um post por ID
*   **Dado** que existe um post com o ID `delete-me-789`
*   **Quando** eu envio uma requisição `DELETE` para `/posts/delete-me-789`
*   **Então** o sistema deve remover o post permanentemente do banco de dados
*   **E** retornar o status HTTP `204 No Content`.

---

## Funcionalidade: Monitoramento (Sprint 1)
### Cenário: Verificar saúde da aplicação
*   **Dado** que a API está no ar
*   **Quando** eu envio uma requisição `GET` para `/health`
*   **Então** o sistema deve retornar o status HTTP `200 OK`
*   **E** a mensagem `{"status": "ok"}`.
