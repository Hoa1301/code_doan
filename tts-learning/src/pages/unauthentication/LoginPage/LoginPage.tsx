import { InfoCircleOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Input, Typography, message } from 'antd';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { login } from '../../../services/auth/login';
import Cookies from 'js-cookie';
import { useAuth } from '../../../contexts/AuthContext';
import { RouteConfig } from '../../../constants';
import { notify } from '../../../utils/notify';
import { getProfile, UserProfile } from '../../../services/auth/profile';
import backgroundImageUrl from '../../../assets/images/background.png';

const { Title } = Typography;

const loginSchema = z.object({
    email: z.string().min(1, 'Email là bắt buộc').email('Email không hợp lệ'),
    password: z.string().min(1, 'Mật khẩu là bắt buộc').min(6, 'Mật khẩu tối thiểu 6 ký tự')
});

type LoginSchema = z.infer<typeof loginSchema>;

const getPrimaryRole = (profileData?: Partial<UserProfile> & { role?: string }, fallbackRole = '') => {
    const roleFromSingleField = String(profileData?.role || '').toLowerCase();
    const roleFromRolesArray = Array.isArray(profileData?.roles)
        ? String(profileData.roles[0]?.name || '').toLowerCase()
        : '';

    return roleFromSingleField || roleFromRolesArray || String(fallbackRole || '').toLowerCase();
};

