import { FC, useEffect, useState } from 'react';
import { Row, Col, Card, Typography } from 'antd';
import { TeamOutlined, BookOutlined, SettingOutlined, RightOutlined, GlobalOutlined, CrownOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { RouteConfig } from '../../../constants';
import { getProfile, UserProfile } from '../../../services/auth/profile';
import Cookies from 'js-cookie';

const { Title, Text } = Typography;

interface ModuleCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    onClick: () => void;
}

interface ModuleConfig {
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    path: string;
    allowedRoles?: string[];
}

const ADMIN_ROLES = ['admin', 'super_admin'];
const RECRUITMENT_ROLES = ['hr', ...ADMIN_ROLES];
const TRAINING_ROLES = ['mentor', 'intern', ...ADMIN_ROLES];
const DIRECTOR_ROLES = ['director', ...ADMIN_ROLES];

const getStoredRoles = (): string[] => {
    try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}') as { role?: string; roles?: Array<{ name?: string }> };
        const roleFromSingleField = String(userInfo.role || '').toLowerCase();
        const rolesFromArray = Array.isArray(userInfo.roles)
            ? userInfo.roles.map((role) => String(role?.name || '').toLowerCase()).filter(Boolean)
            : [];

        return Array.from(new Set([roleFromSingleField, ...rolesFromArray].filter(Boolean)));
    } catch {
        return [];
    }
};

const ModuleCard: FC<ModuleCardProps> = ({ title, description, icon, color, onClick }) => (
    <Card
        hoverable
        onClick={onClick}
        style={{
            height: '100%',
            borderRadius: '16px',
            border: 'none',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            transition: 'all 0.3s ease',
            overflow: 'hidden'
        }}
        bodyStyle={{ padding: '32px' }}
        className='group'
    >
        <div
            style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                backgroundColor: `${color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                color: color,
                marginBottom: '24px'
            }}
        >
            {icon}
        </div>
        <Title level={3} style={{ marginBottom: '12px' }}>
            {title}
        </Title>
        <Text type='secondary' style={{ fontSize: '15px', display: 'block', marginBottom: '24px', minHeight: '44px' }}>
            {description}
        </Text>
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                color: color,
                fontWeight: 600,
                fontSize: '16px'
            }}
        >
            <span>Truy cập hệ thống</span>
            <RightOutlined
                style={{ marginLeft: '8px', fontSize: '12px', transition: 'transform 0.3s' }}
                className='group-hover:translate-x-1'
            />
        </div>
    </Card>
);

export const ModuleSelectionPage: FC = () => {
    const navigate = useNavigate();
    const [currentRoles, setCurrentRoles] = useState<string[]>(() => getStoredRoles());
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchProfile = async () => {
            try {
                const response = await getProfile();
                const profileData = (response.data || {}) as UserProfile & { role?: string };
                const roleFromSingleField = String(profileData.role || '').toLowerCase();
                const rolesFromArray = Array.isArray(profileData.roles)
                    ? profileData.roles.map((role) => String(role?.name || '').toLowerCase()).filter(Boolean)
                    : [];
                const roles = Array.from(new Set([roleFromSingleField, ...rolesFromArray].filter(Boolean)));
                localStorage.setItem('userInfo', JSON.stringify({ ...profileData, role: roles[0] || roleFromSingleField }));
                if (roleFromSingleField === 'hr' || roleFromSingleField === 'mentor') {
                    navigate(RouteConfig.RecruitmentDashboard.path);
                    return;
                }

                if (roleFromSingleField === 'intern') {
                    navigate(RouteConfig.InternLearningPath.path);
                    return;
                }

                if (roleFromSingleField === 'director') {
                    navigate(RouteConfig.DirectorApprovals.path);
                    return;
                }
                if (isMounted) {
                    setCurrentRoles(roles);
                }
            } catch {
                Cookies.remove('accessToken', { path: '/' });
                Cookies.remove('accessToken');
                localStorage.removeItem('userInfo');
                if (isMounted) {
                    setCurrentRoles([]);
                    navigate(RouteConfig.LoginPage.path, { replace: true });
                }
            } finally {
                if (isMounted) {
                    setIsLoadingProfile(false);
                }
            }
        };

        void fetchProfile();

        return () => {
            isMounted = false;
        };
    }, []);
    
    const isIntern = currentRoles.includes('intern');
    const trainingEntryPath = isIntern ? RouteConfig.InternLearningPath.path : RouteConfig.TrainingInternList.path;

    const modules: ModuleConfig[] = [
        {
            title: 'Tuyển dụng',
            description: 'Quản lý kế hoạch, tin tuyển dụng, sàng lọc CV và lịch phỏng vấn ứng viên.',
            icon: <TeamOutlined />,
            color: '#1E40AF',
            path: RouteConfig.RecruitmentDashboard.path,
            allowedRoles: RECRUITMENT_ROLES
        },
        {
            title: 'Đào tạo',
            description: 'Quản lý lộ trình học tập, giao task thực tế và đánh giá thực tập sinh.',
            icon: <BookOutlined />,
            color: '#0D9488',
            path: trainingEntryPath,
            allowedRoles: TRAINING_ROLES
        },
        {
            title: 'Giám đốc',
            description: 'Phê duyệt kế hoạch nhân sự, ngân sách và định hướng chiến lược.',
            icon: <CrownOutlined />,
            color: '#8B5CF6',
            path: RouteConfig.DirectorApprovals.path,
            allowedRoles: DIRECTOR_ROLES
        },
        {
            title: 'Quản trị',
            description: 'Cấu hình hệ thống, quản trị người dùng và phân quyền.',
            icon: <SettingOutlined />,
            color: '#F59E0B',
            path: RouteConfig.UserManagement.path,
            allowedRoles: ADMIN_ROLES
        },
        {
            title: 'Trang tuyển dụng',
            description: 'Xem giao diện trang tin tuyển dụng công khai dành cho ứng viên.',
            icon: <GlobalOutlined />,
            color: '#10B981',
            path: RouteConfig.PublicJobBoard.path
        }
    ];

    const visibleModules = modules.filter((module) => {
        if (!module.allowedRoles?.length) {
            return true;
        }

        return module.allowedRoles.some((role) => currentRoles.includes(role));
    });

    if (isLoadingProfile && currentRoles.length === 0) {
        return null;
    }

    return (
        <div
            style={{
                minHeight: 'calc(100vh - 120px)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '40px 24px',
                maxWidth: '1200px',
                margin: '0 auto'
            }}
        >
            <div style={{ marginBottom: '64px', textAlign: 'center' }}>
                <Title level={1} style={{ fontSize: '42px', fontWeight: 800, marginBottom: '16px' }}>
                    Chào mừng bạn quay lại!
                </Title>
                <Text type='secondary' style={{ fontSize: '18px' }}>
                    Vui lòng chọn phân hệ làm việc để bắt đầu.
                </Text>
            </div>

            <Row gutter={[32, 32]} justify="center">
                {visibleModules.map((m) => (
                    <Col xs={24} md={12} lg={8} xl={6} key={m.title}>
                        <ModuleCard {...m} onClick={() => navigate(m.path)} />
                    </Col>
                ))}
            </Row>
        </div>
    );
};
