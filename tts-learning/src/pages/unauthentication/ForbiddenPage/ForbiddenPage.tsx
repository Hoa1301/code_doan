import { ArrowLeftOutlined, HomeOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { Button, Card, Col, Row, Space, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { RouteConfig } from '../../../constants';

const { Title, Text, Paragraph } = Typography;

export const ForbiddenPage = () => {
    const navigate = useNavigate();

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                background:
                    'radial-gradient(circle at top left, rgba(30, 64, 175, 0.12), transparent 34%), radial-gradient(circle at bottom right, rgba(13, 148, 136, 0.14), transparent 28%), #F8FAFC'
            }}
        >
            <Card
                bordered={false}
                style={{
                    width: '100%',
                    maxWidth: '960px',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    boxShadow: '0 24px 60px rgba(15, 23, 42, 0.10)'
                }}
                styles={{ body: { padding: 0 } }}
            >
                <Row gutter={0}>
                    <Col xs={24} lg={10}>
                        <div
                            style={{
                                height: '100%',
                                minHeight: '320px',
                                padding: '40px 32px',
                                background: 'linear-gradient(160deg, #0F172A 0%, #1E3A8A 100%)',
                                color: '#fff',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                            }}
                        >
                            <div>
                                <div
                                    style={{
                                        width: '72px',
                                        height: '72px',
                                        borderRadius: '20px',
                                        background: 'rgba(255,255,255,0.12)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '34px',
                                        marginBottom: '24px'
                                    }}
                                >
                                    <SafetyCertificateOutlined />
                                </div>
                                <Text style={{ color: 'rgba(255,255,255,0.72)', fontSize: '14px' }}>Mã lỗi</Text>
                                <Title level={1} style={{ color: '#fff', margin: '6px 0 0', fontSize: '56px', lineHeight: 1 }}>
                                    403
                                </Title>
                            </div>

                            <Paragraph style={{ color: 'rgba(255,255,255,0.78)', marginBottom: 0 }}>
                                Hệ thống đã xác thực tài khoản của bạn, nhưng trang này không nằm trong phạm vi quyền hiện tại.
                            </Paragraph>
                        </div>
                    </Col>

                    <Col xs={24} lg={14}>
                        <div
                            style={{
                                padding: '40px 32px',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center'
                            }}
                        >
                            <Title level={2} style={{ marginTop: 0, marginBottom: '12px' }}>
                                Bạn không có quyền truy cập trang này
                            </Title>
                            <Paragraph style={{ color: '#64748B', fontSize: '15px', marginBottom: '24px' }}>
                                Điều này thường xảy ra khi bạn mở một màn hình chỉ dành cho vai trò khác, hoặc truy cập trực tiếp
                                bằng đường dẫn không phù hợp với phân hệ đang dùng.
                            </Paragraph>

                            <div
                                style={{
                                    padding: '18px 20px',
                                    borderRadius: '16px',
                                    background: '#F8FAFC',
                                    border: '1px solid #E2E8F0',
                                    marginBottom: '28px'
                                }}
                            >
                                <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                                    Gợi ý xử lý
                                </Text>
                                <Text style={{ display: 'block', color: '#475569' }}>
                                    Quay về trang chọn phân hệ để vào đúng màn hình theo vai trò của bạn.
                                </Text>
                                <Text style={{ display: 'block', color: '#475569', marginTop: '6px' }}>
                                    Nếu bạn nghĩ đây là nhầm quyền, hãy đăng nhập lại hoặc liên hệ quản trị hệ thống.
                                </Text>
                            </div>

                            <Space wrap size={12}>
                                <Button
                                    type='primary'
                                    icon={<HomeOutlined />}
                                    onClick={() => navigate(RouteConfig.ModuleSelection.path)}
                                    style={{ height: '42px', borderRadius: '10px' }}
                                >
                                    Về trang phân hệ
                                </Button>
                                <Button
                                    icon={<ArrowLeftOutlined />}
                                    onClick={() => navigate(-1)}
                                    style={{ height: '42px', borderRadius: '10px' }}
                                >
                                    Quay lại
                                </Button>
                            </Space>
                        </div>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};
