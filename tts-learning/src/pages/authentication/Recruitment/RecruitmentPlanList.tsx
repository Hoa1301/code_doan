import { EllipsisOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import {
    App,
    Avatar,
    Button,
    Card,
    Col,
    Dropdown,
    Empty,
    Input,
    MenuProps,
    message,
    Modal,
    Row,
    Select,
    Table,
    Tag,
    Typography
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { RouteConfig } from '../../../constants';
import { http } from '../../../utils/http';
import { RecruitmentPlan } from '../../../services/Recruitment/recruitmentPlans';
import { RecruitmentPlanModal } from './components/RecruitmentPlanModal';
import { notify } from '../../../utils/notify';
import { mapPlanStatusToUI } from '../../../utils/mapping';

const { Title, Text } = Typography;

export const RecruitmentPlanList = () => {
    const { modal } = App.useApp();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<RecruitmentPlan | null>(null);
    const [isViewOnly, setIsViewOnly] = useState(false);

    const [plansData, setPlansData] = useState<any>(null);
    const [adjustingApprovalsByPlanId, setAdjustingApprovalsByPlanId] = useState<Record<string, any>>({});
    const [selectedAdjustment, setSelectedAdjustment] = useState<{ planName: string; approval: any } | null>(null);
    const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const fetchPlans = async () => {
        setIsLoading(true);
        try {
            const [plansRes, approvalsRes] = await Promise.all([
                http.get('/recruitment-plans'),
                http.get('/approvals', {
                    params: {
                        type: 'Recruitment'
                    }
                })
            ]);

            setPlansData(plansRes);

            const approvals = ((approvalsRes as any)?.hits || []) as Array<any>;
            const latestAdjustingByPlanId = approvals.reduce<Record<string, any>>((accumulator, approval) => {
                const entityId = String(approval?.entityId || '');

                if (!entityId || accumulator[entityId]) {
                    return accumulator;
                }

                accumulator[entityId] = approval;
                return accumulator;
            }, {});

            setAdjustingApprovalsByPlanId(latestAdjustingByPlanId);
        } catch (error) {
            console.error(error);
            notify.error('Không thể tải danh sách kế hoạch tuyển dụng. Vui lòng thử lại!');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const handleCreate = () => {
        setEditingPlan(null);
        setIsViewOnly(false);
        setIsModalOpen(true);
    };

    const handleEdit = (record: RecruitmentPlan) => {
        setEditingPlan(record);
        setIsViewOnly(false);
        setIsModalOpen(true);
    };

    const handleView = (record: RecruitmentPlan) => {
        setEditingPlan(record);
        setIsViewOnly(true);
        setIsModalOpen(true);
    };

    const handleMenuClick = (e: any, record: RecruitmentPlan) => {
        if (e.key === 'edit') {
            handleEdit(record);
        } else if (e.key === 'view') {
            handleView(record);
        } else if (e.key === 'view_adjustment_request') {
            const adjustingApproval = adjustingApprovalsByPlanId[record.id];

            notify.info('Đang hiển thị yêu cầu chỉnh sửa từ Giám đốc');

            setSelectedAdjustment({
                planName: record.name,
                approval: adjustingApproval
            });
            setIsAdjustmentModalOpen(true);
        } else if (e.key === 'delete') {
            modal.confirm({
                title: t('common.delete_confirm'),
                content: `${t('common.delete_confirm_desc')} ${record.name}?`,
                onOk: async () => {
                    try {
                        await http.delete(`/recruitment-plans/${record.id}`);
                        // notify.success(t('common.success'));
                        notify.success(`Xóa kế hoạch "${record.name}" thành công!`);
                        fetchPlans();
                    } catch {
                        // notify.error(t('common.error'));
                        notify.error(`Xóa kế hoạch "${record.name}" thất bại. Vui lòng thử lại!`);
                    }
                }
            });
        }
    };

    const getActionMenu = (record: RecruitmentPlan): MenuProps => {
        const status = String(record.status || '').toLowerCase();

        if (status === 'pending_approval') {
            return {
                items: [{ key: 'view', label: t('common.view') }],
                onClick: (e) => handleMenuClick(e, record)
            };
        }

        if (status === 'active') {
            return {
                items: [{ key: 'view', label: t('common.view') }],
                onClick: (e) => handleMenuClick(e, record)
            };
        }

        if (status === 'closed') {
            return {
                items: [
                    { key: 'view', label: t('common.view') },
                    { key: 'delete', label: t('common.delete'), danger: true }
                ],
                onClick: (e) => handleMenuClick(e, record)
            };
        }

        if (status === 'request_edit') {
            return {
                items: [
                    { key: 'view', label: t('common.view') },
                    { key: 'view_adjustment_request', label: 'Xem yêu cầu chỉnh sửa' },
                    { key: 'edit', label: t('common.edit') },
                    { type: 'divider' },
                    { key: 'delete', label: t('common.delete'), danger: true }
                ].filter(Boolean),
                onClick: (e) => handleMenuClick(e, record)
            };
        }

        if (status === 'rejected') {
            return {
                items: [{ key: 'view', label: t('common.view') }].filter(Boolean),
                onClick: (e) => handleMenuClick(e, record)
            };
        }
        // default = draft
        return {
            items: [
                { key: 'view', label: t('common.view') },
                { key: 'edit', label: t('common.edit') },
                { type: 'divider' },
                { key: 'delete', label: t('common.delete'), danger: true }
            ],
            onClick: (e) => handleMenuClick(e, record)
        };
    };

    const columns: ColumnsType<RecruitmentPlan> = [
        {
            title: t('recruitment.campaign_name'),
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => {
                const hasAdjustmentRequest = Boolean(adjustingApprovalsByPlanId[record.id]);

                return (
                    <div style={{ cursor: 'pointer' }} onClick={() => handleView(record)}>
                        <Text strong style={{ display: 'block', color: '#1E40AF' }}>
                            {text}
                            {hasAdjustmentRequest && (
                                <Text strong style={{ color: '#EF4444', marginLeft: 6 }}>
                                    *
                                </Text>
                            )}
                        </Text>
                        <Text type='secondary' style={{ fontSize: '12px' }}>
                            {record.batch}
                        </Text>
                    </div>
                );
            }
        },
        {
            title: t('common.department'),
            dataIndex: 'department',
            key: 'department',
            render: (text) => <Text type='secondary'>{text}</Text>
        },
        {
            title: t('candidate.applied_date'),
            dataIndex: 'startDate',
            key: 'startDate',
            render: (text) => <Text type='secondary'>{text}</Text>
        },
        // {
        //     title: t('candidate.total_applications'),
        //     dataIndex: 'candidates',
        //     key: 'candidates',
        //     render: (count) => (
        //         <div
        //             style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        //             onClick={() => navigate(RouteConfig.CVList.path)}
        //         >
        //             <Avatar.Group maxCount={3} size='small'>
        //                 <Avatar src={`https://i.pravatar.cc/150?u=${count}`} />
        //             </Avatar.Group>
        //             <Text type='secondary' style={{ marginLeft: 8, fontSize: '12px' }}>
        //                 +{count}
        //             </Text>
        //         </div>
        //     )
        // },
        {
            title: t('common.status'),
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const { label, color } = mapPlanStatusToUI(status);
                return <Tag color={color}>{label}</Tag>;
            }
        },
        {
            title: t('common.actions'),
            key: 'action',
            width: 80,
            fixed: 'right',
            render: (_, record) => {
                const menu = getActionMenu(record);

                return (
                    <Dropdown
                        menu={{
                            items: menu.items,
                            onClick: (e) => handleMenuClick(e, record)
                        }}
                        trigger={['click']}
                    >
                        <Button type='text' icon={<EllipsisOutlined />} onClick={(e) => e.stopPropagation()} />
                    </Dropdown>
                );
            }
        }
    ];

    const schedule = [];
    const plans = (plansData?.hits || []) as RecruitmentPlan[];

    const departmentOptions = useMemo(() => {
        const uniqueDepartments = Array.from(
            new Set(
                plans.map((plan) => String(plan.department || '').trim()).filter((department) => department.length > 0)
            )
        ).sort((a, b) => a.localeCompare(b));

        return [
            { value: 'all', label: t('recruitment.all_depts') },
            ...uniqueDepartments.map((dept) => ({ value: dept, label: dept }))
        ];
    }, [plans, t]);

    const filteredPlans = useMemo(() => {
        return plans.filter((plan) => {
            const normalizedSearchText = searchText.trim().toLowerCase();
            const matchesSearch =
                !normalizedSearchText ||
                String(plan.name || '')
                    .toLowerCase()
                    .includes(normalizedSearchText) ||
                String(plan.batch || '')
                    .toLowerCase()
                    .includes(normalizedSearchText);

            const matchesDepartment =
                departmentFilter === 'all' ||
                String(plan.department || '').toLowerCase() === departmentFilter.toLowerCase();

            const planStatus = String(plan.status || '').toLowerCase();
            const matchesStatus = statusFilter === 'all' || planStatus === statusFilter;

            return matchesSearch && matchesDepartment && matchesStatus;
        });
    }, [plans, searchText, departmentFilter, statusFilter]);

    return (
        <div style={{ padding: '24px' }}>
           <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}
            >
                <div>
                    <Title level={3} style={{ margin: 0 }}>
                        {t('recruitment.campaigns')}
                    </Title>
                    {/* <Text type='secondary'>{t('recruitment.job_management_desc')}</Text> */}
                </div>
               

                <Button type='primary' icon={<PlusOutlined />} onClick={handleCreate}>
                                {t('recruitment.create_new_plan')}
                </Button>
            </div>

            <Row gutter={24}>
                <Col xs={24} lg={24}>
                    <Card
                        bordered={false}
                        style={{ borderRadius: '12px' }}
                    >
                        <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <Input
                                prefix={<SearchOutlined />}
                                placeholder={t('recruitment.search_campaigns')}
                                style={{ width: 200, height: 40 }}
                                value={searchText}
                                onChange={(event) => setSearchText(event.target.value)}
                            />
                            <Select
                                value={departmentFilter}
                                style={{ width: 160, height: 40 }}
                                onChange={setDepartmentFilter}
                                options={departmentOptions}
                            />
                            <Select
                                value={statusFilter}
                                style={{ width: 160, height: 40 }}
                                onChange={setStatusFilter}
                                options={[
                                    { value: 'all', label: t('recruitment.status_all') },
                                    { value: 'draft', label: t('recruitment.draft') },
                                    { value: 'active', label: t('internship.active') },
                                    { value: 'pending_approval', label: t('recruitment.pending_approval') },
                                    { value: 'request_edit', label: t('recruitment.request_edit') },
                                    { value: 'closed', label: t('recruitment.closed') }
                                ]}
                            />
                        </div>

                        <Table
                            columns={columns as any}
                            dataSource={filteredPlans}
                            scroll={{ x: 'max-content' }}
                            locale={{ emptyText: <Empty description='Không có dữ liệu' /> }}
                            pagination={{
                                total: filteredPlans.length,
                                pageSize: 15
                            }}
                            loading={isLoading}
                            rowKey='id'
                        />
                    </Card>
                </Col>

                <RecruitmentPlanModal
                    open={isModalOpen}
                    onCancel={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        fetchPlans();
                    }}
                    initialValues={editingPlan as any}
                    viewOnly={isViewOnly}
                />
                <Modal
                    title='Yêu cầu chỉnh sửa từ Giám đốc'
                    open={isAdjustmentModalOpen}
                    onCancel={() => setIsAdjustmentModalOpen(false)}
                    onOk={() => setIsAdjustmentModalOpen(false)}
                    okText='Đã hiểu'
                    cancelButtonProps={{ style: { display: 'none' } }}
                >
                    <div>
                        <Text type='secondary'>Kế hoạch: {selectedAdjustment?.planName || '-'}</Text>
                        <div style={{ marginTop: 12 }}>
                            <Text strong>Nội dung yêu cầu:</Text>
                            <div style={{ marginTop: 8 }}>
                                {selectedAdjustment?.approval?.notes ||
                                    'Giám đốc đã yêu cầu chỉnh sửa kế hoạch này. Vui lòng cập nhật và gửi lại.'}
                            </div>
                        </div>
                        <div style={{ marginTop: 12 }}>
                            <Text strong>Lịch sử yêu cầu chỉnh sửa:</Text>
                            {Array.isArray(selectedAdjustment?.approval?.details?.directorActionHistory) &&
                            selectedAdjustment?.approval?.details?.directorActionHistory?.length ? (
                                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {selectedAdjustment.approval.details.directorActionHistory
                                        .filter((history: any) => history?.action === 'Adjusting')
                                        .sort(
                                            (first: any, second: any) =>
                                                new Date(second.actedAt || second.updatedAt || 0).getTime() -
                                                new Date(first.actedAt || first.updatedAt || 0).getTime()
                                        )
                                        .map((history: any, index: number) => (
                                            <div
                                                key={`${history.actedAt || history.updatedAt || index}`}
                                                style={{
                                                    border: '1px solid #E5E7EB',
                                                    borderRadius: 8,
                                                    padding: '8px 10px',
                                                    background: '#FAFAFA'
                                                }}
                                            >
                                                <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>
                                                    {new Date(
                                                        history.actedAt || history.updatedAt || Date.now()
                                                    ).toLocaleString('vi-VN')}
                                                </div>
                                                <div>{history.note || 'Không có ghi chú.'}</div>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <div style={{ marginTop: 8, color: '#6B7280' }}>Chưa có lịch sử chỉnh sửa.</div>
                            )}
                        </div>
                        <div style={{ marginTop: 12, color: '#6B7280', fontSize: 12 }}>
                            {selectedAdjustment?.approval?.updatedAt
                                ? `Cập nhật lúc: ${new Date(selectedAdjustment.approval.updatedAt).toLocaleString('vi-VN')}`
                                : ''}
                        </div>
                    </div>
                </Modal>
            </Row>
        </div>
    );
};
