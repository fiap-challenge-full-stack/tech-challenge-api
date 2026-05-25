import { Request, Response, NextFunction } from 'express';

export interface ITestModeRequest extends Request {
  isTestMode?: boolean;
  testSessionId?: string;
}

// Armazenamento em memória para UUIDs criados em modo de teste
const testModeData = new Map<string, Set<string>>();

export function testModeMiddleware(req: ITestModeRequest, res: Response, next: NextFunction): void {
  const testModeHeader = req.headers['x-test-mode'];
  
  if (testModeHeader === 'true') {
    req.isTestMode = true;
    // Gerar um ID de sessão de teste único
    req.testSessionId = req.headers['x-test-session-id'] as string || generateTestSessionId();
    
    // Adicionar header de resposta para confirmar modo de teste
    res.setHeader('X-Test-Mode', 'true');
    res.setHeader('X-Test-Session-Id', req.testSessionId);
  }
  
  next();
}

function generateTestSessionId(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Função para registrar UUIDs criados em modo de teste
export function registerTestUuid(sessionId: string, uuid: string): void {
  if (!testModeData.has(sessionId)) {
    testModeData.set(sessionId, new Set());
  }
  testModeData.get(sessionId)!.add(uuid);
}

// Função para obter UUIDs de uma sessão de teste
export function getTestUuids(sessionId: string): string[] {
  return Array.from(testModeData.get(sessionId) || []);
}

// Função para limpar dados de uma sessão de teste
export function clearTestSession(sessionId: string): void {
  testModeData.delete(sessionId);
}

// Função para limpar todas as sessões de teste
export function clearAllTestSessions(): void {
  testModeData.clear();
}
