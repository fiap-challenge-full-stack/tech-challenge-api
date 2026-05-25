# Cenários BDD - Monitoramento de Saúde (Sucesso)

## Funcionalidade: Monitoramento (Sprint 1)
**Como um** Administrador do Sistema  
**Eu quero** verificar a saúde da aplicação  
**Para que** eu possa monitorar o status do serviço

### Cenário: Verificar saúde da aplicação
*   **Dado** que a API está rodando na porta 3001
*   **Quando** eu envio uma requisição `GET` para `/health`
*   **Então** o sistema deve retornar o status HTTP `200 OK`
*   **E** um JSON contendo o status e o timestamp atual
