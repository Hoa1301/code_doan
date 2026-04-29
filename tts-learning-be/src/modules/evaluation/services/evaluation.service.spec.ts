import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EvaluationService } from './evaluation.service';
import { Evaluation } from '../entities/evaluation.entity';

describe('EvaluationService', () => {
  let service: EvaluationService;
  let evaluationRepository: jest.Mocked<Pick<Repository<Evaluation>, 'create' | 'save' | 'findOne' | 'find'>>;
  const internId = '0e077b17-fd77-4229-812e-961e88207179';
  const mentorId = '11111111-1111-4111-8111-111111111111';

  beforeEach(async () => {
    evaluationRepository = {
      create: jest.fn((payload) => payload as Evaluation),
      save: jest.fn(async (payload) => payload as Evaluation),
      findOne: jest.fn(),
      find: jest.fn(),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        EvaluationService,
        {
          provide: getRepositoryToken(Evaluation),
          useValue: evaluationRepository,
        },
      ],
    }).compile();

    service = moduleRef.get(EvaluationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('keeps the provided overall score when creating a simplified evaluation', async () => {
    await service.create({
      internId,
      mentorId,
      type: 'Probation',
      overallScore: 8,
      strengths: 'Điểm mạnh',
      weaknesses: 'Điểm cần cải thiện',
      feedback: 'Ghi chú',
    });

    expect(evaluationRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        overallScore: 8,
      }),
    );
  });

  it('updates the existing phase evaluation instead of creating a duplicate draft', async () => {
    evaluationRepository.findOne.mockResolvedValueOnce({
      id: 'existing-evaluation-id',
      internId,
      mentorId,
      type: 'Probation',
      status: 'draft',
      strengths: 'Old strengths',
    } as Evaluation);

    await service.create({
      internId,
      mentorId,
      type: 'Probation',
      overallScore: 9,
      strengths: 'Updated strengths',
      weaknesses: 'Updated weaknesses',
      feedback: 'Updated feedback',
      status: 'draft',
    });

    expect(evaluationRepository.create).not.toHaveBeenCalled();
    expect(evaluationRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'existing-evaluation-id',
        internId,
        type: 'Probation',
        overallScore: 9,
        strengths: 'Updated strengths',
        weaknesses: 'Updated weaknesses',
        feedback: 'Updated feedback',
        status: 'draft',
      }),
    );
  });

  it('returns one active evaluation per phase and prioritizes draft over completed', async () => {
    evaluationRepository.find.mockResolvedValueOnce([
      {
        id: 'completed-probation',
        internId,
        type: 'Probation',
        status: 'completed',
        updatedAt: new Date('2026-03-19T10:00:00.000Z'),
      },
      {
        id: 'draft-probation',
        internId,
        type: 'Probation',
        status: 'draft',
        updatedAt: new Date('2026-03-20T10:00:00.000Z'),
      },
      {
        id: 'completed-final',
        internId,
        type: 'Final',
        status: 'completed',
        updatedAt: new Date('2026-03-18T10:00:00.000Z'),
      },
    ] as Evaluation[]);

    const result = await service.findByIntern(internId);

    expect(result).toHaveLength(2);
    expect(result.find((item) => item.type === 'Probation')?.id).toBe('draft-probation');
    expect(result.find((item) => item.type === 'Final')?.id).toBe('completed-final');
  });
});
