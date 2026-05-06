import { trace, context, Span, SpanStatusCode } from '@opentelemetry/api';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';

export function createSpan(name: string, fn: (span: Span) => Promise<unknown> | unknown): Promise<unknown> {
  const tracer = trace.getTracer('blog-backend');
  const span = tracer.startSpan(name);

  return context
    .with(trace.setSpan(context.active(), span), async () => {
      try {
        const result = await fn(span);
        span.setStatus({ code: SpanStatusCode.OK });
        return result;
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : String(error),
        });
        span.recordException(error instanceof Error ? error : new Error(String(error)));
        throw error;
      } finally {
        span.end();
      }
    });
}

export function setSpanAttributes(attributes: Record<string, string | number | boolean>): void {
  const activeSpan = trace.getActiveSpan();
  if (activeSpan) {
    Object.entries(attributes).forEach(([key, value]) => {
      activeSpan.setAttribute(key, value);
    });
  }
}

export function setHttpAttributes(method: string, url: string, statusCode: number): void {
  const activeSpan = trace.getActiveSpan();
  if (activeSpan) {
    activeSpan.setAttribute(SemanticAttributes.HTTP_METHOD, method);
    activeSpan.setAttribute(SemanticAttributes.HTTP_URL, url);
    activeSpan.setAttribute(SemanticAttributes.HTTP_STATUS_CODE, statusCode);
  }
}

export function setDbAttributes(system: string, operation: string, table?: string): void {
  const activeSpan = trace.getActiveSpan();
  if (activeSpan) {
    activeSpan.setAttribute(SemanticAttributes.DB_SYSTEM, system);
    activeSpan.setAttribute(SemanticAttributes.DB_OPERATION, operation);
    if (table) {
      activeSpan.setAttribute(SemanticAttributes.DB_NAME, table);
    }
  }
}
