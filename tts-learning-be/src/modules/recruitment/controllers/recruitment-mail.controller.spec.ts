import { CanActivate, ExecutionContext, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { RecruitmentMailController } from './recruitment-mail.controller';
import { BatchMailService } from '../services/batch-mail.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';

class MockJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const roleHeader = req.headers['x-test-role'];

    req.user = {
      role: Array.isArray(roleHeader) ? roleHeader[0] : roleHeader ?? 'hr',
    };

    return true;
  }
}

describe('RecruitmentMailController', () => {
  let app: INestApplication;

  const batchMailService = {
    sendBatchEmail: jest.fn(),
    sendDirectBatchEmail: jest.fn(),
  };

  beforeAll(async () => {
    const moduleBuilder = Test.createTestingModule({
      controllers: [RecruitmentMailController],
      providers: [
        RolesGuard,
        {
          provide: BatchMailService,
          useValue: batchMailService,
        },
      ],
    }).overrideGuard(JwtAuthGuard)
      .useClass(MockJwtGuard);

    const moduleRef: TestingModule = await moduleBuilder.compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects malformed recipient emails for direct mail', async () => {
    await request(app.getHttpServer())
      .post('/recruitment/mail/send')
      .set('x-test-role', 'hr')
      .send({
        subject: 'Test subject',
        recipients: [
          {
            email: 'not-an-email',
            fullName: 'Mail Test',
            htmlBody: '<p>Hello</p>',
          },
        ],
      })
      .expect(400);

    expect(batchMailService.sendDirectBatchEmail).not.toHaveBeenCalled();
  });

  it('forbids non-recruitment roles from sending mail', async () => {
    await request(app.getHttpServer())
      .post('/recruitment/mail/send')
      .set('x-test-role', 'intern')
      .send({
        subject: 'Test subject',
        recipients: [
          {
            email: 'test@example.com',
            fullName: 'Mail Test',
            htmlBody: '<p>Hello</p>',
          },
        ],
      })
      .expect(403);
  });

  it('rejects undeclared recipient fields', async () => {
    await request(app.getHttpServer())
      .post('/recruitment/mail/send')
      .set('x-test-role', 'hr')
      .send({
        subject: 'Test subject',
        recipients: [
          {
            email: 'test@example.com',
            fullName: 'Mail Test',
            htmlBody: '<p>Hello</p>',
            injectedPlaceholder: 'unexpected',
          },
        ],
      })
      .expect(400);

    expect(batchMailService.sendDirectBatchEmail).not.toHaveBeenCalled();
  });

  it('accepts a valid HR direct mail request', async () => {
    batchMailService.sendDirectBatchEmail.mockResolvedValue({
      total: 1,
      success: 1,
      failed: 0,
      details: [{ email: 'test@example.com', status: 'sent' }],
    });

    await request(app.getHttpServer())
      .post('/recruitment/mail/send')
      .set('x-test-role', 'hr')
      .send({
        subject: 'Test subject',
        recipients: [
          {
            email: 'test@example.com',
            fullName: 'Mail Test',
            htmlBody: '<p>Hello</p>',
          },
        ],
      })
      .expect(200);

    expect(batchMailService.sendDirectBatchEmail).toHaveBeenCalledWith('Test subject', [
      {
        email: 'test@example.com',
        fullName: 'Mail Test',
        htmlBody: '<p>Hello</p>',
      },
    ]);
  });
});
