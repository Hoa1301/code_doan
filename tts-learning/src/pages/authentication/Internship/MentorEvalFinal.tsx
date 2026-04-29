import {
    CheckCircleOutlined,
    HistoryOutlined,
    IdcardOutlined,
    LineChartOutlined,
    RightOutlined,
    SaveOutlined,
    SendOutlined,
    TeamOutlined,
    TrophyOutlined
} from '@ant-design/icons';
import {
    Avatar,
    Button,
    Card,
    Col,
    Collapse,
    Input,
    Layout,
    Progress,
    Radio,
    Row,
    Select,
    Space,
    Tag,
    Typography,
    Form,
    message,
    Spin
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { http } from '../../../utils/http';
import { RouteConfig } from '../../../constants';
import { getProfile } from '../../../services/auth/profile';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

export const MentorEvalFinal = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [form] = Form.useForm();

    const [internData, setInternData] = useState<any>(null);
    const [isInternLoading, setIsInternLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [mentorProfile, setMentorProfile] = useState<any>(null);

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

    useEffect(() => {
        fetchIntern();
    }, [id]);

    useEffect(() => {
        getProfile().then((res) => setMentorProfile(res)).catch(() => { });
    }, []);

    const onFinish = async (values: any) => {
        if (!id || !internData) return;

        setIsProcessing(true);
        try {
            // Calculate an average score from the radio groups
            const technicalScores = [values.codeQuality, values.architecture, values.tooling];
            const softSkillScores = [values.attitude, values.communication, values.teamwork];
            const allScores = [...technicalScores, ...softSkillScores].filter((s) => s !== undefined);

            const avgScore =
                allScores.length > 0
                    ? (allScores.reduce((a, b) => a + b, 0) / allScores.length) * 2 // Map 5 stars to 10 points
                    : 0;

            await http.post('/evaluations', {
                internId: id,
                internName: internData.user?.fullName || internData.name,
                mentorId: mentorProfile?.id,
                mentorName: mentorProfile?.fullName,
                type: 'Final',
                decision: values.recommendation,
                technicalScore: Math.round(
                    (technicalScores.filter(Boolean).reduce((a, b) => a + b, 0) /
                        (technicalScores.filter(Boolean).length || 1)) * 2
                ),
                attitudeScore: Math.round(
                    (softSkillScores.filter(Boolean).reduce((a, b) => a + b, 0) /
                        (softSkillScores.filter(Boolean).length || 1)) * 2
                ),
                feedback: `Recommendation: ${values.recommendation}${values.hrNote ? '\n\nHR Note: ' + values.hrNote : ''}`,
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
            <div style={{ padding: '100px', textAlign: 'center' }}>
                <Spin size='large' />
            </div>
        );
    }

    const intern = internData;

    return (
        <Layout style={{ minHeight: '100vh', background: '#f6f7f8' }}>
            <Content style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', paddingBottom: '100px' }}>
                <div
                    style={{
                        marginBottom: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#64748B',
                        fontSize: '14px'
                    }}
                >
                    <span style={{ cursor: 'pointer' }} onClick={() => navigate(RouteConfig.InternList.path)}>
                        Thực tập sinh
                    </span>
                    <RightOutlined style={{ fontSize: '10px' }} />
                    <span style={{ cursor: 'pointer' }}>Đánh giá</span>
                    <RightOutlined style={{ fontSize: '10px' }} />
                    <span style={{ color: '#1E40AF', fontWeight: 600 }}>Đánh giá cuối kỳ</span>
                </div>

                <Card
                    bordered={false}
                    style={{ borderRadius: '12px', marginBottom: '24px', border: '1px solid #E2E8F0' }}
                >
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '24px'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                            <div style={{ position: 'relative' }}>
                                <Avatar
                                    size={96}
                                    src={intern?.user?.avatarUrl || intern?.avatar || 'https://i.pravatar.cc/150'}
                                    shape='square'
                                    style={{ borderRadius: '12px' }}
                                />
                                <div
                                    style={{
                                        position: 'absolute',
                                        bottom: -4,
                                        right: -4,
                                        width: 16,
                                        height: 16,
                                        background: intern?.status === 'active' ? '#10B981' : '#E2E8F0',
                                        borderRadius: '50%',
                                        border: '2px solid #fff'
                                    }}
                                ></div>
                            </div>
                            <div>
                                <Title level={2} style={{ margin: 0, marginBottom: '4px' }}>
                                    {intern?.user?.fullName || intern?.name}
                                </Title>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        color: '#64748B',
                                        fontSize: '14px',
                                        marginBottom: '8px'
                                    }}
                                >
                                    <span>
                                        <IdcardOutlined /> {intern?.track} Thực tập sinh
                                    </span>
                                    <span>•</span>
                                    <span>
                                        {intern?.startDate} - {intern?.endDate}
                                    </span>
                                </div>
                                <Tag color='blue' style={{ borderRadius: '12px' }}>
                                    Phòng kỹ thuật
                                </Tag>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right', borderLeft: '1px solid #E2E8F0', paddingLeft: '24px' }}>
                            <Text
                                type='secondary'
                                style={{
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    fontWeight: 600,
                                    display: 'block'
                                }}
                            >
                                Tiến độ tổng thể
                            </Text>
                            <Text strong style={{ fontSize: '18px' }}>
                                {intern?.overallProgress ?? 0}% Hoàn thành
                            </Text>
                            <Progress percent={intern?.overallProgress ?? 0} size='small' status='active' />
                        </div>
                    </div>
                </Card>

                <Row gutter={16} style={{ marginBottom: '24px' }}>
                    <Col span={12}>
                        <Card
                            bordered={false}
                            style={{
                                borderRadius: '12px',
                                border: '1px solid #E2E8F0',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <HistoryOutlined
                                style={{
                                    position: 'absolute',
                                    top: 16,
                                    right: 16,
                                    fontSize: '64px',
                                    color: '#f3f4f6',
                                    zIndex: 0
                                }}
                            />
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <Text
                                        type='secondary'
                                        style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 600 }}
                                    >
                                        Điểm giữa kỳ
                                    </Text>
                                    <CheckCircleOutlined style={{ color: '#10B981' }} />
                                </div>
                                <div style={{ marginBottom: '4px' }}>
                                    <span style={{ fontSize: '32px', fontWeight: 700 }}>8.2</span>
                                    <span style={{ fontSize: '18px', color: '#9ca3af' }}>/10</span>
                                </div>
                                <Text type='success' style={{ fontWeight: 500 }}>
                                    <LineChartOutlined /> Đúng tiến độ
                                </Text>
                            </div>
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card
                            bordered={false}
                            style={{
                                borderRadius: '12px',
                                border: '1px solid #E2E8F0',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <HistoryOutlined
                                style={{
                                    position: 'absolute',
                                    top: 16,
                                    right: 16,
                                    fontSize: '64px',
                                    color: '#f3f4f6',
                                    zIndex: 0
                                }}
                            />
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <Text
                                        type='secondary'
                                        style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 600 }}
                                    >
                                        Giai đoạn dự án
                                    </Text>
                                    <CheckCircleOutlined style={{ color: '#10B981' }} />
                                </div>
                                <div style={{ marginBottom: '4px' }}>
                                    <span style={{ fontSize: '32px', fontWeight: 700 }}>9.4</span>
                                    <span style={{ fontSize: '18px', color: '#9ca3af' }}>/10</span>
                                </div>
                                <Text type='success' style={{ fontWeight: 500 }}>
                                    <TrophyOutlined /> Vượt kỳ vọng
                                </Text>
                            </div>
                        </Card>
                    </Col>
                </Row>

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '16px'
                    }}
                >
                    <Title level={3} style={{ margin: 0 }}>
                        Mẫu đánh giá cuối kỳ
                    </Title>
                    <Tag style={{ borderRadius: '12px', padding: '4px 12px' }}>Bản nhiớm đã lưu gần đây</Tag>
                </div>

                <Form
                    form={form}
                    layout='vertical'
                    onFinish={onFinish}
                    initialValues={{
                        codeQuality: 4,
                        architecture: 3,
                        tooling: 5,
                        attitude: 5,
                        communication: 4,
                        teamwork: 4
                    }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                        <Collapse
                            defaultActiveKey={['1', '2']}
                            expandIconPosition='end'
                            style={{ background: 'transparent', border: 'none' }}
                            items={[
                                {
                                    key: '1',
                                    label: (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div
                                                style={{
                                                    width: 40,
                                                    height: 40,
                                                    background: '#e6f7ff',
                                                    borderRadius: '8px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#1E40AF'
                                                }}
                                            >
                                                <TeamOutlined />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '16px' }}>
                                                    Thái độ & Kỹ năng mềm
                                                </div>
                                                <div style={{ fontSize: '14px', color: '#64748B' }}>
                                                    Sự đúng giờ, chủ động và văn hóa làm việc.
                                                </div>
                                            </div>
                                        </div>
                                    ),
                                    style: {
                                        background: '#fff',
                                        borderRadius: '12px',
                                        border: '1px solid #E2E8F0',
                                        overflow: 'hidden',
                                        marginBottom: '16px'
                                    },
                                    children: (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                            <Form.Item name='attitude' label='Thái độ & Tính chủ động'>
                                                <Radio.Group buttonStyle='solid'>
                                                    {[1, 2, 3, 4, 5].map((v) => (
                                                        <Radio.Button key={v} value={v}>
                                                            {v}
                                                        </Radio.Button>
                                                    ))}
                                                </Radio.Group>
                                            </Form.Item>
                                            <Form.Item name='communication' label='Kỹ năng giao tiếp'>
                                                <Radio.Group buttonStyle='solid'>
                                                    {[1, 2, 3, 4, 5].map((v) => (
                                                        <Radio.Button key={v} value={v}>
                                                            {v}
                                                        </Radio.Button>
                                                    ))}
                                                </Radio.Group>
                                            </Form.Item>
                                            <Form.Item name='teamwork' label='Làm việc nhóm & Hợp tác'>
                                                <Radio.Group buttonStyle='solid'>
                                                    {[1, 2, 3, 4, 5].map((v) => (
                                                        <Radio.Button key={v} value={v}>
                                                            {v}
                                                        </Radio.Button>
                                                    ))}
                                                </Radio.Group>
                                            </Form.Item>
                                        </div>
                                    )
                                },
                                {
                                    key: '2',
                                    label: (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div
                                                style={{
                                                    width: 40,
                                                    height: 40,
                                                    background: '#1E40AF',
                                                    borderRadius: '8px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#fff'
                                                }}
                                            >
                                                <CheckCircleOutlined />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '16px' }}>
                                                    Năng lực kỹ thuật
                                                </div>
                                                <div style={{ fontSize: '14px', color: '#64748B' }}>
                                                    Chất lượng mã, thành thạo công cụ và giải quyết vấn đề.
                                                </div>
                                            </div>
                                        </div>
                                    ),
                                    style: {
                                        background: '#fff',
                                        borderRadius: '12px',
                                        border: '1px solid #E2E8F0',
                                        overflow: 'hidden',
                                        marginBottom: '16px'
                                    },
                                    children: (
                                        <div
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '32px',
                                                padding: '16px 0'
                                            }}
                                        >
                                            {[
                                                {
                                                    name: 'codeQuality',
                                                    title: 'Chất lượng mã & Tiêu chuẩn',
                                                    desc: 'Tuân thủ quy tắc viết code, dễ đọc và comment rõ ràng.'
                                                },
                                                {
                                                    name: 'architecture',
                                                    title: 'Kiến trúc & Thiết kế',
                                                    desc: 'Khả năng hiểu thiết kế hệ thống và đóng góp vào quyết định kiến trúc.'
                                                },
                                                {
                                                    name: 'tooling',
                                                    title: 'Thành thạo công cụ',
                                                    desc: 'Sử dụng thành thạo Git, Docker, CI/CD và IDE.'
                                                }
                                            ].map((item, i) => (
                                                <div
                                                    key={i}
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'flex-start',
                                                        borderBottom: i < 2 ? '1px solid #E2E8F0' : 'none',
                                                        paddingBottom: i < 2 ? '24px' : 0
                                                    }}
                                                >
                                                    <div style={{ maxWidth: '300px' }}>
                                                        <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                                                            {item.title}
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: '#64748B' }}>
                                                            {item.desc}
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <Text
                                                            type='secondary'
                                                            style={{ fontSize: '12px', textTransform: 'uppercase' }}
                                                        >
                                                            Poor
                                                        </Text>
                                                        <Form.Item name={item.name} noStyle>
                                                            <Radio.Group buttonStyle='solid'>
                                                                {[1, 2, 3, 4, 5].map((val) => (
                                                                    <Radio.Button
                                                                        key={val}
                                                                        value={val}
                                                                        style={{
                                                                            width: 40,
                                                                            textAlign: 'center',
                                                                            borderRadius: '8px',
                                                                            margin: '0 4px',
                                                                            border: '1px solid #E2E8F0'
                                                                        }}
                                                                    >
                                                                        {val}
                                                                    </Radio.Button>
                                                                ))}
                                                            </Radio.Group>
                                                        </Form.Item>
                                                        <Text
                                                            type='secondary'
                                                            style={{ fontSize: '12px', textTransform: 'uppercase' }}
                                                        >
                                                            Excellent
                                                        </Text>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )
                                }
                            ]}
                        />
                    </div>

                    <Card bordered={false} style={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', alignItems: 'start', gap: '16px', marginBottom: '24px' }}>
                            <TrophyOutlined style={{ fontSize: '32px', color: '#1E40AF' }} />
                            <div>
                                <Title level={4} style={{ margin: 0 }}>
                                    Đề xuất cuối cùng
                                </Title>
                                <Text type='secondary'>
                                    Quyết định này sẽ được chuyển tới bộ phận HR để xử lý.
                                </Text>
                            </div>
                        </div>

                        <Row gutter={32}>
                            <Col span={12}>
                                <Form.Item
                                    label={<Text strong>Quyết định đề xuất</Text>}
                                    name='recommendation'
                                    rules={[{ required: true }]}
                                >
                                    <Select placeholder='Chọn kết quả...' style={{ width: '100%' }} size='large'>
                                        <Select.Option value='hire'>Tuyển chính thức</Select.Option>
                                        <Select.Option value='extend'>Gia hạn thực tập (3 tháng)</Select.Option>
                                        <Select.Option value='end'>Kết thúc chương trình</Select.Option>
                                    </Select>
                                </Form.Item>
                                <Text type='secondary' style={{ fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                    Vui lòng tham khảo với Trưởng phòng trước khi chọn "Tuyển chính thức".
                                </Text>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label={<Text strong>Ghi chú bảo mật cho HR</Text>}
                                    name='hrNote'
                                    rules={[{ required: true }]}
                                >
                                    <TextArea rows={4} placeholder='Thêm nhận xét về quyết định của bạn...' />
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
                            background: 'rgba(255,255,255,0.9)',
                            backdropFilter: 'blur(10px)',
                            borderTop: '1px solid #E2E8F0',
                            zIndex: 100,
                            paddingLeft: 280
                        }}
                    >
                        <div
                            style={{
                                maxWidth: '1000px',
                                margin: '0 auto',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <Text
                                    type='secondary'
                                    style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 600 }}
                                >
                                    Form Status
                                </Text>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Text strong style={{ fontSize: '14px', color: '#1E40AF' }}>
                                        Ready to Submit
                                    </Text>
                                </div>
                            </div>
                            <Space>
                                <Button icon={<SaveOutlined />} onClick={() => message.success('Bản nhiớm đã được lưu!')}>
                                    Lưu bản nhiớm
                                </Button>
                                <Button
                                    type='primary'
                                    icon={<SendOutlined />}
                                    size='large'
                                    onClick={() => form.submit()}
                                    loading={isProcessing}
                                >
                                    Gửi đánh giá
                                </Button>
                            </Space>
                        </div>
                    </div>
                </Form>
            </Content>
        </Layout>
    );
};
