import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InternService } from './intern.service';
import { Intern } from '../entities/intern.entity';
import { InternProgress } from '../entities/intern-progress.entity';
import { LearningPath } from '../entities/learning-path.entity';
import { Module as TrainingModule } from '../entities/module.entity';
import { InternStatus } from '../../../common/constants/status.enum';

describe('InternService', () => {
  let service: InternService;
  let internRepository: jest.Mocked<Pick<Repository<Intern>, 'count' | 'create' | 'save' | 'findOne'>>;
  let progressRepository: jest.Mocked<Pick<Repository<InternProgress>, 'findOne' | 'create' | 'save'>>;
  let learningPathRepository: jest.Mocked<Pick<Repository<LearningPath>, 'findOne'>>;
  let moduleRepository: jest.Mocked<Pick<Repository<TrainingModule>, 'findOne'>>;

  beforeEach(async () => {
    internRepository = {
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn().mockImplementation((data) => data as Intern),
      save: jest.fn().mockImplementation(async (data) => ({ id: 'intern-1', ...data }) as Intern),
      findOne: jest.fn(),
    };

    progressRepository = {
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((data) => data as InternProgress),
      save: jest.fn().mockImplementation(async (data) => data as InternProgress),
    };

    learningPathRepository = {
      findOne: jest.fn(),
    };

    moduleRepository = {
      findOne: jest.fn(),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        InternService,
        {
          provide: getRepositoryToken(Intern),
          useValue: internRepository,
        },
        {
          provide: getRepositoryToken(InternProgress),
          useValue: progressRepository,
        },
        {
          provide: getRepositoryToken(LearningPath),
          useValue: learningPathRepository,
        },
        {
          provide: getRepositoryToken(TrainingModule),
          useValue: moduleRepository,
        },
      ],
    }).compile();

    service = moduleRef.get(InternService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates an intern without learningPathId and leaves track unset', async () => {
    const result = await service.create({
      userId: 'user-1',
      candidateId: 'candidate-1',
      mentorId: 'mentor-1',
      department: 'Engineering',
      startDate: '2026-03-21',
      endDate: '2026-06-21',
    });

    expect(result).toEqual(
      expect.objectContaining({
        id: 'intern-1',
        track: null,
      }),
    );

    expect(internRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'ITS-001',
        track: null,
      }),
    );
    expect(learningPathRepository.findOne).not.toHaveBeenCalled();
    expect(progressRepository.save).not.toHaveBeenCalled();
  });

  it('blocks mentor from updating another mentors intern', async () => {
    internRepository.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 'intern-2',
        mentorId: 'mentor-2',
      } as Intern);

    await expect(
      service.updateMentorManagedFields('intern-2', 'mentor-1', {
        status: InternStatus.ACTIVE,
      }),
    ).rejects.toThrow('You do not have permission to manage this intern');
  });

  it('rejects invalid internship period when mentor updates dates', async () => {
    internRepository.findOne.mockResolvedValueOnce({
      id: 'intern-1',
      mentorId: 'mentor-1',
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-06-01'),
    } as Intern);

    await expect(
      service.updateMentorManagedFields('intern-1', 'mentor-1', {
        startDate: '2026-07-01',
        endDate: '2026-06-01',
      }),
    ).rejects.toThrow('Internship start date must be before or equal to end date');
  });

  it('allows mentor to update only scoped fields for owned intern', async () => {
    internRepository.findOne.mockResolvedValueOnce({
      id: 'intern-1',
      mentorId: 'mentor-1',
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-06-01'),
    } as Intern);

    const updateSpy = jest.spyOn(service, 'update').mockResolvedValue({
      id: 'intern-1',
      mentorId: 'mentor-1',
      status: InternStatus.COMPLETED,
    } as Intern);

    const result = await service.updateMentorManagedFields('intern-1', 'mentor-1', {
      status: InternStatus.COMPLETED,
      learningPathId: 'lp-1',
      endDate: '2026-06-30',
    });

    expect(updateSpy).toHaveBeenCalledWith('intern-1', {
      status: InternStatus.COMPLETED,
      learningPathId: 'lp-1',
      endDate: '2026-06-30',
    });
    expect(result).toEqual(
      expect.objectContaining({
        id: 'intern-1',
        status: InternStatus.COMPLETED,
      }),
    );
  });
});
