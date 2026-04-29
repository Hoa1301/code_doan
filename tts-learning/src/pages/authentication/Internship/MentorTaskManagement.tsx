import {
    PlusOutlined,
    ClockCircleOutlined,
    ProjectOutlined,
    EllipsisOutlined,
    CheckOutlined,
    CloseOutlined,
    EyeOutlined,
    LinkOutlined,
    PaperClipOutlined,
    UploadOutlined
} from '@ant-design/icons';
import {
    Avatar,
    Button,
    Card,
    Col,
    Divider,
    Input,
    Row,
    Space,
    Table,
    Tag,
    Typography,
    Modal,
    Form,
    Select,
    DatePicker,
    Dropdown,
    MenuProps,
    App,
    Upload
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { http } from '../../../utils/http';
import { Task } from '../../../services/Internship/tasks';
import { getCompactFileLabel } from '../../../utils';

const { Title, Text } = Typography;
const attachmentButtonStyle = {
    width: '100%',
    height: 'auto',
    padding: 0,
    justifyContent: 'flex-start',
    whiteSpace: 'normal' as const,
    wordBreak: 'break-word' as const,
    textAlign: 'left' as const,
};

export const MentorTaskManagement = () => {
    const { t } = useTranslation();
    const { message: messageApi } = App.useApp();
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [internFilter, setInternFilter] = useState<string>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
    const [taskDetail, setTaskDetail] = useState<Task | null>(null);
    const [revisionTask, setRevisionTask] = useState<Task | null>(null);
    const [assignmentFileList, setAssignmentFileList] = useState<UploadFile[]>([]);
    const [form] = Form.useForm();
    const [revisionForm] = Form.useForm();

    const [tasksData, setTasksData] = useState<any>(null);
    const [internsData, setInternsData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    const revisionRequest = Form.useWatch('revisionRequest', revisionForm) || '';

    const internRecords = internsData?.hits || internsData?.data || [];

    const fetchTasks = async () => {
        setIsLoading(true);
        try {
            const res = await http.get('/tasks');
            setTasksData(res);
        } catch {
            messageApi.error(t('common.error'));
        } finally {
            setIsLoading(false);
        }
    };

    const fetchInterns = async () => {
        try {
            const res = await http.get('/interns');
            setInternsData(res);
        } catch {
            messageApi.error(t('common.error'));
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    useEffect(() => {
        fetchInterns();
    }, []);

    const uploadTaskFile = async (file: File): Promise<string> => {
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        const uploadResult = await http.post<{ fileName?: string; data?: { fileName?: string } }>(
            '/storage/upload',
            uploadFormData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            },
        );
        const fileName = uploadResult?.fileName || uploadResult?.data?.fileName;
        if (!fileName) {
            throw new Error('Upload tài liệu thất bại');
        }

        const urlResult = await http.get<{ url?: string; data?: { url?: string } }>(
            `/storage/url/${encodeURIComponent(fileName)}`,
        );
        return urlResult?.url || urlResult?.data?.url || fileName;
    };

    const handleAddTask = async (values: any) => {
        setIsProcessing(true);
        try {
            const selectedIntern = internRecords.find((i: any) => i.id === values.internId);
            if (!selectedIntern?.mentorId) {
                messageApi.error('Không tìm thấy mentor của thực tập sinh đã chọn');
                return;
            }

            const uploadedAttachmentUrls = await Promise.all(
                assignmentFileList
                    .map((fileItem) => fileItem.originFileObj)
                    .filter(Boolean)
                    .map((file) => uploadTaskFile(file as File)),
            );
            const attachments = Array.from(
                new Set([
                    ...uploadedAttachmentUrls,
                    ...(values.assignmentLink?.trim() ? [values.assignmentLink.trim()] : []),
                ]),
            );

            await http.post('/tasks', {
                title: values.title,
                internId: values.internId,
                mentorId: selectedIntern.mentorId,
                priority: values.priority.toLowerCase() as any,
                dueDate: values.dueDate.format('YYYY-MM-DD'),
                description: values.description || '',
                attachments,
            });
            setIsModalOpen(false);
            form.resetFields();
            setAssignmentFileList([]);
            messageApi.success(t('common.success'));
            fetchTasks();
        } catch {
            messageApi.error(t('common.error'));
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: Task['status']) => {
        try {
            await http.patch(`/tasks/${id}/status`, {
                status: newStatus
            });
            messageApi.success(t('common.success'));
            fetchTasks();
        } catch {
            messageApi.error(t('common.error'));
        }
    };

    const handleViewDetail = async (id: string) => {
        setIsLoadingDetail(true);
        setIsDetailModalOpen(true);
        try {
            const detail = await http.get<Task>(`/tasks/${id}`);
            setTaskDetail(detail);
        } catch {
            messageApi.error(t('common.error'));
            setIsDetailModalOpen(false);
        } finally {
            setIsLoadingDetail(false);
        }
    };

    const openRevisionModal = (task: Task) => {
        setRevisionTask(task);
        revisionForm.setFieldsValue({ revisionRequest: task.revisionRequest || '' });
        setIsRevisionModalOpen(true);
    };

    const handleSubmitRevisionRequest = async () => {
        if (!revisionTask?.id) return;

        try {
            const values = await revisionForm.validateFields();
            const normalizedRevisionRequest = String(values.revisionRequest || '').trim();

            if (!normalizedRevisionRequest) {
                return;
            }

            setIsProcessing(true);
            await http.patch(`/tasks/${revisionTask.id}`, {
                status: 'need_rework',
                revisionRequest: normalizedRevisionRequest,
            });
            messageApi.success(t('common.success'));
            setIsRevisionModalOpen(false);
            setRevisionTask(null);
            revisionForm.resetFields();
            await fetchTasks();

            if (taskDetail?.id === revisionTask.id) {
                const detail = await http.get<Task>(`/tasks/${revisionTask.id}`);
                setTaskDetail(detail);
            }
        } catch (error: any) {
            if (!error?.errorFields) {
                messageApi.error(t('common.error'));
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const responseData = tasksData;
    const dataSource = responseData?.hits || responseData?.data || [];
    const filteredDataSource = useMemo(() => {
        const normalizedKeyword = searchText.trim().toLowerCase();

        return dataSource.filter((task: any) => {
            const normalizedStatus = String(task?.status || '').toLowerCase();
            const matchesStatus = statusFilter === 'all' || normalizedStatus === statusFilter;

            const taskInternId = String(task?.internId || task?.intern?.id || '');
            const matchesIntern = internFilter === 'all' || taskInternId === internFilter;

            const matchesKeyword =
                !normalizedKeyword ||
                String(task?.title || '')
                    .toLowerCase()
                    .includes(normalizedKeyword) ||
                String(task?.description || '')
                    .toLowerCase()
                    .includes(normalizedKeyword) ||
                String(task?.internName || task?.intern?.user?.fullName || task?.intern?.fullName || '')
                    .toLowerCase()
                    .includes(normalizedKeyword);

            return matchesStatus && matchesIntern && matchesKeyword;
        });
    }, [dataSource, searchText, statusFilter, internFilter]);

    const submittedComments = (taskDetail?.comments || []).filter(
        (commentItem) =>
            Boolean(commentItem.attachments?.length) || /^https?:\/\//i.test(String(commentItem.comment || '').trim()),
    );

    const internOptions = [
        { value: 'all', label: t('task_mgmt.all_interns') },
        ...internRecords.map((i: any) => ({
            value: i.id,
            label: i.name || i.fullName || i.user?.fullName || i.user?.email || i.id
        }))
    ];

    const getActionMenu = (record: Task): MenuProps => ({
        items: [
            {
                key: 'view',
                label: t('task_mgmt.view_details'),
                icon: <EyeOutlined />,
                onClick: () => handleViewDetail(record.id)
            },
            {
                key: 'approve',
                label: t('task_mgmt.approve_complete'),
                icon: <CheckOutlined />,
                disabled: record.status === 'completed',
                onClick: () => handleUpdateStatus(record.id, 'completed')
            },
            {
                key: 'return',
                label: t('task_mgmt.request_revision'),
                icon: <CloseOutlined />,
                disabled: record.status === 'completed' || record.status === 'to_do' || record.status === 'need_rework',
                onClick: () => openRevisionModal(record)
            }
        ]
    });

    const columns: ColumnsType<Task> = [
        {
            title: t('task_mgmt.task_title'),
            dataIndex: 'title',
            key: 'title',
            ellipsis: true,
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: t('common.status'),
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => {
                const s = status?.toLowerCase();
                let color = 'default';
                if (s === 'in_progress') color = 'blue';
                if (s === 'completed') color = 'success';
                if (s === 'under_review') color = 'warning';
                if (s === 'need_rework') color = 'error';

                const statusMap: any = {
                    in_progress: t('task_mgmt.in_progress'),
                    under_review: t('task_mgmt.under_review'),
                    completed: t('task_mgmt.completed'),
                    to_do: t('task_mgmt.to_do'),
                    need_rework: t('task_mgmt.need_rework')
                };
                return (
                    <Tag color={color} style={{ borderRadius: '10px' }}>
                        {statusMap[s] || status}
                    </Tag>
                );
            }
        },
        {
            title: t('task_mgmt.intern'),
            dataIndex: 'internName',
            key: 'internName',
            ellipsis: true,
            render: (text, record: any) => (
                <Space>
                    <Avatar size='small' src={record.internAvatar} />
                    <Text>{typeof text === 'string' ? text : record.intern?.user?.fullName || 'N/A'}</Text>
                </Space>
            )
        },
        {
            title: t('task_mgmt.priority'),
            dataIndex: 'priority',
            key: 'priority',
            render: (priority) => {
                const p = priority?.toLowerCase();
                let color = 'blue';
                if (p === 'high') color = 'volcano';
                if (p === 'medium') color = 'gold';
                return (
                    <Tag color={color}>
                        {p === 'high'
                            ? t('task_mgmt.high')
                            : p === 'medium'
                              ? t('task_mgmt.medium')
                              : t('task_mgmt.low')}
                    </Tag>
                );
            }
        },
        {
            title: t('task_mgmt.due_date'),
            dataIndex: 'dueDate',
            key: 'dueDate',
            render: (date) => (
                <Space>
                    <ClockCircleOutlined style={{ fontSize: '12px', color: '#8c8c8c' }} />
                    <Text style={{ fontSize: '13px' }}>{typeof date === 'string' ? date : 'N/A'}</Text>
                </Space>
            )
        },
        {
            title: t('common.actions'),
            key: 'action',
            width: 80,
            fixed: 'right',
            render: (_, record) => (
                <Dropdown menu={getActionMenu(record)} trigger={['click']}>
                    <Button type='text' icon={<EllipsisOutlined />} />
                </Dropdown>
            )
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '24px'
                }}
            >
                <div>
                    <Title level={2} style={{ margin: 0 }}>
                        {t('task_mgmt.title')}
                    </Title>
                </div>
                <Button type='primary' icon={<PlusOutlined />} size='large' onClick={() => setIsModalOpen(true)}>
                    {t('task_mgmt.assign_task')}
                </Button>
            </div>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={24}>
                    <Card variant='borderless' style={{ borderRadius: '12px' }}>
                        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
                            <Space size='middle'>
                                <Select
                                    value={internFilter}
                                    style={{ width: 150 }}
                                    onChange={setInternFilter}
                                    options={internOptions}
                                />
                                <Select
                                    value={statusFilter}
                                    style={{ width: 150 }}
                                    onChange={setStatusFilter}
                                    options={[
                                        { value: 'all', label: t('task_mgmt.all_statuses') },
                                        { value: 'in_progress', label: t('task_mgmt.in_progress') },
                                        { value: 'under_review', label: t('task_mgmt.under_review') },
                                        { value: 'need_rework', label: t('task_mgmt.need_rework') },
                                        { value: 'completed', label: t('task_mgmt.completed') },
                                        { value: 'to_do', label: t('task_mgmt.to_do') }
                                    ]}
                                />
                            </Space>
                            <Input
                                prefix={<ProjectOutlined />}
                                placeholder={t('task_mgmt.search_tasks')}
                                style={{ width: 250 }}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </div>
                        <Table
                            columns={columns}
                            dataSource={filteredDataSource}
                            scroll={{ x: 'max-content' }}
                            loading={isLoading}
                            pagination={{
                                total: filteredDataSource.length,
                                pageSize: 8
                            }}
                            rowKey='id'
                        />
                    </Card>
                </Col>
            </Row>

            <Modal
                title={
                    <Space>
                        <PlusOutlined style={{ color: '#1E40AF' }} /> {t('task_mgmt.assign_task')}
                    </Space>
                }
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={isProcessing}
                destroyOnClose
                afterOpenChange={(open) => {
                    if (!open) {
                        setAssignmentFileList([]);
                    }
                }}
            >
                <Form form={form} layout='vertical' onFinish={handleAddTask} style={{ marginTop: '16px' }}>
                    <Form.Item
                        label={t('task_mgmt.task_title')}
                        name='title'
                        rules={[{ required: true, message: t('common.required_field') }]}
                    >
                        <Input placeholder={t('task_mgmt.task_title')} />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label={t('task_mgmt.intern')}
                                name='internId'
                                rules={[{ required: true, message: t('common.required_field') }]}
                            >
                                <Select
                                    placeholder={t('task_mgmt.choose_intern')}
                                    options={internRecords.map((i: any) => ({ value: i.id, label: i.name || i.fullName }))}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label={t('task_mgmt.due_date')}
                                name='dueDate'
                                rules={[{ required: true, message: t('common.required_field') }]}
                            >
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item
                        label={t('task_mgmt.priority')}
                        name='priority'
                        rules={[{ required: true, message: t('common.required_field') }]}
                    >
                        <Select
                            placeholder={t('task_mgmt.priority')}
                            options={[
                                { value: 'High', label: t('task_mgmt.high') },
                                { value: 'Medium', label: t('task_mgmt.medium') },
                                { value: 'Low', label: t('task_mgmt.low') }
                            ]}
                        />
                    </Form.Item>
                    <Form.Item label={t('learning_path.description_optional')} name='description'>
                        <Input.TextArea rows={3} placeholder={t('learning_path.description_optional')} />
                    </Form.Item>
                    <Form.Item label='Link tài liệu' name='assignmentLink'>
                        <Input prefix={<LinkOutlined />} placeholder='https://drive.google.com/... hoặc link tài liệu khác' />
                    </Form.Item>
                    <Form.Item label='Upload tài liệu'>
                        <Upload
                            multiple
                            beforeUpload={() => false}
                            fileList={assignmentFileList}
                            onChange={({ fileList }) => setAssignmentFileList(fileList)}
                        >
                            <Button icon={<UploadOutlined />}>Chọn tài liệu</Button>
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title={taskDetail?.title || t('task_mgmt.view_details')}
                open={isDetailModalOpen}
                onCancel={() => {
                    setIsDetailModalOpen(false);
                    setTaskDetail(null);
                }}
                footer={null}
                confirmLoading={isLoadingDetail}
            >
                <Space direction='vertical' style={{ width: '100%' }}>
                    <Text type='secondary'>
                        {t('task_mgmt.task_id')}: {taskDetail?.id || 'N/A'}
                    </Text>
                    <Text>
                        {t('task_mgmt.intern')}: {taskDetail?.internName || taskDetail?.intern?.user?.fullName || 'N/A'}
                    </Text>
                    <Text>
                        {t('task_mgmt.priority')}:{' '}
                        {(taskDetail?.priority || '').toLowerCase() === 'high'
                            ? t('task_mgmt.high')
                            : (taskDetail?.priority || '').toLowerCase() === 'medium'
                              ? t('task_mgmt.medium')
                              : t('task_mgmt.low')}
                    </Text>
                    <Text>
                        {t('task_mgmt.due_date')}: {taskDetail?.dueDate || 'N/A'}
                    </Text>
                    <Text>
                        {t('common.status')}: {taskDetail?.status || 'N/A'}
                    </Text>
                    <Text>{taskDetail?.description || 'No description provided.'}</Text>
                    {taskDetail?.revisionRequest ? (
                        <>
                            <Divider style={{ margin: '8px 0' }} />
                            <Card size='small' style={{ borderColor: '#faad14', background: '#fffbe6' }}>
                                <Space direction='vertical' style={{ width: '100%' }} size={6}>
                                    <Text strong>{t('task_mgmt.revision_request')}</Text>
                                    <Text style={{ whiteSpace: 'pre-wrap' }}>{taskDetail.revisionRequest}</Text>
                                </Space>
                            </Card>
                        </>
                    ) : null}
                    <Divider style={{ margin: '8px 0' }} />
                    <Space direction='vertical' style={{ width: '100%' }} size={8}>
                        <Text strong>
                            <PaperClipOutlined style={{ marginRight: '8px' }} />
                            Tài liệu đã giao
                        </Text>
                        {taskDetail?.attachments?.length ? (
                            taskDetail.attachments.map((attachment, index) => (
                                <Button
                                    key={`${attachment}-${index}`}
                                    type='link'
                                    style={attachmentButtonStyle}
                                    onClick={() => window.open(attachment, '_blank', 'noopener,noreferrer')}
                                >
                                    {getCompactFileLabel(attachment)}
                                </Button>
                            ))
                        ) : (
                            <Text type='secondary'>Chưa có tài liệu được giao.</Text>
                        )}
                    </Space>
                    <Divider style={{ margin: '8px 0' }} />
                    <Space direction='vertical' style={{ width: '100%' }} size={8}>
                        <Text strong>Tài liệu thực tập sinh đã nộp</Text>
                        {submittedComments.length ? (
                            submittedComments.map((commentItem) => (
                                <Card key={commentItem.id} size='small'>
                                    <Space direction='vertical' style={{ width: '100%' }} size={6}>
                                        <Text strong>{commentItem.user?.fullName || 'Người dùng'}</Text>
                                        <Text style={{ wordBreak: 'break-all' }}>{commentItem.comment}</Text>
                                        {commentItem.attachments?.length ? (
                                            commentItem.attachments.map((attachment, index) => (
                                                <Button
                                                    key={`${attachment}-${index}`}
                                                    type='link'
                                                    style={attachmentButtonStyle}
                                                    onClick={() => window.open(attachment, '_blank', 'noopener,noreferrer')}
                                                >
                                                    {getCompactFileLabel(attachment)}
                                                </Button>
                                            ))
                                        ) : null}
                                    </Space>
                                </Card>
                            ))
                        ) : (
                            <Text type='secondary'>Chưa có tài liệu nộp.</Text>
                        )}
                    </Space>
                </Space>
            </Modal>

            <Modal
                title={t('task_mgmt.request_revision')}
                open={isRevisionModalOpen}
                onCancel={() => {
                    setIsRevisionModalOpen(false);
                    setRevisionTask(null);
                    revisionForm.resetFields();
                }}
                onOk={handleSubmitRevisionRequest}
                okText={t('task_mgmt.send_revision_request')}
                confirmLoading={isProcessing}
                okButtonProps={{ disabled: !revisionRequest.trim() }}
                destroyOnClose
            >
                <Form form={revisionForm} layout='vertical'>
                    <Space direction='vertical' style={{ width: '100%', marginTop: '16px' }} size={12}>
                        <Text strong>{revisionTask?.title}</Text>
                        <Form.Item
                            label={t('task_mgmt.revision_request')}
                            name='revisionRequest'
                            rules={[{ required: true, whitespace: true, message: t('common.required_field') }]}
                            style={{ marginBottom: 0, width: '100%' }}
                        >
                            <Input.TextArea rows={4} placeholder={t('task_mgmt.revision_request_placeholder')} />
                        </Form.Item>
                    </Space>
                </Form>
            </Modal>
        </div>
    );
};
