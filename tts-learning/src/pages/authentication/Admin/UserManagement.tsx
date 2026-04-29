import { FC, useState, useEffect } from 'react';
import {
    Table,
    Tag,
    Space,
    Button,
    Typography,
    Card,
    Input,
    Select,
    Modal,
    Form,
    message,
    Popconfirm,
    Tooltip,
    Avatar
} from 'antd';
import {
    UserAddOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    ReloadOutlined,
    UserOutlined,
    CheckCircleOutlined,
    StopOutlined
} from '@ant-design/icons';
import { http } from '../../../utils/http';

const { Title, Text } = Typography;
const { Option } = Select;

interface UserRecord {
    key: string;
    name: string;
    email: string;
    role: 'super_admin' | 'hr' | 'mentor' | 'intern' | 'director' | 'admin' | string;
    status: 'Active' | 'Inactive';
    lastLogin?: string;
}

export const UserManagement: FC = () => {
    const [searchText, setSearchText] = useState('');
    const [roleFilter, setRoleFilter] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
    const [form] = Form.useForm();

    const [usersData, setUsersData] = useState<{
        data?: Record<string, unknown>[];
        pagination?: { totalRows: number };
    } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const res = await http.get('/users');
            setUsersData(res);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAddUser = () => {
        setEditingUser(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEditUser = (record: UserRecord) => {
        setEditingUser(record);
        form.setFieldsValue({ ...record, role: record.role?.toLowerCase() });
        setIsModalOpen(true);
    };

    const handleDeleteUser = async (key: string) => {
        try {
            await http.delete(`/users/${key}`);
            message.success('Xóa người dùng thành công');
            fetchUsers();
        } catch {
            message.error('Xóa thất bại');
        }
    };

    const handleModalOk = () => {
        form.validateFields().then(async (values) => {
            try {
                if (editingUser) {
                    await http.patch(`/users/${editingUser.key}`, values);
                    message.success('Cập nhật người dùng thành công');
                } else {
                    await http.post('/users', {
                        fullName: values.name,
                        email: values.email,
                        password: values.password,
                        role: values.role
                    });
                    message.success('Tạo người dùng thành công');
                }
                setIsModalOpen(false);
                fetchUsers();
            } catch {
                message.error('Thao tác thất bại');
            }
        });
    };

    const allUsers: UserRecord[] = (usersData?.data || []).map((u: Record<string, unknown>) => ({
        key: String(u.id),
        name: String(u.name || u.fullName || ''),
        email: String(u.email || ''),
        role: String(u.role || 'User'),
        status: (u.status === 'Inactive' ? 'Inactive' : 'Active') as 'Active' | 'Inactive',
        lastLogin: String(u.lastLogin || '-')
    }));

    const filteredUsers = allUsers.filter((user) => {
        const matchesSearch =
            user.name?.toLowerCase().includes(searchText.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchText.toLowerCase());
        const matchesRole = !roleFilter || user.role?.toLowerCase() === roleFilter.toLowerCase();
        return matchesSearch && matchesRole;
    });

    const columns = [
        {
            title: 'Người dùng',
            key: 'user',
            render: (record: UserRecord) => (
                <Space>
                    <Avatar
                        icon={<UserOutlined />}
                        style={{ backgroundColor: record.role === 'Admin' ? '#1E40AF' : '#f56a00' }}
                    />
                    <div>
                        <Text strong style={{ display: 'block' }}>
                            {record.name}
                        </Text>
                        <Text type='secondary' style={{ fontSize: '12px' }}>
                            {record.email}
                        </Text>
                    </div>
                </Space>
            )
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            render: (role: string) => {
                let color = 'default';
                let label = role;
                if (role === 'super_admin') {
                    color = 'magenta';
                    label = 'Super Admin';
                }
                if (role === 'admin') {
                    color = 'blue';
                    label = 'Admin';
                }
                if (role === 'hr') {
                    color = 'cyan';
                    label = 'HR';
                }
                if (role === 'mentor') {
                    color = 'green';
                    label = 'Mentor';
                }
                if (role === 'director') {
                    color = 'purple';
                    label = 'Giám đốc';
                }
                if (role === 'intern') {
                    color = 'orange';
                    label = 'TTS';
                }
                return <Tag color={color}>{label.toUpperCase()}</Tag>;
            }
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag
                    icon={status === 'Active' ? <CheckCircleOutlined /> : <StopOutlined />}
                    color={status === 'Active' ? 'success' : 'error'}
                >
                    {status === 'Active' ? 'Đang hoạt động' : 'Đã khóa'}
                </Tag>
            )
        },
        {
            title: 'Đăng nhập cuối',
            dataIndex: 'lastLogin',
            key: 'lastLogin',
            render: (text: string) => (
                <Text type='secondary' style={{ fontSize: '13px' }}>
                    {text}
                </Text>
            )
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 120,
            fixed: 'right' as const,
            render: (record: UserRecord) => (
                <Space size='small'>
                    <Tooltip title='Chỉnh sửa'>
                        <Button type='text' icon={<EditOutlined />} onClick={() => handleEditUser(record)} />
                    </Tooltip>
                    <Popconfirm
                        title='Xác nhận xóa'
                        description='Bạn có chắc chắn muốn xóa người dùng này?'
                        onConfirm={() => handleDeleteUser(record.key)}
                        okText='Xóa'
                        cancelText='Hủy'
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title='Xóa'>
                            <Button type='text' danger icon={<DeleteOutlined />} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Card bordered={false} style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '32px'
                    }}
                >
                    <div>
                        <Title level={3} style={{ margin: 0, color: '#1a3353' }}>
                            Quản lý người dùng
                        </Title>
                        <Text type='secondary'>Quản lý tài khoản, vai trò và quyền truy cập của nhân viên.</Text>
                    </div>
                    <Button
                        type='primary'
                        size='large'
                        icon={<UserAddOutlined />}
                        onClick={handleAddUser}
                        style={{ height: '45px', borderRadius: '8px', padding: '0 24px' }}
                    >
                        Thêm người dùng mới
                    </Button>
                </div>

                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    <Input
                        placeholder='Tìm kiếm theo tên hoặc email...'
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        style={{ width: '300px', borderRadius: '8px' }}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        allowClear
                    />
                    <Select
                        placeholder='Lọc theo vai trò'
                        style={{ width: '180px' }}
                        value={roleFilter}
                        onChange={setRoleFilter}
                        allowClear
                    >
                        <Option value='admin'>Admin</Option>
                        <Option value='hr'>HR</Option>
                        <Option value='mentor'>Mentor</Option>
                        <Option value='intern'>TTS</Option>
                        <Option value='director'>Giám đốc</Option>
                    </Select>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => {
                            setSearchText('');
                            setRoleFilter(null);
                        }}
                    />
                </div>

                <Table
                    dataSource={filteredUsers}
                    columns={columns}
                    scroll={{ x: 'max-content' }}
                    loading={isLoading}
                    pagination={{ pageSize: 8, showSizeChanger: true, total: usersData?.pagination?.totalRows }}
                    style={{ borderRadius: '8px' }}
                    rowKey='key'
                />

                <Modal
                    title={editingUser ? 'Cập nhật người dùng' : 'Thêm người dùng mới'}
                    open={isModalOpen}
                    onOk={handleModalOk}
                    onCancel={() => setIsModalOpen(false)}
                    okText={editingUser ? 'Cập nhật' : 'Tạo mới'}
                    cancelText='Hủy bỏ'
                    width={500}
                    centered
                >
                    <Form form={form} layout='vertical' style={{ marginTop: '24px' }}>
                        <Form.Item
                            name='name'
                            label='Họ và tên'
                            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                        >
                            <Input placeholder='Nguyễn Văn A' />
                        </Form.Item>
                        <Form.Item
                            name='email'
                            label='Địa chỉ Email'
                            rules={[
                                { required: true, message: 'Vui lòng nhập email' },
                                { type: 'email', message: 'Email không đúng định dạng' }
                            ]}
                        >
                            <Input placeholder='example@company.com' />
                        </Form.Item>
                        {!editingUser && (
                            <Form.Item
                                name='password'
                                label='Mật khẩu'
                                rules={[
                                    { required: true, message: 'Vui lòng nhập mật khẩu' },
                                    { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' }
                                ]}
                            >
                                <Input.Password placeholder='Nhập mật khẩu đăng nhập' />
                            </Form.Item>
                        )}
                        <Form.Item
                            name='role'
                            label='Vai trò'
                            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
                        >
                            <Select placeholder='Chọn vai trò'>
                                <Option value='admin'>Admin</Option>
                                <Option value='hr'>HR</Option>
                                <Option value='mentor'>Mentor</Option>
                                <Option value='intern'>TTS</Option>
                                <Option value='director'>Giám đốc</Option>
                            </Select>
                        </Form.Item>
                        {editingUser && (
                            <Form.Item name='status' label='Trạng thái'>
                                <Select>
                                    <Option value='Active'>Đang hoạt động</Option>
                                    <Option value='Inactive'>Đã khóa</Option>
                                </Select>
                            </Form.Item>
                        )}
                    </Form>
                </Modal>
            </Card>
        </div>
    );
};
