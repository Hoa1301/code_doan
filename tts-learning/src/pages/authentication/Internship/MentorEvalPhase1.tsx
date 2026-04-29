import { SaveOutlined, InfoCircleOutlined } from '@ant-design/icons';
import {
    Avatar,
    Button,
    Card,
    Col,
    Form,
    Input,
    Rate,
    Row,
    Select,
    Space,
    Typography,
    message,
    Divider,
    Tag
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { RouteConfig } from '../../../constants';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { http } from '../../../utils/http';
import { getProfile } from '../../../services/auth/profile';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const MentorEvalPhase1 = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [form] = Form.useForm();

    const [internData, setInternData] = useState<any>(null);
    const [isInternLoading, setIsInternLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [mentorProfile, setMentorProfile] = useState<any>(null);

    useEffect(() => {
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
        fetchIntern();
    }, [id]);

    useEffect(() => {
        getProfile().then((res) => setMentorProfile(res)).catch(() => { });
    }, []);

    const onFinish = async (values: any) => {
        if (!id || !internData) return;

        setIsProcessing(true);
        try {
            await http.post('/evaluations', {
                internId: id,
                internName: internData.user?.fullName || internData.name,
                mentorId: mentorProfile?.id,
                mentorName: mentorProfile?.fullName,
                type: 'Probation', // Phase 1
                attitudeScore: Math.round(((values.learningSpeed + values.punctuality) / 2) * 2),
                technicalScore: Math.round(values.codeQuality * 2),
                teamworkScore: Math.round(values.communication * 2),
                feedback: values.strengths ? `${values.strengths}\n\nImprovements: ${values.improvements}` : values.improvements,
                date: new Date().toISOString()
            });

            message.success(t('common.success'));
            navigate(RouteConfig.InternList.path);
        } catch {
            message.error(t('common.error'));
        } finally {
            setIsProcessing(false);
        }
    };

    if (isInternLoading) {
        return (
            <div style={{ padding: '24px', textAlign: 'center' }}>
                <Typography.Text>{t('common.loading')}</Typography.Text>
            </div>
        );
    }

    const intern = internData;

    return (
        <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px'
                }}
            >
                <Space align='center'>
                    <Title level={3} style={{ margin: 0 }}>
                        {t('eval.phase1_title')}
                    </Title>
                </Space>
                <Space>
                    <Button icon={<SaveOutlined />} onClick={() => message.info(t('eval.draft_saved'))}>
                        {t('eval.save_draft')}
                    </Button>
                    <Button type='primary' onClick={() => form.submit()} loading={isProcessing}>
                        {t('eval.submit_eval')}
                    </Button>
                </Space>
            </div>

            <Card bordered={false} style={{ borderRadius: '12px', marginBottom: '24px', background: '#e6f7ff' }}>
                <Row align='middle' gutter={24}>
                    <Col>
                        <Avatar size={64} src={intern?.user?.avatarUrl || intern?.avatar} />
                    </Col>
                    <Col flex='1'>
                        <Title level={4} style={{ margin: 0 }}>
                            {intern?.user?.fullName || intern?.name}
                        </Title>
                        <Text type='secondary'>
                            {intern?.track} • {intern?.id}
                        </Text>
                        <div style={{ marginTop: '4px' }}>
                            <Tag color='blue'>Xét duyệt tháng 1-2</Tag>
                            <Tag color='cyan'>Giai đoạn đào tạo</Tag>
                        </div>
                    </Col>
                </Row>
            </Card>

            <Form form={form} layout='vertical' onFinish={onFinish}>
                <Card
                    title={t('eval.core_perf')}
                    bordered={false}
                    style={{ borderRadius: '12px', marginBottom: '24px' }}
                >
                    <Row gutter={48}>
                        <Col span={12}>
                            <Form.Item
                                label={t('eval.learning_speed')}
                                name='learningSpeed'
                                rules={[{ required: true }]}
                            >
                                <Rate allowHalf />
                            </Form.Item>
                            <Text type='secondary' style={{ fontSize: '12px' }}>
                                {t('eval.learning_speed_desc')}
                            </Text>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label={t('candidate.communication')}
                                name='communication'
                                rules={[{ required: true }]}
                            >
                                <Rate allowHalf />
                            </Form.Item>
                            <Text type='secondary' style={{ fontSize: '12px' }}>
                                {t('eval.communication_desc')}
                            </Text>
                        </Col>
                    </Row>
                    <Divider />
                    <Row gutter={48}>
                        <Col span={12}>
                            <Form.Item label={t('eval.punctuality')} name='punctuality' rules={[{ required: true }]}>
                                <Rate allowHalf />
                            </Form.Item>
                            <Text type='secondary' style={{ fontSize: '12px' }}>
                                {t('eval.punctuality_desc')}
                            </Text>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={t('eval.code_quality')} name='codeQuality' rules={[{ required: true }]}>
                                <Rate allowHalf />
                            </Form.Item>
                            <Text type='secondary' style={{ fontSize: '12px' }}>
                                {t('eval.code_quality_desc')}
                            </Text>
                        </Col>
                    </Row>
                </Card>

                <Card
                    title={t('eval.detailed_assessment')}
                    bordered={false}
                    style={{ borderRadius: '12px', marginBottom: '24px' }}
                >
                    <Form.Item
                        label={t('eval.strengths')}
                        name='strengths'
                        rules={[{ required: true, message: t('common.required_field') }]}
                    >
                        <TextArea rows={3} placeholder={t('eval.strengths_placeholder')} />
                    </Form.Item>

                    <Form.Item
                        label={t('eval.improvements')}
                        name='improvements'
                        rules={[{ required: true, message: t('common.required_field') }]}
                    >
                        <TextArea rows={3} placeholder={t('eval.improvements_placeholder')} />
                    </Form.Item>
                </Card>

                <Card title={t('eval.recommendation')} bordered={false} style={{ borderRadius: '12px' }}>
                    <Form.Item label={t('eval.proceed_q')} name='proceedToPhase2' rules={[{ required: true }]}>
                        <Select
                            options={[
                                { value: 'yes', label: t('eval.ready_projects') },
                                { value: 'extended_training', label: t('eval.extended_training') },
                                { value: 'no', label: t('eval.not_meeting') }
                            ]}
                        />
                    </Form.Item>
                    <div
                        style={{
                            background: '#f6ffed',
                            padding: '16px',
                            borderRadius: '8px',
                            border: '1px solid #b7eb8f'
                        }}
                    >
                        <Space>
                            <InfoCircleOutlined style={{ color: '#10B981' }} />
                            <Text>{t('eval.advancing_info')}</Text>
                        </Space>
                    </div>
                </Card>
            </Form>
        </div>
    );
};
