import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';
import { MailerService } from './mailer.service';

@Global()
@Module({
  imports: [
    ConfigModule,
    NestMailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('mailer.host');
        const port = configService.get<number>('mailer.port');
        const secure = configService.get<boolean>('mailer.secure') ?? false;
        const from = configService.get<string>('mailer.from');
        const user = configService.get<string>('mailer.user');
        const pass = configService.get<string>('mailer.pass');

        if (!host) {
          throw new Error('[MailerModule] Missing config for key: mailer.host');
        }

        if (!port) {
          throw new Error('[MailerModule] Missing config for key: mailer.port');
        }

        return {
          transport: {
            service: 'gmail',
            auth: {
              user,
              pass,
            },
          },
          pool: true,
          maxConnections: 2,
          maxMessages: 50,
          rateDelta: 1000,
          rateLimit: 2,
          defaults: {
            from,
          },
        };
      },
    }),
  ],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailProviderModule {}
