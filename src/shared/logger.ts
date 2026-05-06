export function logError(error: Error, context: string): void {
  console.error(`[${context}]`, {
    message: error.message,
    name: error.name,
    stack: error.stack
  });
}

export function logInfo(message: string, context: string): void {
  console.log(`[${context}]`, message);
}

export function logWarn(message: string, context: string): void {
  console.warn(`[${context}]`, message);
}
