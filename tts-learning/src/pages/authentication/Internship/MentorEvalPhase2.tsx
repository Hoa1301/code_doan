import { SaveOutlined, RocketOutlined, StarOutlined } from '@ant-design/icons';
import {
    Avatar,
    Button,
    Card,
    Col,
    Form,
    Input,
    Rate,
    Row,
    Space,
    Typography,
    message,
    Divider,
    Tag,
    Select
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { RouteConfig } from '../../../constants';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { http } from '../../../utils/http';
import { getProfile } from '../../../services/auth/profile';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const MentorEvalPhase2 = () => {
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
                type: 'Mid-term', // Phase 2
                technicalScore: Math.round(((values.techContribution + values.problemSolving) / 2) * 2),
                attitudeScore: Math.round(values.reliability * 2),
                teamworkScore: Math.round(values.teamwork * 2),
                feedback: values.accomplishments ? `${values.accomplishments}\n\nFeedback: ${values.feedback || ''}` : (values.feedback || ''),
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
                <Title level={3} style={{ margin: 0 }}>
                    Bước 2: Đánh giá hợp tác dự án
                </Title>
                <Space>
                    <Button icon={<SaveOutlined />}>Lưu tiến độ</Button>
                    <Button type='primary' onClick={() => form.submit()} loading={isProcessing}>
                        Gửi đánh giá
                    </Button>
                </Space>
            </div>

            <Card
                bordered={false}
                style={{
                    borderRadius: '12px',
                    marginBottom: '24px',
                    background: '#f9f0ff',
                    border: '1px solid #d3adf7'
                }}
            >
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
                            <Tag color='purple'>Xét duyệt tháng 3-5</Tag>
                            <Tag color='geekblue'>Giai đoạn dự án</Tag>
                        </div>
                    </Col>
                </Row>
            </Card>

            <Form form={form} layout='vertical' onFinish={onFinish}>
                <Card
                    title='Hiệu suất dự án'
                    bordered={false}
                    style={{ borderRadius: '12px', marginBottom: '24px' }}
                >
                    <Row gutter={48}>
                        <Col span={12}>
                            <Form.Item
                                label='Đóng góp kỹ thuật'
                                name='techContribution'
                                rules={[{ required: true }]}
                            >
                                <Rate character={<StarOutlined />} />
                            </Form.Item>
                            <Text type='secondary' style={{ fontSize: '12px' }}>
                                Tác động của code/công việc lên dự án.
                            </Text>
                        </Col>
                        <Col span={12}>
                            <Form.Item label='Giải quyết vấn đề' name='problemSolving' rules={[{ required: true }]}>
                                <Rate character={<StarOutlined />} />
                            </Form.Item>
                            <Text type='secondary' style={{ fontSize: '12px' }}>
                                Tính độc lập trong việc xác định và khắc phục sự cố.
                            </Text>
                        </Col>
                    </Row>
                    <Divider />
                    <Row gutter={48}>
                        <Col span={12}>
                            <Form.Item label='Độ tin cậy' name='reliability' rules={[{ required: true }]}>
                                <Rate character={<StarOutlined />} />
                            </Form.Item>
                            <Text type='secondary' style={{ fontSize: '12px' }}>
                                Hoàn thành đúng hạn và chất lượng ổn định.
                            </Text>
                        </Col>
                        <Col span={12}>
                            <Form.Item label='Hòa nhập nhóm' name='teamwork' rules={[{ required: true }]}>
                                <Rate character={<StarOutlined />} />
                            </Form.Item>
                            <Text type='secondary' style={{ fontSize: '12px' }}>
                                Hợp tác với lập trình viên và nhà thiết kế.
                            </Text>
                        </Col>
                    </Row>
                </Card>

                <Card
                    title='Tóm tắt nhiệm vụ/mốc'
                    bordered={false}
                    style={{ borderRadius: '12px', marginBottom: '24px' }}
                >
                    <Form.Item label='Thành tích nổi bật' name='accomplishments' rules={[{ required: true }]}>
                        <TextArea rows={4} placeholder='Các nhiệm vụ hoặc mốc quan trọng trong giai đoạn dự án...' />
                    </Form.Item>

                    <Form.Item label='Phản hồi của mentor dự án' name='feedback'>
                        <TextArea rows={3} placeholder='Nhận xét thêm về hiệu suất...' />
                    </Form.Item>
                </Card>

                <Card title='Sẵn sàng bước cuối' bordered={false} style={{ borderRadius: '12px' }}>
                    <Form.Item
                        label='Sẵn sàng cho đánh giá cuối kỳ?'
                        name='readyForFinal'
                        rules={[{ required: true }]}
                    >
                        <Select
                            options={[
                                { value: 'ready', label: 'Sẵn sàng - Bắt đầu quy trình tốt nghiệp' },
                                { value: 'not_ready', label: 'Chưa sẵn sàng - Cần thêm thời gian thực hiện dự án' }
                            ]}
                        />
                    </Form.Item>
                    <div
                        style={{
                            background: '#f9f0ff',
                            padding: '16px',
                            borderRadius: '8px',
                            border: '1px solid #d3adf7'
                        }}
                    >
                        <Space>
                            <RocketOutlined style={{ color: '#722ed1' }} />
                            <Text>Đánh giá cuối kỳ xác định khả năng tuyển và tốt nghiệp chương trình.</Text>
                        </Space>
                    </div>
                </Card>
            </Form>
        </div>
    );
};
