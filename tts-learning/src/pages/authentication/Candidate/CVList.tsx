import React, { useEffect, useState } from 'react';
import type { ColumnsType } from 'antd/es/table';
import {
    Avatar,
    Badge,
    Button,
    Card,
    Input,
    Tabs,
    Tag,
    Typography,
    Table,
    message,
    Dropdown,
    MenuProps,
    Select
} from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    EyeOutlined,
    SearchOutlined,
    MoreOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { http } from '../../../utils/http';
import { Candidate } from '../../../services/Recruitment/candidates';
import { CVDetailModal } from './components/CVDetailModal';
import { ConvertToInternModal } from './components/ConvertToInternModal';
import { notify } from '../../../utils/notify';

const { Title, Text } = Typography;

interface StatusSummary {
    total: number;
    pending_review: number;
    cv_dat: number; // shortlisted + cv_screened (computed by BE)
    interview_scheduled: number;
    offer: number;
    rejected_cv: number;
    rejected_interview: number;
    [key: string]: number;
}

const TABS = [
    { key: 'all', labelKey: 'candidate.tab_all', summaryKey: 'total' },
    { key: 'pending_review', labelKey: 'candidate.tab_new_cv', summaryKey: 'pending_review' },
    { key: 'cv_dat', labelKey: 'candidate.tab_cv_dat', summaryKey: 'cv_dat' },
    { key: 'interview_scheduled', labelKey: 'candidate.tab_interview', summaryKey: 'interview_scheduled' },
    { key: 'offer', labelKey: 'candidate.tab_offer', summaryKey: 'offer' },
    { key: 'rejected_cv', labelKey: 'candidate.tab_reject_cv', summaryKey: 'rejected_cv' },
    { key: 'rejected_interview', labelKey: 'candidate.tab_reject_pv', summaryKey: 'rejected_interview' }
];

const STATUS_TAG: Record<string, { color: string; label: string }> = {
    pending_review: { color: 'warning', label: 'candidate.pending_review' },
    cv_screened: { color: 'processing', label: 'candidate.cv_screened' },
    shortlisted: { color: 'success', label: 'candidate.shortlisted' },
    interview_scheduled: { color: 'blue', label: 'candidate.interview_scheduled' },
    passed_interview: { color: 'green', label: 'candidate.passed_interview' },
    offer: { color: 'cyan', label: 'candidate.offer' },
    rejected: { color: 'error', label: 'candidate.rejected' },
    rejected_cv: { color: 'error', label: 'candidate.tab_reject_cv' },
    rejected_interview: { color: 'volcano', label: 'candidate.tab_reject_pv' },
    converted_to_intern: { color: 'purple', label: 'candidate.converted_to_intern' }
};

type AllowedActionStatus =
    | 'pending_review'
    | 'shortlisted'
    | 'interview_scheduled'
    | 'offer'
    | 'rejected_cv'
    | 'rejected_interview';

const STATUS_FLOW: Record<string, string[]> = {
    pending_review: ['shortlisted', 'rejected_cv'],
    shortlisted: ['interview_scheduled'],
    interview_scheduled: ['offer', 'rejected_interview'],
    offer: ['rejected_interview', 'converted_to_intern']
};

const isStatusInTab = (tab: string, status: AllowedActionStatus) => {
    if (tab === 'all') return true;
    if (tab === 'cv_dat') return status === 'shortlisted';
    return tab === status;
};

const getTabForStatus = (status: AllowedActionStatus) => {
    if (status === 'shortlisted') return 'cv_dat';
    return status;
};

