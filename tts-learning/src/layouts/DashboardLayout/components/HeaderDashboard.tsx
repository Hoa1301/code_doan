import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    BellOutlined,
    SearchOutlined,
    QuestionCircleOutlined,
    UserOutlined,
    SettingOutlined,
    LogoutOutlined
} from '@ant-design/icons';
import {
    Layout,
    Button,
    Input,
    Badge,
    Avatar,
    theme,
    Popover,
    List,
    Typography,
    Dropdown,
    MenuProps,
    Modal,
    Space,
    message
} from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { RouteConfig } from '../../../constants';
import { getProfile, UserProfile } from '../../../services/auth/profile';

const { Header } = Layout;
const { Text } = Typography;

interface HeaderDashboardProps {
    collapsed: boolean;
    toggleCollapsed: () => void;
    isMobile: boolean;
    isLaptop: boolean;
}

type ProfileWithLegacyRole = UserProfile & { role?: string };

const toDisplayRole = (roles: string[]): string => {
    const primaryRole = roles[0] || '';

    if (primaryRole === 'super_admin') return 'Super Admin';
    if (primaryRole === 'admin') return 'Admin';
    if (primaryRole === 'hr') return 'HR';
    if (primaryRole === 'mentor') return 'Mentor';
    if (primaryRole === 'director') return 'Giám đốc';
    if (primaryRole === 'intern') return 'TTS';

    return primaryRole || 'Người dùng';
};

export const HeaderDashboard = ({ collapsed, toggleCollapsed, isMobile, isLaptop }: HeaderDashboardProps) => {
    const { token } = theme.useToken();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentRoles, setCurrentRoles] = useState<string[]>([]);
    const [profile, setProfile] = useState<ProfileWithLegacyRole | null>(null);

    useEffect(() => {
        let isMounted = true;

        const loadProfile = async () => {
            try {
                const response = await getProfile();
                const profileData = (response.data || {}) as ProfileWithLegacyRole;
                const rolesFromArray = Array.isArray(profileData.roles)
                    ? profileData.roles.map((role) => String(role?.name || '').toLowerCase()).filter(Boolean)
                    : [];
                const roleFromSingleField = String(profileData.role || '').toLowerCase();
                const roles = Array.from(new Set([roleFromSingleField, ...rolesFromArray].filter(Boolean)));

                if (isMounted) {
                    setCurrentRoles(roles);
                    setProfile(profileData);
                }
            } catch {
                if (isMounted) {
                    setCurrentRoles([]);
                }
            }
        };

        void loadProfile();

        return () => {
            isMounted = false;
        };
    }, []);

    const notifications = [
        { title: 'Người dùng mới đăng ký', time: '5 phút trước', read: false },
        { title: 'Cập nhật hệ thống hoàn tất', time: '1 giờ trước', read: true },
        { title: 'Báo cáo tuần đã sẵn sàng', time: 'Hôm qua', read: true }
    ];

    const handleLogout = async () => {
        setIsLoading(true);
        try {
            logout();
            message.success('Đăng xuất thành công!');
            navigate(RouteConfig.LoginPage.path);
        } catch {
            message.error('Có lỗi xảy ra khi đăng xuất!');
        } finally {
            setIsLoading(false);
        }
    };

    const userMenuItems: MenuProps['items'] = [
        {
            key: 'profile',
            label: 'Thông tin cá nhân',
            icon: <UserOutlined />,
            onClick: () => navigate(RouteConfig.SettingPage.path)
        },
        {
            key: 'settings',
            label: 'Cài đặt',
            icon: <SettingOutlined />,
            onClick: () => navigate(RouteConfig.SettingPage.path)
        },
        {
            type: 'divider'
        },
        {
            key: 'logout',
            label: 'Đăng xuất',
            icon: <LogoutOutlined />,
            onClick: () => setShowModal(true)
        }
    ];

    const notificationContent = (
        <div style={{ width: 300 }}>
            <div
                style={{
                    padding: '8px 16px',
                    borderBottom: '1px solid #E2E8F0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
                <Text strong>Thông báo</Text>
                <Button type='link' size='small'>
                    Đánh dấu đã đọc
                </Button>
            </div>
            <List
                itemLayout='horizontal'
                dataSource={notifications}
                renderItem={(item) => (
                    <List.Item
                        style={{
                            padding: '12px 16px',
                            background: item.read ? '#fff' : 'rgba(30, 64, 175, 0.05)',
                            cursor: 'pointer',
                            transition: 'background 0.3s'
                        }}
                        className='hover:bg-gray-50'
                    >
                        <List.Item.Meta
                            avatar={<Badge status={item.read ? 'default' : 'processing'} />}
                            title={<Text style={{ fontSize: '13px' }}>{item.title}</Text>}
                            description={
                                <Text type='secondary' style={{ fontSize: '11px' }}>
                                    {item.time}
                                </Text>
                            }
                        />
                    </List.Item>
                )}
            />
        </div>
    );

    return (
        <Header
            style={{
                padding: isMobile ? '0 12px' : '0 24px',
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(8px)',
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #E2E8F0',
                height: '64px'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '16px' }}>
                <Button
                    type='text'
                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={toggleCollapsed}
                    style={{
                        fontSize: '16px',
                        width: 32,
                        height: 32
                    }}
                />

                {/* <Input
                    prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
                    placeholder='Tìm kiếm...'
                    variant='borderless'
                    style={{
                        backgroundColor: '#F1F5F9',
                        borderRadius: '6px',
                        width: isLaptop ? '200px' : '240px',
                        padding: '6px 12px'
                    }}
                    className='hidden md:flex'
                /> */}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '16px' }}>
                <Button type='text' shape='circle' icon={<QuestionCircleOutlined />} style={{ color: '#64748B' }} />

                {/* <Popover content={notificationContent} trigger='click' placement='bottomRight' arrow={false}>
                    <Badge count={1} dot offset={[-4, 4]}>
                        <Button type='text' shape='circle' icon={<BellOutlined />} style={{ color: '#64748B' }} />
                    </Badge>
                </Popover> */}

                {!isMobile && <div style={{ width: '1px', height: '24px', background: '#E2E8F0' }}></div>}

                <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement='bottomRight' arrow>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <Avatar
                            size='default'
                            src={profile?.avatarUrl}
                            icon={<UserOutlined />}
                            style={{
                                backgroundColor: token.colorPrimary,
                                cursor: 'pointer'
                            }}
                        />
                        {!isMobile && (
                            <span style={{ fontWeight: 500, color: '#1E293B' }}>{toDisplayRole(currentRoles)}</span>
                        )}
                    </div>
                </Dropdown>

                <Modal
                    title={
                        <Space>
                            <QuestionCircleOutlined style={{ color: '#f59e0b' }} />
                            <span>Xác nhận đăng xuất</span>
                        </Space>
                    }
                    open={showModal}
                    onCancel={() => setShowModal(false)}
                    footer={[
                        <Button key='cancel' onClick={() => setShowModal(false)}>
                            Hủy
                        </Button>,
                        <Button
                            key='logout'
                            type='primary'
                            danger
                            loading={isLoading}
                            onClick={handleLogout}
                            icon={<LogoutOutlined />}
                        >
                            Đăng xuất
                        </Button>
                    ]}
                    centered
                    width={isMobile ? 'calc(100vw - 24px)' : 400}
                >
                    <div style={{ paddingTop: '16px', paddingBottom: '16px' }}>
                        <Text>Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?</Text>
                    </div>
                </Modal>
            </div>
        </Header>
    );
};
