import {
    CheckCircleOutlined,
    CloseOutlined,
    SaveOutlined,
    SendOutlined,
    TeamOutlined,
    ClockCircleOutlined,
    TrophyOutlined
} from '@ant-design/icons';
import { Avatar, Button, Card, Col, Form, Input, InputNumber, Row, Space, Spin, Steps, Tag, Typography, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { RouteConfig } from '../../../constants';
import { getProfile } from '../../../services/auth/profile';
import {
    Phase1ModuleEvaluationSummary,
    getPhase1ModuleEvaluations,
    upsertPhase1ModuleEvaluation
} from '../../../services/Internship/moduleAssessments';
import { http } from '../../../utils/http';
import { Phase1ModuleEvaluationBoard } from './components/Phase1ModuleEvaluationBoard';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const DEFAULT_FORM_VALUES = {
    strengths: '',
    improvements: '',
    notes: '',
    overallScore: 7
};

const PHASE_CONFIG = [
    { key: 'Probation', label: 'Giai đoạn đào tạo', color: '#1E40AF', icon: <ClockCircleOutlined /> },
    { key: 'Mid-term', label: 'Giai đoạn tham gia dự án', color: '#059669', icon: <TeamOutlined /> },
    { key: 'Final', label: 'Giai đoạn cuối', color: '#D97706', icon: <TrophyOutlined /> }
];

const formatDisplayDate = (value?: string | null) => {
    if (!value) return null;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date.toLocaleDateString('vi-VN');
};

const getPhase1SummaryDate = (phase1Detail: Phase1ModuleEvaluationSummary | null) => {
    if (phase1Detail?.summaryEvaluation?.evaluationDate) {
        return phase1Detail.summaryEvaluation.evaluationDate;
    }

    const evaluatedDates = (phase1Detail?.modules || [])
        .map((module) => module.evaluation?.evaluatedAt)
        .filter((value): value is string => Boolean(value));

    if (!evaluatedDates.length) {
        return null;
    }

    return evaluatedDates.reduce((latest, current) =>
        new Date(current).getTime() > new Date(latest).getTime() ? current : latest
    );
};

const renderReadonlyPhaseNote = (label: string, value?: string | null) => (
    <div
        style={{
            borderRadius: 16,
            border: '1px solid #D1D5DB',
            background: '#FFFFFF',
            padding: 16,
            height: '100%'
        }}
    >
        <Text strong style={{ color: '#0F172A', display: 'block', marginBottom: 8 }}>
            {label}
        </Text>
        <Paragraph style={{ margin: 0, color: value ? '#334155' : '#94A3B8', whiteSpace: 'pre-wrap' }}>
            {value || 'Chưa có nội dung'}
        </Paragraph>
    </div>
);

export const MentorEvaluationV2 = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const [form] = Form.useForm();
    const [currentStep, setCurrentStep] = useState(0);
    const [internData, setInternData] = useState<any>(null);
    const [mentorProfile, setMentorProfile] = useState<any>(null);
    const [evaluations, setEvaluations] = useState<any[]>([]);
    const [phase1Detail, setPhase1Detail] = useState<Phase1ModuleEvaluationSummary | null>(null);
    const [isInternLoading, setIsInternLoading] = useState(false);
    const [isEvalLoading, setIsEvalLoading] = useState(false);
    const [isPhase1Loading, setIsPhase1Loading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchIntern = async () => {
        if (!id) return;
        setIsInternLoading(true);
        try {
            const res = await http.get(`/interns/${id}`);
            setInternData(res);
        } finally {
            setIsInternLoading(false);
        }
    };

    const fetchEvaluations = async () => {
        if (!id) return;
        setIsEvalLoading(true);
        try {
            const res = await http.get(`/evaluations/intern/${id}`);
            setEvaluations(Array.isArray(res) ? res : res?.data || []);
        } finally {
            setIsEvalLoading(false);
        }
    };

    const fetchPhase1Detail = async () => {
        if (!id) return;
        setIsPhase1Loading(true);
        try {
            const res = await getPhase1ModuleEvaluations(id);
            setPhase1Detail(res?.data || null);
        } finally {
            setIsPhase1Loading(false);
        }
    };

    useEffect(() => {
        fetchIntern();
        fetchEvaluations();
        fetchPhase1Detail();
    }, [id]);

    useEffect(() => {
        getProfile().then((res) => setMentorProfile((res as any)?.data || res)).catch(() => undefined);
    }, []);

    const getCompletedEvalByPhase = (phase: string) => evaluations.find((e) => e.type === phase && e.status === 'completed');
    const getDraftEvalByPhase = (phase: string) => evaluations.find((e) => e.type === phase && e.status === 'draft');
    const getFormSourceByPhase = (phase: string) => getDraftEvalByPhase(phase) ?? getCompletedEvalByPhase(phase) ?? evaluations.find((e) => e.type === phase);
    const requestedPhase = searchParams.get('phase');
    const requestedStep = useMemo(() => PHASE_CONFIG.findIndex((phase) => phase.key === requestedPhase), [requestedPhase]);
    const phase2CompletedEvaluation = useMemo(
        () => evaluations.find((evaluation) => evaluation.type === 'Mid-term' && evaluation.status === 'completed') || null,
        [evaluations]
    );
    const phase1ScoreSummary = useMemo(
        () => ({
            score: phase1Detail?.averageScore ?? null,
            date: getPhase1SummaryDate(phase1Detail)
        }),
        [phase1Detail]
    );
    const isPhase1Completed = useMemo(
        () =>
            Boolean(phase1Detail?.isAverageReady) ||
            phase1Detail?.summaryEvaluation?.status === 'completed' ||
            Boolean(getCompletedEvalByPhase('Probation')),
        [phase1Detail, evaluations]
    );
    const isPhase2Completed = useMemo(() => Boolean(getCompletedEvalByPhase('Mid-term')), [evaluations]);
    const hasFinalEvaluation = useMemo(() => Boolean(getFormSourceByPhase('Final')), [evaluations]);
    const canAccessFinalStep = (isPhase1Completed && isPhase2Completed) || hasFinalEvaluation;

    useEffect(() => {
        if (requestedStep === -1) {
            return;
        }

        if (PHASE_CONFIG[requestedStep]?.key === 'Final' && !canAccessFinalStep) {
            const fallbackStep = !isPhase1Completed ? 0 : 1;
            setCurrentStep(fallbackStep);
            return;
        }

        setCurrentStep(requestedStep);
    }, [id, requestedStep, canAccessFinalStep, isPhase1Completed]);

    useEffect(() => {
        if (requestedStep !== -1) {
            return;
        }

        const firstIncompleteStep = PHASE_CONFIG.findIndex((phase) => {
            if (phase.key === 'Probation') {
                return !isPhase1Completed;
            }

            if (phase.key === 'Final') {
                return !getCompletedEvalByPhase(phase.key) && canAccessFinalStep;
            }

            return !getCompletedEvalByPhase(phase.key);
        });
        setCurrentStep(firstIncompleteStep === -1 ? PHASE_CONFIG.length - 1 : firstIncompleteStep);
    }, [evaluations, requestedStep, canAccessFinalStep, isPhase1Completed]);

    useEffect(() => {
        const phaseKey = PHASE_CONFIG[currentStep]?.key;
        if (!phaseKey || phaseKey === 'Probation') {
            return;
        }

        const evaluation = getFormSourceByPhase(phaseKey);
        form.setFieldsValue({
            strengths: evaluation?.strengths ?? DEFAULT_FORM_VALUES.strengths,
            improvements: evaluation?.weaknesses ?? DEFAULT_FORM_VALUES.improvements,
            notes: evaluation?.feedback ?? DEFAULT_FORM_VALUES.notes,
            overallScore: evaluation?.overallScore ?? DEFAULT_FORM_VALUES.overallScore
        });
    }, [currentStep, evaluations, form]);

    const currentPhase = PHASE_CONFIG[currentStep] || PHASE_CONFIG[0];
    const handleStepChange = (nextStep: number) => {
        if (PHASE_CONFIG[nextStep]?.key === 'Final' && !canAccessFinalStep) {
            message.warning('Cần hoàn tất giai đoạn đào tạo và giai đoạn tham gia dự án trước khi đánh giá giai đoạn cuối.');
            return;
        }

        setCurrentStep(nextStep);
    };

    const submitEvaluation = async (status: 'draft' | 'completed', values: any) => {
        if (!id) return;
        if (currentPhase.key === 'Final' && !canAccessFinalStep) {
            message.warning('Cần hoàn tất giai đoạn đào tạo và giai đoạn tham gia dự án trước khi đánh giá giai đoạn cuối.');
            return;
        }
        setIsProcessing(true);
        try {
            await http.post('/evaluations', {
                internId: id,
                mentorId: mentorProfile?.id,
                type: currentPhase.key,
                overallScore: values.overallScore,
                strengths: values.strengths,
                weaknesses: values.improvements,
                feedback: values.notes,
                status
            });
            message.success(status === 'draft' ? 'Đã lưu nháp' : 'Đã lưu đánh giá');
            await fetchEvaluations();
        } catch {
            message.error('Không thể lưu đánh giá');
        } finally {
            setIsProcessing(false);
        }
    };

    const onFinish = async (values: any) => {
        await submitEvaluation('completed', values);
    };

    const onSaveDraft = async () => {
        await submitEvaluation('draft', { ...DEFAULT_FORM_VALUES, ...form.getFieldsValue(true) });
    };

    const handleSavePhase1Module = async (moduleId: string, values: { score?: number | null; feedback?: string }) => {
        if (!id) return;
        if (values.score === undefined || values.score === null) {
            message.warning('Hãy nhập điểm cho học phần này.');
            return;
        }

        setIsProcessing(true);
        try {
            const res = await upsertPhase1ModuleEvaluation(id, moduleId, {
                score: values.score,
                feedback: values.feedback,
                status: 'completed'
            });
            setPhase1Detail(res?.data || null);
            await fetchEvaluations();
            message.success('Đã lưu chấm điểm học phần');
        } catch {
            message.error('Không thể lưu chấm điểm học phần');
        } finally {
            setIsProcessing(false);
        }
    };

    if (isInternLoading) {
        return (
            <div style={{ padding: '100px', textAlign: 'center' }}>
                <Spin size='large' />
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', maxWidth: '1180px', margin: '0 auto', paddingBottom: currentPhase.key === 'Probation' ? '24px' : '100px' }}>
            <Card bordered={false} style={{ borderRadius: 12, marginBottom: 24, border: '1px solid #E2E8F0' }}>
                <Row align='middle' gutter={24} justify='space-between'>
                    <Col>
                        <Avatar size={80} src={internData?.user?.avatarUrl || internData?.avatar} />
                    </Col>
                    <Col flex='1'>
                        <Title level={3} style={{ margin: 0 }}>
                            {internData?.user?.fullName || internData?.name}
                        </Title>
                        <Text type='secondary'>{internData?.track}</Text>
                    </Col>
                    <Col>
                        <Button type='text' shape='circle' size='large' icon={<CloseOutlined />} onClick={() => navigate(RouteConfig.MentorInternList.path)} />
                    </Col>
                </Row>
            </Card>

            <Card bordered={false} style={{ borderRadius: 12, border: '1px solid #E2E8F0', marginBottom: 24 }}>
                <Steps
                    current={currentStep}
                    onChange={handleStepChange}
                    items={PHASE_CONFIG.map((phase, index) => ({
                        title: phase.label,
                        disabled: phase.key === 'Final' && !canAccessFinalStep,
                        icon: getCompletedEvalByPhase(phase.key) ? <CheckCircleOutlined /> : index === 2 ? <TrophyOutlined /> : undefined
                    }))}
                />
            </Card>

            {currentPhase.key === 'Probation' ? (
                <Phase1ModuleEvaluationBoard
                    modules={phase1Detail?.modules || []}
                    isLoading={isEvalLoading || isPhase1Loading}
                    readOnly={false}
                    averageScore={phase1Detail?.averageScore}
                    isAverageReady={phase1Detail?.isAverageReady}
                    onSaveModuleEvaluation={handleSavePhase1Module}
                />
            ) : (
                <Form form={form} layout='vertical' onFinish={onFinish}>
                    {currentPhase.key === 'Final' ? (
                        <Card bordered={false} style={{ borderRadius: 12, border: '1px solid #E2E8F0', marginBottom: 24 }}>
                            <Text strong style={{ fontSize: '18px', color: '#0F172A' }}>
                                Điểm các giai đoạn trước
                            </Text>
                            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                                <Col xs={24} md={12}>
                                    <div
                                        style={{
                                            borderRadius: 16,
                                            border: '1px solid #BFDBFE',
                                            background: '#EFF6FF',
                                            padding: 20,
                                            height: '100%'
                                        }}
                                    >
                                        <Text strong style={{ color: '#1D4ED8', fontSize: '16px' }}>
                                            Giai đoạn đào tạo
                                        </Text>
                                        <Title level={2} style={{ margin: '12px 0 4px', color: '#1E3A8A' }}>
                                            {phase1ScoreSummary.score != null ? `${phase1ScoreSummary.score}/10` : '--'}
                                        </Title>
                                        <Text type='secondary'>
                                            {formatDisplayDate(phase1ScoreSummary.date) || 'Chưa có ngày đánh giá'}
                                        </Text>
                                    </div>
                                </Col>
                                <Col xs={24} md={12}>
                                    <div
                                        style={{
                                            borderRadius: 16,
                                            border: '1px solid #A7F3D0',
                                            background: '#ECFDF5',
                                            padding: 20,
                                            height: '100%'
                                        }}
                                    >
                                        <Text strong style={{ color: '#059669', fontSize: '16px' }}>
                                            Giai đoạn tham gia dự án
                                        </Text>
                                        <Title level={2} style={{ margin: '12px 0 4px', color: '#047857' }}>
                                            {phase2CompletedEvaluation?.overallScore != null ? `${phase2CompletedEvaluation.overallScore}/10` : '--'}
                                        </Title>
                                        <Text type='secondary'>
                                            {formatDisplayDate(phase2CompletedEvaluation?.evaluationDate || null) || 'Chưa có ngày đánh giá'}
                                        </Text>
                                    </div>
                                </Col>
                            </Row>
                            <div style={{ marginTop: 24 }}>
                                <Text strong style={{ fontSize: '16px', color: '#0F172A' }}>
                                    Đánh giá từ giai đoạn tham gia dự án
                                </Text>
                                <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                                    <Col xs={24} md={8}>
                                        {renderReadonlyPhaseNote('Điểm mạnh', phase2CompletedEvaluation?.strengths)}
                                    </Col>
                                    <Col xs={24} md={8}>
                                        {renderReadonlyPhaseNote('Điểm cần cải thiện', phase2CompletedEvaluation?.weaknesses)}
                                    </Col>
                                    <Col xs={24} md={8}>
                                        {renderReadonlyPhaseNote('Nhận xét', phase2CompletedEvaluation?.feedback)}
                                    </Col>
                                </Row>
                            </div>
                        </Card>
                    ) : null}

                    <Card bordered={false} style={{ borderRadius: 12, border: '1px solid #E2E8F0' }}>
                        <Row gutter={[24, 24]}>
                            <Col xs={24}>
                                <Form.Item label='Điểm mạnh' name='strengths' rules={[{ required: true, message: 'Bắt buộc' }]}>
                                    <TextArea rows={4} />
                                </Form.Item>
                            </Col>
                            <Col xs={24}>
                                <Form.Item label='Điểm cần cải thiện' name='improvements' rules={[{ required: true, message: 'Bắt buộc' }]}>
                                    <TextArea rows={4} />
                                </Form.Item>
                            </Col>
                            <Col xs={24}>
                                <Form.Item label='Mô tả/nhận xét' name='notes' rules={[{ required: true, message: 'Bắt buộc' }]}>
                                    <TextArea rows={4} />
                                </Form.Item>
                            </Col>
                            <Col xs={24}>
                                <Form.Item label='Điểm đánh giá tổng' name='overallScore' rules={[{ required: true, message: 'Bắt buộc' }]}>
                                    <InputNumber min={0} max={10} step={0.5} style={{ width: '100%', maxWidth: 220 }} />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>

                    <div
                        style={{
                            position: 'fixed',
                            bottom: 0,
                            left: 0,
                            width: '100%',
                            padding: '16px 24px',
                            background: 'rgba(255,255,255,0.95)',
                            borderTop: '1px solid #E2E8F0',
                            zIndex: 100,
                            paddingLeft: 280
                        }}
                    >
                        <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'flex', justifyContent: 'flex-end' }}>
                            <Space>
                                <Button icon={<SaveOutlined />} onClick={onSaveDraft} loading={isProcessing}>
                                    Lưu nháp
                                </Button>
                                <Button type='primary' icon={<SendOutlined />} onClick={() => form.submit()} loading={isProcessing}>
                                    Lưu đánh giá
                                </Button>
                            </Space>
                        </div>
                    </div>
                </Form>
            )}
        </div>
    );
};