export const CVList = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [searchText, setSearchText] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [viewingCandidate, setViewingCandidate] = useState<Candidate | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [candidatesData, setCandidatesData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [summary, setSummary] = useState<StatusSummary>({
        total: 0,
        pending_review: 0,
        cv_dat: 0,
        interview_scheduled: 0,
        offer: 0,
        rejected_cv: 0,
        rejected_interview: 0
    });
    const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
    const [convertingCandidate, setConvertingCandidate] = useState<Candidate | null>(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const jobId = searchParams.get('jobId');
    const planId = searchParams.get('planId');
    const [jobFilter, setJobFilter] = useState<string>('all');
    const [jobOptions, setJobOptions] = useState<any[]>([]);

    const fetchSummary = async () => {
        try {
            const params: any = {};

            if (jobFilter !== 'all') {
                params.jobId = jobFilter;
            } else if (jobId) {
                params.jobId = jobId;
            }

            if (planId) {
                params.planId = planId;
            }

            const res = await http.get('/candidates/summary', { params });
            setSummary(res as StatusSummary);
        } catch {
            notify.error('Không tải được thống kê ứng viên');
        }
    };

    const fetchJobs = async () => {
        try {
            const res = await http.get('/job-positions');
            const jobs = res?.data || [];

            setJobOptions([
                { value: 'all', label: 'Tất cả vị trí' },
                ...jobs.map((j: any) => ({
                    value: j.id,
                    label: j.title
                }))
            ]);
        } catch (e) {
            console.error(e);
            notify.error('Không tải được danh sách vị trí tuyển dụng');
        }
    };

    const fetchCandidates = async () => {
        setIsLoading(true);
        try {
            const params: any = {};
            if (jobId) params.jobId = jobId;
            if (planId) params.planId = planId;

            if (searchText.trim()) params.q = searchText.trim();
            if (activeTab !== 'all') {
                params.status = activeTab;
            }
            if (jobFilter !== 'all') {
                params.jobId = jobFilter;
            }
            params.page = page;
            params.pageSize = pageSize;
            const res = await http.get('/candidates', { params });
            setCandidatesData(res);
        } catch (error) {
            notify.error('Không tải được danh sách ứng viên');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSummary();
        fetchJobs();
    }, [jobFilter, jobId, planId]);

    useEffect(() => {
        fetchJobs();
    }, []);

    useEffect(() => {
        fetchCandidates();
    }, [searchText, activeTab, page, pageSize, jobFilter, planId]);

    useEffect(() => {
        if (jobId) {
            setJobFilter(jobId);
        }
    }, [jobId]);

    const handleView = (candidate: Candidate) => {
        setViewingCandidate(candidate);
        setIsDetailModalOpen(true);
    };

    const handleChangeStatus = async (id: string, name: string, status: AllowedActionStatus) => {
        try {
            await http.patch(`/candidates/${id}`, { status });
            const statusLabel = STATUS_TAG[status]?.label ? t(STATUS_TAG[status].label) : status;
            notify.success(`Đã chuyển trạng thái ${name} -> ${statusLabel}`);

            const nextTab = getTabForStatus(status);
            if (isStatusInTab(activeTab, status)) {
                fetchCandidates();
            } else {
                setActiveTab(nextTab);
                setPage(1);
            }
            fetchSummary();
        } catch {
            notify.error(t('common.error'));
        }
    };

    const handleShortlist = async (id: string, name: string) => {
        await handleChangeStatus(id, name, 'shortlisted');
    };

    const handleReject = async (id: string, name: string) => {
        await handleChangeStatus(id, name, 'rejected_cv');
    };

    const handleBulkAction = async (status: string) => {
        if (selectedRowKeys.length === 0) {
            notify.warning('Vui lòng chọn ít nhất 1 ứng viên');
            return;
        }

        try {
            await Promise.all(selectedRowKeys.map((id) => http.patch(`/candidates/${id}`, { status })));

            notify.success('Cập nhật trạng thái thành công');
            setSelectedRowKeys([]);

            fetchCandidates();
            fetchSummary();
        } catch {
            notify.error('Có lỗi xảy ra');
        }
    };
    const openConvertModal = (candidate: Candidate) => {
        setConvertingCandidate(candidate);
        setIsConvertModalOpen(true);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: (keys: React.Key[]) => setSelectedRowKeys(keys)
    };

    const columns: ColumnsType<Candidate> = [
        {
            title: t('candidate.candidate_info'),
            dataIndex: 'fullName',
            key: 'fullName',
            render: (text: any, record: any) => (
                <div
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                    onClick={() => handleView(record)}
                >
                    {record.avatarUrl?.includes('http') ? (
                        <Avatar src={record.avatarUrl} size={40} />
                    ) : (
                        <Avatar style={{ backgroundColor: '#f56a00', verticalAlign: 'middle' }} size={40}>
                            {record.fullName?.[0]}
                        </Avatar>
                    )}
                    <div>
                        <Text strong style={{ display: 'block' }}>
                            {text}
                        </Text>
                        <Text type='secondary' style={{ fontSize: '12px' }}>
                            {record.email}
                        </Text>
                    </div>
                </div>
            )
        },
        {
            title: t('candidate.position_name'),
            dataIndex: 'job',
            key: 'job',
            render: (job: any) => <Text style={{ fontSize: '13px' }}>{job?.title}</Text>
        },
        {
            title: t('candidate.applied_date'),
            dataIndex: 'appliedDate',
            key: 'appliedDate',
            render: (text: any, record: any) => (
                <div>
                    <Text style={{ display: 'block' }}>{text}</Text>
                    <Text type='secondary' style={{ fontSize: '12px' }}>
                        {record.timeAgo}
                    </Text>
                </div>
            )
        },
        {
            title: t('common.status'),
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const tag = STATUS_TAG[status];
                return (
                    <Tag color={tag?.color ?? 'default'} style={{ borderRadius: '10px' }}>
                        {tag ? t(tag.label) : status}
                    </Tag>
                );
            }
        },
        {
            title: t('common.actions'),
            key: 'action',
            width: 80,
            fixed: 'right',
            align: 'right',
            render: (_: any, record: any) => {
                const buildMenuItems = (record: Candidate): MenuProps['items'] => {
                    const items: MenuProps['items'] = [
                        {
                            key: 'view',
                            label: t('common.view'),
                            icon: <EyeOutlined />,
                            onClick: () => handleView(record)
                        }
                    ];

                    if (record.status === 'pending_review') {
                        items.push(
                            {
                                key: 'shortlist',
                                label: t('candidate.shortlist_candidate'),
                                icon: <CheckCircleOutlined />,
                                onClick: () => handleChangeStatus(record.id, record.fullName, 'shortlisted')
                            },
                            {
                                key: 'reject',
                                label: t('candidate.reject_candidate'),
                                icon: <CloseCircleOutlined />,
                                danger: true,
                                onClick: () => handleChangeStatus(record.id, record.fullName, 'rejected_cv')
                            }
                        );
                    }

                    if (record.status === 'shortlisted') {
                        items.push({
                            key: 'interview',
                            label: t('interview.schedule_title'),
                            icon: <CalendarOutlined />,
                            onClick: () => navigate('/recruitment/interviews')
                        });
                    }

                    if (record.status === 'interview_scheduled') {
                        items.push(
                            {
                                key: 'offer',
                                label: 'Mời làm việc',
                                onClick: () => handleChangeStatus(record.id, record.fullName, 'offer')
                            },
                            {
                                key: 'reject_interview',
                                label: 'Trượt phỏng vấn',
                                danger: true,
                                onClick: () => handleChangeStatus(record.id, record.fullName, 'rejected_interview')
                            }
                        );
                    }

                    if (record.status === 'offer') {
                        items.push(
                            {
                                key: 'convert',
                                label: 'Chuyển thành thực tập sinh',
                                onClick: () => openConvertModal(record)
                            },
                            {
                                key: 'reject_interview',
                                label: 'Trượt phỏng vấn',
                                danger: true,
                                onClick: () => handleChangeStatus(record.id, record.fullName, 'rejected_interview')
                            }
                        );
                    }

                    return items;
                };
                return (
                    <Dropdown menu={{ items: buildMenuItems(record) }} trigger={['click']}>
                        <Button type='text' icon={<MoreOutlined />} />
                    </Dropdown>
                );
            }
        }
    ];

    const tabItems = TABS.map((tab) => {
        const count = summary[tab.summaryKey] ?? 0;
        return {
            key: tab.key,
            label: (
                <span>
                    {t(tab.labelKey)}
                    {count > 0 && (
                        <Badge
                            count={count}
                            size='small'
                            style={{
                                marginLeft: 6,
                                backgroundColor: activeTab === tab.key ? '#1677ff' : '#d9d9d9',
                                color: activeTab === tab.key ? '#fff' : '#666'
                            }}
                        />
                    )}
                </span>
            )
        };
    });

    const dataSource = candidatesData?.hits || candidatesData?.data || [];
    const BULK_ACTIONS_BY_TAB: Record<string, string[]> = {
        pending_review: ['shortlisted', 'rejected_cv'],
        interview_scheduled: ['offer', 'rejected_interview'],
        offer: ['rejected_interview']
    };

    const bulkActions = BULK_ACTIONS_BY_TAB[activeTab] || [];
    
    return (
        <div style={{ padding: '24px' }}>
            <div
                style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
                <div>
                    <Title level={3} style={{ margin: 0 }}>
                        {t('candidate.screening')}
                    </Title>
                </div>
            </div>

            <Card bordered={false} style={{ borderRadius: '12px' }}>
                {/* Tabs */}
                <Tabs
                    activeKey={activeTab}
                    onChange={(value) => {
                        setActiveTab(value);
                        setPage(1);
                    }}
                    items={tabItems}
                    style={{ marginBottom: 0 }}
                />

                {/* Search bar */}
                <div
                    style={{
                        padding: '16px 0',
                        borderBottom: '1px solid #f0f0f0',
                        marginBottom: 16,
                        display: 'flex',
                        gap: 12,
                        alignItems: 'center',
                        flexWrap: 'wrap'
                    }}
                >
                    <Input
                        prefix={<SearchOutlined />}
                        placeholder={t('candidate.search_placeholder')}
                        style={{ width: 300, height: 40 }}
                        size='large'
                        onChange={(e) => {
                            setSearchText(e.target.value);
                            setPage(1);
                        }}
                    />
                    <Select
                        value={jobFilter}
                        style={{ width: 220, height: 40 }}
                        size='large'
                        onChange={(val) => {
                            setJobFilter(val);
                            setPage(1);

                            const newParams = new URLSearchParams(searchParams);

                            if (val === 'all') {
                                newParams.delete('jobId');
                                newParams.delete('planId');
                            } else {
                                newParams.set('jobId', val);
                            }

                            setSearchParams(newParams);
                        }}
                        options={jobOptions}
                    />
                </div>

                {/* Bulk action bar */}
                {selectedRowKeys.length > 0 && (
                    <div
                        style={{
                            marginBottom: '16px',
                            padding: '12px 24px',
                            background: '#e6f7ff',
                            border: '1px solid #91d5ff',
                            borderRadius: '8px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        <Text strong>
                            {t('interview.selected')} {selectedRowKeys.length} {t('common.candidates')}
                        </Text>
                        <span style={{ display: 'flex', gap: 8 }}>
                            {bulkActions.map((action) => (
                                <Button key={action} onClick={() => handleBulkAction(action)}>
                                    {STATUS_TAG[action]?.label ? t(STATUS_TAG[action].label) : action}
                                </Button>
                            ))}
                            <Button onClick={() => setSelectedRowKeys([])}>{t('common.cancel')}</Button>
                        </span>
                    </div>
                )}

                <Table
                    rowSelection={rowSelection}
                    columns={columns as any}
                    scroll={{ x: 'max-content' }}
                    dataSource={dataSource}
                    loading={isLoading}
                    pagination={{
                        current: page,
                        pageSize,
                        total: candidatesData?.pagination?.totalRows || 0,
                        onChange: (nextPage, nextPageSize) => {
                            setPage(nextPage);
                            if (nextPageSize && nextPageSize !== pageSize) {
                                setPageSize(nextPageSize);
                            }
                        },
                        showTotal: (total, range) =>
                            `${t('common.showing')} ${range[0]}-${range[1]} ${t('common.of')} ${total} ${t('common.candidates')}`,
                        showSizeChanger: true
                    }}
                    rowKey='id'
                />
            </Card>

            <CVDetailModal
                open={isDetailModalOpen}
                onCancel={() => setIsDetailModalOpen(false)}
                candidate={viewingCandidate}
                onUpdated={() => {
                    fetchCandidates();
                    fetchSummary();
                }}
            />

            {convertingCandidate && (
                <ConvertToInternModal
                    open={isConvertModalOpen}
                    onCancel={() => {
                        setIsConvertModalOpen(false);
                        setConvertingCandidate(null);
                    }}
                    onSuccess={async () => {
                        setActiveTab('all');
                        setPage(1);
                        await fetchCandidates();
                        await fetchSummary();
                    }}
                    candidateId={convertingCandidate.id}
                    candidateName={convertingCandidate.fullName}
                />
            )}
        </div>
    );
};
