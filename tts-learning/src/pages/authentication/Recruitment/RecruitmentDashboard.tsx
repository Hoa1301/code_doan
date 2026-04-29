import {
    TeamOutlined,
    FileTextOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    ArrowRightOutlined
} from '@ant-design/icons';
import { Card, Col, Row, Typography, Button, Space } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResponsive } from '../../../hooks/useResponsive';
import { getDashboardStats } from '../../../services/dashboard';
import { RouteConfig } from '../../../constants';

const { Title, Text, Paragraph } = Typography;

const StatCard = ({ title, value, prefix, color, note, loading }: any) => (
    <Card
        bordered={false}
        loading={loading}
        style={{
            height: '100%',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            border: '1px solid #E2E8F0'
        }}
        styles={{ body: { padding: '24px' } }}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
            <div>
                <Text type='secondary' style={{ fontSize: '14px', fontWeight: 600, color: '#64748B' }}>
                    {title}
                </Text>
                <div style={{ marginTop: '12px' }}>
                    <span style={{ fontSize: '32px', fontWeight: 800, color: '#1E293B' }}>{value}</span>
                </div>
                <Text style={{ display: 'block', marginTop: '8px', fontSize: '13px', color: '#64748B' }}>{note}</Text>
            </div>
            <div
                style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: `${color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color,
                    fontSize: '24px'
                }}
            >
                {prefix}
            </div>
        </div>
    </Card>
);

export const RecruitmentDashboard = () => {
    const { isMobile } = useResponsive();
    const navigate = useNavigate();
    const [statsRes, setStatsRes] = useState<any>(null);
    const [statsLoading, setStatsLoading] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            setStatsLoading(true);
            try {
                const res = await getDashboardStats();
                setStatsRes(res);
            } catch (error) {
                console.error(error);
            } finally {
                setStatsLoading(false);
            }
        };

        void fetchStats();
    }, []);

    const stats = statsRes?.data;
    const actionItems = [
        {
            title: 'Xem danh sách CV',
            description: 'Tập trung xử lý các hồ sơ mới và đánh dấu kết quả sàng lọc.',
            onClick: () => navigate(RouteConfig.CVList.path)
        },
        {
            title: 'Quản lý lịch phỏng vấn',
            description: 'Theo dõi lịch sắp tới và chủ động sắp xếp interviewer.',
            onClick: () => navigate(RouteConfig.InterviewSchedule.path)
        },
        {
            title: 'Theo dõi kế hoạch tuyển dụng',
            description: 'Rà soát nhu cầu và tiến độ mở vị trí theo từng kế hoạch.',
            onClick: () => navigate(RouteConfig.RecruitmentPlanList.path)
        }
    ];

    return (
        <div style={{ padding: isMobile ? '16px' : '24px', maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ marginBottom: '28px' }}>
                <Title level={2} style={{ margin: 0, fontWeight: 800 }}>
                    Tổng quan tuyển dụng
                </Title>
            </div>

            <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard
                        title='Vị trí đang tuyển'
                        value={stats?.openPositions || 0}
                        prefix={<TeamOutlined />}
                        color='#1E40AF'
                        note='Tổng số job đang mở hiện tại.'
                        loading={statsLoading}
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard
                        title='Tổng hồ sơ ứng tuyển'
                        value={stats?.totalApplications || 0}
                        prefix={<FileTextOutlined />}
                        color='#0F766E'
                        note='Toàn bộ ứng viên đã nộp hồ sơ vào hệ thống.'
                        loading={statsLoading}
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard
                        title='CV chờ sàng lọc'
                        value={stats?.pendingApplications || 0}
                        prefix={<ClockCircleOutlined />}
                        color='#D97706'
                        note='Số hồ sơ recruiter cần xem trước tiên.'
                        loading={statsLoading}
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard
                        title='Phỏng vấn sắp tới'
                        value={stats?.upcomingInterviews || 0}
                        prefix={<CheckCircleOutlined />}
                        color='#7C3AED'
                        note='Các buổi phỏng vấn dự kiến diễn ra tiếp theo.'
                        loading={statsLoading}
                    />
                </Col>
            </Row>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={14}>
                    <Card
                        title={<span style={{ fontWeight: 700 }}>Bức tranh tuyển dụng hiện tại</span>}
                        bordered={false}
                        style={{
                            borderRadius: '16px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                            border: '1px solid #E2E8F0'
                        }}
                    >
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={8}>
                                <div style={{ padding: '18px', borderRadius: '14px', background: '#EFF6FF' }}>
                                    <Text type='secondary'>Đã chuyển thành TTS</Text>
                                    <Title level={3} style={{ margin: '8px 0 0', color: '#1D4ED8' }}>
                                        {stats?.convertedInterns || 0}
                                    </Title>
                                </div>
                            </Col>
                            <Col xs={24} sm={8}>
                                <div style={{ padding: '18px', borderRadius: '14px', background: '#F0FDF4' }}>
                                    <Text type='secondary'>Tỷ lệ chuyển đổi</Text>
                                    <Title level={3} style={{ margin: '8px 0 0', color: '#059669' }}>
                                        {stats?.conversionRate || 0}%
                                    </Title>
                                </div>
                            </Col>
                            <Col xs={24} sm={8}>
                                <div style={{ padding: '18px', borderRadius: '14px', background: '#FFF7ED' }}>
                                    <Text type='secondary'>TTS đang hoạt động</Text>
                                    <Title level={3} style={{ margin: '8px 0 0', color: '#EA580C' }}>
                                        {stats?.activeInterns || 0}
                                    </Title>
                                </div>
                            </Col>
                        </Row>
                    </Card>
                </Col>
                <Col xs={24} lg={10}>
                    <Card
                        title={<span style={{ fontWeight: 700 }}>Tác vụ nhanh</span>}
                        bordered={false}
                        style={{
                            height: '100%',
                            borderRadius: '16px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                            border: '1px solid #E2E8F0'
                        }}
                    >
                        <Space direction='vertical' size={16} style={{ width: '100%' }}>
                            {actionItems.map((item) => (
                                <div
                                    key={item.title}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: isMobile ? 'flex-start' : 'center',
                                        flexDirection: isMobile ? 'column' : 'row',
                                        gap: '14px',
                                        paddingBottom: '16px',
                                        borderBottom: '1px solid #F1F5F9'
                                    }}
                                >
                                    <div style={{ flex: 1 }}>
                                        <Text strong style={{ display: 'block', fontSize: '15px' }}>
                                            {item.title}
                                        </Text>
                                        <Paragraph style={{ margin: '6px 0 0', color: '#64748B' }}>
                                            {item.description}
                                        </Paragraph>
                                    </div>
                                    <Button type='default' icon={<ArrowRightOutlined />} onClick={item.onClick}>
                                        Mở màn hình
                                    </Button>
                                </div>
                            ))}
                        </Space>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};
