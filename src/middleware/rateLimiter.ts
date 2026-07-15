import rateLimit from 'express-rate-limit'

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por window
  message: 'Muitas requisições deste IP, tente novamente mais tarde',
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test'
})

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // limite mais estrito para auth
  message: 'Muitas tentativas de login, tente novamente mais tarde',
  skip: () => process.env.NODE_ENV === 'test'
})

