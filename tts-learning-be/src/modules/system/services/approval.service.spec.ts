import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApprovalService } from './approval.service';
import { Approval } from '../entities/approval.entity';
import { RecruitmentPlan } from '../../recruitment/entities/recruitment-plan.entity';
import { Candidate } from '../../recruitment/entities/candidate.entity';
import { JobPosition } from '../../recruitment/entities/job-position.entity';
import { RecruitmentPlanStatus } from '../../../common/constants/status.enum';

describe('ApprovalService', () => {
  let service: ApprovalService;
  let approvalRepository: jest.Mocked<Pick<Repository<Approval>, 'findOne' | 'save'>>;
  let planRepository: jest.Mocked<Pick<Repository<RecruitmentPlan>, 'findOne' | 'update'>>;
  let candidateRepository: jest.Mocked<Pick<Repository<Candidate>, 'update'>>;
  let jobPositionRepository: jest.Mocked<
    Pick<Repository<JobPosition>, 'count' | 'create' | 'save' | 'createQueryBuilder'>
  >;

  beforeEach(async () => {
    approvalRepository = {
      findOne: jest.fn(),
      save: jest.fn(async (payload) => payload as Approval),
    };

    planRepository = {
      findOne: jest.fn(),
      update: jest.fn(async () => ({ affected: 1, generatedMaps: [], raw: [] })),
    };

    candidateRepository = {
      update: jest.fn(async () => ({ affected: 1, generatedMaps: [], raw: [] })),
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
        ApprovalService,
        {
          provide: getRepositoryToken(Approval),
          useValue: approvalRepository,
        },
        {
          provide: getRepositoryToken(RecruitmentPlan),
          useValue: planRepository,
        },
        {
          provide: getRepositoryToken(Candidate),
          useValue: candidateRepository,
        },
        {
          provide: getRepositoryToken(JobPosition),
          useValue: jobPositionRepository,
        },
      ],
    }).compile();

    service = moduleRef.get(ApprovalService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates job positions when an approved recruitment request stores planned roles under jobPositions', async () => {
    approvalRepository.findOne
      .mockResolvedValueOnce({
        id: 'approval-id',
        type: 'Recruitment',
        entityId: '0e077b17-fd77-4229-812e-961e88207179',
        status: 'Pending',
        details: {
          jobPositions: [
            {
              title: 'Frontend Intern',
              department: 'Engineering',
              count: 2,
              requirements: 'React',
            },
          ],
        },
      } as Approval)
      .mockResolvedValueOnce({
        id: 'approval-id',
        type: 'Recruitment',
        entityId: '0e077b17-fd77-4229-812e-961e88207179',
        status: 'Pending',
        details: {
          jobPositions: [
            {
              title: 'Frontend Intern',
              department: 'Engineering',
              count: 2,
              requirements: 'React',
            },
          ],
        },
      } as Approval);

    planRepository.findOne.mockResolvedValueOnce({
      id: '0e077b17-fd77-4229-812e-961e88207179',
      department: 'Engineering',
      description: 'Hiring interns',
      status: RecruitmentPlanStatus.PLAN_ACTIVE,
    } as RecruitmentPlan);

    jobPositionRepository.count.mockResolvedValueOnce(0);

    await service.update('approval-id', {
      status: 'Approved',
      approverId: '11111111-1111-4111-8111-111111111111',
    });

    expect(jobPositionRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Frontend Intern',
        recruitmentPlanId: '0e077b17-fd77-4229-812e-961e88207179',
        requiredQuantity: 2,
      }),
    );
    expect(jobPositionRepository.save).toHaveBeenCalled();
  });
});
