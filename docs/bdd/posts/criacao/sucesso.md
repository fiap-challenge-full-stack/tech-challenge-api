# Cenários BDD - Criação de Postagem (Sucesso)

## Funcionalidade: Criação de Postagem (Sprint 4)
**Como um** Autor/Docente  
**Eu quero** criar uma nova postagem no blog  
**Para que** eu possa compartilhar conhecimento com os alunos

### Cenário: Criar um post com dados válidos
*   **Dado** que eu possuo os dados do post (título, conteúdo e autor)
*   **E** estou autenticado como docente ou admin
*   **Quando** eu envio uma requisição `POST` para `/posts` com esses dados
*   **Então** o sistema deve salvar o post no banco de dados
*   **E** retornar o status HTTP `201 Created`
*   **E** o corpo da resposta deve conter o `id` serial, o `uuid` gerado, e as datas de criação/atualização
