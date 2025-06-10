export const config = {
  authRedirectUrl: process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:5173',
  isDevelopment: process.env.NODE_ENV === 'development'
} 