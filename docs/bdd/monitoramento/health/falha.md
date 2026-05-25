# Cenários BDD - Monitoramento de Saúde (Falha)

## Funcionalidade: Monitoramento (Sprint 1)
**Como um** Administrador do Sistema  
**Eu quero** verificar a saúde da aplicação  
**Para que** eu possa monitorar o status do serviço

### Cenário: Serviço indisponível
*   **Dado** que a API não está respondendo
*   **Quando** eu envio uma requisição `GET` para `/health`
*   **Então** o sistema deve retornar o status HTTP `503 Service Unavailable`
*   **E** um JSON indicando que o serviço está indisponível
