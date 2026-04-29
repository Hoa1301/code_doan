import {
    BookOutlined,
    CheckCircleFilled,
    ClockCircleOutlined,
    FileTextOutlined,
    PlayCircleOutlined,
    QuestionCircleOutlined
} from '@ant-design/icons';
import { Button, Card, Col, Empty, List, Row, Skeleton, Space, Tag, Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RouteConfig } from '../../../constants';
import { useLearningPath } from '../../../hooks/Internship/useLearningPath';
import { useMeIntern } from '../../../hooks/Internship/useInterns';
import { useMyProgress } from '../../../hooks/Internship/useStudentProgress';
import { LearningPath } from '../../../services/Internship/learningPath';
import { StudentProgress } from '../../../services/Internship/studentProgress';
import { getCompactFileLabel, getCompactLinkLabel } from '../../../utils';

const { Title, Text } = Typography;

type DashboardModule = {
    id: string;
    title: string;
    description: string;
    orderIndex: number;
    contents?: Array<{
        id?: string;
        title?: string;
        contentUrl?: string;
        type?: string;
        metadata?: { assessmentFileUrl?: string; documentUrls?: string[] };
    }>;
    quizzes?: Array<{ id: string; title?: string }>;
    sequence: number;
    status: 'Completed' | 'In Progress';
};

type LearningMaterialItem = {
    id: string;
    title: string;
    type: 'video' | 'document' | 'quiz' | 'other';
    contentUrl?: string;
    assessmentFileUrl?: string;
    documentUrls?: string[];
};

