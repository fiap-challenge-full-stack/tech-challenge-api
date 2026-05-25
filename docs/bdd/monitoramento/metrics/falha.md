# Cenários BDD - Métricas do Sistema (Falha)

## Funcionalidade: Métricas do Sistema
**Como um** Administrador do Sistema  
**Eu quero** acessar métricas da aplicação  
**Para que** eu possa monitorar performance e identificar problemas

### Cenário: Serviço de métricas indisponível
*   **Dado** que o serviço de coleta de métricas não está funcionando
*   **Quando** eu envio uma requisição `GET` para `/metrics`
*   **Então** o sistema deve retornar o status HTTP `503 Service Unavailable`
*   **E** um JSON indicando que o serviço de métricas está indisponível
