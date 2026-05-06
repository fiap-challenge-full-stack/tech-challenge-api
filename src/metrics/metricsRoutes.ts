import { Router } from 'express';
import { MetricsController } from './metricsController';

const metricsRouter = Router();
const metricsController = new MetricsController();

// GET /metrics - Retorna todas as métricas em formato Prometheus
metricsRouter.get('/', metricsController.getMetrics.bind(metricsController));

// GET /metrics/summary - Retorna resumo das métricas
metricsRouter.get('/summary', metricsController.getMetricsSummary.bind(metricsController));

// GET /metrics/endpoint/:endpoint - Retorna métricas de um endpoint específico
metricsRouter.get('/endpoint/:endpoint', metricsController.getMetricsByEndpoint.bind(metricsController));

// GET /metrics/method/:method - Retorna métricas de um método HTTP específico
metricsRouter.get('/method/:method', metricsController.getMetricsByMethod.bind(metricsController));

// GET /metrics/status/:statusCode - Retorna métricas de um status code específico
metricsRouter.get('/status/:statusCode', metricsController.getMetricsByStatusCode.bind(metricsController));

// GET /metrics/search - Busca métricas com filtros combinados
// Query params: endpoint, method, statusCode, function
metricsRouter.get('/search', metricsController.searchMetrics.bind(metricsController));

export default metricsRouter;
