export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),

  mongo: {
    uri: process.env.MONGO_URI,
  },

  // Config cho Postgres (dạng object)
  postgres: {
    config: {
      // <--- Gom vào 1 object để dễ lấy theo key
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT as string, 10) || 5433,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
    },
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRESIN || '7d',
    signOptions: {
      expiresIn: process.env.JWT_EXPIRESIN,
    },
  },

  mailer: {
    host: process.env.MAILER_HOST,
    port: parseInt(process.env.MAILER_PORT as string, 10) || 587,
    secure: process.env.MAILER_SECURE === 'true',
    from: process.env.MAILER_FROM,
    user: process.env.MAILER_USER,
    pass: process.env.MAILER_PASS,
  },

  minio: {
    endpoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT as string, 10) || 9000,
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
    bucket: process.env.MINIO_BUCKET || 'tts-learning',
  },
});
