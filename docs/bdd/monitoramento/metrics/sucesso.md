# Cenários BDD - Métricas do Sistema (Sucesso)

## Funcionalidade: Métricas do Sistema
**Como um** Administrador do Sistema  
**Eu quero** acessar métricas da aplicação  
**Para que** eu possa monitorar performance e identificar problemas

### Cenário: Acessar métricas da aplicação
*   **Dado** que a API está coletando métricas
*   **Quando** eu envio uma requisição `GET` para `/metrics`
*   **Então** o sistema deve retornar o status HTTP `200 OK`
*   **E** um JSON contendo métricas de requests, erros, latência, etc
