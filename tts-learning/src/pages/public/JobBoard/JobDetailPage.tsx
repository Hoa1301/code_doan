import {
    ArrowLeftOutlined,
    CheckCircleOutlined,
    CloudUploadOutlined,
    DollarOutlined,
    EnvironmentOutlined,
    FieldTimeOutlined,
    GlobalOutlined,
    HourglassOutlined,
    MailOutlined,
    PhoneOutlined
} from '@ant-design/icons';
import { Button, Card, Col, Form, Input, Layout, Row, Tag, Typography, Upload, Modal, Skeleton, App } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useJobPosition } from '../../../hooks/Recruitment/useJobPositions';
import { useCreateCandidateWithCv } from '../../../hooks/Recruitment/useCandidates';
import { RouteConfig } from '../../../constants';
import type { UploadFile } from 'antd/es/upload/interface';
import { notify } from '../../../utils/notify';

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

export const JobDetailPage = () => {
    const { modal } = App.useApp();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    useTranslation();
    const [form] = Form.useForm();
    const { mutate: applyJob, isLoading: isApplying } = useCreateCandidateWithCv();
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    const { data: jobRes, isLoading } = useJobPosition(id || '', true);
    const job = jobRes?.data;

    const onFinish = async (values: { fullName: string; email: string; phone: string; coverLetter: string }) => {
        if (!id) {
            notify.error('Không xác định được vị trí ứng tuyển');
            return;
        }

        if (!fileList.length) {
            notify.error('Vui lòng tải lên CV trước khi gửi');
            return;
        }

        try {
            await applyJob({
                fullName: values.fullName,
                email: values.email,
                phone: values.phone,
                coverLetter: values.coverLetter,
                jobId: id,
                cv: fileList[0]?.originFileObj as File | undefined
            });

            notify.success('Nộp hồ sơ thành công!');

            modal.success({
                title: 'Nộp hồ sơ thành công!',
                content:
                    'Cảm ơn bạn đã quan tâm. Chúng tôi đã nhận được hồ sơ và sẽ phản hồi trong vòng 3-5 ngày làm việc.',
                okText: 'Quay lại danh sách',
                onOk: () => navigate(RouteConfig.PublicJobBoard.path)
            });

            form.resetFields();
            setFileList([]);
        } catch (err) {
            modal.error({
                title: 'Lỗi',
                content: 'Đã có lỗi xảy ra khi nộp hồ sơ. Vui lòng thử lại sau.'
            });
        }
    };

    if (isLoading) {
        return (
            <div style={{ padding: '100px', textAlign: 'center' }}>
                <Skeleton active />
            </div>
        );
    }

    if (!job) {
        return (
            <div style={{ padding: '100px', textAlign: 'center' }}>
                <Title level={3}>Không tìm thấy thông tin công việc</Title>
                <Button onClick={() => navigate(RouteConfig.PublicJobBoard.path)}>Quay lại</Button>
            </div>
        );
    }

    return (
        <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
            <Header
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#fff',
                    borderBottom: '1px solid #e2e8f0',
                    padding: '0 24px',
                    height: '64px'
                }}
            >
                <div
                    style={{ display: 'flex', alignItems: 'center', marginLeft: '-10px', cursor: 'pointer' }}
                    onClick={() => navigate(RouteConfig.PublicJobBoard.path)}
                >
                    <img
                        src='/assets/logo_svtech.png'
                        alt='logo'
                        style={{
                            width: '220px',
                            height: '220px',
                            objectFit: 'contain',
                            marginRight: '12px',
                            cursor: 'pointer',
                            flexShrink: 0
                        }}
                        onClick={() => navigate(RouteConfig.ModuleSelection.path)}
                    />
                </div>
                <Button
                    type='text'
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(RouteConfig.PublicJobBoard.path)}
                    style={{ fontWeight: 600, color: '#64748b' }}
                >
                    Quay lại tìm việc
                </Button>
            </Header>

            <Content style={{ padding: '40px 24px' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <Row gutter={[40, 40]}>
                        <Col xs={24} lg={16}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            marginBottom: '16px'
                                        }}
                                    >
                                        <Tag color='blue' style={{ margin: 0, padding: '4px 12px', fontWeight: 700 }}>
                                            {job.department}
                                        </Tag>
                                        <Text
                                            type='secondary'
                                            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                        >
                                            <EnvironmentOutlined /> {job.location}
                                        </Text>
                                    </div>
                                    <Title
                                        level={1}
                                        style={{ margin: 0, fontSize: '32px', fontWeight: 800, color: '#1e293b' }}
                                    >
                                        {job.title}
                                    </Title>
                                </div>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                    {[
                                        {
                                            icon: <DollarOutlined />,
                                            text: job.salaryRange || 'Thỏa thuận'
                                        },
                                        {
                                            icon: <FieldTimeOutlined />,
                                            text: `${job.required || job.requiredQuantity || 0} vị trí`
                                        }
                                    ].map((item, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '8px 16px',
                                                background: '#fff',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                fontWeight: 500,
                                                color: '#475569'
                                            }}
                                        >
                                            <span style={{ color: '#1E40AF' }}>{item.icon}</span>
                                            {item.text}
                                        </div>
                                    ))}
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '8px 16px',
                                            background: '#fff1f2',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            fontWeight: 700,
                                            color: '#e11d48'
                                        }}
                                    >
                                        <HourglassOutlined /> Hạn nộp: {job.deadline || 'Liên hệ HR'}
                                    </div>
                                </div>

                                <Card
                                    bordered={false}
                                    style={{
                                        borderRadius: '12px',
                                        border: '1px solid #e2e8f0',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                    }}
                                >
                                    <Row gutter={16}>
                                        <Col span={8}>
                                            <Text
                                                type='secondary'
                                                style={{
                                                    fontSize: '12px',
                                                    textTransform: 'uppercase',
                                                    fontWeight: 600
                                                }}
                                            >
                                                Thời gian
                                            </Text>
                                            <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '4px' }}>
                                                3 - 6 Tháng
                                            </div>
                                        </Col>
                                        <Col span={8}>
                                            <Text
                                                type='secondary'
                                                style={{
                                                    fontSize: '12px',
                                                    textTransform: 'uppercase',
                                                    fontWeight: 600
                                                }}
                                            >
                                                Lương
                                            </Text>
                                            <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '4px' }}>
                                                {job.salaryRange || 'Thỏa thuận'}
                                            </div>
                                        </Col>
                                        <Col span={8}>
                                            <Text
                                                type='secondary'
                                                style={{
                                                    fontSize: '12px',
                                                    textTransform: 'uppercase',
                                                    fontWeight: 600
                                                }}
                                            >
                                                Trình độ
                                            </Text>
                                            <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '4px' }}>
                                                Intern/Trainee
                                            </div>
                                        </Col>
                                    </Row>
                                </Card>

                                <div style={{ fontSize: '16px', lineHeight: '1.8', color: '#334155' }}>
                                    <Title level={3}>Mô tả công việc</Title>
                                    <Paragraph>{job.description}</Paragraph>

                                    <Title level={3} style={{ marginTop: '32px' }}>
                                        Yêu cầu ứng viên
                                    </Title>
                                    <Paragraph>{job.requirements}</Paragraph>

                                    <Title level={3} style={{ marginTop: '32px' }}>
                                        Quyền lợi
                                    </Title>
                                    <ul style={{ listStyle: 'none', padding: 0 }}>
                                        {[
                                            job.benefits || 'Môi trường học tập thực tế với mentor.',
                                            'Cơ hội phát triển lên vị trí chính thức.',
                                            'Được hỗ trợ trong suốt quá trình thực tập.'
                                        ].map((item, i) => (
                                            <li key={i} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                                                <CheckCircleOutlined style={{ color: '#1E40AF', marginTop: '6px' }} />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </Col>

                        <Col xs={24} lg={8}>
                            <div style={{ position: 'sticky', top: '100px' }}>
                                <Card
                                    bordered={false}
                                    style={{
                                        borderRadius: '16px',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                                        border: '1px solid #e2e8f0'
                                    }}
                                    bodyStyle={{ padding: '32px' }}
                                >
                                    <div style={{ marginBottom: '24px' }}>
                                        <Title level={3} style={{ margin: 0, fontSize: '24px' }}>
                                            Ứng tuyển ngay
                                        </Title>
                                        <Text type='secondary'>Gửi thông tin của bạn để bắt đầu hành trình.</Text>
                                    </div>

                                    <Form form={form} layout='vertical' onFinish={onFinish}>
                                        <Form.Item
                                            name='fullName'
                                            label='Họ và tên'
                                            rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                                        >
                                            <Input placeholder='Nguyễn Văn A' size='large' />
                                        </Form.Item>

                                        <Form.Item
                                            name='email'
                                            label='Địa chỉ Email'
                                            rules={[{ required: true, type: 'email', message: 'Email không hợp lệ!' }]}
                                        >
                                            <Input
                                                prefix={<MailOutlined style={{ color: '#94a3b8' }} />}
                                                placeholder='example@gmail.com'
                                                size='large'
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            name='phone'
                                            label='Số điện thoại'
                                            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                                        >
                                            <Input
                                                prefix={<PhoneOutlined style={{ color: '#94a3b8' }} />}
                                                placeholder='09xxxxxxxx'
                                                size='large'
                                            />
                                        </Form.Item>

                                        <Form.Item name='coverLetter' label='Thư giới thiệu'>
                                            <Input.TextArea
                                                placeholder='Hãy giới thiệu ngắn gọn về bản thân, kinh nghiệm và lý do bạn phù hợp với vị trí này.'
                                                rows={4}
                                                showCount
                                                maxLength={1000}
                                                style={{ resize: 'none' }}
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            name='cv'
                                            label='Tải lên CV (PDF/DOCX)'
                                            rules={[
                                                {
                                                    required: true,
                                                    validator: () => {
                                                        if (!fileList.length) {
                                                            return Promise.reject('Vui lòng tải lên CV!');
                                                        }
                                                        return Promise.resolve();
                                                    }
                                                }
                                            ]}
                                        >
                                            <Upload.Dragger
                                                style={{
                                                    padding: '24px',
                                                    background: '#f8fafc',
                                                    border: '2px dashed #e2e8f0'
                                                }}
                                                beforeUpload={(file) => {
                                                    const isValidType =
                                                        file.type === 'application/pdf' || file.type.includes('word');

                                                    if (!isValidType) {
                                                        notify.error('Chỉ hỗ trợ file PDF hoặc Word');
                                                        return Upload.LIST_IGNORE;
                                                    }

                                                    const isLt5M = file.size / 1024 / 1024 < 5;

                                                    if (!isLt5M) {
                                                        notify.error('File phải nhỏ hơn 5MB');
                                                        return Upload.LIST_IGNORE;
                                                    }

                                                    return false;
                                                }}
                                                fileList={fileList}
                                                onChange={(info) => {
                                                    const files = info.fileList.slice(-1);
                                                    setFileList(files);

                                                    form.setFieldsValue({ cv: files });

                                                    if (info.file.status !== 'removed') {
                                                        notify.success('Đã tải lên CV');
                                                    }
                                                }}
                                                accept='.pdf,.doc,.docx'
                                                maxCount={1}
                                            >
                                                <p>
                                                    <CloudUploadOutlined
                                                        style={{ fontSize: '32px', color: '#1E40AF' }}
                                                    />
                                                </p>
                                                <p style={{ fontSize: '14px', fontWeight: 500 }}>
                                                    Bấm để chọn hoặc kéo thả file
                                                </p>
                                                <p style={{ fontSize: '12px', color: '#64748b' }}>
                                                    Dung lượng tối đa 5MB
                                                </p>
                                            </Upload.Dragger>
                                        </Form.Item>

                                        <Button
                                            type='primary'
                                            htmlType='submit'
                                            size='large'
                                            disabled={!fileList.length}
                                            block
                                            loading={isApplying}
                                            style={{
                                                height: '52px',
                                                fontWeight: 700,
                                                fontSize: '16px',
                                                marginTop: '12px',
                                                borderRadius: '8px'
                                            }}
                                        >
                                            Gửi hồ sơ ngay
                                        </Button>
                                    </Form>
                                </Card>
                            </div>
                        </Col>
                    </Row>
                </div>
            </Content>
        </Layout>
    );
};
