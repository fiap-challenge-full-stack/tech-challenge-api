import { Router } from 'express';
import { TestCleanupService } from './testCleanupService';
import { TestModeRequest } from './testModeMiddleware';

const router = Router();
const cleanupService = new TestCleanupService();

// Endpoint para limpar dados de uma sessão de teste específica
router.delete('/cleanup/:sessionId', async (req: TestModeRequest, res) => {
  try {
    const { sessionId } = req.params;
    const sessionIdStr = typeof sessionId === 'string' ? sessionId : sessionId[0];
    const result = await cleanupService.cleanupTestSession(sessionIdStr);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao limpar dados de teste' });
  }
});

// Endpoint para limpar dados da sessão atual (baseado no header)
router.delete('/cleanup', async (req: TestModeRequest, res) => {
  try {
    if (!req.testSessionId) {
      return res.status(400).json({ message: 'Sessão de teste não encontrada' });
    }
    const sessionId = typeof req.testSessionId === 'string' ? req.testSessionId : req.testSessionId[0];
    const result = await cleanupService.cleanupTestSession(sessionId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao limpar dados de teste' });
  }
});

export { router as testCleanupRouter };
