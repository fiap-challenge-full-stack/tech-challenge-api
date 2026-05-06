import Pyroscope from '@pyroscope/nodejs';

const serviceName = process.env.PYROSCOPE_SERVICE_NAME || 'blog-backend';
const serverAddress = process.env.PYROSCOPE_SERVER_ADDRESS || 'http://localhost:4040';

Pyroscope.init({
  serverAddress,
  appName: serviceName,
  tags: {
    env: process.env.NODE_ENV || 'development',
    version: process.env.OTEL_SERVICE_VERSION || '1.0.0',
  },
});

console.log('Pyroscope inicializado com sucesso');
console.log(`Profiling disponível em: ${serverAddress}`);
