import { Layout, Menu, Avatar, Typography, theme, Button, Drawer } from 'antd';
import {
    DashboardOutlined,
    UserOutlined,
    LogoutOutlined,
    TeamOutlined,
    SolutionOutlined,
    BookOutlined,
    FileProtectOutlined,
    RocketOutlined,
    ReadOutlined,
    CheckCircleOutlined,
    UnorderedListOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { RouteConfig } from '../../../constants';
import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { getProfile, UserProfile } from '../../../services/auth/profile';

const { Sider } = Layout;
const { Text } = Typography;

type ModuleType = 'recruitment' | 'training' | 'admin' | 'director' | 'none';

interface NavbarDashboardProps {
    collapsed: boolean;
    isMobile: boolean;
    isLaptop: boolean;
    mobileOpen: boolean;
    onMobileClose: () => void;
}

interface MenuItem {
    key: string;
    icon: ReactNode;
    label: string;
    onClick?: () => void;
    children?: SubMenuItem[];
}

interface SubMenuItem {
    key: string;
    label: string;
    path?: string;
    onClick: () => void;
    icon?: ReactNode;
}

type ProfileWithLegacyRole = UserProfile & { role?: string };

const flattenMenuItems = (items: MenuItem[]): MenuItem[] =>
    items.flatMap((item) => {
        if (!item.children?.length) {
            return [item];
        }

        return item.children.map((child) => ({
            key: child.key,
            icon: child.icon ?? item.icon,
            label: child.label,
            onClick: child.onClick
        }));
    });

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

export const NavbarDashboard = ({ collapsed, isMobile, isLaptop, mobileOpen, onMobileClose }: NavbarDashboardProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();
    const { token } = theme.useToken();
    const { t } = useTranslation();
    const [currentRoles, setCurrentRoles] = useState<string[]>([]);
    const [displayEmail, setDisplayEmail] = useState('N/A');

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
                    setDisplayEmail(profileData.email || 'N/A');
                }
            } catch {
                if (isMounted) {
                    setCurrentRoles([]);
                    setDisplayEmail('N/A');
                }
            }
        };

        void loadProfile();

        return () => {
            isMounted = false;
        };
    }, []);

    const getCurrentModule = (): ModuleType => {
        const path = location.pathname;
        if (path.startsWith('/recruitment')) return 'recruitment';
        if (path.startsWith('/training')) return 'training';
        if (path.startsWith('/director')) return 'director';
        if (path.startsWith('/admin')) return 'admin';
        return 'none';
    };

    const currentModule = getCurrentModule();
    const isIntern = currentRoles.includes('intern');
    const hasMentorPortalAccess = currentRoles.some((role) => ['mentor', 'admin', 'super_admin'].includes(role));
    const isSuperAdmin = currentRoles.includes('super_admin');
    const recruitmentItems: MenuItem[] = [
        {
            key: 'rec-dashboard',
            icon: <DashboardOutlined />,
            label: t('menu.dashboard'),
            onClick: () => navigate(RouteConfig.RecruitmentDashboard.path)
        },
        {
            key: 'rec-plans',
            icon: <FileProtectOutlined />,
            label: t('menu.recruitment_plans'),
            onClick: () => navigate(RouteConfig.RecruitmentPlanList.path)
        },
        {
            key: 'rec-jobs',
            icon: <RocketOutlined />,
            label: t('menu.recruitment_jobs'),
            onClick: () => navigate(RouteConfig.RecruitmentJobList.path)
        },
        {
            key: 'rec-cvs',
            icon: <SolutionOutlined />,
            label: t('menu.cv_management'),
            onClick: () => navigate(RouteConfig.CVList.path)
        },
        {
            key: 'rec-interviews',
            icon: <TeamOutlined />,
            label: t('menu.interviews'),
            onClick: () => navigate(RouteConfig.InterviewSchedule.path)
        },
        {
            key: 'rec-interns',
            icon: <UserOutlined />,
            label: t('menu.intern_list'),
            onClick: () => navigate(RouteConfig.InternList.path)
        }
    ];

    const trainingItems: MenuItem[] = [
        ...(hasMentorPortalAccess
            ? [
                  {
                      key: 'mentor',
                      icon: <SolutionOutlined />,
                      label: t('menu.mentor_portal'),
                      children: [
                          {
                              key: 'train-interns',
                              label: t('menu.intern_list'),
                              onClick: () => navigate(RouteConfig.TrainingInternList.path),
                              icon: <UserOutlined />
                          },
                          {
                              key: 'mentor-path',
                              label: t('menu.learning_path'),
                              onClick: () => navigate(RouteConfig.MentorLearningPath.path),
                              icon: <BookOutlined />
                          },
                          {
                              key: 'mentor-eval',
                              label: t('menu.evaluations'),
                              onClick: () => navigate(RouteConfig.MentorInternList.path),
                              icon: <CheckCircleOutlined />
                          },
                          {
                              key: 'mentor-tasks',
                              label: t('menu.task_management'),
                              onClick: () => navigate(RouteConfig.MentorTaskManagement.path),
                              icon: <UnorderedListOutlined />
                          }
                      ]
                  } satisfies MenuItem
              ]
            : []),
        ...(isIntern
            ? [
                  {
                      key: 'intern',
                      icon: <BookOutlined />,
                      label: t('menu.intern_portal'),
                      children: [
                          {
                              key: 'intern-dash',
                              label: 'Bài giảng',
                              onClick: () => navigate(RouteConfig.InternLearningPath.path),
                              icon: <ReadOutlined />
                          },
                          {
                              key: 'intern-evaluations',
                              label: t('menu.evaluations'),
                              onClick: () => navigate(RouteConfig.InternEvaluation.path),
                              icon: <CheckCircleOutlined />
                          },
                          {
                              key: 'intern-tasks',
                              label: t('menu.task_board'),
                              onClick: () => navigate(RouteConfig.InternTaskBoard.path),
                              icon: <UnorderedListOutlined />
                          }
                      ]
                  }
              ]
            : [])
    ];

    const directorItems: MenuItem[] = [
        {
            key: 'director',
            icon: <FileProtectOutlined />,
            label: t('menu.director_portal'),
            children: [
                {
                    key: 'dir-approvals',
                    label: t('menu.plan_approvals'),
                    onClick: () => navigate(RouteConfig.DirectorApprovals.path),
                    icon: <FileProtectOutlined />
                }
            ]
        }
    ];

    const adminItems: MenuItem[] = [
        {
            key: 'user-management',
            icon: <UserOutlined />,
            label: 'Quản lý người dùng',
            onClick: () => navigate(RouteConfig.UserManagement.path)
        }
    ];

    const getMenuItems = (): MenuItem[] => {
        switch (currentModule) {
            case 'recruitment':
                return flattenMenuItems(recruitmentItems);
            case 'training':
                return flattenMenuItems(trainingItems);
            case 'director':
                return flattenMenuItems(directorItems);
            case 'admin':
                return flattenMenuItems(adminItems);
            default:
                return flattenMenuItems([
                    {
                        key: 'dashboard',
                        icon: <DashboardOutlined />,
                        label: t('menu.dashboard'),
                        onClick: () => navigate(RouteConfig.ModuleSelection.path)
                    }
                ]);
        }
    };

    const getSelectedKeys = (): string[] => {
        const path = location.pathname;
        if (path.includes('/recruitment/dashboard')) return ['rec-dashboard'];
        if (path.includes('/recruitment/plans')) return ['rec-plans'];
        if (path.includes('/recruitment/jobs')) return ['rec-jobs'];
        if (path.includes('/recruitment/cvs')) return ['rec-cvs'];
        if (path.includes('/recruitment/interviews')) return ['rec-interviews'];
        if (path.includes('/recruitment/onboarding')) return ['rec-onboarding'];
        if (path.includes('/recruitment/interns')) return ['rec-interns'];

        if (path.includes('/training/interns')) return ['train-interns'];
        if (path.includes('/training/mentor/learning-paths')) return ['mentor-path'];
        if (path.includes('/training/mentor/interns')) return ['mentor-eval'];
        if (path.includes('/training/mentor/evaluations')) return ['mentor-eval'];
        if (path.includes('/training/mentor/tasks')) return ['mentor-tasks'];

        if (isIntern && path.includes('/training/intern/learning-path')) return ['intern-dash'];
        if (isIntern && path.includes('/training/intern/dashboard')) return ['intern-dash'];
        if (isIntern && path.includes('/training/intern/test')) return ['intern-dash'];
        if (isIntern && path.includes('/training/intern/evaluations')) return ['intern-evaluations'];
        if (isIntern && path.includes('/training/intern/tasks')) return ['intern-tasks'];

        if (path.includes('/director/approvals')) return ['dir-approvals'];
        if (path.includes('/admin/users')) return ['user-management'];

        return ['dashboard'];
    };

    const siderWidth = isLaptop ? 240 : 260;

    const sideContent = (
        <>
            <div
                style={{
                    height: '64px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'flex-start' : 'flex-start',
                    padding: collapsed ? '0 10px' : '0 10px',
                    borderBottom: '1px solid rgba(5, 5, 5, 0.06)'
                }}
            >
                <img
                    src='/assets/logo.png'
                    alt='logo'
                    style={{
                        width: collapsed ? '32px' : '36px',
                        height: collapsed ? '32px' : '36px',
                        objectFit: 'contain',
                        marginRight: collapsed ? 0 : '12px',
                        cursor: 'pointer',
                        flexShrink: 0
                    }}
                    onClick={() => navigate(RouteConfig.ModuleSelection.path)}
                />
                {!collapsed && (
                    <span
                        style={{ fontSize: '18px', fontWeight: '700', color: '#1E293B', cursor: 'pointer' }}
                        onClick={() => navigate(RouteConfig.ModuleSelection.path)}
                    >
                        {currentModule === 'recruitment'
                            ? 'Tuyển dụng'
                            : currentModule === 'training'
                              ? 'Đào tạo'
                              : currentModule === 'director'
                                ? 'Giám đốc'
                                : currentModule === 'admin'
                                  ? 'Quản trị'
                                  : 'Hệ thống'}
                    </span>
                )}
            </div>

           {isSuperAdmin && (
            <div style={{ padding: collapsed ? '12px 8px' : '16px 12px' }}>
                <Button
                    type='default'
                    block={!collapsed}
                    icon={<DashboardOutlined />}
                    onClick={() => navigate(RouteConfig.ModuleSelection.path)}
                    style={{
                        borderRadius: '8px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        border: '1px dashed #E2E8F0'
                    }}
                >
                    {!collapsed && 'Đổi phân hệ'}
                </Button>
            </div>
        )}

            <div style={{ height: 'calc(100vh - 64px - 70px - 72px)', overflowY: 'auto' }}>
                <Menu
                    theme='light'
                    mode='inline'
                    selectedKeys={getSelectedKeys()}
                    items={getMenuItems()}
                    style={{
                        borderRight: 0,
                        fontSize: isLaptop ? '14px' : '15px',
                        fontWeight: 500
                    }}
                />
            </div>

            {/* <div
                style={{
                    height: '70px',
                    borderTop: '1px solid rgba(5, 5, 5, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: collapsed ? '0' : '0 16px',
                    justifyContent: collapsed ? 'center' : 'space-between',
                    background: '#F8FAFC'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                    <Avatar style={{ backgroundColor: token.colorPrimary, flexShrink: 0 }} icon={<UserOutlined />} />
                    {!collapsed && (
                        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <Text
                                strong
                                style={{
                                    fontSize: '14px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}
                            >
                                {toDisplayRole(currentRoles)}
                            </Text>
                            <Text type='secondary' style={{ fontSize: '12px' }}>
                                {displayEmail}
                            </Text>
                        </div>
                    )}
                </div>
                {!collapsed && (
                    <Button type='text' icon={<LogoutOutlined />} onClick={logout} style={{ color: '#64748B' }} />
                )}
            </div> */}
        </>
    );

    if (isMobile) {
        return (
            <Drawer
                open={mobileOpen}
                onClose={onMobileClose}
                width={280}
                placement='left'
                title={null}
                styles={{ body: { padding: 0 } }}
                closable={false}
            >
                {sideContent}
            </Drawer>
        );
    }

    return (
        <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            style={{
                background: '#fff',
                borderRight: '1px solid rgba(5, 5, 5, 0.06)',
                height: '100vh',
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0,
                zIndex: 1001
            }}
            width={siderWidth}
            theme='light'
        >
            {sideContent}
        </Sider>
    );
};

export default NavbarDashboard;
