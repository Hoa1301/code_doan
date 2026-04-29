import {
    CalendarOutlined,
    ClockCircleOutlined,
    FileTextOutlined,
    TeamOutlined,
    TrophyOutlined,
    UserOutlined
} from '@ant-design/icons';
import { Avatar, Card, Col, Empty, Row, Skeleton, Space, Statistic, Tag, Typography } from 'antd';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useMeIntern } from '../../../hooks/Internship/useInterns';
import { Intern } from '../../../services/Internship/interns';
import { http } from '../../../utils/http';

const { Title, Text, Paragraph } = Typography;

type PhaseKey = 'phase1' | 'phase2' | 'final';

type EvaluationRecord = {
    id: string;
    type?: string;
    status?: string;
    overallScore?: number;
    technicalScore?: number;
    attitudeScore?: number;
    teamworkScore?: number;
    progressScore?: number;
    strengths?: string;
    weaknesses?: string;
    feedback?: string;
    decision?: string;
    decisionReason?: string;
    evaluationDate?: string;
    createdAt?: string;
    updatedAt?: string;
    mentor?: {
        id?: string;
        fullName?: string;
    };
    mentorName?: string;
};

type PhaseConfig = {
    key: PhaseKey;
    label: string;
    shortLabel: string;
    color: string;
    background: string;
    icon: ReactNode;
};

const PHASE_CONFIG: PhaseConfig[] = [
    {
        key: 'phase1',
        label: 'Giai đoạn đào tạo',
        shortLabel: 'Giai đoạn đào tạo',
        color: '#1D4ED8',
        background: '#EFF6FF',
        icon: <ClockCircleOutlined />
    },
    {
        key: 'phase2',
        label: 'Giai đoạn tham gia dự án',
        shortLabel: 'Giai đoạn tham gia dự án',
        color: '#059669',
        background: '#ECFDF5',
        icon: <TeamOutlined />
    },
    {
        key: 'final',
        label: 'Giai đoạn cuối',
        shortLabel: 'Giai đoạn cuối',
        color: '#D97706',
        background: '#FFF7ED',
        icon: <TrophyOutlined />
    }
];

const normalizePhaseKey = (phaseType?: string): PhaseKey | null => {
    const normalizedValue = String(phaseType || '')
        .trim()
        .toLowerCase();

    if (['probation', 'phase1', 'phase_1', 'trial', 'gd1', 'giai-doan-1'].includes(normalizedValue)) {
        return 'phase1';
    }

    if (['mid-term', 'midterm', 'phase2', 'phase_2', 'project', 'gd2', 'giai-doan-2'].includes(normalizedValue)) {
        return 'phase2';
    }

    if (['final', 'final-term', 'phase3', 'phase_3', 'gd-cuoi', 'giai-doan-cuoi'].includes(normalizedValue)) {
        return 'final';
    }

    return null;
};

const normalizeStatus = (status?: string) => String(status || '').trim().toLowerCase();

const getStatusMeta = (status?: string, hasEvaluation = false) => {
    const normalizedStatus = normalizeStatus(status);

    if (normalizedStatus === 'completed') {
        return {
            color: 'success' as const,
            label: 'Đã đánh giá'
        };
    }

    if (normalizedStatus === 'draft') {
        return {
            color: 'gold' as const,
            label: 'Bản nháp'
        };
    }

    if (hasEvaluation) {
        return {
            color: 'processing' as const,
            label: 'Đang cập nhật'
        };
    }

    return {
        color: 'default' as const,
        label: 'Chưa có đánh giá'
    };
};

const getRecordTimestamp = (evaluation?: EvaluationRecord) => {
    if (!evaluation) {
        return 0;
    }

    const source = evaluation.updatedAt || evaluation.evaluationDate || evaluation.createdAt;
    const timestamp = source ? new Date(source).getTime() : 0;
    return Number.isNaN(timestamp) ? 0 : timestamp;
};

const getPreferredEvaluation = (evaluations: EvaluationRecord[], phaseKey: PhaseKey) => {
    const matchedEvaluations = evaluations.filter((evaluation) => normalizePhaseKey(evaluation.type) === phaseKey);

    if (!matchedEvaluations.length) {
        return null;
    }

    return [...matchedEvaluations].sort((firstEvaluation, secondEvaluation) => {
        const firstStatus = normalizeStatus(firstEvaluation.status);
        const secondStatus = normalizeStatus(secondEvaluation.status);

        const firstRank = firstStatus === 'completed' ? 2 : firstStatus === 'draft' ? 1 : 0;
        const secondRank = secondStatus === 'completed' ? 2 : secondStatus === 'draft' ? 1 : 0;

        if (firstRank !== secondRank) {
            return secondRank - firstRank;
        }

        return getRecordTimestamp(secondEvaluation) - getRecordTimestamp(firstEvaluation);
    })[0];
};

