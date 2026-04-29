import {
    PlusOutlined,
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    MoreOutlined
} from '@ant-design/icons';
import {
    Button,
    Card,
    Empty,
    Input,
    Select,
    Space,
    Table,
    Tag,
    Typography,
    message,
    Dropdown,
    MenuProps,
    Avatar
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { http } from '../../../utils/http';
import { JobPosition } from '../../../services/Recruitment/jobPositions';
import { RecruitmentJobModal } from './components/RecruitmentJobModal';
import { JobFormValues } from './components/RecruitmentJobModal';
import { Modal } from 'antd';
import { DepartmentSelect } from '../../../components/CommonSelect/DepartmentSelect';
import { useNavigate } from 'react-router-dom';
import { RouteConfig } from '../../../constants';
import { notify } from '../../../utils/notify';

const { Title, Text } = Typography;

type RecruitmentPlanOption = {
    value: string;
    label: string;
    department?: string;
};

const normalizeJobStatus = (status?: string): 'draft' | 'open' | 'closed' | 'on_hold' => {
    const normalized = (status || 'draft').toLowerCase().replace(/\s+/g, '_');
    if (normalized === 'open') return 'open';
    if (normalized === 'closed') return 'closed';
    if (normalized === 'on_hold') return 'on_hold';
    return 'draft';
};

export const RecruitmentJobList = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [searchText, setSearchText] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingJob, setEditingJob] = useState<JobPosition | null>(null);
    const [isViewOnly, setIsViewOnly] = useState(false);

    const [jobPositionsData, setJobPositionsData] = useState<any>(null);
    const [planOptions, setPlanOptions] = useState<RecruitmentPlanOption[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [planFilter, setPlanFilter] = useState('all');

    const fetchJobs = async () => {
        setIsLoading(true);
        try {
            const params: any = {};
            if (planFilter !== 'all') {
                params.planId = planFilter;
            }
            if (searchText) {
                params.searcher = JSON.stringify({ keyword: searchText, field: 'title' });
            }
            if (departmentFilter !== 'All') {
                params.department = departmentFilter;
            }
            const res = await http.get('/job-positions', { params });
            setJobPositionsData(res);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPlans = async () => {
        try {
            const res = await http.get('/recruitment-plans');
            const plans = (res as { data?: Array<Record<string, unknown>> }).data || [];
            const activePlans = plans.filter((plan) => String(plan.status).toLowerCase() === 'active');

            setPlanOptions(
                activePlans.map((plan) => ({
                    value: String(plan.id),
                    label: String(plan.name || plan.batch || plan.id),
                    department: String(plan.department || '')
                }))
            );
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, [searchText, departmentFilter]);

    useEffect(() => {
        fetchPlans();
    }, []);

    const handleStatusChange = async (record: JobPosition) => {
        const currentStatus = normalizeJobStatus(record.status);
        const newStatus = currentStatus === 'open' ? 'closed' : 'open';
        try {
            await http.patch(`/job-positions/${record.id}`, { status: newStatus });
            Modal.success({
                title: t('common.success'),
                content: `${t('recruitment.status_change_success')} (${record.title}: ${newStatus === 'open' ? t('recruitment.status_published') : t('recruitment.status_stopped')})`,
                centered: true,
                okText: t('common.ok')
            });
            fetchJobs();
        } catch (error) {
            console.error(error);
            notify.error(t('common.error'));
        }
    };

    const handleCreate = () => {
        if (planOptions.length === 0) {
            notify.warning('Chưa có kế hoạch tuyển dụng Active để tạo tin tuyển dụng.');
            return;
        }
        setEditingJob(null);
        setIsViewOnly(false);
        setIsModalOpen(true);
    };

    const handleEdit = (record: JobPosition) => {
        setEditingJob(record);
        setIsViewOnly(false);
        setIsModalOpen(true);
    };

    const handleView = (record: JobPosition) => {
        setEditingJob(record);
        setIsViewOnly(true);
        setIsModalOpen(true);
    };

    const handleDelete = async (record: JobPosition) => {
        try {
            await http.delete(`/job-positions/${record.id}`);
            notify.success(t('common.success'));
            fetchJobs();
        } catch (error) {
            console.error(error);
            notify.error(t('common.error'));
        }
    };

    const handleSubmit = async (values: JobFormValues) => {
        const payload = {
            title: values.title,
            recruitmentPlanId: values.campaignId,
            department: values.department,
            requiredQuantity: values.requiredQuantity,
            description: values.description,
            requirements: values.requirements,
            location: values.location,
            salaryRange: values.salaryRange,
            status: values.status,
            deadline: values.deadline
        };

        if (editingJob?.id) {
            await http.patch(`/job-positions/${editingJob.id}`, payload);
        } else {
            await http.post('/job-positions', payload);
        }
    };

    const handleMenuClick = (key: string, record: JobPosition) => {
        if (key === 'view') {
            handleView(record);
        } else if (key === 'edit') {
            handleEdit(record);
        } else if (key === 'delete') {
            Modal.confirm({
                title: t('common.delete_confirm'),
                content: `${t('common.delete_confirm_desc')} ${record.title}?`,
                onOk: () => handleDelete(record)
            });
        }
    };

    const getActionMenu = (record: JobPosition): MenuProps => ({
        items: [
            { key: 'view', label: t('recruitment.view_details'), icon: <EyeOutlined /> },
            { key: 'edit', label: t('common.edit'), icon: <EditOutlined /> },
            { type: 'divider' },
            { key: 'delete', label: t('common.delete'), icon: <DeleteOutlined />, danger: true }
        ],
        onClick: ({ key }) => handleMenuClick(key, record)
    });

    const columns: ColumnsType<JobPosition> = [
        {
            title: t('recruitment.job_title'),
            dataIndex: 'title',
            key: 'title',
            render: (text: any) => (
                <div>
                    <Text strong style={{ display: 'block', color: '#1E40AF' }}>
                        {text}
                    </Text>
                </div>
            )
        },
        {
            title: t('recruitment.plan'),
            dataIndex: 'campaign',
            key: 'campaign',
            render: (text: string) => <Text>{text}</Text>
        },
        {
            title: t('common.department'),
            dataIndex: 'department',
            key: 'department',
            render: (text: any) => <Tag color='blue'>{text}</Tag>
        },

        {
            title: t('candidate.total_applications'),
            dataIndex: 'totalApplications',
            key: 'totalApplications',
            render: (count: number, record: any) => (
                <div
                    style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#1677ff' }}
                    onClick={() =>
                        navigate(`${RouteConfig.CVList.path}?jobId=${record.id}&planId=${record.campaignId}`)
                    }
                >
                    <Avatar.Group maxCount={3} size='small'>
                        <Avatar src={`https://i.pravatar.cc/150?u=${count}`} />
                    </Avatar.Group>
                    <Text type='secondary' style={{ marginLeft: 8, fontSize: '12px' }}>
                        +{count}
                    </Text>
                </div>
            )
        },
        // {
        //     title: t('recruitment.fulfillment'),
        //     key: 'fulfillment',
        //     render: (_: any, record: any) => (
        //         <div style={{ minWidth: '100px' }}>
        //             <Text strong>{record.filled}</Text> / <Text type='secondary'>{record.required}</Text>
        //             <div
        //                 style={{
        //                     width: '100%',
        //                     height: '4px',
        //                     background: '#E2E8F0',
        //                     marginTop: '4px',
        //                     borderRadius: '2px',
        //                     overflow: 'hidden'
        //                 }}
        //             >
        //                 <div
        //                     style={{
        //                         width: `${(record.filled / record.required) * 100}%`,
        //                         height: '100%',
        //                         background: record.filled >= record.required ? '#10B981' : '#1E40AF'
        //                     }}
        //                 />
        //             </div>
        //         </div>
        //     )
        // },
        {
            title: 'Thời hạn',
            dataIndex: 'deadline',
            key: 'deadline',
            render: (text: string) => (
                <Text type='danger' style={{ fontSize: '12px' }}>
                    {text || '—'}
                </Text>
            )
        },
        {
            title: t('common.status'),
            dataIndex: 'status',
            key: 'status',
            render: (status: any, record: JobPosition) => {
                const normalizedStatus = normalizeJobStatus(String(status));

                let color: 'default' | 'success' | 'error' | 'warning' | 'processing' = 'default';
                let label = status;
                if (normalizedStatus === 'open') {
                    color = 'success';
                    label = t('recruitment.status_published');
                } else if (normalizedStatus === 'closed') {
                    color = 'error';
                    label = t('recruitment.status_stopped');
                } else if (normalizedStatus === 'draft') {
                    color = 'warning';
                    label = t('recruitment.draft');
                } else if (normalizedStatus === 'on_hold') {
                    color = 'processing';
                    label = t('recruitment.on_hold');
                }

                return (
                    <Tag
                        color={color}
                        style={{ cursor: 'pointer', borderRadius: '4px', padding: '0 8px' }}
                        onClick={() => handleStatusChange(record)}
                    >
                        {label}
                    </Tag>
                );
            }
        },
        {
            title: t('recruitment.posted'),
            dataIndex: 'postedDate',
            key: 'postedDate',
            render: (text: any) => (
                <Text type='secondary' style={{ fontSize: '12px' }}>
                    {text}
                </Text>
            )
        },
        {
            title: t('common.actions'),
            key: 'action',
            width: 80,
            fixed: 'right',
            render: (_: any, record: any) => (
                <Dropdown menu={getActionMenu(record)} trigger={['click']}>
                    <Button type='text' icon={<MoreOutlined />} />
                </Dropdown>
            )
        }
    ];

    const dataSource = jobPositionsData?.data || [];

    return (
        <div style={{ padding: '24px' }}>
            <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}
            >
                <div>
                    <Title level={3} style={{ margin: 0 }}>
                        {t('recruitment.job_management')}
                    </Title>
                    {/* <Text type='secondary'>{t('recruitment.job_management_desc')}</Text> */}
                </div>
                <Button type='primary' icon={<PlusOutlined />} onClick={handleCreate}>
                    {t('recruitment.create_job_post')}
                </Button>
            </div>

            <Card bordered={false} style={{ borderRadius: '12px' }}>
                <div
                    style={{
                        marginBottom: '16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px'
                    }}
                >
                    <Space size='middle'>
                        <Input
                            placeholder={t('recruitment.search_job_placeholder')}
                            prefix={<SearchOutlined />}
                            style={{ width: 300 }}
                            size='large'
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                        {/* <Select
                            defaultValue='All'
                            style={{ width: 160 }}
                            onChange={setDepartmentFilter}
                            options={[
                                { value: 'All', label: t('common.all_departments') },
                                { value: 'Engineering', label: 'Engineering' },
                                { value: 'Marketing', label: 'Marketing' },
                                { value: 'Design', label: 'Design' },
                                { value: 'Data', label: 'Data Science' }
                            ]}
                        /> */}
                        <DepartmentSelect
                            onChange={(val) => setDepartmentFilter(val)}
                            placeholder={t('common.select_department')}
                            style={{ width: 200, height: 40 }}
                        />
                        <Select
                            value={planFilter}
                            style={{ width: 200, height: 40 }}
                            onChange={setPlanFilter}
                            options={[
                                { value: 'all', label: t('recruitment.all_plans') },
                                ...planOptions.map((p) => ({
                                    value: p.value,
                                    label: p.label
                                }))
                            ]}
                        />
                    </Space>
                    <Space>
                        <Text type='secondary'>
                            {dataSource.length} {t('recruitment.jobs_found')}
                        </Text>
                    </Space>
                </div>

                <Table
                    columns={columns as any}
                    dataSource={dataSource}
                    scroll={{ x: 'max-content' }}
                    loading={isLoading}
                    locale={{ emptyText: <Empty description='Không có dữ liệu' /> }}
                    pagination={{
                        total: jobPositionsData?.pagination?.totalRows || 0,
                        pageSize: 10
                    }}
                    rowKey='id'
                />
            </Card>

            <RecruitmentJobModal
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                onSuccess={() => {
                    setIsModalOpen(false);
                    fetchJobs();
                }}
                campaignOptions={planOptions}
                initialValues={editingJob}
                viewOnly={isViewOnly}
            />
        </div>
    );
};
