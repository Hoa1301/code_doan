import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecruitmentPlanService } from './recruitment-plan.service';
import { RecruitmentPlan } from '../entities/recruitment-plan.entity';
import { Approval } from '../../system/entities/approval.entity';
import { JobPosition } from '../entities/job-position.entity';
import { RecruitmentPlanStatus } from '../../../common/constants/status.enum';

describe('RecruitmentPlanService', () => {
  let service: RecruitmentPlanService;
  let recruitmentPlanRepository: jest.Mocked<Pick<Repository<RecruitmentPlan>, 'find' | 'findOne' | 'save'>>;
  let approvalRepository: jest.Mocked<Pick<Repository<Approval>, 'findOne' | 'save'>>;
  let jobPositionRepository: jest.Mocked<
    Pick<Repository<JobPosition>, 'count' | 'create' | 'save' | 'createQueryBuilder'>
  >;

  beforeEach(async () => {
    recruitmentPlanRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(async (payload) => payload as RecruitmentPlan),
    };

    approvalRepository = {
      findOne: jest.fn(),
      save: jest.fn(async (payload) => payload as Approval),
    };

    jobPositionRepository = {
      count: jest.fn(),
      create: jest.fn((payload) => payload as JobPosition),
      save: jest.fn(async (payload) => payload as JobPosition[]),
      createQueryBuilder: jest.fn(),
    };

    jobPositionRepository.createQueryBuilder.mockReturnValue({
      withDeleted: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ maxCode: '0' }),
    } as never);

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        RecruitmentPlanService,
        {
          provide: getRepositoryToken(RecruitmentPlan),
          useValue: recruitmentPlanRepository,
        },
        {
          provide: getRepositoryToken(Approval),
          useValue: approvalRepository,
        },
        {
          provide: getRepositoryToken(JobPosition),
          useValue: jobPositionRepository,
        },
      ],
    }).compile();

    service = moduleRef.get(RecruitmentPlanService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('backfills missing job positions for active recruitment plans using the latest approved request data', async () => {
    recruitmentPlanRepository.find.mockResolvedValueOnce([
      {
        id: '0e077b17-fd77-4229-812e-961e88207179',
        name: 'Frontend batch',
        department: 'Engineering',
        description: 'Frontend interns',
        status: RecruitmentPlanStatus.PLAN_ACTIVE,
      },
    ] as RecruitmentPlan[]);

    jobPositionRepository.count.mockResolvedValueOnce(0);
    approvalRepository.findOne.mockResolvedValueOnce({
      id: 'approval-id',
      details: {
        positions: [
          {
            title: 'Frontend Intern',
            department: 'Engineering',
            count: 2,
            requirements: 'React',
          },
        ],
      },
    } as Approval);

    await service.backfillActivePlansMissingJobPositions();

    expect(jobPositionRepository.create).toHaveBeenCalledWith([
      expect.objectContaining({
        title: 'Frontend Intern',
        recruitmentPlanId: '0e077b17-fd77-4229-812e-961e88207179',
        requiredQuantity: 2,
      }),
    ]);
    expect(jobPositionRepository.save).toHaveBeenCalled();
  });

  it('preserves planned positions from the latest approval when resubmitting without explicit positions payload', async () => {
    const planId = '0e077b17-fd77-4229-812e-961e88207179';

    recruitmentPlanRepository.findOne.mockResolvedValueOnce({
      id: planId,
      name: 'Frontend batch',
      batch: 'Batch 01',
      department: 'Engineering',
      description: 'Frontend interns',
      startDate: new Date('2026-04-01'),
      endDate: new Date('2026-06-30'),
      status: RecruitmentPlanStatus.PLAN_DRAFT,
    } as RecruitmentPlan);

    approvalRepository.findOne.mockResolvedValueOnce({
      id: 'approval-id',
      type: 'Recruitment',
      entityId: planId,
      status: 'Pending',
      details: {
        totalPositions: 2,
        positions: [
          {
            title: 'Frontend Intern',
            department: 'Engineering',
            count: 2,
            requirements: 'React',
          },
        ],
      },
    } as Approval);

    await service.update(planId, {
      status: RecruitmentPlanStatus.PLAN_PENDING_APPROVAL,
    });

    expect(approvalRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        details: expect.objectContaining({
          totalPositions: 2,
          positions: [
            expect.objectContaining({
              title: 'Frontend Intern',
              department: 'Engineering',
              count: 2,
              requirements: 'React',
            }),
          ],
        }),
      }),
    );
  });
});
