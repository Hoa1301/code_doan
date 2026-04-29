import {
    PlusOutlined,
    SearchOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    EditOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import {
    Button,
    Card,
    Col,
    Input,
    Row,
    Select,
    Space,
    Table,
    Tag,
    Typography,
    Modal,
    Form,
    InputNumber,
    message,
    DatePicker
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import TextArea from 'antd/es/input/TextArea';
import dayjs, { Dayjs } from 'dayjs';
import { http } from '../../../utils/http';
import { CreateMentorRequestParams, MentorRequest } from '../../../services/Recruitment/mentorRequests';
import { useResponsive } from '../../../hooks/useResponsive';
import { notify } from '../../../utils/notify';

const { Title, Text } = Typography;

interface MentorRequestFormValues {
    priority: 'high' | 'medium' | 'low';
    title: string;
    department: string;
    position?: string;
    quantity?: number;
    requiredSkills?: string;
    expectedStartDate?: Dayjs;
}

export const MentorRequestList = () => {
    const { t } = useTranslation();
    const { isMobile, isLaptop } = useResponsive();
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form] = Form.useForm();
    const [isLoading, setIsLoading] = useState(false);
    const [isMutating, setIsMutating] = useState(false);

    // Data handling
    const [requestsData, setRequestsData] = useState<any>(null);

    const fetchRequests = async () => {
        setIsLoading(true);
        try {
            const res = await http.get('/mentor-requests');
            setRequestsData(res);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const requests: MentorRequest[] = requestsData?.hits || requestsData?.data || [];
    const filteredRequests = useMemo(() => {
        const normalizedKeyword = searchText.trim().toLowerCase();

        return requests.filter((record) => {
            const normalizedStatus = String(record.status || '').toLowerCase();
            const matchesStatus = statusFilter === 'all' || normalizedStatus === statusFilter;
            const matchesKeyword =
                !normalizedKeyword ||
                String(record.title || '')
                    .toLowerCase()
                    .includes(normalizedKeyword) ||
                String(record.department || '')
                    .toLowerCase()
                    .includes(normalizedKeyword) ||
                String(record.position || '')
                    .toLowerCase()
                    .includes(normalizedKeyword) ||
                String(record.requiredSkills || '')
                    .toLowerCase()
                    .includes(normalizedKeyword) ||
                String(record.mentor?.fullName || '')
                    .toLowerCase()
                    .includes(normalizedKeyword);

            return matchesStatus && matchesKeyword;
        });
    }, [requests, searchText, statusFilter]);

    const handleOpenCreate = () => {
        setEditingId(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleOpenEdit = (record: MentorRequest) => {
        setEditingId(record.id);
        form.setFieldsValue({
            ...record,
            position: record.position,
            expectedStartDate: record.expectedStartDate ? dayjs(record.expectedStartDate) : undefined
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (values: any) => {
        setIsMutating(true);
        try {
            const formData: any = {
                title: values.title,
                department: values.department,
                position: values.position,
                quantity: values.quantity,
                requiredSkills: values.requiredSkills,
                priority: values.priority?.toLowerCase(),
                expectedStartDate: values.expectedStartDate ? values.expectedStartDate.format('YYYY-MM-DD') : undefined,
                notes: values.notes
            };

            if (editingId) {
                await http.patch(`/mentor-requests/${editingId}`, {
                    ...formData,
                    status: (requests.find((r) => r.id === editingId)?.status || 'pending').toLowerCase()
                });
                notify.success(t('mentor_request.update_success'));
            } else {
                await http.post('/mentor-requests', formData);
                notify.success(t('mentor_request.create_success'));
            }
            fetchRequests();
            setIsModalOpen(false);
            form.resetFields();
        } catch {
            notify.error(t('common.error'));
        } finally {
            setIsMutating(false);
        }
    };

    const handleDelete = (id: string) => {
        Modal.confirm({
            title: t('mentor_request.confirm_delete'),
            content: t('mentor_request.confirm_delete_msg'),
            okText: t('common.delete'),
            cancelText: t('common.cancel'),
            okButtonProps: { danger: true },
            onOk: async () => {
                try {
                    await http.delete(`/mentor-requests/${id}`);
                    fetchRequests();
                    notify.success(t('mentor_request.delete_success'));
                } catch {
                    notify.error(t('common.error'));
                }
            }
        });
    };

    const getStatusColor = (status: string) => {
        const s = status?.toLowerCase();
        switch (s) {
            case 'pending':
                return 'warning';
            case 'approved':
                return 'success';
            case 'rejected':
                return 'error';
            case 'in_progress':
                return 'processing';
            default:
                return 'default';
        }
    };

    const getStatusIcon = (status: string) => {
        const s = status?.toLowerCase();
        switch (s) {
            case 'pending':
                return <ClockCircleOutlined />;
            case 'approved':
                return <CheckCircleOutlined />;
            case 'rejected':
                return <CloseCircleOutlined />;
            default:
                return <ClockCircleOutlined />;
        }
    };

    const getStatusText = (status: string) => {
        const s = status?.toLowerCase();
        switch (s) {
            case 'pending':
                return t('mentor_request.pending');
            case 'approved':
                return t('mentor_request.approved');
            case 'rejected':
                return t('mentor_request.rejected');
            case 'in_progress':
                return t('mentor_request.in_progress');
            default:
                return status;
        }
    };

    const getPriorityColor = (priority: string) => {
        const p = priority?.toLowerCase();
        switch (p) {
            case 'high':
                return 'red';
            case 'medium':
                return 'orange';
            case 'low':
                return 'blue';
            default:
                return 'default';
        }
    };

    const getPriorityText = (priority: string) => {
        const p = priority?.toLowerCase();
        switch (p) {
            case 'high':
                return t('mentor_request.high');
            case 'medium':
                return t('mentor_request.medium');
            case 'low':
                return t('mentor_request.low');
            default:
                return priority;
        }
    };

    const columns: ColumnsType<MentorRequest> = [
        {
            title: t('mentor_request.request_title'),
            dataIndex: 'title',
            key: 'title',
            render: (text, record) => (
                <div>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>{text}</div>
                    <Text type='secondary' style={{ fontSize: '12px' }}>
                        {record.mentor?.fullName}
                    </Text>
                </div>
            )
        },
        {
            title: t('mentor_request.department'),
            dataIndex: 'department',
            key: 'department',
            width: 150
        },
        {
            title: t('mentor_request.positions_quantity'),
            key: 'positions',
            width: 250,
            render: (_, record) => (
                <div>
                    <Tag style={{ marginBottom: '4px' }}>{record.position}</Tag>
                    {record.quantity && (
                        <div style={{ marginTop: '4px' }}>
                            <Text type='secondary' style={{ fontSize: '12px' }}>
                                {t('mentor_request.form.quantity')}: {record.quantity}
                            </Text>
                        </div>
                    )}
                </div>
            )
        },
        {
            title: t('mentor_request.priority'),
            dataIndex: 'priority',
            key: 'priority',
            width: 120,
            render: (priority) => <Tag color={getPriorityColor(priority)}>{getPriorityText(priority)}</Tag>
        },
        {
            title: t('mentor_request.status'),
            dataIndex: 'status',
            key: 'status',
            width: 150,
            render: (status) => (
                <Tag icon={getStatusIcon(status)} color={getStatusColor(status)}>
                    {getStatusText(status)}
                </Tag>
            )
        },
        {
            title: t('mentor_request.created_at'),
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 120,
            render: (date) => new Date(date).toLocaleDateString('vi-VN')
        },
        {
            title: t('common.actions'),
            key: 'action',
            width: 100,
            fixed: 'right',
            align: 'center',
            render: (_, record) => (
                <Space>
                    <Button
                        type='text'
                        icon={<EditOutlined />}
                        disabled={record.status?.toLowerCase() !== 'pending'}
                        onClick={() => handleOpenEdit(record)}
                    />
                    <Button
                        type='text'
                        danger
                        icon={<DeleteOutlined />}
                        disabled={record.status?.toLowerCase() === 'approved'}
                        onClick={() => handleDelete(record.id)}
                    />
                </Space>
            )
        }
    ];

    // Stats Calculation
    const pendingCount = requests.filter((r) => r.status?.toLowerCase() === 'pending').length;
    const approvedCount = requests.filter((r) => r.status?.toLowerCase() === 'approved').length;
    const processingCount = requests.filter((r) => r.status?.toLowerCase() === 'in_progress').length;

    return (
        <div style={{ padding: isMobile ? '12px' : isLaptop ? '18px' : '24px' }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: isMobile ? 'flex-start' : 'flex-start',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: isMobile ? '10px' : 0,
                    marginBottom: '24px'
                }}
            >
                <div>
                    <Title level={2} style={{ margin: 0 }}>
                        {t('mentor_request.title')}
                    </Title>
                </div>
                <Button type='primary' icon={<PlusOutlined />} onClick={handleOpenCreate}>
                    {t('mentor_request.create_request')}
                </Button>
            </div>

            <Card bordered={false}>
                <div
                    style={{
                        marginBottom: '16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: isMobile ? '10px' : 0
                    }}
                >
                    <Space wrap>
                        <Input
                            placeholder={t('mentor_request.search_placeholder')}
                            prefix={<SearchOutlined />}
                            style={{ width: isMobile ? '100%' : 250 }}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                        <Select
                            value={statusFilter}
                            style={{ width: isMobile ? '100%' : 150 }}
                            onChange={setStatusFilter}
                            options={[
                                { value: 'all', label: 'All Status' },
                                { value: 'pending', label: t('mentor_request.pending') },
                                { value: 'approved', label: t('mentor_request.approved') },
                                { value: 'rejected', label: t('mentor_request.rejected') },
                                { value: 'in_progress', label: t('mentor_request.in_progress') }
                            ]}
                        />
                    </Space>
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredRequests}
                    rowKey='id'
                    loading={isLoading}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 1200 }}
                />
            </Card>

            <Modal
                title={editingId ? t('mentor_request.edit_request') : t('mentor_request.create_request')}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={isMutating}
                width={isMobile ? 'calc(100vw - 24px)' : isLaptop ? 620 : 700}
                destroyOnClose
            >
                <Form form={form} layout='vertical' onFinish={handleSubmit} initialValues={{ priority: 'medium' }}>
                    <Form.Item
                        label={t('mentor_request.form.priority')}
                        name='priority'
                        rules={[{ required: true, message: t('common.required_field') }]}
                    >
                        <Select>
                            <Select.Option value='high'>{t('mentor_request.high')}</Select.Option>
                            <Select.Option value='medium'>{t('mentor_request.medium')}</Select.Option>
                            <Select.Option value='low'>{t('mentor_request.low')}</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label={t('mentor_request.form.title')}
                        name='title'
                        rules={[{ required: true, message: t('common.required_field') }]}
                    >
                        <Input placeholder='VD: Đề xuất tuyển thêm 5 thực tập sinh Backend' />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label={t('mentor_request.form.department')}
                                name='department'
                                rules={[{ required: true, message: t('common.required_field') }]}
                            >
                                <Select>
                                    <Select.Option value='Engineering'>Engineering</Select.Option>
                                    <Select.Option value='Product'>Product</Select.Option>
                                    <Select.Option value='Design'>Design</Select.Option>
                                    <Select.Option value='QA'>QA</Select.Option>
                                    <Select.Option value='HR'>HR</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item label={t('mentor_request.form.quantity')} name='quantity'>
                                <InputNumber style={{ width: '100%' }} min={1} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item label={t('mentor_request.form.position')} name='position'>
                        <TextArea rows={2} placeholder={t('mentor_request.form.position_placeholder')} />
                    </Form.Item>
                    <Form.Item label={t('mentor_request.form.skills')} name='requiredSkills'>
                        <TextArea rows={2} placeholder={t('mentor_request.form.skills_placeholder')} />
                    </Form.Item>
                    <Form.Item label={t('mentor_request.form.expected_date')} name='expectedStartDate'>
                        <DatePicker style={{ width: '100%' }} format='DD/MM/YYYY' />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