export const InternLearningPath = () => {
    const navigate = useNavigate();
    const [selectedLearningModuleId, setSelectedLearningModuleId] = useState<string>('');
    const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');

    const { data: internRes, isLoading: isLoadingIntern } = useMeIntern();
    const { data: progressRes, isLoading: isLoadingProgress } = useMyProgress();

    const intern = useMemo(() => (internRes?.data || internRes) as { track?: string } | null, [internRes]);
    const progress = useMemo(() => (progressRes?.data || progressRes) as StudentProgress | null, [progressRes]);
    const learningTrack = intern?.track || progress?.learningPath?.track || '';

    const { data: learningPathRes, isLoading: isLoadingLearningPath } = useLearningPath(learningTrack);
    const learningPath = useMemo(() => (learningPathRes?.data || learningPathRes) as LearningPath | null, [learningPathRes]);

    const modules = useMemo<DashboardModule[]>(() => {
        if (!learningPath?.modules) return [];

        const completedSet = new Set(progress?.modulesCompleted || []);
        const orderedModules = [...learningPath.modules].sort((firstModule, secondModule) => {
            if (firstModule.orderIndex !== secondModule.orderIndex) {
                return firstModule.orderIndex - secondModule.orderIndex;
            }

            return firstModule.createdAt.localeCompare(secondModule.createdAt);
        });
        const fallbackCurrentModule = orderedModules.find((module) => !completedSet.has(module.id));
        const activeModuleId = progress?.currentModuleId || fallbackCurrentModule?.id;

        return orderedModules.map((module, index) => ({
            id: module.id,
            title: module.title,
            description: module.description,
            orderIndex: module.orderIndex,
            contents: Array.isArray(module.contents)
                ? (module.contents as Array<{
                      id?: string;
                      title?: string;
                      contentUrl?: string;
                      type?: string;
                      metadata?: { assessmentFileUrl?: string; documentUrls?: string[] };
                  }>)
                : [],
            quizzes: Array.isArray(module.quizzes) ? (module.quizzes as Array<{ id: string; title?: string }>) : [],
            sequence: index + 1,
            status: completedSet.has(module.id) ? 'Completed' : 'In Progress'
        }));
    }, [learningPath, progress]);

    const selectedLearningModule = useMemo(
        () => modules.find((module) => module.id === selectedLearningModuleId) || modules[0] || null,
        [modules, selectedLearningModuleId]
    );

    const selectedLearningMaterials = useMemo<LearningMaterialItem[]>(() => {
        if (!selectedLearningModule) return [];

        const materialsFromContents = (selectedLearningModule.contents || []).map((content, index) => {
            const rawType = String(content.type || '').toLowerCase();
            const normalizedType: LearningMaterialItem['type'] =
                rawType === 'video' ? 'video' : rawType === 'document' || rawType === 'file' ? 'document' : 'other';

            return {
                id: String(content.id || `content-${index}`),
                title: String(content.title || `Bài giảng ${index + 1}`),
                type: normalizedType,
                contentUrl: content.contentUrl,
                assessmentFileUrl: content.metadata?.assessmentFileUrl,
                documentUrls: Array.isArray(content.metadata?.documentUrls) ? content.metadata.documentUrls : []
            };
        });

        const materialsFromQuizzes = (selectedLearningModule.quizzes || []).map((quiz, index) => ({
            id: String(quiz.id || `quiz-${index}`),
            title: String(quiz.title || `Bài kiểm tra ${index + 1}`),
            type: 'quiz' as const
        }));

        return [...materialsFromContents, ...materialsFromQuizzes];
    }, [selectedLearningModule]);

    const isLoading = isLoadingIntern || isLoadingProgress || (Boolean(learningTrack) && isLoadingLearningPath);

    useEffect(() => {
        if (!selectedLearningMaterials.length) {
            setSelectedMaterialId('');
            return;
        }

        const selectedStillExists = selectedLearningMaterials.some((material) => material.id === selectedMaterialId);
        if (selectedStillExists) {
            return;
        }

        setSelectedMaterialId(selectedLearningMaterials[0].id);
    }, [selectedLearningMaterials, selectedMaterialId]);

    const selectedMaterial = useMemo(
        () => selectedLearningMaterials.find((material) => material.id === selectedMaterialId) || null,
        [selectedLearningMaterials, selectedMaterialId],
    );

    const getYoutubeEmbedUrl = (url?: string): string | null => {
        if (!url) return null;

        try {
            const parsedUrl = new URL(url);
            const host = parsedUrl.hostname.toLowerCase();

            if (host.includes('youtu.be')) {
                const id = parsedUrl.pathname.split('/').filter(Boolean)[0];
                return id ? `https://www.youtube.com/embed/${id}` : null;
            }

            if (host.includes('youtube.com')) {
                const watchId = parsedUrl.searchParams.get('v');
                if (watchId) {
                    return `https://www.youtube.com/embed/${watchId}`;
                }

                const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
                const embedIndex = pathParts.findIndex((part) => part === 'embed');
                if (embedIndex >= 0 && pathParts[embedIndex + 1]) {
                    return `https://www.youtube.com/embed/${pathParts[embedIndex + 1]}`;
                }
            }
        } catch {
            return null;
        }

        return null;
    };

    const selectedYoutubeEmbedUrl =
        selectedMaterial && selectedMaterial.type !== 'quiz' ? getYoutubeEmbedUrl(selectedMaterial.contentUrl) : null;

    const handleOpenMaterial = (material: LearningMaterialItem) => {
        if (material.type === 'quiz') {
            navigate(RouteConfig.InternTest.getPath(material.id, selectedLearningModule?.id));
            return;
        }

        if (material.contentUrl) {
            window.open(material.contentUrl, '_blank', 'noopener,noreferrer');
            return;
        }
    };

    if (isLoading) {
        return (
            <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
                <Skeleton active paragraph={{ rows: 8 }} />
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
            <Card
                variant='borderless'
                style={{ borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '24px' }}
            >
                <Space direction='vertical' style={{ width: '100%' }}>
                    <Tag color='blue' style={{ width: 'fit-content' }}>
                        Lộ trình học tập
                    </Tag>
                    <Title level={3} style={{ margin: 0 }}>
                        {learningPath?.title || intern?.track || 'Chưa có lộ trình'}
                    </Title>
                    <Text type='secondary'>{learningPath?.description || 'Theo dõi học phần và nội dung đào tạo theo lộ trình.'}</Text>
                </Space>
            </Card>

            {!modules.length ? (
                <Card variant='borderless' style={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <Empty description='Bạn chưa được gán lộ trình hoặc lộ trình chưa có học phần.' />
                </Card>
            ) : (
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={10}>
                        <Card
                            variant='borderless'
                            style={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}
                            title='Danh sách học phần'
                        >
                            <List
                                dataSource={modules}
                                renderItem={(module) => (
                                    <List.Item
                                        style={{
                                            cursor: 'pointer',
                                            border: module.id === selectedLearningModule?.id ? '1px solid #1E40AF' : '1px solid #E2E8F0',
                                            borderRadius: '8px',
                                            marginBottom: '8px',
                                            padding: '12px',
                                            background: module.id === selectedLearningModule?.id ? '#f0f7ff' : '#fff'
                                        }}
                                        onClick={() => setSelectedLearningModuleId(module.id)}
                                    >
                                        <div style={{ width: '100%' }}>
                                            <Space align='start'>
                                                {module.status === 'Completed' ? (
                                                    <CheckCircleFilled style={{ color: '#10B981', marginTop: '4px' }} />
                                                ) : (
                                                    <PlayCircleOutlined style={{ color: '#1E40AF', marginTop: '4px' }} />
                                                )}
                                                <div>
                                                    <Text strong>{`Module ${module.sequence}: ${module.title}`}</Text>
                                                    <div>
                                                        <Tag
                                                            color={
                                                                module.status === 'Completed'
                                                                    ? 'success'
                                                                    : 'processing'
                                                            }
                                                            style={{ marginTop: '6px' }}
                                                        >
                                                            {module.status}
                                                        </Tag>
                                                    </div>
                                                </div>
                                            </Space>
                                        </div>
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} md={14}>
                        <Card
                            variant='borderless'
                            style={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}
                            title={selectedLearningModule ? `Nội dung: ${selectedLearningModule.title}` : 'Nội dung học phần'}
                        >
                            {!selectedLearningModule ? (
                                <Empty description='Chọn học phần để xem bài giảng và video.' />
                            ) : (
                                <Space direction='vertical' style={{ width: '100%' }} size={16}>
                                    <List
                                        dataSource={selectedLearningMaterials}
                                        locale={{ emptyText: 'Học phần này chưa có bài giảng/video.' }}
                                        renderItem={(item) => (
                                            <List.Item
                                                style={{
                                                    border: item.id === selectedMaterial?.id ? '1px solid #1E40AF' : '1px solid #E2E8F0',
                                                    borderRadius: '8px',
                                                    padding: '12px',
                                                    marginBottom: '8px',
                                                    background: item.id === selectedMaterial?.id ? '#f0f7ff' : '#fff',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => setSelectedMaterialId(item.id)}
                                                actions={[
                                                    <Button type='link' onClick={() => handleOpenMaterial(item)}>
                                                        {item.type === 'quiz' ? 'Làm bài kiểm tra' : 'Mở nội dung'}
                                                    </Button>
                                                ]}
                                            >
                                                <Space align='start'>
                                                    {item.type === 'video' ? (
                                                        <PlayCircleOutlined style={{ color: '#ef4444', marginTop: '4px' }} />
                                                    ) : item.type === 'quiz' ? (
                                                        <QuestionCircleOutlined style={{ color: '#722ed1', marginTop: '4px' }} />
                                                    ) : item.type === 'document' ? (
                                                        <FileTextOutlined style={{ color: '#fa8c16', marginTop: '4px' }} />
                                                    ) : (
                                                        <BookOutlined style={{ color: '#64748b', marginTop: '4px' }} />
                                                    )}
                                                    <div>
                                                        <Text strong>{item.title}</Text>
                                                        <div>
                                                            <Text type='secondary' style={{ fontSize: '12px' }}>
                                                                <ClockCircleOutlined style={{ marginRight: '4px' }} />
                                                                {item.type === 'video'
                                                                    ? 'Video bài giảng'
                                                                    : item.type === 'quiz'
                                                                      ? 'Bài kiểm tra học phần'
                                                                : 'Tài liệu học tập'}
                                                            </Text>
                                                        </div>
                                                        {item.assessmentFileUrl ? (
                                                            <div style={{ marginTop: '6px' }}>
                                                                <Button
                                                                    type='link'
                                                                    size='small'
                                                                    style={{ padding: 0 }}
                                                                    onClick={() =>
                                                                        window.open(item.assessmentFileUrl, '_blank', 'noopener,noreferrer')
                                                                    }
                                                                >
                                                                    {`Mở ${getCompactLinkLabel(item.assessmentFileUrl, 'danh gia')}`}
                                                                </Button>
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                </Space>
                                            </List.Item>
                                        )}
                                    />
                                    <Card
                                        variant='borderless'
                                        style={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}
                                        title='Xem trước nội dung'
                                    >
                                        {!selectedMaterial ? (
                                            <Empty description='Chọn nội dung để xem trước.' />
                                        ) : selectedMaterial.type === 'quiz' ? (
                                            <Space direction='vertical'>
                                                <Text>Bài này là quiz, bấm nút dưới để vào làm bài.</Text>
                                                <Button type='primary' onClick={() => handleOpenMaterial(selectedMaterial)}>
                                                    Làm bài kiểm tra
                                                </Button>
                                            </Space>
                                        ) : selectedYoutubeEmbedUrl ? (
                                            <Space direction='vertical' style={{ width: '100%' }} size={16}>
                                                <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}>
                                                    <iframe
                                                        src={selectedYoutubeEmbedUrl}
                                                        title={selectedMaterial.title}
                                                        style={{
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            width: '100%',
                                                            height: '100%',
                                                            border: 0,
                                                            borderRadius: '8px'
                                                        }}
                                                        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                                                        referrerPolicy='strict-origin-when-cross-origin'
                                                        allowFullScreen
                                                    />
                                                </div>
                                                {selectedMaterial.documentUrls?.length ? (
                                                    <Space direction='vertical' size={8} style={{ width: '100%' }}>
                                                        <Text strong>Tài liệu đính kèm</Text>
                                                        {selectedMaterial.documentUrls.map((url, index) => (
                                                            <Button
                                                                key={`${url}-${index}`}
                                                                onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
                                                            >
                                                                {getCompactFileLabel(url, `Tai lieu ${index + 1}`)}
                                                            </Button>
                                                        ))}
                                                    </Space>
                                                ) : null}
                                                {selectedMaterial.assessmentFileUrl ? (
                                                    <Button
                                                        onClick={() =>
                                                            window.open(
                                                                selectedMaterial.assessmentFileUrl,
                                                                '_blank',
                                                                'noopener,noreferrer',
                                                            )
                                                        }
                                                    >
                                                        {`Mở ${getCompactLinkLabel(selectedMaterial.assessmentFileUrl, 'danh gia')}`}
                                                    </Button>
                                                ) : null}
                                            </Space>
                                        ) : selectedMaterial.contentUrl ? (
                                            <Space direction='vertical'>
                                                <Button type='primary' onClick={() => handleOpenMaterial(selectedMaterial)}>
                                                    Mở nội dung
                                                </Button>
                                                {selectedMaterial.documentUrls?.length ? (
                                                    <Space direction='vertical' size={8}>
                                                        <Text strong>Tài liệu đính kèm</Text>
                                                        {selectedMaterial.documentUrls.map((url, index) => (
                                                            <Button
                                                                key={`${url}-${index}`}
                                                                onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
                                                            >
                                                                {getCompactFileLabel(url, `Tai lieu ${index + 1}`)}
                                                            </Button>
                                                        ))}
                                                    </Space>
                                                ) : null}
                                                {selectedMaterial.assessmentFileUrl ? (
                                                    <Button
                                                        onClick={() =>
                                                            window.open(
                                                                selectedMaterial.assessmentFileUrl,
                                                                '_blank',
                                                                'noopener,noreferrer',
                                                            )
                                                        }
                                                    >
                                                        {`Mở ${getCompactLinkLabel(selectedMaterial.assessmentFileUrl, 'danh gia')}`}
                                                    </Button>
                                                ) : null}
                                            </Space>
                                        ) : (
                                            <Space direction='vertical'>
                                                <Text type='secondary'>Nội dung này chưa có URL.</Text>
                                                {selectedMaterial.documentUrls?.length ? (
                                                    <Space direction='vertical' size={8}>
                                                        <Text strong>Tài liệu đính kèm</Text>
                                                        {selectedMaterial.documentUrls.map((url, index) => (
                                                            <Button
                                                                key={`${url}-${index}`}
                                                                onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
                                                            >
                                                                {getCompactFileLabel(url, `Tai lieu ${index + 1}`)}
                                                            </Button>
                                                        ))}
                                                    </Space>
                                                ) : null}
                                                {selectedMaterial.assessmentFileUrl ? (
                                                    <Button
                                                        onClick={() =>
                                                            window.open(
                                                                selectedMaterial.assessmentFileUrl,
                                                                '_blank',
                                                                'noopener,noreferrer',
                                                            )
                                                        }
                                                    >
                                                        {`Mở ${getCompactLinkLabel(selectedMaterial.assessmentFileUrl, 'danh gia')}`}
                                                    </Button>
                                                ) : null}
                                            </Space>
                                        )}
                                    </Card>
                                </Space>
                            )}
                        </Card>
                    </Col>
                </Row>
            )}
        </div>
    );
};
