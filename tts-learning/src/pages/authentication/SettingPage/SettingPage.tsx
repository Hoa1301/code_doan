import { UserOutlined, MailOutlined, TeamOutlined, LockOutlined } from '@ant-design/icons';
import { Alert, Avatar, Button, Card, Descriptions, Form, Input, Modal, Space, Spin, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { changePassword, getProfile, uploadAvatar } from '../../../services/auth/profile';
import { Upload } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import { notify } from '../../../utils/notify';

const { Title, Text } = Typography;

type ProfileData = {
    id?: string;
    fullName?: string;
    email?: string;
    role?: string;
    avatarUrl?: string;
    roles?: Array<{ name?: string; displayName?: string }>;
};

const toDisplayRole = (profile: ProfileData): string => {
    const primaryRole = String(profile.role || profile.roles?.[0]?.name || '').toLowerCase();
    if (!primaryRole) return 'N/A';

    if (primaryRole === 'super_admin') return 'Super Admin';
    if (primaryRole === 'admin') return 'Admin';
    if (primaryRole === 'hr') return 'HR';
    if (primaryRole === 'mentor') return 'Mentor';
    if (primaryRole === 'director') return 'Director';
    if (primaryRole === 'intern') return 'Intern';
    return primaryRole;
};

export default function SettingPage() {
    const [form] = Form.useForm();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [uploading, setUploading] = useState(false);

    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState<string>();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        let mounted = true;

        const loadProfile = async () => {
            setIsLoading(true);
            setErrorMessage('');
            try {
                const response = await getProfile();
                if (!mounted) return;
                const profileData = (response as any)?.data || {};
                setProfile(profileData);
            } catch {
                if (!mounted) return;
                setErrorMessage('Không thể tải thông tin cá nhân.');
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        void loadProfile();

        return () => {
            mounted = false;
        };
    }, []);

    const handleChangePassword = async (values: {
        currentPassword: string;
        newPassword: string;
        confirmNewPassword: string;
    }) => {
        setIsChangingPassword(true);
        try {
            await changePassword({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword
            });
            window.alert('Đổi mật khẩu thành công.');
            form.resetFields();
        } catch {
            notify.error('Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại và thử lại.');
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleUploadAvatar = async (file: File) => {
        if (!profile?.id) return;

        setUploading(true);

        try {
            const res = await uploadAvatar(profile.id, file);

            setProfile((prev) => ({
                ...prev!,
                avatarUrl: res.avatarUrl
            }));

            notify.success('Cập nhật avatar thành công');
        } catch {
            notify.error('Upload avatar thất bại');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '20px' }}>
                <Title level={3} style={{ margin: 0 }}>
                    Thông tin cá nhân
                </Title>
                <Text type='secondary'>Quản lý thông tin tài khoản và đổi mật khẩu đăng nhập.</Text>
            </div>

            <Space direction='vertical' size={16} style={{ width: '100%', maxWidth: 760 }}>
                <Card bordered={false} style={{ borderRadius: 12 }}>
                    {isLoading ? (
                        <div style={{ padding: '24px 0', textAlign: 'center' }}>
                            <Spin />
                        </div>
                    ) : errorMessage ? (
                        <Alert type='error' message={errorMessage} showIcon />
                    ) : (
                        <Space direction='vertical' size={20} style={{ width: '100%' }}>
                            <Space>
                                <Avatar
                                    size={56}
                                    src={profile?.avatarUrl}
                                    icon={<UserOutlined />}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setIsAvatarModalOpen(true)}
                                />
                                <div>
                                    <Text strong style={{ fontSize: 16, display: 'block' }}>
                                        {profile?.fullName || 'Người dùng'}
                                    </Text>
                                    <Text type='secondary'>{profile?.email || 'N/A'}</Text>
                                </div>
                            </Space>

                            <Descriptions bordered column={1} size='middle'>
                                <Descriptions.Item
                                    label={
                                        <Space>
                                            <MailOutlined />
                                            <span>Email</span>
                                        </Space>
                                    }
                                >
                                    {profile?.email || 'N/A'}
                                </Descriptions.Item>
                                <Descriptions.Item
                                    label={
                                        <Space>
                                            <TeamOutlined />
                                            <span>Vai trò</span>
                                        </Space>
                                    }
                                >
                                    {toDisplayRole(profile || {})}
                                </Descriptions.Item>
                            </Descriptions>
                        </Space>
                    )}
                </Card>
                <Modal
                    title='Cập nhật avatar'
                    open={isAvatarModalOpen}
                    onCancel={() => {
                        setIsAvatarModalOpen(false);
                        setPreviewImage(undefined);
                        setSelectedFile(null);
                    }}
                    onOk={async () => {
                        if (!selectedFile) {
                            notify.warning('Vui lòng chọn ảnh');
                            return;
                        }

                        await handleUploadAvatar(selectedFile);
                        setIsAvatarModalOpen(false);
                        setPreviewImage(undefined);
                        setSelectedFile(null);
                    }}
                    confirmLoading={uploading}
                    okText='Lưu'
                    cancelText='Hủy'
                >
                    <Upload
                        showUploadList={false}
                        beforeUpload={(file) => {
                            const isImage = file.type.startsWith('image/');
                            if (!isImage) {
                                notify.error('Chỉ hỗ trợ ảnh');
                                return Upload.LIST_IGNORE;
                            }

                            const isLt2M = file.size / 1024 / 1024 < 2;
                            if (!isLt2M) {
                                notify.error('Ảnh phải nhỏ hơn 2MB');
                                return Upload.LIST_IGNORE;
                            }

                            const preview = URL.createObjectURL(file);
                            setPreviewImage(preview);
                            setSelectedFile(file);

                            return false;
                        }}
                    >
                        <Button>Chọn ảnh</Button>
                    </Upload>
                    {previewImage && (
                        <div style={{ textAlign: 'center', marginTop: 16 }}>
                            <Avatar size={120} src={previewImage} />
                        </div>
                    )}
                </Modal>
                <Card
                    bordered={false}
                    style={{ borderRadius: 12 }}
                    title={
                        <Space>
                            <LockOutlined />
                            <span>Đổi mật khẩu</span>
                        </Space>
                    }
                >
                    <Form form={form} layout='vertical' onFinish={handleChangePassword}>
                        <Form.Item
                            label='Mật khẩu hiện tại'
                            name='currentPassword'
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại.' }]}
                        >
                            <Input.Password placeholder='Nhập mật khẩu hiện tại' />
                        </Form.Item>

                        <Form.Item
                            label='Mật khẩu mới'
                            name='newPassword'
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu mới.' },
                                { min: 6, message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || value !== getFieldValue('currentPassword')) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Mật khẩu mới phải khác mật khẩu hiện tại.'));
                                    }
                                })
                            ]}
                        >
                            <Input.Password placeholder='Nhập mật khẩu mới' />
                        </Form.Item>

                        <Form.Item
                            label='Xác nhận mật khẩu mới'
                            name='confirmNewPassword'
                            dependencies={['newPassword']}
                            rules={[
                                { required: true, message: 'Vui lòng xác nhận mật khẩu mới.' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('newPassword') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp.'));
                                    }
                                })
                            ]}
                        >
                            <Input.Password placeholder='Nhập lại mật khẩu mới' />
                        </Form.Item>

                        <Form.Item style={{ marginBottom: 0 }}>
                            <Button type='primary' htmlType='submit' loading={isChangingPassword}>
                                Cập nhật mật khẩu
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </Space>
        </div>
    );
}
