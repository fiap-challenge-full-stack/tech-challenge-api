# Cenários BDD - Leitura de Postagem (Sucesso)

## Funcionalidade: Listagem de Postagens (Sprint 4)
**Como um** Leitor  
**Eu quero** visualizar todas as postagens  
**Para que** eu possa escolher qual ler

### Cenário: Listar todos os posts existentes
*   **Dado** que existem postagens cadastradas no sistema
*   **Quando** eu envio uma requisição `GET` para `/posts`
*   **Então** o sistema deve retornar o status HTTP `200 OK`
*   **E** uma lista contendo todos os posts em formato JSON, ordenados pela data de criação (mais recentes primeiro)

## Funcionalidade: Visualização de Detalhes (Sprint 4)
**Como um** Leitor  
**Eu quero** ler o conteúdo completo de um post específico  
**Para que** eu possa me aprofundar no assunto

### Cenário: Visualizar post por UUID válido
*   **Dado** que existe um post com o UUID `ce104344-319f-42ed-9759-90080c60f7a2`
*   **Quando** eu envio uma requisição `GET` para `/posts/ce104344-319f-42ed-9759-90080c60f7a2`
*   **Então** o sistema deve retornar o status HTTP `200 OK`
*   **E** o conteúdo completo deste post específico
