import {
    BookOutlined,
    CheckCircleFilled,
    ClockCircleOutlined,
    DownloadOutlined,
    DownOutlined,
    FileTextOutlined,
    LinkOutlined,
    PlayCircleOutlined,
    QuestionCircleOutlined,
    RightOutlined
} from '@ant-design/icons';
import { Button, Card, Col, Empty, Form, Input, Row, Skeleton, Space, Tag, Typography, Upload, message } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RouteConfig } from '../../../constants';
import { useLearningPath } from '../../../hooks/Internship/useLearningPath';
import { useMeIntern } from '../../../hooks/Internship/useInterns';
import { useMyProgress } from '../../../hooks/Internship/useStudentProgress';
import { LearningPath } from '../../../services/Internship/learningPath';
import {
    Phase1ModuleDetail,
    getPhase1ModuleEvaluations,
    submitMyModuleFinalTest
} from '../../../services/Internship/moduleAssessments';
import { StudentProgress } from '../../../services/Internship/studentProgress';
import { getCompactFileLabel, getCompactLinkLabel } from '../../../utils';
import { http } from '../../../utils/http';

const { Title, Text } = Typography;
const { TextArea } = Input;

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
    type: 'video' | 'document' | 'quiz' | 'other' | 'final_test';
    moduleId: string;
    contentUrl?: string;
    assessmentFileUrl?: string;
    documentUrls?: string[];
    phase1ModuleDetail?: Phase1ModuleDetail | null;
};

type MaterialResource = {
    key: string;
    label: string;
    url: string;
};

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

const getModuleStatusMeta = (status: DashboardModule['status']) => {
    if (status === 'Completed') {
        return {
            color: 'success' as const,
            label: 'Hoàn thành'
        };
    }

    return {
        color: 'processing' as const,
        label: 'Đang học'
    };
};

const getMaterialTypeLabel = (type: LearningMaterialItem['type']) => {
    if (type === 'final_test') return 'Bài kiểm tra học phần';
    if (type === 'video') return 'Video bài giảng';
    if (type === 'quiz') return 'Bài quiz';
    if (type === 'document') return 'Tài liệu bài giảng';
    return 'Nội dung học tập';
};

const getMaterialIcon = (type: LearningMaterialItem['type']) => {
    if (type === 'final_test') {
        return <FileTextOutlined style={{ color: '#1D4ED8', marginTop: '4px' }} />;
    }

    if (type === 'video') {
        return <PlayCircleOutlined style={{ color: '#ef4444', marginTop: '4px' }} />;
    }

    if (type === 'quiz') {
        return <QuestionCircleOutlined style={{ color: '#722ed1', marginTop: '4px' }} />;
    }

    if (type === 'document') {
        return <FileTextOutlined style={{ color: '#fa8c16', marginTop: '4px' }} />;
    }

    return <BookOutlined style={{ color: '#64748b', marginTop: '4px' }} />;
};

const MOJIBAKE_PATTERN = /(?:Ã.|áº|á»|Ä.|Â|â€|Æ.)/;

const repairMojibakeLabel = (label: string): string => {
    const normalizedLabel = label.trim();

    if (!normalizedLabel || !MOJIBAKE_PATTERN.test(normalizedLabel)) {
        return normalizedLabel;
    }

    try {
        const latin1Bytes = Uint8Array.from(Array.from(normalizedLabel, (char) => char.charCodeAt(0) & 0xff));
        const decodedLabel = new TextDecoder('utf-8').decode(latin1Bytes).trim();

        return decodedLabel || normalizedLabel;
    } catch {
        return normalizedLabel;
    }
};

const getTrainingDisplayFileLabel = (resourceUrl?: string, fallbackLabel = 'Tài liệu'): string =>
    repairMojibakeLabel(getCompactFileLabel(resourceUrl, fallbackLabel));