export const LoginPage = () => {
    const navigate = useNavigate();
    const { setIsAuthenticated } = useAuth();

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: ''
        }
    });

    // const onFinish = async (values: LoginSchema) => {
    //     try {
    //         const response = await login(values.email, values.password);
    //         if (response.accessToken) {
    //             Cookies.set('accessToken', response.accessToken, { path: '/' });
    //             setIsAuthenticated(true);
    //             notify.success('Đăng nhập thành công!');
    //             navigate(RouteConfig.ModuleSelection.path);
    //         }
    //     } catch (error: any) {
    //         notify.error(error.response?.data?.message || 'Đăng nhập thất bại!');
    //     }
    // };
    const onFinish = async (values: LoginSchema) => {
        try {
            const response = await login(values.email, values.password);

            if (response.accessToken) {
                Cookies.set('accessToken', response.accessToken, { path: '/' });
                setIsAuthenticated(true);

                let profileData: (UserProfile & { role?: string }) | undefined;
                try {
                    const profile = await getProfile();
                    profileData = (profile.data || {}) as UserProfile & { role?: string };
                } catch {
                    profileData = undefined;
                }

                const role = getPrimaryRole(profileData, response.userInfo?.role);
                localStorage.setItem('userInfo', JSON.stringify({ ...response.userInfo, role }));
                notify.success('Đăng nhập thành công!');

                switch (role) {
                    case 'hr':
                        navigate(RouteConfig.RecruitmentDashboard.path);
                        break;
                    case 'mentor':
                        navigate(RouteConfig.TrainingInternList.path);
                        break;
                    case 'intern':
                        navigate(RouteConfig.InternLearningPath.path);
                        break;
                    case 'director':
                        navigate(RouteConfig.DirectorApprovals.path);
                        break;
                    case 'super_admin':
                    case 'admin':
                    default:
                        navigate(RouteConfig.ModuleSelection.path);
                        break;
                }
            }
        } catch (error) {
            notify.error(error.response?.data?.message || 'Đăng nhập thất bại!');
        }
    };

    const inputStyle = {
        height: '48px',
        borderRadius: '12px',
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        fontSize: '16px'
    };

    const buttonStyle = {
        height: '48px',
        borderRadius: '14px',
        background: 'linear-gradient(135deg, #2f3f75, #4c6ef5)',
        color: '#fff',
        fontWeight: 600,
        fontSize: '16px',
        marginTop: '20px',
        boxShadow: '0 10px 25px rgba(76,110,245,0.3)',
        border: 'none'
    };
    return (
        <div
            style={{
                minHeight: '100vh',
                backgroundImage: `url(${backgroundImageUrl})`,
                backgroundSize: 'cover',
                objectFit: 'cover',
                display: 'flex'
            }}
        >
            {/* LEFT */}
            <div style={{ width: '55%' }}></div>

            {/* RIGHT */}
            <div
                style={{
                    width: '40%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px 0'
                }}
            >
                <div
                    style={{
                        maxWidth: '520px',
                        width: '100%',
                        background: 'rgba(255,255,255,0.95)',
                        borderRadius: '36px',
                        padding: '40px 36px',
                        boxShadow: '0 40px 100px rgba(0,0,0,0.25)',
                        backdropFilter: 'blur(14px)'
                    }}
                >
                    <Title
                        level={2}
                        style={{
                            marginBottom: '28px',
                            fontWeight: 700,
                            color: '#1e293b',
                            fontSize: '28px'
                        }}
                    >
                        Chào mừng quay lại
                    </Title>

                    <Form layout='vertical' onFinish={handleSubmit(onFinish)}>
                        <Controller
                            name='email'
                            control={control}
                            render={({ field }) => (
                                <Form.Item
                                    label={<span style={{ fontWeight: 600, fontSize: '18px' }}>Địa chỉ email:</span>}
                                    help={errors.email?.message}
                                    validateStatus={errors.email ? 'error' : ''}
                                >
                                    <Input
                                        {...field}
                                        placeholder='Nhập email của bạn'
                                        prefix={<UserOutlined />}
                                        style={inputStyle}
                                    />
                                </Form.Item>
                            )}
                        />

                        <Controller
                            name='password'
                            control={control}
                            render={({ field }) => (
                                <Form.Item
                                    label={<span style={{ fontWeight: 600, fontSize: '18px' }}>Mật khẩu:</span>}
                                    help={errors.password?.message}
                                    validateStatus={errors.password ? 'error' : ''}
                                >
                                    <Input.Password
                                        {...field}
                                        placeholder='Nhập mật khẩu của bạn'
                                        prefix={<LockOutlined />}
                                        style={inputStyle}
                                    />
                                </Form.Item>
                            )}
                        />

                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                marginTop: '-10px',
                                marginBottom: '10px'
                            }}
                        >
                            <span
                                style={{
                                    fontSize: '15px',
                                    color: '#4c6ef5',
                                    cursor: 'pointer',
                                    fontWeight: 500
                                }}
                                onClick={() => navigate(RouteConfig.ForgotPassword?.path || '/forgot-password')}
                            >
                                Quên mật khẩu?
                            </span>
                        </div>
                        {/* RULE */}
                        <div
                            style={{
                                background: '#eef2ff',
                                border: '1px solid #c7d2fe',
                                borderRadius: '14px',
                                color: '#3730a3',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                padding: '12px 14px',
                                fontSize: '14px',
                                marginTop: '12px'
                            }}
                        >
                            <LockOutlined style={{ fontSize: '20px', marginRight: '10px' }} />
                            Mật khẩu phải có tối thiểu 6 ký tự
                        </div>

                        <Button htmlType='submit' loading={isSubmitting} block style={buttonStyle}>
                            Đăng nhập
                        </Button>
                        {/* <div
                            style={{
                                textAlign: 'center',
                                marginTop: '25px',
                                fontSize: '16px'
                            }}
                        >
                            Chưa có tài khoản?{' '}
                            <span
                                style={{
                                    color: '#4c6ef5',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                                onClick={() => navigate(RouteConfig.Register?.path || '/register')}
                            >
                                Đăng ký
                            </span>
                        </div> */}
                    </Form>
                </div>
            </div>

            <style>{`
                .ant-input:focus,
                .ant-input-password:focus {
                    border-color: #4c6ef5 !important;
                    box-shadow: 0 0 0 3px rgba(76,110,245,0.2);
                }

                .ant-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 16px 30px rgba(76,110,245,0.4);
                }
            `}</style>
        </div>
    );
};
