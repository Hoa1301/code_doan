import {
    SearchOutlined,
    EditOutlined,
    EyeOutlined,
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    CalendarOutlined,
    StarOutlined,
    DeleteOutlined,
    ExportOutlined
} from '@ant-design/icons';
import { Avatar, Button, Card, Empty, Input, Select, Space, Table, Tag, Typography, Tooltip } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RouteConfig } from '../../../constants';
import { http } from '../../../utils/http';
import { getProfile } from '../../../services/auth/profile';
import {
    getPhase1ModuleEvaluations,
    Phase1ModuleEvaluationSummary
} from '../../../services/Internship/moduleAssessments';

import { InternModal } from './components/InternModal';
import { PlusOutlined } from '@ant-design/icons';
import { notify } from '../../../utils/notify';

const { Title, Text } = Typography;

const normalizeInternStatus = (status?: string): 'active' | 'completed' | 'terminated' | 'on_hold' | '' => {
    const normalized = String(status || '')
        .trim()
        .toLowerCase();
    const lastToken = normalized.split('.').pop() || '';
    const normalizedToken = lastToken.replace(/[\s-]+/g, '_');

    if (!normalized) return '';
    if (normalizedToken === 'active') return 'active';
    if (normalizedToken === 'completed') return 'completed';
    if (normalizedToken === 'terminated' || normalizedToken === 'dropped') return 'terminated';
    if (normalizedToken === 'on_hold' || normalizedToken === 'onhold') return 'on_hold';

    return '';
};

const getMentorEvaluationPath = (internId: string, phase: 'Probation' | 'Mid-term' | 'Final') =>
    `${RouteConfig.MentorEvaluation.getPath(internId)}?phase=${encodeURIComponent(phase)}`;

const hasCompletedEvaluation = (evaluations: any[] = [], phase: 'Probation' | 'Mid-term' | 'Final') =>
    evaluations.some((evaluation) => evaluation?.type === phase && evaluation?.status === 'completed');

const getCompletedEvaluationRecord = (evaluations: any[] = [], phase: 'Probation' | 'Mid-term' | 'Final') =>
    evaluations.find((evaluation) => evaluation?.type === phase && evaluation?.status === 'completed') || null;

type InternPhase1Summary = {
    averageScore?: number | null;
    isAverageReady?: boolean;
    evaluationDate?: string | null;
    summaryStatus?: string | null;
};