const buildModuleMaterials = (module: DashboardModule, phase1ModuleDetail?: Phase1ModuleDetail | null): LearningMaterialItem[] => {
    const materialsFromContents = (module.contents || []).map((content, index) => {
        const rawType = String(content.type || '').toLowerCase();
        const normalizedType: LearningMaterialItem['type'] =
            rawType === 'video' ? 'video' : rawType === 'document' || rawType === 'file' ? 'document' : 'other';

        return {
            id: String(content.id || `content-${index}`),
            title: String(content.title || `Bài giảng ${index + 1}`),
            moduleId: module.id,
            type: normalizedType,
            contentUrl: content.contentUrl,
            assessmentFileUrl: content.metadata?.assessmentFileUrl,
            documentUrls: Array.isArray(content.metadata?.documentUrls) ? content.metadata.documentUrls : []
        };
    });

    const quizMaterials = (module.quizzes || []).map((quiz, index) => ({
        id: String(quiz.id || `quiz-${index}`),
        title: String(quiz.title || `Bài quiz ${index + 1}`),
        moduleId: module.id,
        type: 'quiz' as const
    }));

    const finalTestMaterial: LearningMaterialItem = {
        id: `final-test-${module.id}`,
        title: 'Bài kiểm tra học phần',
        moduleId: module.id,
        type: 'final_test',
        phase1ModuleDetail: phase1ModuleDetail || null
    };

    return [...materialsFromContents, ...quizMaterials, finalTestMaterial];
};

