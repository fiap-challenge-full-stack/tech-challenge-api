import { Request, Response } from 'express';

async function fetchMetrics(): Promise<string> {
  const http = await import('http');
  return new Promise((resolve, reject) => {
    http.get('http://localhost:9464/metrics', (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

function toString(value: unknown): string {
  if (Array.isArray(value)) return String(value[0] || '');
  if (typeof value === 'object' && value !== null) return String(Object.values(value)[0] || '');
  return String(value || '');
}

export class MetricsController {
  async getMetrics(_req: Request, res: Response): Promise<Response> {
    try {
      const metrics = await fetchMetrics();
      return res.set('Content-Type', 'text/plain').send(metrics);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar métricas' });
    }
  }

  async getMetricsByEndpoint(req: Request, res: Response): Promise<Response> {
    try {
      const { endpoint } = req.params;
      const metrics = await fetchMetrics();
      
      const lines = metrics.split('\n');
      const filteredLines = lines.filter((line: string) => {
        if (!line || line.startsWith('#')) return false;
        return line.includes(`http_route="${endpoint}"`);
      });

      return res.json({
        endpoint,
        metrics: filteredLines,
        total: filteredLines.length
      });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar métricas do endpoint' });
    }
  }

  async getMetricsByMethod(req: Request, res: Response): Promise<Response> {
    try {
      const { method } = req.params;
      const metrics = await fetchMetrics();
      const methodStr = toString(method).toUpperCase();
      
      const lines = metrics.split('\n');
      const filteredLines = lines.filter((line: string) => {
        if (!line || line.startsWith('#')) return false;
        return line.includes(`http_method="${methodStr}"`);
      });

      return res.json({
        method: methodStr,
        metrics: filteredLines,
        total: filteredLines.length
      });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar métricas do método' });
    }
  }

  async getMetricsByStatusCode(req: Request, res: Response): Promise<Response> {
    try {
      const { statusCode } = req.params;
      const metrics = await fetchMetrics();
      
      const lines = metrics.split('\n');
      const filteredLines = lines.filter((line: string) => {
        if (!line || line.startsWith('#')) return false;
        return line.includes(`status_code="${statusCode}"`);
      });

      return res.json({
        statusCode,
        metrics: filteredLines,
        total: filteredLines.length
      });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar métricas do status code' });
    }
  }

  async getMetricsSummary(_req: Request, res: Response): Promise<Response> {
    try {
      const metrics = await fetchMetrics();
      
      const lines = metrics.split('\n');
      const summary = {
        totalMetrics: 0,
        byEndpoint: {} as Record<string, number>,
        byMethod: {} as Record<string, number>,
        byStatusCode: {} as Record<string, number>,
        functions: [] as string[]
      };

      lines.forEach((line: string) => {
        if (!line || line.startsWith('#')) return;
        
        if (line.includes('http_route=')) {
          const match = line.match(/http_route="([^"]+)"/);
          if (match) {
            const route = match[1];
            summary.byEndpoint[route] = (summary.byEndpoint[route] || 0) + 1;
          }
        }

        if (line.includes('http_method=')) {
          const match = line.match(/http_method="([^"]+)"/);
          if (match) {
            const method = match[1];
            summary.byMethod[method] = (summary.byMethod[method] || 0) + 1;
          }
        }

        if (line.includes('status_code=')) {
          const match = line.match(/status_code="([^"]+)"/);
          if (match) {
            const code = match[1];
            summary.byStatusCode[code] = (summary.byStatusCode[code] || 0) + 1;
          }
        }

        if (line.includes('span.name=')) {
          const match = line.match(/span\.name="([^"]+)"/);
          if (match) {
            const func = match[1];
            if (!summary.functions.includes(func)) {
              summary.functions.push(func);
            }
          }
        }

        summary.totalMetrics++;
      });

      return res.json(summary);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar resumo de métricas' });
    }
  }

  async searchMetrics(req: Request, res: Response): Promise<Response> {
    try {
      const { endpoint, method, statusCode, function: functionName } = req.query;
      const metrics = await fetchMetrics();
      
      const lines = metrics.split('\n');
      let filteredLines = lines.filter((line: string) => {
        if (!line || line.startsWith('#')) return false;
        return true;
      });

      if (endpoint) {
        const endpointStr = toString(endpoint);
        filteredLines = filteredLines.filter((line: string) => 
          line.includes(`http_route="${endpointStr}"`)
        );
      }

      if (method) {
        const methodStr = toString(method).toUpperCase();
        filteredLines = filteredLines.filter((line: string) => 
          line.includes(`http_method="${methodStr}"`)
        );
      }

      if (statusCode) {
        const statusCodeStr = toString(statusCode);
        filteredLines = filteredLines.filter((line: string) => 
          line.includes(`status_code="${statusCodeStr}"`)
        );
      }

      if (functionName) {
        const functionStr = toString(functionName);
        filteredLines = filteredLines.filter((line: string) => 
          line.includes(`span.name="${functionStr}"`)
        );
      }

      return res.json({
        filters: { endpoint, method, statusCode, function: functionName },
        metrics: filteredLines,
        total: filteredLines.length
      });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar métricas com filtros' });
    }
  }
}
