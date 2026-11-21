export const AppEnvConfig = () => ({
  app: {
    env: process.env.ENV || 'development',
    port: parseInt(process.env.PORT!, 10) || 3000,
    jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key',
  },
  database: {
    uri: process.env.DB_URI || 'mongodb://localhost:27017/myapp',
  },
  mail: {
    host: process.env.MAIL_HOST || 'smtp.example.com',
    port: parseInt(process.env.MAIL_PORT!, 10) || 587,
    user: process.env.MAIL_USER || 'user@example.com',
    pass: process.env.MAIL_PASS || '',
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
});