const formatEvaluationDate = (value?: string | null) => {
    if (!value) {
        return null;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date.toLocaleDateString('vi-VN');
};

const getLatestPhase1EvaluationDate = (summary?: Phase1ModuleEvaluationSummary | null) => {
    if (summary?.summaryEvaluation?.evaluationDate) {
        return summary.summaryEvaluation.evaluationDate;
    }

    const evaluatedDates = (summary?.modules || [])
        .map((module) => module.evaluation?.evaluatedAt)
        .filter((value): value is string => Boolean(value));

    if (!evaluatedDates.length) {
        return null;
    }

    return evaluatedDates.reduce((latest, current) =>
        new Date(current).getTime() > new Date(latest).getTime() ? current : latest
    );
};

const attachPhase1SummaryToInterns = async (records: any[]) => {
    const phase1Results = await Promise.allSettled(
        records.map(async (record) => {
            const response = await getPhase1ModuleEvaluations(record.id);
            const summary = response?.data || null;

            return [
                record.id,
                {
                    averageScore: summary?.averageScore ?? null,
                    isAverageReady: summary?.isAverageReady,
                    evaluationDate: getLatestPhase1EvaluationDate(summary),
                    summaryStatus: summary?.summaryEvaluation?.status || null
                } satisfies InternPhase1Summary
            ] as const;
        })
    );

    const phase1SummaryMap = phase1Results.reduce<Record<string, InternPhase1Summary>>((result, item) => {
        if (item.status === 'fulfilled') {
            const [internId, summary] = item.value;
            result[internId] = summary;
        }

        return result;
    }, {});

    return records.map((record) => ({
        ...record,
        phase1Summary: phase1SummaryMap[record.id] || null
    }));
};

const mergeInternCollection = (payload: any, records: any[]) => {
    if (Array.isArray(payload?.hits)) {
        return { ...payload, hits: records };
    }

    if (Array.isArray(payload?.data)) {
        return { ...payload, data: records };
    }

    if (Array.isArray(payload)) {
        return records;
    }

    return { ...payload, data: records };
};

export const InternList = () => {
    // ... (rest of the component)
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIntern, setEditingIntern] = useState<any>(null);
    const [isViewOnly, setIsViewOnly] = useState(false);
    const [currentRole, setCurrentRole] = useState<string>('');

    const [internsData, setInternsData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const exportInterns = async () => {
        try {
            const response = await http.get('/interns/export', {
                responseType: 'blob'
            });

            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            const url = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = 'interns.xlsx';

            document.body.appendChild(a);
            a.click();
            a.remove();

            window.URL.revokeObjectURL(url);

            notify.success('Đã xuất dữ liệu thực tập sinh thành công!');
        } catch (error: any) {
            console.error('EXPORT ERROR:', error?.response || error);
            notify.error(error?.response?.data?.message || 'Xuất dữ liệu thực tập sinh thất bại');
        }
    };

    const fetchInterns = async () => {
        setIsLoading(true);
        try {
            const res = await http.get('/interns');
            const records = Array.isArray(res?.hits)
                ? res.hits
                : Array.isArray(res?.data)
                  ? res.data
                  : Array.isArray(res)
                    ? res
                    : [];

            if (isMentorView && records.length) {
                const recordsWithPhase1Summary = await attachPhase1SummaryToInterns(records);
                setInternsData(mergeInternCollection(res, recordsWithPhase1Summary));
                return;
            }

            setInternsData(res);
        } catch (error) {
            console.error(error);
            // notify.error('Không tải được danh sách thực tập sinh');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInterns();
    }, []);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await getProfile();
                const profileData = (response as any)?.data || {};
                const roleFromSingleField = String(profileData.role || '').toLowerCase();
                const roleFromRolesArray = Array.isArray(profileData.roles)
                    ? String(profileData.roles[0]?.name || '').toLowerCase()
                    : '';
                setCurrentRole(roleFromSingleField || roleFromRolesArray);
            } catch {
                notify.error('Không lấy được thông tin người dùng');
                setCurrentRole('');
            }
        };

        void fetchProfile();
    }, []);

    const handleCreate = () => {
        notify.info('Đang tạo thực tập sinh mới');
        setEditingIntern(null);
        setIsViewOnly(false);
        setIsModalOpen(true);
    };

    const handleEdit = (record: any) => {
        notify.info(`Đang chỉnh sửa: ${record?.user?.fullName}`);
        setEditingIntern(record);
        setIsViewOnly(false);
        setIsModalOpen(true);
    };

    const handleView = (record: any) => {
        notify.info(`Xem thông tin: ${record?.user?.fullName}`);
        setEditingIntern(record);
        setIsViewOnly(true);
        setIsModalOpen(true);
    };

    const isRecruitmentInternPage = location.pathname.startsWith('/recruitment/interns');
    const isTrainingInternPage = location.pathname.startsWith(RouteConfig.TrainingInternList.path);
    const isTrainingModulePage = location.pathname.startsWith('/training');
    const canManageInterns = currentRole === 'admin' || currentRole === 'super_admin';
    const canMentorScopedEdit =
        location.pathname.startsWith(RouteConfig.TrainingInternList.path) && currentRole === 'mentor';
    const canEditInterns = canManageInterns || canMentorScopedEdit;
    const isMentorView = location.pathname.startsWith(RouteConfig.MentorInternList.path);
    const dataSource = internsData?.hits || internsData?.data || [];
    const filteredDataSource = useMemo(() => {
        const normalizedKeyword = searchText.trim().toLowerCase();

        return dataSource.filter((record: any) => {
            const normalizedStatus = normalizeInternStatus(record?.status);
            const matchesStatus = statusFilter === 'all' || normalizedStatus === statusFilter;

            const matchesKeyword =
                !normalizedKeyword ||
                String(record?.user?.fullName || record?.fullName || '')
                    .toLowerCase()
                    .includes(normalizedKeyword) ||
                String(record?.user?.email || '')
                    .toLowerCase()
                    .includes(normalizedKeyword) ||
                String(record?.code || record?.id || '')
                    .toLowerCase()
                    .includes(normalizedKeyword) ||
                String(record?.track || '')
                    .toLowerCase()
                    .includes(normalizedKeyword);

            return matchesStatus && matchesKeyword;
        });
    }, [dataSource, searchText, statusFilter]);

    return (
        <div style={{ padding: '24px' }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px'
                }}
            >
                <div>
                    <Title level={3} style={{ margin: 0 }}>
                        {isMentorView ? t('menu.evaluations') : t('internship.management')}
                    </Title>
                </div>
                {!isMentorView ? (
                    <Button
                        type='primary'
                        icon={<ExportOutlined />}
                        onClick={exportInterns}
                        style={{
                            borderRadius: '10px',
                            height: '40px',
                            padding: '0 18px',
                            fontWeight: 600,
                            fontSize: '15px',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            border: 'none',
                            boxShadow: '0 6px 16px rgba(16,185,129,0.35)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        Xuất Excel
                    </Button>
                ) : (
                    <div></div>
                )}
            </div>

            <Card bordered={false} style={{ borderRadius: '12px' }}>
                <div style={{ marginBottom: '16px', display: 'flex', gap: '12px' }}>
                    <Input
                        placeholder={
                            isTrainingModulePage
                                ? t('internship.search_placeholder_training')
                                : t('internship.search_placeholder')
                        }
                        prefix={<SearchOutlined />}
                        style={{ width: 350, height: 40 }}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    <Select
                        value={statusFilter}
                        style={{ width: 160, height: 40 }}
                        onChange={setStatusFilter}
                        options={[
                            { value: 'all', label: t('internship.all_statuses') },
                            { value: 'active', label: t('internship.active') },
                            { value: 'completed', label: t('internship.completed') },
                            { value: 'terminated', label: t('internship.dropped') }
                            // { value: 'on_hold', label: t('internship.on_hold') }
                        ]}
                    />
                </div>

                <Table
                    scroll={{ x: 'max-content' }}
                    locale={{ emptyText: <Empty description='Không có dữ liệu' /> }}
                    columns={
                        [
                            {
                                title: t('internship.intern_info'),
                                dataIndex: 'user',
                                key: 'user',
                                render: (user: any, record: any) => (
                                    <Space size='middle'>
                                        <Avatar size={40} src={user?.avatarUrl} icon={<UserOutlined />} />
                                        <div>
                                            <Text strong style={{ display: 'block' }}>
                                                {user?.fullName}
                                            </Text>
                                            <Text type='secondary' style={{ fontSize: '12px' }}>
                                                {user?.email || record.track || 'Thực tập sinh'}
                                            </Text>
                                        </div>
                                    </Space>
                                )
                            },
                            !isMentorView
                                ? {
                                      title: t('internship.contact'),
                                      key: 'contact',
                                      render: (_: any, record: any) => (
                                          <div>
                                              <div
                                                  style={{
                                                      display: 'flex',
                                                      alignItems: 'center',
                                                      gap: '4px',
                                                      fontSize: '13px'
                                                  }}
                                              >
                                                  <MailOutlined style={{ fontSize: '12px', color: '#8c8c8c' }} />{' '}
                                                  {record.user?.email}
                                              </div>
                                              <div
                                                  style={{
                                                      display: 'flex',
                                                      alignItems: 'center',
                                                      gap: '4px',
                                                      fontSize: '13px'
                                                  }}
                                              >
                                                  <PhoneOutlined style={{ fontSize: '12px', color: '#8c8c8c' }} />{' '}
                                                  {record.user?.phone}
                                              </div>
                                          </div>
                                      )
                                  }
                                : null,
                            {
                                title: isTrainingModulePage
                                    ? t('internship.mentor_column')
                                    : t('internship.track_mentor'),
                                key: 'track',
                                render: (_: any, record: any) =>
                                    isTrainingModulePage ? (
                                        <Text strong>{record.mentor?.fullName || 'TBD'}</Text>
                                    ) : (
                                        <div>
                                            <Tag color='purple'>{record.track}</Tag>
                                            <div style={{ marginTop: '4px', fontSize: '12px' }}>
                                                <Text type='secondary'>Mentor: </Text>
                                                <Text strong>{record.mentor?.fullName || 'TBD'}</Text>
                                            </div>
                                        </div>
                                    )
                            },
                            !isMentorView
                                ? {
                                      title: t('internship.duration'),
                                      key: 'duration',
                                      render: (_: any, record: any) => (
                                          <div style={{ fontSize: '13px' }}>
                                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                  <CalendarOutlined style={{ color: '#8c8c8c' }} /> {record.startDate}
                                              </div>
                                              <Text type='secondary' style={{ fontSize: '11px', paddingLeft: '18px' }}>
                                                  {t('internship.to')} {record.endDate}
                                              </Text>
                                          </div>
                                      )
                                  }
                                : null,
                            isMentorView
                                ? {
                                      title: 'Giai đoạn đào tạo',
                                      key: 'eval_phase1',
                                      render: (_: any, record: any) => {
                                          const e = record.evaluations?.find((x: any) => x.type === 'Probation');
                                          const phase1Summary = record.phase1Summary as InternPhase1Summary | null;
                                          const hasAverageScore =
                                              phase1Summary?.isAverageReady && phase1Summary?.averageScore != null;
                                          const displayScore = hasAverageScore
                                              ? phase1Summary?.averageScore
                                              : e?.overallScore;
                                          const displayDate = phase1Summary?.evaluationDate || e?.evaluationDate;

                                          if (displayScore != null) {
                                              return (
                                                  <div
                                                      onClick={() =>
                                                          navigate(getMentorEvaluationPath(record.id, 'Probation'))
                                                      }
                                                      style={{ cursor: 'pointer' }}
                                                  >
                                                      <Text strong style={{ color: '#1E40AF' }}>
                                                          {displayScore}/10
                                                      </Text>
                                                      {formatEvaluationDate(displayDate) ? (
                                                          <>
                                                              <br />
                                                              <Text type='secondary' style={{ fontSize: '11px' }}>
                                                                  {formatEvaluationDate(displayDate)}
                                                              </Text>
                                                          </>
                                                      ) : null}
                                                  </div>
                                              );
                                          }
                                          return (
                                              <Button
                                                  size='small'
                                                  type='dashed'
                                                  onClick={() =>
                                                      navigate(getMentorEvaluationPath(record.id, 'Probation'))
                                                  }
                                              >
                                                  Đánh giá
                                              </Button>
                                          );
                                      }
                                  }
                                : null,
                            isMentorView
                                ? {
                                      title: 'Giai đoạn tham gia dự án',
                                      key: 'eval_phase2',
                                      render: (_: any, record: any) => {
                                          const e = getCompletedEvaluationRecord(record.evaluations, 'Mid-term');
                                          if (e?.status === 'completed' && e?.overallScore != null) {
                                              return (
                                                  <div
                                                      onClick={() =>
                                                          navigate(getMentorEvaluationPath(record.id, 'Mid-term'))
                                                      }
                                                      style={{ cursor: 'pointer' }}
                                                  >
                                                      <Text strong style={{ color: '#059669' }}>
                                                          {e.overallScore}/10
                                                      </Text>
                                                      <br />
                                                      <Text type='secondary' style={{ fontSize: '11px' }}>
                                                          {new Date(e.evaluationDate).toLocaleDateString('vi-VN')}
                                                      </Text>
                                                  </div>
                                              );
                                          }
                                          return (
                                              <Button
                                                  size='small'
                                                  type='dashed'
                                                  onClick={() =>
                                                      navigate(getMentorEvaluationPath(record.id, 'Mid-term'))
                                                  }
                                              >
                                                  Đánh giá
                                              </Button>
                                          );
                                      }
                                  }
                                : null,
                            isMentorView
                                ? {
                                      title: 'Giai đoạn cuối',
                                      key: 'eval_final',
                                      render: (_: any, record: any) => {
                                          const phase1Summary = record.phase1Summary as InternPhase1Summary | null;
                                          const isPhase1Completed =
                                              Boolean(phase1Summary?.isAverageReady) ||
                                              phase1Summary?.summaryStatus === 'completed' ||
                                              hasCompletedEvaluation(record.evaluations, 'Probation');
                                          const canEvaluateFinal =
                                              isPhase1Completed &&
                                              hasCompletedEvaluation(record.evaluations, 'Mid-term');
                                          const e = getCompletedEvaluationRecord(record.evaluations, 'Final');
                                          if (e?.status === 'completed' && e?.overallScore != null) {
                                              return (
                                                  <div
                                                      onClick={() =>
                                                          navigate(getMentorEvaluationPath(record.id, 'Final'))
                                                      }
                                                      style={{ cursor: 'pointer' }}
                                                  >
                                                      <Text strong style={{ color: '#D97706' }}>
                                                          {e.overallScore}/10
                                                      </Text>
                                                      <br />
                                                      <Text type='secondary' style={{ fontSize: '11px' }}>
                                                          {new Date(e.evaluationDate).toLocaleDateString('vi-VN')}
                                                      </Text>
                                                  </div>
                                              );
                                          }
                                          return (
                                              <Tooltip
                                                  title={
                                                      canEvaluateFinal
                                                          ? undefined
                                                          : 'Cần hoàn tất giai đoạn đào tạo và giai đoạn tham gia dự án trước'
                                                  }
                                              >
                                                  <span>
                                                      <Button
                                                          size='small'
                                                          type='dashed'
                                                          disabled={!canEvaluateFinal}
                                                          onClick={() =>
                                                              navigate(getMentorEvaluationPath(record.id, 'Final'))
                                                          }
                                                      >
                                                          Đánh giá
                                                      </Button>
                                                  </span>
                                              </Tooltip>
                                          );
                                      }
                                  }
                                : null,
                            !isMentorView
                                ? {
                                      title: t('common.status'),
                                      dataIndex: 'status',
                                      key: 'status',
                                      render: (status: string) => {
                                          const normalizedStatus = normalizeInternStatus(status);
                                          let color = 'processing';
                                          let label = status;
                                          if (normalizedStatus === 'active') {
                                              color = 'processing';
                                              label = t('internship.active');
                                          } else if (normalizedStatus === 'completed') {
                                              color = 'success';
                                              label = t('internship.completed');
                                          } else if (normalizedStatus === 'terminated') {
                                              color = 'error';
                                              label = t('internship.dropped');
                                          } else if (normalizedStatus === 'on_hold') {
                                              color = 'warning';
                                              label = t('internship.on_hold');
                                          }
                                          return (
                                              <Tag color={color} style={{ borderRadius: '10px' }}>
                                                  {label}
                                              </Tag>
                                          );
                                      }
                                  }
                                : null,
                            !isMentorView
                                ? {
                                      title: t('common.actions'),
                                      key: 'action',
                                      width: 100,
                                      fixed: 'right',
                                      render: (_: any, record: any) => (
                                          <Space>
                                              <Tooltip title={t('common.view')}>
                                                  <Button
                                                      type='text'
                                                      icon={<EyeOutlined />}
                                                      onClick={() => handleView(record)}
                                                  />
                                              </Tooltip>
                                              {isMentorView && (
                                                  <Tooltip title={t('menu.evaluations')}>
                                                      <Button
                                                          type='text'
                                                          icon={<StarOutlined style={{ color: '#F59E0B' }} />}
                                                          onClick={() =>
                                                              navigate(RouteConfig.MentorEvaluation.getPath(record.id))
                                                          }
                                                      />
                                                  </Tooltip>
                                              )}
                                              {canEditInterns && (
                                                  <Tooltip title={t('common.edit')}>
                                                      <Button
                                                          type='text'
                                                          icon={<EditOutlined />}
                                                          onClick={() => handleEdit(record)}
                                                      />
                                                  </Tooltip>
                                              )}
                                          </Space>
                                      )
                                  }
                                : null
                        ].filter(Boolean) as any[]
                    }
                    dataSource={filteredDataSource}
                    loading={isLoading}
                    pagination={{
                        total: filteredDataSource.length,
                        showTotal: (total, range) =>
                            `${t('common.showing')} ${range[0]}-${range[1]} ${t('common.of')} ${total} ${t('internship.interns')}`,
                        pageSize: 10
                    }}
                    rowKey='id'
                />
            </Card>

            <InternModal
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onSuccess={() => {
                    setIsModalOpen(false);
                    fetchInterns();
                }}
                initialValues={editingIntern}
                viewOnly={isViewOnly}
                hideLearningPathSelection={isRecruitmentInternPage}
                hideTrackField={isTrainingInternPage}
                mentorScopedEdit={canMentorScopedEdit}
            />
        </div>
    );
};
