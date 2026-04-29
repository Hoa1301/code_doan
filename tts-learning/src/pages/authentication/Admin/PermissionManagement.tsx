import { FC, useState } from 'react';
import {
    Table,
    Tag,
    Typography,
    Card,
    Button,
    Modal,
    Checkbox,
    Row,
    Col,
    Divider,
    Space,
    Input,
    message,
    Tooltip
} from 'antd';
import {
    SafetyCertificateOutlined,
    SettingOutlined,
    SearchOutlined,
    InfoCircleOutlined,
    PlusOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

interface PermissionCategory {
    name: string;
    key: string;
    items: { label: string; value: string }[];
}

interface RolePermission {
    key: string;
    role: string;
    permissions: string[];
    description: string;
    userCount: number;
}

const ALL_PERMISSIONS: PermissionCategory[] = [
    {
        name: 'Quản lý Tuyển dụng',
        key: 'recruitment',
        items: [
            { label: 'Xem tin tuyển dụng', value: 'VIEW_JOBS' },
            { label: 'Quản lý tin tuyển dụng', value: 'MANAGE_JOBS' },
            { label: 'Sàng lọc hồ sơ (CV)', value: 'SCREEN_CVS' },
            { label: 'Lên lịch phỏng vấn', value: 'SCHEDULE_INTERVIEW' },
            { label: 'Phê duyệt kết quả', value: 'APPROVE_RESULTS' }
        ]
    },
    {
        name: 'Quản lý Đào tạo',
        key: 'training',
        items: [
            { label: 'Xem lộ trình học', value: 'VIEW_LEARNING_PATH' },
            { label: 'Quản lý module học', value: 'MANAGE_MODULES' },
            { label: 'Giao bài tập', value: 'ASSIGN_TASKS' },
            { label: 'Chấm bài & Đánh giá', value: 'EVALUATE_TASKS' },
            { label: 'Báo cáo đào tạo', value: 'TRAINING_REPORTS' }
        ]
    },
    {
        name: 'Hệ thống & Admin',
        key: 'admin',
        items: [
            { label: 'Quản lý người dùng', value: 'MANAGE_USERS' },
            { label: 'Phân quyền hệ thống', value: 'MANAGE_ROLES' },
            { label: 'Xem Logs hệ thống', value: 'VIEW_LOGS' },
            { label: 'Cấu hình chung', value: 'SYSTEM_SETTINGS' }
        ]
    }
];

export const PermissionManagement: FC = () => {
    const { t } = useTranslation();
    const [searchText, setSearchText] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<RolePermission | null>(null);
    const [checkedPermissions, setCheckedPermissions] = useState<string[]>([]);

    const [roles, setRoles] = useState<RolePermission[]>([
        {
            key: '1',
            role: 'Admin',
            permissions: ['FULL_ACCESS'],
            description: 'Toàn quyền quản trị hệ thống và cấu hình nhạy cảm.',
            userCount: 2
        },
        {
            key: '2',
            role: 'Mentor',
            permissions: ['VIEW_LEARNING_PATH', 'MANAGE_MODULES', 'ASSIGN_TASKS', 'EVALUATE_TASKS', 'SCREEN_CVS'],
            description: 'Phụ trách chuyên môn, hướng dẫn và đánh giá thực tập sinh.',
            userCount: 8
        },
        {
            key: '3',
            role: 'Intern',
            permissions: ['VIEW_LEARNING_PATH', 'VIEW_JOBS'],
            description: 'Đối tượng tham gia đào tạo, thực hiện bài tập và xem tin tuyển dụng.',
            userCount: 45
        },
        {
            key: '4',
            role: 'HR Manager',
            permissions: ['VIEW_JOBS', 'MANAGE_JOBS', 'SCREEN_CVS', 'SCHEDULE_INTERVIEW', 'APPROVE_RESULTS'],
            description: 'Quản lý toàn bộ quy trình đầu vào và tuyển dụng.',
            userCount: 3
        }
    ]);

    const handleConfigPermissions = (role: RolePermission) => {
        setSelectedRole(role);
        setCheckedPermissions(role.permissions);
        setIsEditModalOpen(true);
    };

    const handleSavePermissions = () => {
        if (!selectedRole) return;
        setRoles(roles.map((r) => (r.key === selectedRole.key ? { ...r, permissions: checkedPermissions } : r)));
        message.success(`Cập nhật quyền cho vai trò ${selectedRole.role} thành công`);
        setIsEditModalOpen(false);
    };

    const columns = [
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            width: 150,
            render: (text: string) => (
                <Text strong style={{ color: '#1E40AF' }}>
                    {text}
                </Text>
            )
        },
        {
            title: 'Mô tả chi tiết',
            dataIndex: 'description',
            key: 'description',
            width: 300,
            render: (text: string) => (
                <Text type='secondary' style={{ fontSize: '13px' }}>
                    {text}
                </Text>
            )
        },
        {
            title: 'Số người dùng',
            dataIndex: 'userCount',
            key: 'userCount',
            render: (count: number) => <Tag color='blue'>{count} người dùng</Tag>
        },
        {
            title: 'Quyền hạn active',
            key: 'permissions_count',
            render: (record: RolePermission) => (
                <Space>
                    <Tag color={record.permissions.includes('FULL_ACCESS') ? 'volcano' : 'purple'}>
                        {record.permissions.includes('FULL_ACCESS')
                            ? 'TOÀN QUYỀN'
                            : `${record.permissions.length} quyền`}
                    </Tag>
                    {record.permissions.length > 0 && !record.permissions.includes('FULL_ACCESS') && (
                        <Tooltip
                            title={
                                record.permissions.slice(0, 3).join(', ') + (record.permissions.length > 3 ? '...' : '')
                            }
                        >
                            <InfoCircleOutlined style={{ color: '#bfbfbf' }} />
                        </Tooltip>
                    )}
                </Space>
            )
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 150,
            fixed: 'right',
            render: (record: RolePermission) => (
                <Button
                    type='text'
                    icon={<SettingOutlined />}
                    onClick={() => handleConfigPermissions(record)}
                    style={{ color: '#1E40AF' }}
                >
                    Cấu hình quyền
                </Button>
            )
        }
    ];

    const filteredRoles = roles.filter(
        (role) =>
            role.role.toLowerCase().includes(searchText.toLowerCase()) ||
            role.description.toLowerCase().includes(searchText.toLowerCase())
    );

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
                            Phân quyền hệ thống
                        </Title>
                        <Text type='secondary'>
                            Định nghĩa các vai trò và gán quyền hạn chi tiết cho từng nhóm người dùng.
                        </Text>
                    </div>
                    <Button
                        type='primary'
                        size='large'
                        icon={<PlusOutlined />}
                        onClick={() => setIsAddRoleModalOpen(true)}
                        style={{ height: '45px', borderRadius: '8px', padding: '0 24px' }}
                    >
                        Tạo vai trò mới
                    </Button>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <Input
                        placeholder='Tìm kiếm vai trò...'
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        style={{ width: '350px', borderRadius: '8px' }}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        allowClear
                    />
                </div>

                <Table
                    dataSource={filteredRoles}
                    columns={columns}
                    scroll={{ x: 'max-content' }}
                    pagination={false}
                    style={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}
                />

                <Modal
                    title={
                        <Space>
                            <SafetyCertificateOutlined style={{ color: '#1E40AF' }} /> Cấu hình quyền hạn:{' '}
                            {selectedRole?.role}
                        </Space>
                    }
                    open={isEditModalOpen}
                    onOk={handleSavePermissions}
                    onCancel={() => setIsEditModalOpen(false)}
                    width={800}
                    centered
                    okText='Lưu thay đổi'
                    cancelText='Đóng'
                >
                    <div style={{ maxHeight: '60vh', overflowY: 'auto', padding: '10px' }}>
                        {ALL_PERMISSIONS.map((category) => (
                            <div key={category.key} style={{ marginBottom: '24px' }}>
                                <Title
                                    level={5}
                                    style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}
                                >
                                    <span
                                        style={{
                                            width: '4px',
                                            height: '18px',
                                            background: '#1E40AF',
                                            marginRight: '8px',
                                            borderRadius: '2px',
                                            display: 'inline-block'
                                        }}
                                    ></span>
                                    {category.name}
                                </Title>
                                <Checkbox.Group
                                    style={{ width: '100%' }}
                                    value={checkedPermissions}
                                    onChange={(checkedValues) => setCheckedPermissions(checkedValues as string[])}
                                >
                                    <Row gutter={[16, 16]}>
                                        {category.items.map((item) => (
                                            <Col span={8} key={item.value}>
                                                <Checkbox value={item.value}>{item.label}</Checkbox>
                                            </Col>
                                        ))}
                                    </Row>
                                </Checkbox.Group>
                                <Divider style={{ margin: '16px 0' }} />
                            </div>
                        ))}
                    </div>
                </Modal>

                <Modal
                    title='Thêm vai trò người dùng mới'
                    open={isAddRoleModalOpen}
                    onCancel={() => setIsAddRoleModalOpen(false)}
                    okText='Tạo vai trò'
                    cancelText='Hủy bỏ'
                    centered
                >
                    <div style={{ padding: '12px 0' }}>
                        <div style={{ marginBottom: '16px' }}>
                            <Text strong>
                                Tên vai trò <span style={{ color: 'red' }}>*</span>
                            </Text>
                            <Input placeholder='VD: Quản lý chi nhánh' style={{ marginTop: '8px' }} />
                        </div>
                        <div>
                            <Text strong>Mô tả công việc</Text>
                            <Input.TextArea
                                rows={3}
                                placeholder='Mô tả trách nhiệm của vai trò này'
                                style={{ marginTop: '8px' }}
                            />
                        </div>
                    </div>
                </Modal>
            </Card>
        </div>
    );
};
