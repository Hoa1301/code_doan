import {
    SaveOutlined,
    CheckCircleOutlined,
    TrophyOutlined,
    SendOutlined,
    TeamOutlined,
    ClockCircleOutlined,
    FileTextOutlined,
    LockOutlined,
    CloseOutlined
} from '@ant-design/icons';
import {
    Avatar,
    Button,
    Card,
    Col,
    Form,
    Input,
    Row,
    Slider,
    Space,
    Typography,
    message,
    Divider,
    Tag,
    Steps,
    Spin,
    Empty
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { RouteConfig } from '../../../constants';
import { http } from '../../../utils/http';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getProfile } from '../../../services/auth/profile';

const { Title, Text } = Typography;
const { TextArea } = Input;
const DEFAULT_FORM_VALUES = {
    strengths: '',
    improvements: '',
    notes: '',
    overallScore: 7
};

const PHASE_CONFIG = [
    {
        key: 'Probation',
        label: 'Giai đoạn đào tạo',
        color: '#1E40AF',
        bg: '#EFF6FF',
        icon: <ClockCircleOutlined />
    },
    {
        key: 'Mid-term',
        label: 'Giai đoạn tham gia dự án',
        color: '#059669',
        bg: '#ECFDF5',
        icon: <TeamOutlined />
    },
    {
        key: 'Final',
        label: 'Giai đoạn cuối – Tổng kết',
        color: '#D97706',
        bg: '#FFFBEB',
        icon: <TrophyOutlined />
    }
];

