# Cenários BDD - Monitoramento de Saúde (Validação)

## Funcionalidade: Monitoramento (Sprint 1)
**Como um** Administrador do Sistema  
**Eu quero** verificar a saúde da aplicação  
**Para que** eu possa monitorar o status do serviço

### Cenário: Endpoint de health sempre disponível
*   **Dado** que o endpoint `/health` deve estar sempre acessível
*   **Quando** eu envio uma requisição `GET` para `/health`
*   **Então** o sistema deve responder mesmo sob carga alta
*   **E** retornar o status HTTP `200 OK` dentro de um tempo aceitável (< 1s)
