import {
    EnvironmentOutlined,
    SearchOutlined,
    GlobalOutlined,
    ArrowRightOutlined,
    DollarOutlined,
    FieldTimeOutlined
} from '@ant-design/icons';
import { Button, Card, Col, Input, Layout, Row, Space, Tag, Typography, Skeleton, Empty, Select } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useJobPositions } from '../../../hooks/Recruitment/useJobPositions';
import { RouteConfig } from '../../../constants';
import heroSectionImageUrl from '../../../assets/images/hero-section.jpg';
import logoSvtechUrl from '../../../assets/images/logo_svtech.png';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

export const JobBoardPage = () => {
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState('');

    const { data: jobPositionsData, isLoading } = useJobPositions({
        searcher: searchText ? { keyword: searchText, field: 'title' } : undefined,
        publicOnly: true
    });

    const jobs = jobPositionsData?.data || [];

    return (
        <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
            {/* Header */}
            <Header
                style={{
                    background: '#fff',
                    padding: '0 50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    height: '72px'
                }}
            >
                <div
                    style={{ display: 'flex', alignItems: 'center', marginLeft: '-30px', cursor: 'pointer' }}
                    onClick={() => navigate('/')}
                >
                    <img
                        src={logoSvtechUrl}
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
                <Space size='large'>
                    {/* <Button type='text' style={{ fontWeight: 500 }}>
                        Về chúng tôi
                    </Button>
                    <Button type='text' style={{ fontWeight: 500 }}>
                        Hướng dẫn
                    </Button> */}
                </Space>
            </Header>

            <Content style={{ paddingBottom: '60px' }}>
                {/* Hero Section */}
                <div
                    style={{
                        backgroundImage: `url(${heroSectionImageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        padding: '100px 24px',
                        textAlign: 'center',
                        color: '#fff',
                        position: 'relative'
                    }}
                >
                    {/* Overlay */}
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(135deg, rgba(30,64,175,0.85), rgba(13,148,136,0.7))'
                        }}
                    />

                    {/* Content */}
                    <div
                        style={{
                            maxWidth: 850,
                            margin: '0 auto',
                            position: 'relative',
                            zIndex: 1
                        }}
                    >
                        <Title
                            level={1}
                            style={{
                                color: '#fff',
                                fontSize: '39px',
                                fontWeight: 500,
                                marginBottom: '16px'
                            }}
                        >
                            ĐỒNG HÀNH CÙNG SVTECH <br /> LÀM VUI, SỐNG CHẤT, PHÁT TRIỂN TOÀN DIỆN
                        </Title>

                        <Paragraph
                            style={{
                                color: 'rgba(255,255,255,0.9)',
                                fontSize: '18px',
                                marginBottom: '40px'
                            }}
                        >
                            Khám phá hàng loạt cơ hội thực tập và học tập tại các doanh nghiệp hàng đầu.
                        </Paragraph>

                        {/* Search Box */}
                    </div>
                </div>

                {/* Jobs Grid */}
                <div style={{ maxWidth: 1200, margin: '40px auto 0', padding: '0 24px' }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '16px',
                            marginBottom: '32px',
                            flexWrap: 'wrap'
                        }}
                    >
                        {/* LEFT: Title */}
                        <Title level={3} style={{ margin: 0, flexShrink: 0 }}>
                            Vị trí đang tuyển ({jobs.length})
                        </Title>

                        {/* CENTER: Search */}
                        <Input
                            placeholder='Tìm kiếm vị trí, ngôn ngữ, hoặc kỹ năng...'
                            prefix={<SearchOutlined style={{ color: '#94a3b8', fontSize: '18px' }} />}
                            size='large'
                            style={{
                                flex: 1,
                                marginLeft:'-200px',
                                maxWidth: '400px',
                                marginTop:'5px',
                                borderRadius: '12px',
                                height: '44px'
                            }}
                            onChange={(e) => setSearchText(e.target.value)}
                            onPressEnter={(e: any) => setSearchText(e.target.value)}
                        />

                        {/* RIGHT: Sort */}
                        <Space style={{ flexShrink: 0 }}>
                            <Text type='secondary'>Sắp xếp theo:</Text>
                            <Select
                                defaultValue='newest'
                                style={{ width: 140 }}
                                options={[
                                    { value: 'newest', label: 'Mới nhất' },
                                    { value: 'salary', label: 'Lương cao' }
                                ]}
                            />
                        </Space>
                    </div>

                    {isLoading ? (
                        <Row gutter={[24, 24]}>
                            {[1, 2, 3, 4].map((i) => (
                                <Col xs={24} md={12} key={i}>
                                    <Card style={{ borderRadius: '16px' }}>
                                        <Skeleton active />
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    ) : jobs.length > 0 ? (
                        <Row gutter={[24, 24]}>
                            {jobs.map((job) => (
                                <Col xs={24} md={12} key={job.id}>
                                    <Card
                                        hoverable
                                        style={{
                                            borderRadius: '20px',
                                            border: '1px solid #e2e8f0',
                                            height: '100%',
                                            transition: 'all 0.3s'
                                        }}
                                        bodyStyle={{ padding: '28px' }}
                                        onClick={() => navigate(RouteConfig.PublicJobDetail.getPath(job.id))}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                marginBottom: '16px'
                                            }}
                                        >
                                            <Tag color='blue' style={{ borderRadius: '6px', fontWeight: 600 }}>
                                                {job.department}
                                            </Tag>
                                            <Text type='secondary' style={{ fontSize: '13px' }}>
                                                Đăng ngày {job.postedDate || 'N/A'}
                                            </Text>
                                        </div>

                                        <Title level={4} style={{ marginBottom: '12px', color: '#1e293b' }}>
                                            {job.title}
                                        </Title>

                                        <Space wrap style={{ marginBottom: '20px' }}>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    padding: '4px 10px',
                                                    background: '#f1f5f9',
                                                    borderRadius: '6px',
                                                    fontSize: '13px'
                                                }}
                                            >
                                                <EnvironmentOutlined /> {job.location}
                                            </div>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    padding: '4px 10px',
                                                    background: '#f1f5f9',
                                                    borderRadius: '6px',
                                                    fontSize: '13px'
                                                }}
                                            >
                                                <DollarOutlined /> {job.salaryRange || 'Thỏa thuận'}
                                            </div>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    padding: '4px 10px',
                                                    background: '#f1f5f9',
                                                    borderRadius: '6px',
                                                    fontSize: '13px'
                                                }}
                                            >
                                                <FieldTimeOutlined /> Cần {job.required || job.requiredQuantity || 0} vị
                                                trí
                                            </div>
                                        </Space>

                                        <Paragraph
                                            ellipsis={{ rows: 2 }}
                                            type='secondary'
                                            style={{ marginBottom: '24px', fontSize: '14px', lineHeight: 1.6 }}
                                        >
                                            {job.description}
                                        </Paragraph>

                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                paddingTop: '20px',
                                                borderTop: '1px solid #f1f5f9'
                                            }}
                                        >
                                            <Text style={{ color: '#1E40AF', fontWeight: 600 }}>
                                                {/* {job.filled || job.filledQuantity || 0} /{' '}
                                                {job.required || job.requiredQuantity || 0} suất đã nhận */}
                                            </Text>
                                            <Button type='primary' shape='round' icon={<ArrowRightOutlined />}>
                                                Chi tiết
                                            </Button>
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    ) : (
                        <Empty description='Không tìm thấy vị trí tuyển dụng phù hợp' />
                    )}
                </div>
            </Content>

            <Footer
                style={{ textAlign: 'center', background: '#fff', borderTop: '1px solid #f1f5f9', padding: '40px 0' }}
            >
                <div style={{ marginBottom: '16px' }}>
                    <Text type='secondary'>Nền tảng kết nối đào tạo thực tập sinh hàng đầu</Text>
                </div>
                <Text type='secondary'>©2025 Created by InternFlow Team</Text>
            </Footer>
        </Layout>
    );
};