const renderReadOnlyBlock = (label: string, value?: string) => (
    <div
        style={{
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '16px',
            background: '#FFFFFF',
            height: '100%'
        }}
    >
        <Text strong style={{ color: '#0F172A', display: 'block', marginBottom: '8px' }}>
            {label}
        </Text>
        <Paragraph style={{ margin: 0, color: value ? '#334155' : '#94A3B8', whiteSpace: 'pre-wrap' }}>
            {value || 'Chưa có nội dung'}
        </Paragraph>
    </div>
);

export const InternEvaluation = () => {
    const { data: internRes, isLoading: isLoadingIntern } = useMeIntern();
    const intern = useMemo(() => (internRes?.data || internRes) as Intern | null, [internRes]);

    const [evaluations, setEvaluations] = useState<EvaluationRecord[]>([]);
    const [isLoadingEvaluations, setIsLoadingEvaluations] = useState(false);
    const [hasEvaluationError, setHasEvaluationError] = useState(false);

    useEffect(() => {
        const internId = String(intern?.id || '');

        if (!internId) {
            setEvaluations([]);
            return;
        }

        let isMounted = true;

        const fetchEvaluations = async () => {
            setIsLoadingEvaluations(true);
            setHasEvaluationError(false);

            try {
                const response = await http.get<{ data?: EvaluationRecord[] } | EvaluationRecord[]>(
                    `/evaluations/intern/${internId}`
                );
                const nextEvaluations = Array.isArray(response) ? response : response?.data || [];

                if (isMounted) {
                    setEvaluations(nextEvaluations);
                }
            } catch {
                if (isMounted) {
                    setEvaluations([]);
                    setHasEvaluationError(true);
                }
            } finally {
                if (isMounted) {
                    setIsLoadingEvaluations(false);
                }
            }
        };

        fetchEvaluations();

        return () => {
            isMounted = false;
        };
    }, [intern?.id]);

    const phaseSummaries = useMemo(
        () =>
            PHASE_CONFIG.map((phase) => {
                const evaluation = getPreferredEvaluation(evaluations, phase.key);
                const statusMeta = getStatusMeta(evaluation?.status, Boolean(evaluation));

                return {
                    ...phase,
                    evaluation,
                    statusMeta
                };
            }),
        [evaluations]
    );

    const mentorName = useMemo(() => {
        const mentorFromIntern = intern?.mentor?.fullName;
        const legacyMentorValue = (intern as Intern & { mentor?: string | { fullName?: string } } | null)?.mentor;

        if (mentorFromIntern) {
            return mentorFromIntern;
        }

        if (typeof legacyMentorValue === 'string') {
            return legacyMentorValue;
        }

        return legacyMentorValue?.fullName || 'Chưa có mentor phụ trách';
    }, [intern]);

    const avatarUrl = (intern?.user?.avatarUrl || (intern as Intern & { avatar?: string } | null)?.avatar) as
        | string
        | undefined;

    const isLoading = isLoadingIntern || isLoadingEvaluations;

    if (isLoading) {
        return (
            <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
                <Skeleton active paragraph={{ rows: 10 }} />
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <Card
                variant='borderless'
                style={{ borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '24px' }}
            >
                <Row align='middle' gutter={[20, 20]}>
                    <Col>
                        <Avatar size={72} src={avatarUrl}>
                            {intern?.user?.fullName?.[0] || 'T'}
                        </Avatar>
                    </Col>
                    <Col flex='1'>
                        <Space direction='vertical' size={6} style={{ width: '100%' }}>
                            <Tag color='blue' style={{ width: 'fit-content' }}>
                                Đánh giá của mentor
                            </Tag>
                            <Title level={3} style={{ margin: 0 }}>
                                {intern?.user?.fullName || (intern as Intern & { name?: string } | null)?.name || 'Thực tập sinh'}
                            </Title>
                            <Space wrap size={[8, 8]}>
                                <Tag>{intern?.track || 'Chưa có chuyên ngành'}</Tag>
                                <Tag icon={<UserOutlined />}>{mentorName}</Tag>
                            </Space>
                        </Space>
                    </Col>
                </Row>
            </Card>

            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                {phaseSummaries.map((phase) => (
                    <Col xs={24} md={8} key={phase.key}>
                        <Card
                            variant='borderless'
                            style={{
                                borderRadius: '12px',
                                border: `1px solid ${phase.color}22`,
                                background: phase.background,
                                height: '100%'
                            }}
                        >
                            <Space direction='vertical' size={10} style={{ width: '100%' }}>
                                <div
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: phase.color,
                                        color: '#FFFFFF',
                                        fontSize: '18px'
                                    }}
                                >
                                    {phase.icon}
                                </div>
                                <Text strong style={{ color: '#0F172A', fontSize: '16px' }}>
                                    {phase.shortLabel}
                                </Text>
                                <Text type='secondary'>{phase.label}</Text>
                                <Tag color={phase.statusMeta.color} style={{ width: 'fit-content' }}>
                                    {phase.statusMeta.label}
                                </Tag>
                                <Text style={{ color: phase.evaluation?.overallScore != null ? phase.color : '#94A3B8' }}>
                                    {phase.evaluation?.overallScore != null
                                        ? `Điểm tổng: ${phase.evaluation.overallScore}/10`
                                        : ''}
                                </Text>
                            </Space>
                        </Card>
                    </Col>
                ))}
            </Row>

            {hasEvaluationError ? (
                <Card
                    variant='borderless'
                    style={{ borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '24px' }}
                >
                    <Empty description='Không tải được dữ liệu đánh giá. Vui lòng thử lại sau.' />
                </Card>
            ) : null}

            <Space direction='vertical' size={16} style={{ width: '100%' }}>
                {phaseSummaries.map((phase) => {
                    const evaluation = phase.evaluation;
                    const phaseMentorName = evaluation?.mentor?.fullName || evaluation?.mentorName || mentorName;
                    const scoreItems = [
                        {
                            key: 'overall',
                            label: 'Điểm tổng',
                            value: evaluation?.overallScore
                        },
                        {
                            key: 'technical',
                            label: 'Kỹ thuật',
                            value: evaluation?.technicalScore
                        },
                        {
                            key: 'attitude',
                            label: 'Thái độ',
                            value: evaluation?.attitudeScore
                        },
                        {
                            key: 'teamwork',
                            label: 'Làm việc nhóm',
                            value: evaluation?.teamworkScore
                        },
                        {
                            key: 'progress',
                            label: 'Tiến độ',
                            value: evaluation?.progressScore
                        }
                    ].filter((item) => item.value != null);

                    return (
                        <Card
                            key={phase.key}
                            variant='borderless'
                            style={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}
                            title={
                                <Space size={10}>
                                    <span
                                        style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: '10px',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: phase.color,
                                            color: '#FFFFFF'
                                        }}
                                    >
                                        {phase.icon}
                                    </span>
                                    <span>{phase.label}</span>
                                </Space>
                            }
                            extra={<Tag color={phase.statusMeta.color}>{phase.statusMeta.label}</Tag>}
                        >
                            {!evaluation ? (
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description='Chưa có đánh giá cho giai đoạn này'
                                />
                            ) : (
                                <Space direction='vertical' size={16} style={{ width: '100%' }}>
                                    <Space wrap size={[8, 8]}>
                                        <Tag icon={<CalendarOutlined />}>
                                            {evaluation.evaluationDate
                                                ? new Date(evaluation.evaluationDate).toLocaleDateString('vi-VN')
                                                : 'Chưa có ngày đánh giá'}
                                        </Tag>
                                        <Tag icon={<UserOutlined />}>{phaseMentorName}</Tag>
                                        <Tag icon={<FileTextOutlined />}>
                                            {normalizeStatus(evaluation.status) === 'draft'
                                                ? 'Hiển thị từ bản nháp mới nhất'
                                                : 'Hiển thị từ đánh giá đã lưu'}
                                        </Tag>
                                    </Space>

                                    {scoreItems.length ? (
                                        <Row gutter={[12, 12]}>
                                            {scoreItems.map((item) => (
                                                <Col xs={24} sm={12} md={scoreItems.length > 3 ? 8 : 12} key={item.key}>
                                                    <Card
                                                        size='small'
                                                        variant='borderless'
                                                        style={{
                                                            borderRadius: '12px',
                                                            border: '1px solid #E2E8F0',
                                                            background: '#F8FAFC'
                                                        }}
                                                    >
                                                        <Statistic
                                                            title={item.label}
                                                            value={item.value}
                                                            suffix='/10'
                                                            valueStyle={{ color: phase.color, fontSize: '24px' }}
                                                        />
                                                    </Card>
                                                </Col>
                                            ))}
                                        </Row>
                                    ) : null}

                                    <Row gutter={[16, 16]}>
                                        <Col xs={24} md={12}>
                                            {renderReadOnlyBlock('Điểm mạnh', evaluation.strengths)}
                                        </Col>
                                        <Col xs={24} md={12}>
                                            {renderReadOnlyBlock('Điểm cần cải thiện', evaluation.weaknesses)}
                                        </Col>
                                        <Col xs={24}>
                                            {renderReadOnlyBlock('Nhận xét của mentor', evaluation.feedback)}
                                        </Col>
                                        {evaluation.decision || evaluation.decisionReason ? (
                                            <>
                                                <Col xs={24} md={12}>
                                                    {renderReadOnlyBlock('Kết luận', evaluation.decision)}
                                                </Col>
                                                <Col xs={24} md={12}>
                                                    {renderReadOnlyBlock('Lý do kết luận', evaluation.decisionReason)}
                                                </Col>
                                            </>
                                        ) : null}
                                    </Row>
                                </Space>
                            )}
                        </Card>
                    );
                })}
            </Space>
        </div>
    );
};
