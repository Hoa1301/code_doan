import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CandidateService } from './candidate.service';
import { Candidate } from '../entities/candidate.entity';
import { JobPosition } from '../entities/job-position.entity';
import { UsersService } from '../../auth/users.service';
import { InternService } from '../../training/services/intern.service';
import { MailerService } from '../../../providers/mailer/mailer.service';
import { CandidateStatus } from '../../../common/constants/status.enum';
import { ConflictException } from '@nestjs/common';

describe('CandidateService', () => {
  let service: CandidateService;
  let candidateRepository: jest.Mocked<Pick<Repository<Candidate>, 'findOne' | 'save'>>;
  let usersService: { findByEmail: jest.Mock; create: jest.Mock };
  let internService: { create: jest.Mock; findByCandidateId: jest.Mock };
  let mailerService: { sendMail: jest.Mock };

  beforeEach(async () => {
    candidateRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    usersService = {
      findByEmail: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'user-1' }),
    };

    internService = {
      create: jest.fn().mockResolvedValue({ id: 'intern-1' }),
      findByCandidateId: jest.fn().mockResolvedValue(null),
    };

    mailerService = {
      sendMail: jest.fn().mockResolvedValue(undefined),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        CandidateService,
        {
          provide: getRepositoryToken(Candidate),
          useValue: candidateRepository,
        },
        {
          provide: getRepositoryToken(JobPosition),
          useValue: {},
        },
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: InternService,
          useValue: internService,
        },
        {
          provide: MailerService,
          useValue: mailerService,
        },
        {
          provide: DataSource,
          useValue: {},
        },
      ],
    }).compile();

    service = moduleRef.get(CandidateService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('allows converting a candidate to intern without learningPathId', async () => {
    candidateRepository.findOne.mockResolvedValue({
      id: 'candidate-1',
      fullName: 'Nguyen Van A',
      email: 'candidate@example.com',
      phone: '0123456789',
      avatarUrl: null,
      status: CandidateStatus.OFFER,
      job: {
        title: 'Frontend Intern',
        department: 'Engineering',
      },
    } as Candidate);
    candidateRepository.save.mockImplementation(async (candidate) => candidate as Candidate);

    await service.convertToIntern('candidate-1', 'mentor-1');

    expect(internService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        candidateId: 'candidate-1',
        mentorId: 'mentor-1',
      }),
    );

    expect(internService.create).not.toHaveBeenCalledWith(
      expect.objectContaining({
        learningPathId: expect.anything(),
      }),
    );
  });

  it('throws conflict when candidate already has an intern record', async () => {
    candidateRepository.findOne.mockResolvedValue({
      id: 'candidate-1',
      fullName: 'Nguyen Van A',
      email: 'candidate@example.com',
      phone: '0123456789',
      avatarUrl: null,
      status: CandidateStatus.OFFER,
      job: {
        title: 'Frontend Intern',
        department: 'Engineering',
      },
    } as Candidate);
    internService.findByCandidateId.mockResolvedValue({ id: 'intern-1', candidateId: 'candidate-1' });

    await expect(service.convertToIntern('candidate-1', 'mentor-1')).rejects.toBeInstanceOf(ConflictException);

    expect(usersService.create).not.toHaveBeenCalled();
    expect(internService.create).not.toHaveBeenCalled();
    expect(candidateRepository.save).not.toHaveBeenCalled();
  });
});
