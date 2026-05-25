# Cenários BDD - Métricas do Sistema (Validação)

## Funcionalidade: Métricas do Sistema
**Como um** Administrador do Sistema  
**Eu quero** acessar métricas da aplicação  
**Para que** eu possa monitorar performance e identificar problemas

### Cenário: Formato das métricas deve ser válido
*   **Dado** que o endpoint `/metrics` retorna dados
*   **Quando** eu envio uma requisição `GET` para `/metrics`
*   **Então** o sistema deve retornar métricas em formato válido (JSON ou Prometheus)
*   **E** os campos devem seguir o schema esperado
