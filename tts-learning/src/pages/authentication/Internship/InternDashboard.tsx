import {
    ArrowRightOutlined,
    CalendarOutlined,
    CheckCircleFilled,
    ClockCircleOutlined,
    DownloadOutlined,
    FileTextOutlined,
    FireOutlined,
    InfoCircleOutlined,
    LockOutlined,
    MessageOutlined,
    PlayCircleFilled,
    PlayCircleOutlined,
    QuestionCircleOutlined,
    RightOutlined,
    TrophyOutlined
} from '@ant-design/icons';
import {
    Avatar,
    Button,
    Card,
    Col,
    Empty,
    List,
    Progress,
    Row,
    Tag,
    Timeline,
    Typography,
    Skeleton,
    App,
    Space
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useMemo } from 'react';
import { RouteConfig } from '../../../constants';
import { Intern } from '../../../services/Internship/interns';
import { LearningPath } from '../../../services/Internship/learningPath';
import { StudentProgress } from '../../../services/Internship/studentProgress';
import { Task } from '../../../services/Internship/tasks';
import { http } from '../../../utils/http';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

type DashboardIntern = Intern & {
    mentorAvatar?: string;
    overallProgress?: number;
};

interface DashboardTask extends Task {
    dueDate: string;
}

type DashboardModule = {
    id: string;
    title: string;
    description: string;
    orderIndex: number;
    passingScore: number;
    isRequired: boolean;
    contents?: Array<{ contentUrl?: string; title?: string }>;
    quizzes?: Array<{ id: string; title?: string }>;
    sequence: number;
    status: 'Completed' | 'In Progress' | 'Locked';
    items: Array<Record<string, unknown>>;
    progress: number;
};

type LearningMaterialItem = {
    id: string;
    title: string;
    type: 'video' | 'document' | 'quiz' | 'other';
    contentUrl?: string;
};

