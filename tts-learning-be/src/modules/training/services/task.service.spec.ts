import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskService } from './task.service';
import { Task } from '../entities/task.entity';
import { TaskComment } from '../entities/task-comment.entity';

describe('TaskService', () => {
  let service: TaskService;
  let taskRepository: jest.Mocked<Pick<Repository<Task>, 'count' | 'create' | 'save'>>;
  let commentRepository: jest.Mocked<Pick<Repository<TaskComment>, 'create' | 'save'>>;

  beforeEach(async () => {
    taskRepository = {
      count: jest.fn(),
      create: jest.fn((payload) => payload as Task),
      save: jest.fn(async (payload) => payload as Task),
    };

    commentRepository = {
      create: jest.fn((payload) => payload as TaskComment),
      save: jest.fn(async (payload) => payload as TaskComment),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getRepositoryToken(Task),
          useValue: taskRepository,
        },
        {
          provide: getRepositoryToken(TaskComment),
          useValue: commentRepository,
        },
      ],
    }).compile();

    service = moduleRef.get(TaskService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('keeps task attachments when creating a new task', async () => {
    taskRepository.count.mockResolvedValueOnce(0);

    await service.create({
      internId: '0e077b17-fd77-4229-812e-961e88207179',
      mentorId: '11111111-1111-4111-8111-111111111111',
      title: 'Task with attachments',
      dueDate: '2026-03-20',
      attachments: ['https://example.com/spec.pdf', 'https://example.com/drive-link'],
    });

    expect(taskRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        attachments: ['https://example.com/spec.pdf', 'https://example.com/drive-link'],
      }),
    );
  });

  it('keeps comment attachments when adding a task submission', async () => {
    await service.addComment(
      'task-id',
      'user-id',
      'https://github.com/example/repo/pull/1',
      ['https://example.com/submission.zip'],
    );

    expect(commentRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        taskId: 'task-id',
        userId: 'user-id',
        comment: 'https://github.com/example/repo/pull/1',
        attachments: ['https://example.com/submission.zip'],
      }),
    );
  });
});
