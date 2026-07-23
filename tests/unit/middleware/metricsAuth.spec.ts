import { Request, Response } from 'express';
import { metricsAuth } from '@/middleware/metricsAuth';

function buildRequest(overrides: Partial<Request> = {}): Request {
  return {
    ip: '203.0.113.10',
    socket: { remoteAddress: '203.0.113.10' },
    headers: {},
    ...overrides,
  } as unknown as Request;
}

function buildResponse(): Response {
  const res: Partial<Response> = {};
  res.setHeader = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
}

function basicAuthHeader(user: string, pass: string): string {
  return `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`;
}

describe('metricsAuth', () => {
  const originalUser = process.env.METRICS_USER;
  const originalPass = process.env.METRICS_PASS;

  afterEach(() => {
    process.env.METRICS_USER = originalUser;
    process.env.METRICS_PASS = originalPass;
  });

  it('nega acesso quando METRICS_USER e METRICS_PASS não estão configuradas, mesmo com credenciais admin/admin', () => {
    delete process.env.METRICS_USER;
    delete process.env.METRICS_PASS;

    const req = buildRequest({ headers: { authorization: basicAuthHeader('admin', 'admin') } });
    const res = buildResponse();
    const next = jest.fn();

    metricsAuth(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('nega acesso quando apenas METRICS_USER está configurada', () => {
    process.env.METRICS_USER = 'metrics-user';
    delete process.env.METRICS_PASS;

    const req = buildRequest({ headers: { authorization: basicAuthHeader('metrics-user', 'algo') } });
    const res = buildResponse();
    const next = jest.fn();

    metricsAuth(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('permite acesso quando as credenciais configuradas via env conferem', () => {
    process.env.METRICS_USER = 'metrics-user';
    process.env.METRICS_PASS = 'metrics-pass';

    const req = buildRequest({ headers: { authorization: basicAuthHeader('metrics-user', 'metrics-pass') } });
    const res = buildResponse();
    const next = jest.fn();

    metricsAuth(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('nega acesso quando as credenciais configuradas via env não conferem', () => {
    process.env.METRICS_USER = 'metrics-user';
    process.env.METRICS_PASS = 'metrics-pass';

    const req = buildRequest({ headers: { authorization: basicAuthHeader('metrics-user', 'errado') } });
    const res = buildResponse();
    const next = jest.fn();

    metricsAuth(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