export const MentorEvaluation = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [form] = Form.useForm();
    const [currentStep, setCurrentStep] = useState(0);

    const [internData, setInternData] = useState<any>(null);
    const [isInternLoading, setIsInternLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [mentorProfile, setMentorProfile] = useState<any>(null);
    const [evaluations, setEvaluations] = useState<any[]>([]);
    const [isEvalLoading, setIsEvalLoading] = useState(false);

    const fetchIntern = async () => {
        if (!id) return;
        setIsInternLoading(true);
        try {
            const res = await http.get(`/interns/${id}`);
            setInternData(res);
        } catch (error) {
            console.error(error);
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
        } catch (error) {
            console.error(error);
        } finally {
            setIsEvalLoading(false);
        }
    };

    useEffect(() => {
        fetchIntern();
        fetchEvaluations();
    }, [id]);

    useEffect(() => {
        getProfile().then((res) => setMentorProfile(res)).catch(() => { });
    }, []);

    const getPhaseByStep = (step: number) => PHASE_CONFIG[step] ?? PHASE_CONFIG[0];
    const getEvalByPhase = (phase: string) => evaluations.find((e) => e.type === phase);
    const getCompletedEvalByPhase = (phase: string) => evaluations.find((e) => e.type === phase && e.status === 'completed');
    const getDraftEvalByPhase = (phase: string) => evaluations.find((e) => e.type === phase && e.status === 'draft');
    const getFormSourceByPhase = (phase: string) => getDraftEvalByPhase(phase) ?? getCompletedEvalByPhase(phase) ?? getEvalByPhase(phase);
    const getFormValuesByPhase = (phase: string) => {
        const evaluation = getFormSourceByPhase(phase);

        return {
            strengths: evaluation?.strengths ?? DEFAULT_FORM_VALUES.strengths,
            improvements: evaluation?.weaknesses ?? DEFAULT_FORM_VALUES.improvements,
            notes: evaluation?.feedback ?? DEFAULT_FORM_VALUES.notes,
            overallScore: evaluation?.overallScore ?? DEFAULT_FORM_VALUES.overallScore
        };
    };

    useEffect(() => {
        const firstIncompleteStep = PHASE_CONFIG.findIndex((phase) => !getCompletedEvalByPhase(phase.key));
        setCurrentStep(firstIncompleteStep === -1 ? PHASE_CONFIG.length - 1 : firstIncompleteStep);
    }, [evaluations]);

    useEffect(() => {
        form.setFieldsValue(getFormValuesByPhase(getPhaseByStep(currentStep).key));
    }, [currentStep, evaluations, form]);

    const submitEvaluation = async (status: 'draft' | 'completed', values: any) => {
        if (!id || !internData) return;
        setIsProcessing(true);
        try {
            await http.post('/evaluations', {
                internId: id,
                mentorId: mentorProfile?.id,
                type: getPhaseByStep(currentStep).key as any,
                overallScore: values.overallScore,
                strengths: values.strengths,
                weaknesses: values.improvements,
                feedback: values.notes,
                status,
            });

            message.success(status === 'draft' ? t('eval.draft_saved') : t('common.success'));
            await fetchEvaluations();

            if (status === 'completed' && currentStep === PHASE_CONFIG.length - 1) {
                navigate(RouteConfig.MentorInternList.path);
            }
        } catch {
            message.error(t('common.error'));
        } finally {
            setIsProcessing(false);
        }
    };

    const onFinish = async (values: any) => {
        await submitEvaluation('completed', values);
    };

    const onSaveDraft = async () => {
        await submitEvaluation('draft', {
            ...DEFAULT_FORM_VALUES,
            ...form.getFieldsValue(true)
        });
    };

    const handleBackToMentorInterns = () => {
        navigate(RouteConfig.MentorInternList.path);
    };

    if (isInternLoading) {
        return (
            <div style={{ padding: '100px', textAlign: 'center' }}>
                <Spin size='large' />
            </div>
        );
    }

    const intern = internData;

    // ── Phần tổng hợp tất cả giai đoạn ──
    const renderPhaseSummary = () => (
        <Card
            bordered={false}
            style={{ borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '24px' }}
            title={
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileTextOutlined style={{ color: '#1E40AF' }} />
                    Tổng hợp đánh giá theo giai đoạn
                </span>
            }
        >
            {isEvalLoading ? (
                <div style={{ textAlign: 'center', padding: '24px' }}><Spin /></div>
            ) : (
                <Row gutter={16}>
                    {PHASE_CONFIG.map((phase, idx) => {
                        const eval_ = getEvalByPhase(phase.key);
                        const isCompleted = eval_?.status === 'completed';
                        const isDraft = eval_?.status === 'draft';
                        const isCurrent = idx === currentStep;
                        return (
                            <Col xs={24} md={8} key={phase.key}>
                                <div
                                    style={{
                                        padding: '16px',
                                        borderRadius: '12px',
                                        border: `2px solid ${isCompleted || isDraft ? phase.color : isCurrent ? '#E2E8F0' : '#F1F5F9'}`,
                                        background: isCompleted || isDraft ? phase.bg : '#FAFAFA',
                                        position: 'relative',
                                        height: '100%'
                                    }}
                                >
                                    {/* Header */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                        <div>
                                            <div
                                                style={{
                                                    width: 32, height: 32,
                                                    borderRadius: '8px',
                                                    background: isCompleted || isDraft ? phase.color : '#E2E8F0',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: isCompleted || isDraft ? '#fff' : '#94A3B8',
                                                    marginBottom: '8px'
                                                }}
                                            >
                                                {isCompleted ? <CheckCircleOutlined /> : isDraft ? <SaveOutlined /> : isCurrent ? phase.icon : <LockOutlined />}
                                            </div>
                                            <Text strong style={{ fontSize: '13px', color: isCompleted || isDraft ? phase.color : '#64748B' }}>
                                                {phase.label}
                                            </Text>
                                        </div>
                                        <Tag color={isCompleted ? 'success' : isDraft ? 'gold' : isCurrent ? 'processing' : 'default'}>
                                            {isCompleted ? 'Hoàn thành' : isDraft ? 'Bản nháp' : isCurrent ? 'Đang thực hiện' : 'Chưa đến'}
                                        </Tag>
                                    </div>

                                    {eval_ ? (
                                        <>
                                            <Divider style={{ margin: '8px 0' }} />
                                            {eval_.overallScore != null && (
                                                <div style={{
                                                    marginTop: '12px', padding: '8px 12px',
                                                    background: '#fff', borderRadius: '8px',
                                                    border: `1px solid ${phase.color}`,
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                                }}>
                                                    <Text style={{ fontSize: '12px', color: '#64748B' }}>Điểm tổng</Text>
                                                    <Text strong style={{ fontSize: '18px', color: phase.color }}>
                                                        {eval_.overallScore}/10
                                                    </Text>
                                                </div>
                                            )}
                                            {eval_.strengths ? <Text type='secondary' style={{ display: 'block', marginTop: '8px' }}>Điểm mạnh: {eval_.strengths}</Text> : null}
                                            {eval_.weaknesses ? <Text type='secondary' style={{ display: 'block', marginTop: '4px' }}>Cần cải thiện: {eval_.weaknesses}</Text> : null}
                                            {eval_.feedback ? <Text type='secondary' style={{ display: 'block', marginTop: '4px' }}>Ghi chú: {eval_.feedback}</Text> : null}
                                            <div style={{ marginTop: '8px', fontSize: '11px', color: '#94A3B8' }}>
                                                <ClockCircleOutlined /> {eval_.evaluationDate ? new Date(eval_.evaluationDate).toLocaleDateString('vi-VN') : '--'}
                                                {eval_.mentor?.fullName && ` • ${eval_.mentor.fullName}`}
                                            </div>
                                        </>
                                    ) : (
                                        <div style={{ color: '#94A3B8', fontSize: '12px', marginTop: '8px' }}>
                                            {isCurrent ? 'Sẵn sàng đánh giá bên dưới' : 'Chưa đến giai đoạn này'}
                                        </div>
                                    )}
                                </div>
                            </Col>
                        );
                    })}
                </Row>
            )}
            {evaluations.length === 0 && !isEvalLoading && (
                <Empty description='Chưa có đánh giá nào' style={{ marginTop: '16px' }} />
            )}
        </Card>
    );

    const renderStepContent = () => {
        return (
            <Card bordered={false} style={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <Row gutter={[24, 24]}>
                    <Col xs={24}>
                        <Form.Item
                            label={t('eval.strengths')}
                            name='strengths'
                            rules={[{ required: true, message: t('common.required_field') }]}
                        >
                            <TextArea rows={4} placeholder={t('eval.strengths_placeholder')} />
                        </Form.Item>
                    </Col>
                    <Col xs={24}>
                        <Form.Item
                            label={t('eval.improvements')}
                            name='improvements'
                            rules={[{ required: true, message: t('common.required_field') }]}
                        >
                            <TextArea rows={4} placeholder={t('eval.improvements_placeholder')} />
                        </Form.Item>
                    </Col>
                    <Col xs={24}>
                        <Form.Item
                            label={t('common.description')}
                            name='notes'
                            rules={[{ required: true, message: t('common.required_field') }]}
                        >
                            <TextArea rows={4} placeholder={t('eval.mentor_feedback_placeholder')} />
                        </Form.Item>
                    </Col>
                    <Col xs={24}>
                        <Form.Item
                            label='Điểm đánh giá tổng'
                            name='overallScore'
                            rules={[{ required: true, message: t('common.required_field') }]}
                        >
                            <Slider min={0} max={10} step={1} marks={{ 0: '0', 5: '5', 10: '10' }} />
                        </Form.Item>
                    </Col>
                </Row>
            </Card>
        );
    };

    const completedPhases = PHASE_CONFIG.filter((phase) => Boolean(getCompletedEvalByPhase(phase.key))).length;
    const allDone = completedPhases >= PHASE_CONFIG.length;

    return (
        <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto', paddingBottom: '100px' }}>
            {/* Header card intern */}
            <Card
                bordered={false}
                style={{ borderRadius: '12px', marginBottom: '24px', background: '#fff', border: '1px solid #E2E8F0' }}
            >
                <Row align='middle' gutter={24} justify='space-between'>
                    <Col>
                        <Avatar size={80} src={intern?.user?.avatarUrl || intern?.avatar} />
                    </Col>
                    <Col flex='1'>
                        <Title level={3} style={{ margin: 0 }}>
                            {intern?.user?.fullName || intern?.name}
                        </Title>
                        <Text type='secondary'>{intern?.track}</Text>
                    </Col>
                    <Col>
                        <Button
                            type='text'
                            shape='circle'
                            size='large'
                            icon={<CloseOutlined />}
                            aria-label='Quay về danh sách thực tập sinh'
                            onClick={handleBackToMentorInterns}
                        />
                    </Col>
                </Row>
            </Card>

            {/* Tổng hợp đánh giá theo giai đoạn */}
            {renderPhaseSummary()}

            {/* Form đánh giá mới nếu chưa hoàn tất */}
            {!allDone ? (
                <>
                    <div
                        style={{
                            marginBottom: '32px',
                            background: '#fff',
                            padding: '24px',
                            borderRadius: '12px',
                            border: '1px solid #E2E8F0'
                        }}
                    >
                        <Title level={5} style={{ marginBottom: '16px' }}>
                            Nhập đánh giá – Giai đoạn {currentStep + 1}
                        </Title>
                        <Steps
                            current={currentStep}
                            onChange={(step) => {
                                const firstIncompleteStep = PHASE_CONFIG.findIndex((phase) => !getCompletedEvalByPhase(phase.key));
                                const maxAccessibleStep = firstIncompleteStep === -1 ? PHASE_CONFIG.length - 1 : firstIncompleteStep;

                                if (step <= maxAccessibleStep || Boolean(getCompletedEvalByPhase(PHASE_CONFIG[step].key))) {
                                    setCurrentStep(step);
                                    return;
                                }

                                message.warning('Vui lòng hoàn thành đánh giá giai đoạn trước.');
                            }}
                            items={[
                                { title: t('eval.phase1_title'), description: t('task_mgmt.training'), icon: completedPhases > 0 ? <CheckCircleOutlined /> : undefined },
                                { title: t('eval.phase2_title'), description: t('task_mgmt.project'), icon: completedPhases > 1 ? <CheckCircleOutlined /> : undefined },
                                { title: t('eval.final_title'), description: t('task_mgmt.completed'), icon: completedPhases > 2 ? <TrophyOutlined /> : undefined }
                            ]}
                        />
                    </div>

                    <Form form={form} layout='vertical' onFinish={onFinish}>
                        {renderStepContent()}

                        <div
                            style={{
                                position: 'fixed',
                                bottom: 0, left: 0,
                                width: '100%',
                                padding: '16px 24px',
                                background: 'rgba(255,255,255,0.9)',
                                backdropFilter: 'blur(10px)',
                                borderTop: '1px solid #E2E8F0',
                                zIndex: 100,
                                paddingLeft: 280
                            }}
                        >
                            <div
                                style={{
                                    maxWidth: '1100px',
                                    margin: '0 auto',
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    alignItems: 'center'
                                }}
                            >
                                <Space>
                                    <Button icon={<SaveOutlined />} onClick={onSaveDraft} loading={isProcessing}>
                                        {t('eval.save_draft')}
                                    </Button>
                                    <Button
                                        type='primary'
                                        icon={<SendOutlined />}
                                        size='large'
                                        onClick={() => form.submit()}
                                        loading={isProcessing}
                                    >
                                        {currentStep === 2 ? t('eval.submit_eval') : t('common.save')}
                                    </Button>
                                </Space>
                            </div>
                        </div>
                    </Form>
                </>
            ) : (
                <Card bordered={false} style={{ borderRadius: '12px', border: '1px solid #10B981', background: '#F0FDF4', textAlign: 'center', padding: '32px' }}>
                    <TrophyOutlined style={{ fontSize: '48px', color: '#10B981', marginBottom: '16px' }} />
                    <Title level={4} style={{ color: '#059669' }}>Đã hoàn thành toàn bộ 3 giai đoạn đánh giá</Title>
                    <Text type='secondary'>Tất cả các phiếu đánh giá đã được ghi nhận. Xem tổng hợp bên trên.</Text>
                </Card>
            )}
        </div>
    );
};