const openResource = (url?: string | null) => {
    if (!url) {
        return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
};

export const InternLearningPathV2 = () => {
    const navigate = useNavigate();
    const [expandedModuleId, setExpandedModuleId] = useState<string>('');
    const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');
    const [hasInitializedExpansion, setHasInitializedExpansion] = useState(false);
    const [phase1Modules, setPhase1Modules] = useState<Phase1ModuleDetail[]>([]);
    const [isPhase1Loading, setIsPhase1Loading] = useState(false);
    const [isSubmittingFinalTest, setIsSubmittingFinalTest] = useState(false);
    const [finalTestFileList, setFinalTestFileList] = useState<UploadFile[]>([]);
    const [finalTestForm] = Form.useForm();

    const { data: internRes, isLoading: isLoadingIntern } = useMeIntern();
    const { data: progressRes, isLoading: isLoadingProgress } = useMyProgress();

    const intern = useMemo(() => (internRes?.data || internRes) as { id?: string; track?: string } | null, [internRes]);
    const progress = useMemo(() => (progressRes?.data || progressRes) as StudentProgress | null, [progressRes]);
    const learningTrack = intern?.track || progress?.learningPath?.track || '';

    const { data: learningPathRes, isLoading: isLoadingLearningPath } = useLearningPath(learningTrack);
    const learningPath = useMemo(() => (learningPathRes?.data || learningPathRes) as LearningPath | null, [learningPathRes]);

    const loadPhase1Modules = async () => {
        const internId = String(intern?.id || '');
        if (!internId) {
            setPhase1Modules([]);
            return;
        }

        setIsPhase1Loading(true);
        try {
            const response = await getPhase1ModuleEvaluations(internId);
            setPhase1Modules(response?.data?.modules || []);
        } catch {
            setPhase1Modules([]);
        } finally {
            setIsPhase1Loading(false);
        }
    };

    useEffect(() => {
        loadPhase1Modules();
    }, [intern?.id]);

    const phase1ModuleMap = useMemo(
        () =>
            phase1Modules.reduce<Record<string, Phase1ModuleDetail>>((result, item) => {
                result[item.moduleId] = item;
                return result;
            }, {}),
        [phase1Modules]
    );

    const modules = useMemo<DashboardModule[]>(() => {
        if (!Array.isArray(learningPath?.modules)) return [];

        const completedSet = new Set((progress?.modulesCompleted || []).map((moduleId) => String(moduleId)));
        const orderedModules = [...learningPath.modules].sort((firstModule, secondModule) => {
            if (firstModule.orderIndex !== secondModule.orderIndex) {
                return firstModule.orderIndex - secondModule.orderIndex;
            }

            const firstCreatedAt = String((firstModule as { createdAt?: string }).createdAt || '');
            const secondCreatedAt = String((secondModule as { createdAt?: string }).createdAt || '');
            return firstCreatedAt.localeCompare(secondCreatedAt);
        });

        return orderedModules.map((module, index) => ({
            id: String(module.id),
            title: String(module.title || `Học phần ${index + 1}`),
            description: String(module.description || ''),
            orderIndex: Number(module.orderIndex || index + 1),
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
            status: completedSet.has(String(module.id)) ? 'Completed' : 'In Progress'
        }));
    }, [learningPath, progress]);

    const defaultExpandedModuleId = useMemo(() => {
        if (!modules.length) return '';

        const currentModuleId = progress?.currentModuleId ? String(progress.currentModuleId) : '';
        return modules.find((module) => module.id === currentModuleId)?.id || modules[0].id;
    }, [modules, progress?.currentModuleId]);

    const materialsByModuleId = useMemo<Record<string, LearningMaterialItem[]>>(
        () =>
            modules.reduce<Record<string, LearningMaterialItem[]>>((result, module) => {
                result[module.id] = buildModuleMaterials(module, phase1ModuleMap[module.id]);
                return result;
            }, {}),
        [modules, phase1ModuleMap]
    );

    const expandedModule = useMemo(
        () => modules.find((module) => module.id === expandedModuleId) || null,
        [expandedModuleId, modules]
    );

    const expandedModuleMaterials = useMemo<LearningMaterialItem[]>(
        () => (expandedModule ? materialsByModuleId[expandedModule.id] || [] : []),
        [expandedModule, materialsByModuleId]
    );

    const isLoading = isLoadingIntern || isLoadingProgress || (Boolean(learningTrack) && isLoadingLearningPath) || isPhase1Loading;

    useEffect(() => {
        if (!modules.length) {
            setExpandedModuleId('');
            setSelectedMaterialId('');
            setHasInitializedExpansion(false);
            return;
        }

        if (!hasInitializedExpansion && defaultExpandedModuleId) {
            setExpandedModuleId(defaultExpandedModuleId);
            setHasInitializedExpansion(true);
            return;
        }

        if (!expandedModuleId) {
            return;
        }

        const expandedStillExists = modules.some((module) => module.id === expandedModuleId);
        if (!expandedStillExists) {
            setExpandedModuleId(defaultExpandedModuleId);
        }
    }, [defaultExpandedModuleId, expandedModuleId, hasInitializedExpansion, modules]);

    useEffect(() => {
        if (!expandedModuleMaterials.length) {
            setSelectedMaterialId('');
            return;
        }

        const selectedStillExists = expandedModuleMaterials.some((material) => material.id === selectedMaterialId);
        if (!selectedStillExists) {
            setSelectedMaterialId(expandedModuleMaterials[0].id);
        }
    }, [expandedModuleMaterials, selectedMaterialId]);

    const selectedMaterial = useMemo(
        () => expandedModuleMaterials.find((material) => material.id === selectedMaterialId) || null,
        [expandedModuleMaterials, selectedMaterialId]
    );

    useEffect(() => {
        if (selectedMaterial?.type === 'final_test') {
            const submission = selectedMaterial.phase1ModuleDetail?.submission;
            finalTestForm.setFieldsValue({
                submissionLink: submission?.submissionLink,
                description: submission?.description
            });
            setFinalTestFileList([]);
        }
    }, [finalTestForm, selectedMaterial?.id, selectedMaterial?.type]);

    const selectedYoutubeEmbedUrl =
        selectedMaterial?.type === 'video' ? getYoutubeEmbedUrl(selectedMaterial.contentUrl) : null;

    const attachmentResources = useMemo<MaterialResource[]>(() => {
        if (!selectedMaterial) {
            return [];
        }

        const seenUrls = new Set<string>();
        const resources = (selectedMaterial.documentUrls || []).reduce<MaterialResource[]>((result, url, index) => {
            if (!url || seenUrls.has(url)) {
                return result;
            }

            seenUrls.add(url);
            result.push({
                key: `attachment-${index}`,
                label: getTrainingDisplayFileLabel(url, `Tài liệu ${index + 1}`),
                url
            });
            return result;
        }, []);

        if (selectedMaterial.assessmentFileUrl && !seenUrls.has(selectedMaterial.assessmentFileUrl)) {
            resources.push({
                key: 'attachment-link',
                label: getCompactLinkLabel(selectedMaterial.assessmentFileUrl, 'Đường link tài liệu'),
                url: selectedMaterial.assessmentFileUrl
            });
        }

        return resources;
    }, [selectedMaterial]);

    const primaryResource = useMemo<MaterialResource | null>(() => {
        if (!selectedMaterial?.contentUrl) {
            return null;
        }

        if (selectedMaterial.type === 'document') {
            return {
                key: 'primary-document',
                label: getTrainingDisplayFileLabel(selectedMaterial.contentUrl, selectedMaterial.title),
                url: selectedMaterial.contentUrl
            };
        }

        if (selectedMaterial.type === 'other') {
            return {
                key: 'primary-content',
                label: getCompactLinkLabel(selectedMaterial.contentUrl, 'Mở nội dung'),
                url: selectedMaterial.contentUrl
            };
        }

        return null;
    }, [selectedMaterial]);

    const selectedPhase1Detail = selectedMaterial?.type === 'final_test' ? selectedMaterial.phase1ModuleDetail || null : null;

    const uploadSubmissionFile = async (file: File): Promise<string> => {
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        const uploadResult = await http.post<{ fileName?: string; data?: { fileName?: string } }>(
            '/storage/upload',
            uploadFormData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
        const fileName = uploadResult?.fileName || uploadResult?.data?.fileName;
        if (!fileName) {
            throw new Error('Upload tài liệu thất bại');
        }

        return fileName;
    };

    const handleSubmitFinalTest = async () => {
        if (!selectedPhase1Detail?.moduleId) {
            return;
        }

        try {
            const values = await finalTestForm.validateFields();
            const nextFile = finalTestFileList[0]?.originFileObj;

            if (!nextFile && !values.submissionLink && !values.description && !selectedPhase1Detail.submission?.submissionFile?.fileName) {
                message.warning('Hãy chọn file hoặc nhập ít nhất một thông tin bài nộp.');
                return;
            }

            setIsSubmittingFinalTest(true);
            await submitMyModuleFinalTest(selectedPhase1Detail.moduleId, {
                submissionFileName: nextFile ? await uploadSubmissionFile(nextFile as File) : undefined,
                submissionOriginalName: nextFile ? (nextFile as File).name : undefined,
                submissionLink: values.submissionLink,
                description: values.description
            });
            message.success('Đã nộp bài kiểm tra học phần');
            setFinalTestFileList([]);
            await loadPhase1Modules();
        } catch (error: any) {
            if (!error?.errorFields) {
                message.error('Không thể nộp bài kiểm tra học phần');
            }
        } finally {
            setIsSubmittingFinalTest(false);
        }
    };

    const handleToggleModule = (moduleId: string) => {
        if (moduleId === expandedModuleId) {
            setExpandedModuleId('');
            setSelectedMaterialId('');
            return;
        }

        const nextModuleMaterials = materialsByModuleId[moduleId] || [];
        setExpandedModuleId(moduleId);
        setSelectedMaterialId(nextModuleMaterials[0]?.id || '');
    };

    const handleOpenMaterial = (material: LearningMaterialItem) => {
        if (material.type === 'quiz') {
            navigate(RouteConfig.InternTest.getPath(material.id, material.moduleId));
            return;
        }

        openResource(material.contentUrl);
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
                        {learningPath?.title || learningTrack || 'Chưa có lộ trình'}
                    </Title>
                    <Text type='secondary'>Theo dõi học phần, bài giảng và bài kiểm tra cuối học phần theo đúng lộ trình được gán.</Text>
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
                            extra={<Tag color='blue'>{`${modules.length} học phần`}</Tag>}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {modules.map((module) => {
                                    const isExpanded = module.id === expandedModuleId;
                                    const moduleStatus = getModuleStatusMeta(module.status);
                                    const moduleMaterials = materialsByModuleId[module.id] || [];

                                    return (
                                        <div
                                            key={module.id}
                                            style={{
                                                border: isExpanded ? '1px solid #1D4ED8' : '1px solid #E2E8F0',
                                                borderRadius: '16px',
                                                background: isExpanded ? '#F8FBFF' : '#FFFFFF',
                                                overflow: 'hidden',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <div
                                                role='button'
                                                tabIndex={0}
                                                onClick={() => handleToggleModule(module.id)}
                                                onKeyDown={(event) => {
                                                    if (event.key === 'Enter' || event.key === ' ') {
                                                        event.preventDefault();
                                                        handleToggleModule(module.id);
                                                    }
                                                }}
                                                style={{
                                                    width: '100%',
                                                    padding: '20px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'flex-start',
                                                        gap: '12px'
                                                    }}
                                                >
                                                    <Space align='start' size={12}>
                                                        {module.status === 'Completed' ? (
                                                            <CheckCircleFilled style={{ color: '#10B981', marginTop: '4px' }} />
                                                        ) : (
                                                            <PlayCircleOutlined style={{ color: '#1D4ED8', marginTop: '4px' }} />
                                                        )}
                                                        <div>
                                                            <Text strong style={{ fontSize: '18px', color: '#0F172A' }}>
                                                                {`Học phần ${module.sequence}: ${module.title}`}
                                                            </Text>
                                                            <div style={{ marginTop: '8px' }}>
                                                                <Text type='secondary'>
                                                                    {module.description || 'Học phần này chưa có mô tả chi tiết.'}
                                                                </Text>
                                                            </div>
                                                            <Space wrap size={[8, 8]} style={{ marginTop: '12px' }}>
                                                                <Tag color={moduleStatus.color}>{moduleStatus.label}</Tag>
                                                                <Tag>{`${moduleMaterials.length} nội dung`}</Tag>
                                                            </Space>
                                                        </div>
                                                    </Space>
                                                    {isExpanded ? (
                                                        <DownOutlined style={{ color: '#1D4ED8', marginTop: '6px' }} />
                                                    ) : (
                                                        <RightOutlined style={{ color: '#1D4ED8', marginTop: '6px' }} />
                                                    )}
                                                </div>
                                            </div>

                                            {isExpanded ? (
                                                <div style={{ padding: '0 20px 20px' }}>
                                                    <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
                                                        {moduleMaterials.length ? (
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                                {moduleMaterials.map((item) => {
                                                                    const isSelected = item.id === selectedMaterial?.id;

                                                                    return (
                                                                        <div
                                                                            key={item.id}
                                                                            role='button'
                                                                            tabIndex={0}
                                                                            onClick={() => setSelectedMaterialId(item.id)}
                                                                            onKeyDown={(event) => {
                                                                                if (event.key === 'Enter' || event.key === ' ') {
                                                                                    event.preventDefault();
                                                                                    setSelectedMaterialId(item.id);
                                                                                }
                                                                            }}
                                                                            style={{
                                                                                border: isSelected
                                                                                    ? '1px solid #1D4ED8'
                                                                                    : '1px solid #D9E2F1',
                                                                                borderRadius: '14px',
                                                                                background: isSelected ? '#EAF3FF' : '#FFFFFF',
                                                                                padding: '16px',
                                                                                cursor: 'pointer'
                                                                            }}
                                                                        >
                                                                            <Space align='start' size={12}>
                                                                                {getMaterialIcon(item.type)}
                                                                                <div>
                                                                                    <Text strong style={{ color: '#0F172A' }}>
                                                                                        {item.title}
                                                                                    </Text>
                                                                                    {item.type !== 'video' ? (
                                                                                        <div style={{ marginTop: '6px' }}>
                                                                                            <Text type='secondary' style={{ fontSize: '12px' }}>
                                                                                                <ClockCircleOutlined style={{ marginRight: '4px' }} />
                                                                                                {getMaterialTypeLabel(item.type)}
                                                                                            </Text>
                                                                                        </div>
                                                                                    ) : null}
                                                                                </div>
                                                                            </Space>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <Text type='secondary'>Chưa có nội dung</Text>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} md={14}>
                        <Card
                            variant='borderless'
                            style={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}
                            title='Chi tiết nội dung'
                        >
                            {!selectedMaterial ? (
                                <div
                                    style={{
                                        minHeight: '360px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Empty
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        description={
                                            expandedModule
                                                ? 'Học phần này chưa có nội dung để hiển thị.'
                                                : 'Chọn học phần và một mục nội dung ở cột bên trái để xem chi tiết.'
                                        }
                                    />
                                </div>
                            ) : (
                                <Space direction='vertical' style={{ width: '100%' }} size={16}>
                                    <div
                                        style={{
                                            border: '1px solid #E2E8F0',
                                            borderRadius: '12px',
                                            background: '#F8FBFF',
                                            padding: '16px 20px'
                                        }}
                                    >
                                        <Text type='secondary'>
                                            {expandedModule
                                                ? `Học phần ${expandedModule.sequence}: ${expandedModule.title}`
                                                : 'Chi tiết nội dung'}
                                        </Text>
                                        <div style={{ marginTop: '8px' }}>
                                            <Text strong style={{ fontSize: '20px', color: '#0F172A' }}>
                                                {selectedMaterial.title}
                                            </Text>
                                        </div>
                                        <Space wrap size={[8, 8]} style={{ marginTop: '12px' }}>
                                            {selectedMaterial.type !== 'video' ? (
                                                <Tag color='blue'>{getMaterialTypeLabel(selectedMaterial.type)}</Tag>
                                            ) : null}
                                            {selectedPhase1Detail?.submission ? <Tag color='cyan'>Đã nộp bài</Tag> : null}
                                        </Space>
                                    </div>
                                    {selectedMaterial.type === 'video' ? (
                                        <Card
                                            variant='borderless'
                                            style={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}
                                        >
                                            {selectedYoutubeEmbedUrl ? (
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
                                                    {selectedMaterial.contentUrl ? (
                                                        <Button onClick={() => handleOpenMaterial(selectedMaterial)}>
                                                            Mở video ở tab mới
                                                        </Button>
                                                    ) : null}
                                                </Space>
                                            ) : selectedMaterial.contentUrl ? (
                                                <Space direction='vertical' size={12}>
                                                    <Text type='secondary'>
                                                        Video này chưa hỗ trợ xem trực tiếp trong hệ thống. Bạn có thể mở ở tab mới.
                                                    </Text>
                                                    <Button type='primary' onClick={() => handleOpenMaterial(selectedMaterial)}>
                                                        Mở ở tab mới
                                                    </Button>
                                                </Space>
                                            ) : (
                                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='Nội dung chưa sẵn sàng.' />
                                            )}
                                        </Card>
                                    ) : null}

                                    {selectedMaterial.type === 'quiz' ? (
                                        <Card
                                            variant='borderless'
                                            style={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}
                                            title='Bài quiz'
                                        >
                                            <Space direction='vertical' size={12}>
                                                <Text>Bài quiz của học phần đã sẵn sàng. Mở nội dung để bắt đầu làm bài.</Text>
                                                <Button type='primary' onClick={() => navigate(RouteConfig.InternTest.getPath(selectedMaterial.id, selectedMaterial.moduleId))}>
                                                    Làm bài quiz
                                                </Button>
                                            </Space>
                                        </Card>
                                    ) : null}

                                    {selectedMaterial.type === 'final_test' ? (
                                        <Space direction='vertical' style={{ width: '100%' }} size={16}>
                                            <Card
                                                variant='borderless'
                                                style={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}
                                                title='Bài kiểm tra học phần'
                                            >
                                                {selectedPhase1Detail?.finalTest ? (
                                                    <Space direction='vertical' size={12} style={{ width: '100%' }}>
                                                        <Text style={{ whiteSpace: 'pre-wrap' }}>
                                                            {selectedPhase1Detail.finalTest.description || 'Chưa có mô tả cho bài kiểm tra học phần.'}
                                                        </Text>
                                                        {selectedPhase1Detail.finalTest.materialFile?.url ? (
                                                            <Button
                                                                icon={<DownloadOutlined />}
                                                                onClick={() => openResource(selectedPhase1Detail.finalTest?.materialFile?.url)}
                                                            >
                                                            {getTrainingDisplayFileLabel(
                                                                selectedPhase1Detail.finalTest.materialFile.originalName
                                                                    || selectedPhase1Detail.finalTest.materialFile.fileName,
                                                                'download'
                                                                )}
                                                            </Button>
                                                        ) : null}
                                                        {selectedPhase1Detail.finalTest.materialLink ? (
                                                            <Button
                                                                icon={<LinkOutlined />}
                                                                onClick={() => openResource(selectedPhase1Detail.finalTest?.materialLink)}
                                                            >
                                                                {getCompactLinkLabel(selectedPhase1Detail.finalTest.materialLink, 'Mở link tài liệu')}
                                                            </Button>
                                                        ) : null}
                                                    </Space>
                                                ) : (
                                                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='Mentor chưa cập nhật đề bài cho học phần này.' />
                                                )}
                                            </Card>

                                            <Card
                                                variant='borderless'
                                                style={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}
                                                title='Nộp bài'
                                            >
                                                <Space direction='vertical' size={16} style={{ width: '100%' }}>
                                                    {selectedPhase1Detail?.submission ? (
                                                        <div
                                                            style={{
                                                                border: '1px solid #D9E2F1',
                                                                borderRadius: 12,
                                                                padding: 16,
                                                                background: '#F8FAFC'
                                                            }}
                                                        >
                                                            <Text strong style={{ display: 'block', marginBottom: 8 }}>
                                                                Bài nộp gần nhất
                                                            </Text>
                                                            <Space direction='vertical' size={8} style={{ width: '100%' }}>
                                                                {selectedPhase1Detail.submission.submissionFile?.url ? (
                                                                    <Button
                                                                        icon={<DownloadOutlined />}
                                                                        onClick={() => openResource(selectedPhase1Detail.submission?.submissionFile?.url)}
                                                                    >
                                                            {getTrainingDisplayFileLabel(
                                                                selectedPhase1Detail.submission.submissionFile.originalName
                                                                    || selectedPhase1Detail.submission.submissionFile.fileName,
                                                                'download'
                                                                        )}
                                                                    </Button>
                                                                ) : null}
                                                                {selectedPhase1Detail.submission.submissionLink ? (
                                                                    <Button
                                                                        icon={<LinkOutlined />}
                                                                        onClick={() => openResource(selectedPhase1Detail.submission?.submissionLink)}
                                                                    >
                                                                        {getCompactLinkLabel(
                                                                            selectedPhase1Detail.submission.submissionLink,
                                                                            'Mở link bài nộp'
                                                                        )}
                                                                    </Button>
                                                                ) : null}
                                                                <Text type='secondary' style={{ whiteSpace: 'pre-wrap' }}>
                                                                    {selectedPhase1Detail.submission.description || 'Thực tập sinh không để lại mô tả thêm.'}
                                                                </Text>
                                                            </Space>
                                                        </div>
                                                    ) : null}

                                                    <Form form={finalTestForm} layout='vertical'>
                                                        <Form.Item label='Upload file bài nộp'>
                                                            <Upload
                                                                maxCount={1}
                                                                fileList={finalTestFileList}
                                                                beforeUpload={() => false}
                                                                onChange={({ fileList }) => setFinalTestFileList(fileList)}
                                                            >
                                                                <Button>Chọn file</Button>
                                                            </Upload>
                                                        </Form.Item>
                                                        <Form.Item label='Link bài nộp' name='submissionLink'>
                                                            <Input placeholder='Ví dụ: Google Drive, GitHub repo...' />
                                                        </Form.Item>
                                                        <Form.Item label='Mô tả thêm' name='description'>
                                                            <TextArea rows={4} placeholder='Ghi chú ngắn về cách làm hoặc nội dung đã nộp' />
                                                        </Form.Item>
                                                    </Form>

                                                    <Button type='primary' loading={isSubmittingFinalTest} onClick={handleSubmitFinalTest}>
                                                        {selectedPhase1Detail?.submission ? 'Cập nhật bài nộp' : 'Nộp bài'}
                                                    </Button>
                                                </Space>
                                            </Card>
                                        </Space>
                                    ) : null}
                                    {selectedMaterial.type !== 'video' && selectedMaterial.type !== 'quiz' && selectedMaterial.type !== 'final_test' ? (
                                        <Card
                                            variant='borderless'
                                            style={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}
                                            title={selectedMaterial.type === 'document' ? 'Tài liệu bài giảng' : 'Nội dung bài giảng'}
                                        >
                                            {primaryResource ? (
                                                <Space direction='vertical' size={12}>
                                                    <Text type='secondary'>
                                                        {selectedMaterial.type === 'document'
                                                            ? 'Mở trực tiếp tài liệu của bài giảng này.'
                                                            : 'Mở liên kết nội dung của bài giảng này.'}
                                                    </Text>
                                                    <Button type='primary' onClick={() => openResource(primaryResource.url)}>
                                                        {selectedMaterial.type === 'document' ? 'Mở tài liệu' : 'Mở nội dung'}
                                                    </Button>
                                                </Space>
                                            ) : (
                                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='Nội dung này chưa có liên kết để mở.' />
                                            )}
                                        </Card>
                                    ) : null}

                                    {attachmentResources.length ? (
                                        <Card
                                            variant='borderless'
                                            style={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}
                                            title='Tài liệu'
                                        >
                                            <Space direction='vertical' style={{ width: '100%' }} size={12}>
                                                {attachmentResources.map((resource) => (
                                                    <Button key={resource.key} style={{ width: 'fit-content' }} onClick={() => openResource(resource.url)}>
                                                        {resource.label}
                                                    </Button>
                                                ))}
                                            </Space>
                                        </Card>
                                    ) : null}

                                </Space>
                            )}
                        </Card>
                    </Col>
                </Row>
            )}
        </div>
    );
};
