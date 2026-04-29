import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    FileTextOutlined,
    HistoryOutlined,
    InfoCircleOutlined,
    LoadingOutlined,
    SearchOutlined,
    WarningOutlined
} from '@ant-design/icons';
import {
    Button,
    Card,
    Col,
    Empty,
    Input,
    Layout,
    List,
    Row,
    Select,
    Space,
    Spin,
    Table,
    Tag,
    Typography,
    message
} from 'antd';
import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useApprovals, useUpdateApproval } from '../../../hooks/Recruitment/useApprovals';
import { useDebounce } from '../../../hooks/useDebounce';
import { useResponsive } from '../../../hooks/useResponsive';
import {
    Approval,
    ApprovalDirectorActionHistoryItem,
    ApprovalPositionDetail,
    ApprovalStatus,
    ApprovalType
} from '../../../services/Recruitment/approvals';
import { http } from '../../../utils/http';
import { notify } from '../../../utils/notify';
import { mapPlanStatusToUI } from '../../../utils/mapping';

dayjs.extend(relativeTime);

const { Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;

const STATUS_OPTIONS: Array<ApprovalStatus | 'all'> = ['all', 'Pending', 'Approved', 'Rejected', 'Adjusting'];

const STATUS_LABELS: Record<ApprovalStatus | 'all', string> = {
    all: 'Tất cả',
    Pending: 'Chờ duyệt',
    Approved: 'Đã duyệt',
    Rejected: 'Đã từ chối',
    Adjusting: 'Yêu cầu chỉnh sửa'
};

const STATUS_COLORS: Record<ApprovalStatus, 'warning' | 'success' | 'error' | 'processing'> = {
    Pending: 'warning',
    Approved: 'success',
    Rejected: 'error',
    Adjusting: 'processing'
};

const normalizeStatus = (status: string): ApprovalStatus | null => {
    const lower = status.toLowerCase();
    if (lower === 'pending') return 'Pending';
    if (lower === 'approved') return 'Approved';
    if (lower === 'rejected') return 'Rejected';
    if (lower === 'adjusting') return 'Adjusting';
    return null;
};

const getStatusLabel = (status: string): string => {
    if (status === 'all') return STATUS_LABELS.all;
    const normalized = normalizeStatus(status);
    return normalized ? STATUS_LABELS[normalized] : status;
};

const statusSelectOptions = STATUS_OPTIONS.map((status) => ({
    value: status,
    label: STATUS_LABELS[status]
}));

const getStatusColor = (status: string): 'warning' | 'success' | 'error' | 'processing' | 'default' => {
    const normalized = normalizeStatus(status);
    return normalized ? STATUS_COLORS[normalized] : 'default';
};

const formatDateTime = (value?: string): string => {
    if (!value) return 'N/A';
    return dayjs(value).isValid() ? dayjs(value).format('DD/MM/YYYY HH:mm') : 'N/A';
};

const formatRelativeTime = (value?: string): string => {
    if (!value) return 'N/A';
    return dayjs(value).isValid() ? dayjs(value).fromNow() : 'N/A';
};

const getActionErrorMessage = (error: unknown): string => {
    if (typeof error === 'object' && error !== null) {
        const errorObject = error as {
            message?: string;
            response?: {
                data?: {
                    message?: string;
                };
            };
        };
        return (
            errorObject.response?.data?.message || errorObject.message || 'Cập nhật yêu cầu thất bại. Vui lòng thử lại.'
        );
    }

    return 'Cập nhật yêu cầu thất bại. Vui lòng thử lại.';
};

export const DirectorApprovals = () => {
    const { isMobile, isLaptop } = useResponsive();

    const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
    const [directorNote, setDirectorNote] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState<ApprovalStatus | 'all'>('Pending');

    const debouncedSearchKeyword = useDebounce(searchKeyword, 300);

    const {
        data: approvalsRes,
        isLoading,
        refetch
    } = useApprovals({
        status: statusFilter === 'all' ? undefined : statusFilter,
        type: 'Recruitment',
        searcher: debouncedSearchKeyword ? { keyword: debouncedSearchKeyword, field: 'name' } : undefined
    });

    const updateApproval = useUpdateApproval();

    const queue = useMemo<Approval[]>(() => approvalsRes?.data || [], [approvalsRes?.data]);

    useEffect(() => {
        if (queue.length === 0) {
            setSelectedRequestId(null);
            return;
        }

        if (!selectedRequestId || !queue.some((item) => item.id === selectedRequestId)) {
            setSelectedRequestId(queue[0].id);
        }
    }, [queue, selectedRequestId]);

    const selectedRequest = useMemo<Approval | null>(
        () => queue.find((item) => item.id === selectedRequestId) || null,
        [queue, selectedRequestId]
    );

    const positions: ApprovalPositionDetail[] = selectedRequest?.details?.positions || [];
    const directorActionHistory = useMemo<ApprovalDirectorActionHistoryItem[]>(() => {
        const history = selectedRequest?.details?.directorActionHistory;

        if (!Array.isArray(history)) {
            return [];
        }

        return [...history].sort(
            (firstItem, secondItem) => dayjs(secondItem.actedAt).valueOf() - dayjs(firstItem.actedAt).valueOf()
        );
    }, [selectedRequest?.details?.directorActionHistory]);

    const totalPositions =
        typeof selectedRequest?.details?.totalPositions === 'number'
            ? selectedRequest.details.totalPositions
            : positions.reduce((sum, item) => sum + (typeof item.count === 'number' ? item.count : 0), 0);

    const runAction = async (status: ApprovalStatus) => {
        if (!selectedRequest) return;

        try {
            await updateApproval.mutate({
                id: selectedRequest.id,
                status,
                notes: directorNote.trim() || undefined
            });

            if (status === 'Adjusting' && selectedRequest.entityId) {
                await http.patch(`/recruitment-plans/${selectedRequest.entityId}`, {
                    status: 'request_edit'
                });
            }

            notify.success(`Đã cập nhật trạng thái: ${getStatusLabel(status)}`);
            setDirectorNote('');
            await refetch();
            setSelectedRequestId(null);
        } catch (error) {
            notify.error(getActionErrorMessage(error));
        }
    };

    const selectedStatus = selectedRequest?.status ? normalizeStatus(selectedRequest.status) : null;
    const planStatus = selectedRequest?.planStatus;

    const canTakeAction = planStatus === 'pending_approval' || planStatus === 'request_edit';


    return (
        <Layout
            style={{
                minHeight: '100vh',
                background: '#f6f7f8',
                flexDirection: isMobile ? 'column' : 'row'
            }}
        >
            <Sider
                width={isMobile ? '100%' : 380}
                theme='light'
                style={{
                    borderRight: isMobile ? 'none' : '1px solid #E2E8F0',
                    borderBottom: isMobile ? '1px solid #E2E8F0' : 'none'
                }}
            >
                <div style={{ padding: 16, borderBottom: '1px solid #E2E8F0' }}>
                    <Title level={5} style={{ margin: 0, marginBottom: 12 }}>
                        Danh sách kế hoạch
                    </Title>

                    <Select
                        value={statusFilter}
                        onChange={(value) => setStatusFilter(value)}
                        options={statusSelectOptions}
                        style={{ width: '100%', marginBottom: 12 }}
                    />

                    <Input
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        prefix={<SearchOutlined />}
                        placeholder='Tìm theo tên hoặc tiêu đề'
                        style={{ marginBottom: 12 }}
                    />

                    <Select
                        value={'Recruitment' as ApprovalType}
                        disabled
                        style={{ width: '100%' }}
                        options={[{ value: 'Recruitment', label: 'Kế hoạch tuyển dụng' }]}
                    />
                </div>

                {isLoading ? (
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} style={{ marginTop: 64 }} />
                ) : (
                    <List
                        dataSource={queue}
                        locale={{ emptyText: <Empty description='Không có yêu cầu phù hợp' /> }}
                        renderItem={(item) => {
                            const active = item.id === selectedRequestId;
                            const { label, color } = mapPlanStatusToUI(item.planStatus);
                            return (
                                <div
                                    style={{
                                        padding: 16,
                                        borderBottom: '1px solid #E2E8F0',
                                        borderLeft: active ? '4px solid #1E40AF' : '4px solid transparent',
                                        background: active ? 'rgba(30,64,175,0.06)' : '#fff',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => setSelectedRequestId(item.id)}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: 8
                                        }}
                                    >
                                        <Tag color='blue'>Recruitment</Tag>
                                        <Tag color={color}>{label}</Tag>
                                    </div>

                                    <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                                        <FileTextOutlined style={{ color: '#1E40AF', marginTop: 2 }} />
                                        <div>
                                            <Text strong style={{ display: 'block' }}>
                                                {item.name}
                                            </Text>
                                            <Text type='secondary' style={{ fontSize: 12 }}>
                                                {item.title}
                                            </Text>
                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            fontSize: 12
                                        }}
                                    >
                                        <Text type='secondary'>{formatRelativeTime(item.createdAt)}</Text>
                                        {item.priority === 'High' && (
                                            <Text style={{ color: '#d97706' }}>
                                                <WarningOutlined /> Ưu tiên cao
                                            </Text>
                                        )}
                                    </div>
                                </div>
                            );
                        }}
                    />
                )}
            </Sider>

            <Content style={{ padding: 0, position: 'relative' }}>
                {!selectedRequest ? (
                    <div
                        style={{
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Empty description='Chọn một yêu cầu ở danh sách bên trái' />
                    </div>
                ) : (
                    <>
                        <div
                            style={{
                                padding: isMobile ? 12 : isLaptop ? '18px 24px' : '24px 32px',
                                background: '#fff',
                                borderBottom: '1px solid #E2E8F0',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: isMobile ? 'flex-start' : 'center',
                                flexDirection: isMobile ? 'column' : 'row',
                                gap: isMobile ? 8 : 0
                            }}
                        >
                            <div>
                                <Title level={3} style={{ margin: 0 }}>
                                    {selectedRequest.name}
                                </Title>
                                <Text type='secondary'>
                                    {selectedRequest.title} • Gửi lúc {formatDateTime(selectedRequest.createdAt)}
                                </Text>
                            </div>

                            <Tag color={getStatusColor(selectedRequest.status)} style={{ borderRadius: 16 }}>
                                {getStatusLabel(selectedRequest.status)}
                            </Tag>
                        </div>

                        <div
                            style={{
                                padding: isMobile ? 12 : isLaptop ? '18px 24px' : '24px 32px',
                                paddingBottom: 24,
                                maxWidth: 1100,
                                margin: '0 auto'
                            }}
                        >
                            <Row gutter={[16, 16]}>
                                <Col span={24}>
                                    <Card bordered={false} style={{ border: '1px solid #E2E8F0' }}>
                                        <Title level={5} style={{ marginTop: 0 }}>
                                            <InfoCircleOutlined style={{ color: '#1E40AF' }} /> Thông tin kế hoạch
                                        </Title>

                                        <Space direction='vertical' size={10} style={{ width: '100%' }}>
                                            <Text>
                                                <strong>Tên kế hoạch:</strong> {selectedRequest.name}
                                            </Text>
                                            <Text>
                                                <strong>Đợt tuyển dụng:</strong> {selectedRequest.title || 'N/A'}
                                            </Text>
                                            <Text>
                                                <strong>Phòng ban:</strong> {selectedRequest.department || 'N/A'}
                                            </Text>
                                            <Text>
                                                <strong>Số vị trí:</strong> {totalPositions}
                                            </Text>
                                            <Text>
                                                <strong>Dự kiến bắt đầu:</strong>{' '}
                                                {formatDateTime(
                                                    typeof selectedRequest.details?.expectedStart === 'string'
                                                        ? selectedRequest.details.expectedStart
                                                        : undefined
                                                )}
                                            </Text>
                                        </Space>
                                    </Card>
                                </Col>

                                <Col span={24}>
                                    <Card bordered={false} style={{ border: '1px solid #E2E8F0' }}>
                                        <Title level={5} style={{ marginTop: 0 }}>
                                            <FileTextOutlined style={{ color: '#1E40AF' }} /> Danh sách vị trí tuyển
                                        </Title>

                                        {positions.length === 0 ? (
                                            <Empty description='Chưa có thông tin vị trí' />
                                        ) : (
                                            <Table
                                                rowKey={(_, index) => String(index)}
                                                pagination={false}
                                                dataSource={positions}
                                                columns={[
                                                    {
                                                        title: 'Vị trí',
                                                        dataIndex: 'title',
                                                        key: 'title'
                                                    },
                                                    {
                                                        title: 'Số lượng',
                                                        dataIndex: 'count',
                                                        key: 'count',
                                                        width: 120
                                                    },
                                                    {
                                                        title: 'Yêu cầu',
                                                        dataIndex: 'requirements',
                                                        key: 'requirements',
                                                        render: (value?: string) => value || '—'
                                                    }
                                                ]}
                                            />
                                        )}
                                    </Card>
                                </Col>

                                <Col span={24}>
                                    <Card bordered={false} style={{ border: '1px solid #E2E8F0' }}>
                                        <Title level={5} style={{ marginTop: 0 }}>
                                            <InfoCircleOutlined style={{ color: '#1E40AF' }} /> Mô tả
                                        </Title>

                                        <Paragraph style={{ marginBottom: 8 }}>
                                            {(selectedRequest.details?.justification as string) ||
                                                'Chưa có nội dung mô tả.'}
                                        </Paragraph>

                                        <Text type='secondary'>
                                            Cập nhật gần nhất: {formatDateTime(selectedRequest.updatedAt)}
                                        </Text>
                                    </Card>
                                </Col>

                                {/* <Col span={24}>
                                      <Card bordered={false} style={{ border: '1px solid #E2E8F0' }}>
                                          <Title level={5} style={{ marginTop: 0 }}>
                                              <HistoryOutlined style={{ color: '#1E40AF' }} /> Ghi chú giám đốc
                                          </Title>

                                          <Paragraph style={{ marginBottom: 8 }}>
                                              {selectedRequest.notes || 'Chưa có ghi chú từ giám đốc.'}
                                          </Paragraph>

                                          <Text type='secondary'>
                                              Cập nhật gần nhất: {formatDateTime(selectedRequest.updatedAt)}
                                          </Text>

                                          <div style={{ marginTop: 12 }}>
                                              <Text strong>Lịch sử xử lý</Text>
                                              {directorActionHistory.length === 0 ? (
                                                  <Paragraph style={{ margin: '8px 0 0' }} type='secondary'>
                                                      Chưa có lịch sử thao tác.
                                                  </Paragraph>
                                              ) : (
                                                  <List
                                                      size='small'
                                                      style={{ marginTop: 8 }}
                                                      dataSource={directorActionHistory}
                                                      renderItem={(historyItem) => (
                                                          <List.Item>
                                                              <Space
                                                                  direction='vertical'
                                                                  size={2}
                                                                  style={{ width: '100%' }}
                                                              >
                                                                  <Space size={8}>
                                                                      <Tag color={getStatusColor(historyItem.action)}>
                                                                          {getStatusLabel(historyItem.action)}
                                                                      </Tag>
                                                                      <Text type='secondary'>
                                                                          {formatDateTime(historyItem.actedAt)}
                                                                      </Text>
                                                                  </Space>
                                                                  <Text>
                                                                      {historyItem.note ||
                                                                          'Không có ghi chú cho lần xử lý này.'}
                                                                  </Text>
                                                              </Space>
                                                          </List.Item>
                                                      )}
                                                  />
                                              )}
                                          </div>
                                      </Card>
                                  </Col> */}
                            </Row>
                        </div>

                        {canTakeAction && (
                            <div
                                style={{
                                    maxWidth: 1100,
                                    margin: '0 auto 24px',
                                    padding: isMobile ? 12 : '0 24px'
                                }}
                            >
                                <Card
                                    bordered={false}
                                    style={{
                                        border: '1px solid #E2E8F0',
                                        borderRadius: 12,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                                    }}
                                >
                                    <Text strong>Ghi chú của giám đốc</Text>
                                    <Input.TextArea
                                        rows={2}
                                        value={directorNote}
                                        onChange={(e) => setDirectorNote(e.target.value)}
                                        placeholder='Nhập ghi chú xử lý (không bắt buộc)'
                                        style={{ marginTop: 8, marginBottom: 12 }}
                                    />

                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'end',
                                            alignItems: isMobile ? 'flex-start' : 'center',
                                            flexDirection: isMobile ? 'column' : 'row',
                                            gap: 10
                                        }}
                                    >
                                        <Space wrap>
                                            <Button
                                                danger
                                                icon={<CloseCircleOutlined />}
                                                loading={updateApproval.isLoading}
                                                onClick={() => void runAction('Rejected')}
                                            >
                                                Từ chối
                                            </Button>
                                            <Button
                                                icon={<HistoryOutlined />}
                                                loading={updateApproval.isLoading}
                                                onClick={() => void runAction('Adjusting')}
                                            >
                                                Yêu cầu chỉnh sửa
                                            </Button>
                                            <Button
                                                type='primary'
                                                icon={<CheckCircleOutlined />}
                                                loading={updateApproval.isLoading}
                                                onClick={() => void runAction('Approved')}
                                            >
                                                Phê duyệt
                                            </Button>
                                        </Space>
                                    </div>
                                </Card>
                            </div>
                        )}
                    </>
                )}
            </Content>
        </Layout>
    );
};