export const InternDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { message: messageApi } = App.useApp();

    const [internData, setInternData] = useState<DashboardIntern | null>(null);
    const [tasksData, setTasksData] = useState<{ hits?: DashboardTask[]; data?: DashboardTask[] } | null>(null);
    const [learningPathData, setLearningPathData] = useState<LearningPath | null>(null);
    const [progressData, setProgressData] = useState<StudentProgress | null>(null);
    const [isLoadingIntern, setIsLoadingIntern] = useState(true);
    const [isLoadingTasks, setIsLoadingTasks] = useState(false);
    const [isLoadingLP, setIsLoadingLP] = useState(false);
    const [selectedLearningModuleId, setSelectedLearningModuleId] = useState<string>('');

    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoadingIntern(true);
            try {
                const res = (await http.get('/interns/me')) as DashboardIntern;
                setInternData(res);
                const internObj = res;

                if (internObj) {
                    setIsLoadingTasks(true);
                    setIsLoadingLP(true);

                    const [tasksRes, progressRes] = await Promise.all([
                        http.get(`/tasks`, {
                            params: { internId: internObj.id }
                        }),
                        http.get(`/interns/me/progress`)
                    ]);
                    const typedTasksRes = tasksRes as { hits?: DashboardTask[]; data?: DashboardTask[] };
                    const typedProgressRes = progressRes as StudentProgress;

                    let lpRes: LearningPath | null = null;
                    if (typedProgressRes?.learningPathId) {
                        lpRes = (await http.get(`/learning-paths/${typedProgressRes.learningPathId}`)) as LearningPath;
                    } else if (internObj.track) {
                        lpRes = (await http.get(`/learning-paths/track/${internObj.track}`)) as LearningPath;
                    }

                    setTasksData(typedTasksRes);
                    setLearningPathData(lpRes);
                    setProgressData(typedProgressRes);
                }
            } catch (error) {
                console.error(error);
                messageApi.error(t('common.error'));
            } finally {
                setIsLoadingIntern(false);
                setIsLoadingTasks(false);
                setIsLoadingLP(false);
            }
        };

        void fetchInitialData();
    }, [messageApi, t]);

    const intern = internData;

    const tasks = useMemo(() => tasksData?.hits || tasksData?.data || [], [tasksData]);
    const learningPath = learningPathData;
    const modules = useMemo(() => {
        if (!learningPath?.modules) return [];
        const completedSet = new Set(progressData?.modulesCompleted || []);
        const currentModuleId = progressData?.currentModuleId;
        const orderedModules = [...learningPath.modules].sort((firstModule, secondModule) => {
            if (firstModule.orderIndex !== secondModule.orderIndex) {
                return firstModule.orderIndex - secondModule.orderIndex;
            }

            return firstModule.createdAt.localeCompare(secondModule.createdAt);
        });
        const fallbackCurrentModule = orderedModules.find((module) => !completedSet.has(module.id));
        const activeModuleId = currentModuleId || fallbackCurrentModule?.id;

        return orderedModules.map((module, index) => {
            const status: DashboardModule['status'] = completedSet.has(module.id)
                ? 'Completed'
                : activeModuleId === module.id
                  ? 'In Progress'
                  : 'Locked';
            const contents = Array.isArray(module.contents)
                ? (module.contents as Array<{ contentUrl?: string; title?: string }>)
                : [];
            const quizzes = Array.isArray(module.quizzes)
                ? (module.quizzes as Array<{ id: string; title?: string }>)
                : [];

            return {
                id: module.id,
                title: module.title,
                description: module.description,
                orderIndex: module.orderIndex,
                passingScore: module.passingScore,
                isRequired: module.isRequired,
                contents,
                quizzes,
                sequence: index + 1,
                status,
                items: [...contents, ...quizzes],
                progress:
                    status === 'In Progress' ? progressData?.overallProgress || 0 : status === 'Completed' ? 100 : 0
            };
        }) as DashboardModule[];
    }, [learningPath, progressData]);

    const activeModule = useMemo(() => {
        const progressModuleId = progressData?.currentModuleId;

        if (progressModuleId) {
            const matchedModule = modules.find((module) => String(module.id) === String(progressModuleId));

            if (matchedModule) {
                return matchedModule;
            }
        }

        return modules.find((module) => module.status === 'In Progress') || modules[0] || null;
    }, [modules, progressData?.currentModuleId]);

    useEffect(() => {
        if (!modules.length) {
            setSelectedLearningModuleId('');
            return;
        }

        const selectedStillExists = modules.some((module) => module.id === selectedLearningModuleId);
        if (selectedStillExists) {
            return;
        }

        setSelectedLearningModuleId(activeModule?.id || modules[0].id);
    }, [activeModule?.id, modules, selectedLearningModuleId]);

    const selectedLearningModule = useMemo(
        () => modules.find((module) => module.id === selectedLearningModuleId) || null,
        [modules, selectedLearningModuleId]
    );

    const selectedLearningMaterials = useMemo<LearningMaterialItem[]>(() => {
        if (!selectedLearningModule) return [];

        const materialsFromContents = (selectedLearningModule.contents || []).map((content, index) => {
            const rawType = String((content as { type?: string })?.type || '').toLowerCase();
            const normalizedType: LearningMaterialItem['type'] =
                rawType === 'video' ? 'video' : rawType === 'document' || rawType === 'file' ? 'document' : 'other';

            return {
                id: String((content as { id?: string | number })?.id || `content-${index}`),
                title: String(content.title || `Bài giảng ${index + 1}`),
                type: normalizedType,
                contentUrl: content.contentUrl
            };
        });

        const materialsFromQuizzes = (selectedLearningModule.quizzes || []).map((quiz, index) => ({
            id: String(quiz.id || `quiz-${index}`),
            title: String(quiz.title || `Bài kiểm tra ${index + 1}`),
            type: 'quiz' as const
        }));

        return [...materialsFromContents, ...materialsFromQuizzes];
    }, [selectedLearningModule]);

    const currentDocument = useMemo<{ contentUrl?: string; title?: string } | null>(() => {
        const contents = Array.isArray(activeModule?.contents)
            ? (activeModule.contents as Array<{ contentUrl?: string; title?: string }>)
            : [];

        if (!contents.length) {
            return null;
        }

        return contents.find((content) => Boolean(content.contentUrl)) || null;
    }, [activeModule]);

    const activeProgramLabel = activeModule?.title || learningPath?.title || intern?.track || t('menu.dashboard');
    const activeProgramDescription =
        activeModule?.description ||
        learningPath?.description ||
        'Theo doi lo trinh hoc, tien do va bai kiem tra hien tai cua ban.';

    // Find the nearest upcoming deadline
    const upcomingTask = useMemo(() => {
        return tasks
            .filter((task) => task.status?.toLowerCase() !== 'completed' && dayjs(task.dueDate).isAfter(dayjs()))
            .sort((firstTask, secondTask) => dayjs(firstTask.dueDate).diff(dayjs(secondTask.dueDate)))[0];
    }, [tasks]);

    const handleNavigation = (contentUrl?: string) => {
        if (!contentUrl) {
            messageApi.info(t('common.info'));
            return;
        }

        window.open(contentUrl, '_blank', 'noopener,noreferrer');
    };

    const handleDownload = () => {
        if (currentDocument?.contentUrl) {
            window.open(currentDocument.contentUrl, '_blank', 'noopener,noreferrer');
            return;
        }

        messageApi.info(t('intern_dashboard.download_msg', { file: currentDocument?.title || activeProgramLabel }));
    };

    const handleOpenQuiz = (moduleId?: string, quizId?: string) => {
        if (!moduleId || !quizId) {
            messageApi.info('Hoc phan hien tai chua co bai kiem tra.');
            return;
        }

        navigate(RouteConfig.InternTest.getPath(String(quizId), String(moduleId)));
    };

    const handleOpenMaterial = (material: LearningMaterialItem) => {
        if (material.type === 'quiz') {
            handleOpenQuiz(selectedLearningModule?.id, material.id);
            return;
        }

        if (material.contentUrl) {
            window.open(material.contentUrl, '_blank', 'noopener,noreferrer');
            return;
        }

        messageApi.info('Nội dung này chưa có URL để mở.');
    };

    if (isLoadingIntern || isLoadingTasks || isLoadingLP) {
        return (
            <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
                <Skeleton active paragraph={{ rows: 10 }} />
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    marginBottom: '40px',
                    flexWrap: 'wrap',
                    gap: '24px'
                }}
            >
                <div>
                    <Title level={1} style={{ margin: '0 0 8px 0' }}>
                        {learningPath?.title || intern?.track || '-'}
                    </Title>
                </div>
            </div>

            <Row gutter={[48, 48]}>
                <Col xs={24} lg={24}>
                    <Card
                        variant='borderless'
                        style={{ borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '24px' }}
                        title='Bài giảng theo học phần'
                    >
                        {!modules.length ? (
                            <Empty description='Chưa có học phần để hiển thị bài giảng.' />
                        ) : (
                            <Row gutter={[16, 16]}>
                                <Col xs={24} md={10}>
                                    <List
                                        dataSource={modules}
                                        renderItem={(module) => (
                                            <List.Item
                                                style={{
                                                    cursor: 'pointer',
                                                    border:
                                                        module.id === selectedLearningModuleId
                                                            ? '1px solid #1E40AF'
                                                            : '1px solid #E2E8F0',
                                                    borderRadius: '8px',
                                                    marginBottom: '8px',
                                                    padding: '12px',
                                                    background:
                                                        module.id === selectedLearningModuleId ? '#f0f7ff' : '#fff'
                                                }}
                                                onClick={() => setSelectedLearningModuleId(module.id)}
                                            >
                                                <div style={{ width: '100%' }}>
                                                    <Text strong>{`Module ${module.sequence}: ${module.title}`}</Text>
                                                    <div style={{ marginTop: '6px' }}>
                                                        <Tag
                                                            color={
                                                                module.status === 'Completed'
                                                                    ? 'success'
                                                                    : module.status === 'In Progress'
                                                                      ? 'processing'
                                                                      : 'default'
                                                            }
                                                        >
                                                            {module.status}
                                                        </Tag>
                                                    </div>
                                                </div>
                                            </List.Item>
                                        )}
                                    />
                                </Col>
                                <Col xs={24} md={14}>
                                    {!selectedLearningModule ? (
                                        <Empty description='Chọn học phần để xem bài giảng và video.' />
                                    ) : (
                                        <List
                                            header={<Text strong>{`Nội dung: ${selectedLearningModule.title}`}</Text>}
                                            dataSource={selectedLearningMaterials}
                                            locale={{ emptyText: 'Học phần này chưa có bài giảng/video.' }}
                                            renderItem={(item) => (
                                                <List.Item
                                                    actions={[
                                                        <Button type='link' onClick={() => handleOpenMaterial(item)}>
                                                            {item.type === 'quiz' ? 'Làm bài kiểm tra' : 'Mở nội dung'}
                                                        </Button>
                                                    ]}
                                                >
                                                    <Space>
                                                        {item.type === 'video' ? (
                                                            <PlayCircleOutlined style={{ color: '#ef4444' }} />
                                                        ) : item.type === 'quiz' ? (
                                                            <QuestionCircleOutlined style={{ color: '#722ed1' }} />
                                                        ) : (
                                                            <FileTextOutlined style={{ color: '#fa8c16' }} />
                                                        )}
                                                        <div>
                                                            <Text strong>{item.title}</Text>
                                                            <div>
                                                                <Text type='secondary' style={{ fontSize: '12px' }}>
                                                                    {item.type === 'video'
                                                                        ? 'Video'
                                                                        : item.type === 'quiz'
                                                                          ? 'Quiz'
                                                                          : 'Tài liệu'}
                                                                </Text>
                                                            </div>
                                                        </div>
                                                    </Space>
                                                </List.Item>
                                            )}
                                        />
                                    )}
                                </Col>
                            </Row>
                        )}
                    </Card>

                    {!modules.length && (
                        <Card variant='borderless' style={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                            <Empty
                                description={
                                    learningPath
                                        ? 'Lộ trình đã được gán nhưng chưa có học phần. Vui lòng liên hệ mentor/admin.'
                                        : 'Bạn chưa được gán lộ trình đào tạo. Vui lòng liên hệ mentor/admin.'
                                }
                            />
                        </Card>
                    )}
                    {Boolean(modules.length) && (
                        <Timeline
                            items={[
                                ...modules.map((module) => ({
                                    color:
                                        module.status === 'Completed'
                                            ? 'green'
                                            : module.status === 'In Progress'
                                              ? 'blue'
                                              : 'gray',
                                    dot: (
                                        <div
                                            style={{
                                                width: 40,
                                                height: 40,
                                                background:
                                                    module.status === 'Completed'
                                                        ? '#10B981'
                                                        : module.status === 'In Progress'
                                                          ? '#1E40AF'
                                                          : '#E2E8F0',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: module.status === 'Locked' ? '#bfbfbf' : '#fff',
                                                boxShadow:
                                                    module.status === 'In Progress' ? '0 0 0 4px #e6f7ff' : 'none',
                                                border: module.status === 'Locked' ? '2px solid #E2E8F0' : 'none'
                                            }}
                                        >
                                            {module.status === 'Completed' ? (
                                                <CheckCircleFilled style={{ fontSize: '24px' }} />
                                            ) : module.status === 'In Progress' ? (
                                                <PlayCircleFilled style={{ fontSize: '24px' }} />
                                            ) : (
                                                <LockOutlined style={{ fontSize: '20px' }} />
                                            )}
                                        </div>
                                    ),
                                    children: (
                                        <Card
                                            variant='borderless'
                                            style={{
                                                borderRadius: '12px',
                                                border:
                                                    module.status === 'In Progress'
                                                        ? '1px solid rgba(19, 109, 236, 0.3)'
                                                        : '1px solid #E2E8F0',
                                                opacity:
                                                    module.status === 'Locked'
                                                        ? 0.5
                                                        : module.status === 'Completed'
                                                          ? 0.8
                                                          : 1,
                                                boxShadow:
                                                    module.status === 'In Progress'
                                                        ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                                        : 'none',
                                                overflow: 'hidden'
                                            }}
                                            bodyStyle={module.status === 'In Progress' ? { padding: 0 } : undefined}
                                        >
                                            {module.status === 'In Progress' && (
                                                <div style={{ height: '4px', background: '#E2E8F0', width: '100%' }}>
                                                    <div
                                                        style={{
                                                            height: '100%',
                                                            background: '#1E40AF',
                                                            width: `${module.progress}%`
                                                        }}
                                                    ></div>
                                                </div>
                                            )}
                                            <div style={module.status === 'In Progress' ? { padding: '24px' } : {}}>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'start',
                                                        marginBottom: module.status === 'In Progress' ? '24px' : '8px'
                                                    }}
                                                >
                                                    <div>
                                                        <Tag
                                                            color={
                                                                module.status === 'Completed'
                                                                    ? 'success'
                                                                    : module.status === 'In Progress'
                                                                      ? 'blue'
                                                                      : 'default'
                                                            }
                                                            style={{
                                                                border: 0,
                                                                background:
                                                                    module.status === 'Completed'
                                                                        ? '#f6ffed'
                                                                        : module.status === 'In Progress'
                                                                          ? '#e6f7ff'
                                                                          : '#f5f5f5',
                                                                color:
                                                                    module.status === 'Completed'
                                                                        ? '#10B981'
                                                                        : module.status === 'In Progress'
                                                                          ? '#1E40AF'
                                                                          : '#8c8c8c',
                                                                fontWeight: 700,
                                                                textTransform: 'uppercase',
                                                                marginBottom: '8px'
                                                            }}
                                                        >
                                                            {module.status === 'Completed'
                                                                ? t('common.completed')
                                                                : module.status === 'In Progress'
                                                                  ? t('task_mgmt.in_progress')
                                                                  : t('common.locked')}
                                                        </Tag>
                                                        <Title
                                                            level={module.status === 'In Progress' ? 3 : 4}
                                                            style={{ margin: '0 0 8px 0' }}
                                                        >
                                                            Module {module.sequence}: {module.title}
                                                        </Title>
                                                        <Text type='secondary'>{module.description}</Text>
                                                    </div>
                                                    {module.status === 'In Progress' && (
                                                        <Button
                                                            type='primary'
                                                            icon={<ArrowRightOutlined />}
                                                            style={{ background: '#1E40AF' }}
                                                            onClick={() => navigate(RouteConfig.InternTaskBoard.path)}
                                                        >
                                                            {t('intern_dashboard.go_to_tasks')}
                                                        </Button>
                                                    )}
                                                </div>

                                                {module.status === 'In Progress' && (
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: '12px'
                                                        }}
                                                    >
                                                        {tasks.slice(0, 3).map((task) => (
                                                            <div
                                                                key={task.id}
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '16px',
                                                                    padding: '12px',
                                                                    borderRadius: '8px',
                                                                    border: '1px solid #E2E8F0',
                                                                    background:
                                                                        task.status?.toLowerCase() === 'in_progress'
                                                                            ? '#e6f7ff'
                                                                            : '#fff',
                                                                    cursor: 'pointer'
                                                                }}
                                                                onClick={() =>
                                                                    navigate(RouteConfig.InternTaskBoard.path)
                                                                }
                                                            >
                                                                <div
                                                                    style={{
                                                                        width: 40,
                                                                        height: 40,
                                                                        background:
                                                                            task.status?.toLowerCase() === 'completed'
                                                                                ? '#f6ffed'
                                                                                : '#f5f5f5',
                                                                        borderRadius: '8px',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        color:
                                                                            task.status?.toLowerCase() === 'completed'
                                                                                ? '#10B981'
                                                                                : '#bfbfbf'
                                                                    }}
                                                                >
                                                                    {task.status?.toLowerCase() === 'completed' ? (
                                                                        <CheckCircleFilled />
                                                                    ) : (
                                                                        <FileTextOutlined />
                                                                    )}
                                                                </div>
                                                                <div style={{ flex: 1 }}>
                                                                    <div
                                                                        style={{
                                                                            display: 'flex',
                                                                            justifyContent: 'space-between'
                                                                        }}
                                                                    >
                                                                        <Text
                                                                            strong
                                                                            style={{
                                                                                color:
                                                                                    task.status?.toLowerCase() ===
                                                                                    'in_progress'
                                                                                        ? '#1E40AF'
                                                                                        : 'inherit'
                                                                            }}
                                                                        >
                                                                            {task.title}
                                                                        </Text>
                                                                        <Tag
                                                                            color={
                                                                                task.status?.toLowerCase() ===
                                                                                'completed'
                                                                                    ? 'success'
                                                                                    : task.status?.toLowerCase() ===
                                                                                        'in_progress'
                                                                                      ? 'blue'
                                                                                      : 'default'
                                                                            }
                                                                        >
                                                                            {t(
                                                                                `task_mgmt.${task.status
                                                                                    ?.toLowerCase()
                                                                                    .replace(' ', '_')}`
                                                                            )}
                                                                        </Tag>
                                                                    </div>
                                                                    <div
                                                                        style={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: '12px',
                                                                            fontSize: '12px',
                                                                            color: '#8c8c8c'
                                                                        }}
                                                                    >
                                                                        <span>
                                                                            <CalendarOutlined />{' '}
                                                                            {t('intern_dashboard.due')}{' '}
                                                                            {dayjs(task.dueDate).format('MMM DD, YYYY')}
                                                                        </span>
                                                                        <span>•</span>
                                                                        <span>
                                                                            {t(
                                                                                `task_mgmt.${task.priority.toLowerCase()}`
                                                                            )}{' '}
                                                                            {t('task_mgmt.priority')}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {module.status === 'Completed' && (
                                                    <Button
                                                        type='link'
                                                        style={{ padding: 0 }}
                                                        onClick={() =>
                                                            handleNavigation(module.contents?.[0]?.contentUrl)
                                                        }
                                                    >
                                                        {t('intern_dashboard.review_materials')}
                                                    </Button>
                                                )}

                                                {(module.status === 'Completed' || module.status === 'In Progress') && (
                                                    <div
                                                        style={{
                                                            marginTop: '24px',
                                                            paddingTop: '16px',
                                                            borderTop: '1px solid #E2E8F0'
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                flexWrap: 'wrap',
                                                                gap: '16px'
                                                            }}
                                                        >
                                                            <div>
                                                                <Text strong style={{ display: 'block' }}>
                                                                    <FireOutlined
                                                                        style={{ color: '#F59E0B', marginRight: '8px' }}
                                                                    />
                                                                    Bài tập & Kiểm tra
                                                                </Text>
                                                                <Text type='secondary' style={{ fontSize: '13px' }}>
                                                                    Hoàn thành bài tập/quiz để kết thúc bài học
                                                                </Text>
                                                            </div>
                                                            <Space>
                                                                <Button
                                                                    icon={
                                                                        <DownloadOutlined
                                                                            style={{ transform: 'rotate(180deg)' }}
                                                                        />
                                                                    }
                                                                    onClick={() =>
                                                                        messageApi.success('Nộp bài tập thành công!')
                                                                    }
                                                                >
                                                                    Nộp bài tập
                                                                </Button>
                                                                <Button
                                                                    type='primary'
                                                                    onClick={() =>
                                                                        handleOpenQuiz(
                                                                            module.id,
                                                                            module.quizzes?.[0]?.id
                                                                        )
                                                                    }
                                                                    disabled={!module.quizzes?.length}
                                                                >
                                                                    Làm bài kiểm tra
                                                                </Button>
                                                            </Space>
                                                        </div>
                                                    </div>
                                                )}

                                                {module.status === 'Locked' && (
                                                    <Text type='secondary' style={{ fontSize: '12px' }}>
                                                        <InfoCircleOutlined /> {t('intern_dashboard.unlock_info')}
                                                    </Text>
                                                )}
                                            </div>
                                        </Card>
                                    )
                                })),
                                {
                                    color: 'gray',
                                    dot: (
                                        <div
                                            style={{
                                                width: 40,
                                                height: 40,
                                                background: '#E2E8F0',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#bfbfbf',
                                                border: '2px solid #E2E8F0'
                                            }}
                                        >
                                            <TrophyOutlined style={{ fontSize: '20px' }} />
                                        </div>
                                    ),
                                    children: (
                                        <Card
                                            variant='borderless'
                                            style={{ borderRadius: '12px', border: '1px dashed #E2E8F0', opacity: 0.5 }}
                                        >
                                            <Title level={4} style={{ margin: '0 0 4px 0' }}>
                                                {t('intern_dashboard.capstone_title')}
                                            </Title>
                                            <Text type='secondary'>{t('intern_dashboard.capstone_desc')}</Text>
                                        </Card>
                                    )
                                }
                            ]}
                        />
                    )}
                </Col>
            </Row>
        </div>
    );
};
