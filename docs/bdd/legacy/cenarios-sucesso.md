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
*   **E** o corpo da resposta deve conter o `id` serial, o `uuid` gerado, e as datas de criação/atualização.

---

## Funcionalidade: Listagem de Postagens (Sprint 4)
**Como um** Leitor  
**Eu quero** visualizar todas as postagens  
**Para que** eu possa escolher qual ler

### Cenário: Listar todos os posts existentes
*   **Dado** que existem postagens cadastradas no sistema
*   **Quando** eu envio uma requisição `GET` para `/posts`
*   **Então** o sistema deve retornar o status HTTP `200 OK`
*   **E** uma lista contendo todos os posts em formato JSON, ordenados pela data de criação (mais recentes primeiro).

---

## Funcionalidade: Visualização de Detalhes (Sprint 4)
**Como um** Leitor  
**Eu quero** ler o conteúdo completo de um post específico  
**Para que** eu possa me aprofundar no assunto

### Cenário: Visualizar post por UUID válido
*   **Dado** que existe um post com o UUID `ce104344-319f-42ed-9759-90080c60f7a2`
*   **Quando** eu envio uma requisição `GET` para `/posts/ce104344-319f-42ed-9759-90080c60f7a2`
*   **Então** o sistema deve retornar o status HTTP `200 OK`
*   **E** o conteúdo completo deste post específico.

---

## Funcionalidade: Busca de Postagens (Sprint 7)
**Como um** Leitor  
**Eu quero** pesquisar postagens por termos específicos  
**Para que** eu encontre rapidamente o conteúdo desejado

### Cenário: Pesquisar posts por título ou conteúdo
*   **Dado** que existem posts com o termo "Matemática" no título ou conteúdo
*   **Quando** eu envio uma requisição `GET` para `/posts/search?q=Matemática`
*   **Então** o sistema deve retornar o status HTTP `200 OK`
*   **E** uma lista contendo os posts que deram match com o termo.

---

## Funcionalidade: Atualização de Postagem (Sprint 5)
**Como um** Autor  
**Eu quero** editar um post já existente  
**Para que** eu possa corrigir erros ou atualizar informações

### Cenário: Atualizar dados de um post existente
*   **Dado** que existe um post com o UUID `ce104344-319f-42ed-9759-90080c60f7a2`
*   **E** eu possuo novos dados válidos para atualização
*   **Quando** eu envio uma requisição `PUT` para `/posts/ce104344-319f-42ed-9759-90080c60f7a2` com os novos dados
*   **Então** o sistema deve atualizar as informações no banco de dados
*   **E** retornar o status HTTP `200 OK`
*   **E** atualizar o campo `updatedAt`.

---

## Funcionalidade: Exclusão de Postagem (Sprint 5)
**Como um** Autor/Moderador  
**Eu quero** remover uma postagem do blog  
**Para que** conteúdos irrelevantes sejam retirados

### Cenário: Excluir um post por UUID
*   **Dado** que existe um post com o UUID `ce104344-319f-42ed-9759-90080c60f7a2`
*   **Quando** eu envio uma requisição `DELETE` para `/posts/ce104344-319f-42ed-9759-90080c60f7a2`
*   **Então** o sistema deve remover o post permanentemente do banco de dados
*   **E** retornar o status HTTP `204 No Content`.

---

## Funcionalidade: Monitoramento (Sprint 1)
### Cenário: Verificar saúde da aplicação
*   **Dado** que a API está rodando na porta 3001
*   **Quando** eu envio uma requisição `GET` para `/health`
*   **Então** o sistema deve retornar o status HTTP `200 OK`
*   **E** um JSON contendo o status e o timestamp atual.
