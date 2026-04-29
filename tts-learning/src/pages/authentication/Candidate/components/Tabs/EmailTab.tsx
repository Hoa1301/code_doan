import {
    CalendarOutlined,
    EditOutlined,
    MailOutlined,
    SaveOutlined,
    SearchOutlined,
    SendOutlined,
    VideoCameraOutlined
} from '@ant-design/icons';
import {
    Avatar,
    Button,
    Card,
    Checkbox,
    Col,
    DatePicker,
    Input,
    Layout,
    List,
    Row,
    Space,
    Tag,
    TimePicker,
    Typography,
    Skeleton,
    Tabs,
    Select,
    Badge,
    InputNumber
} from 'antd';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Dayjs } from 'dayjs';
import { notify } from '../../../../../utils/notify';
import { http } from '../../../../../utils/http';
import { DepartmentSelect } from '../../../../../components/CommonSelect/DepartmentSelect';

const { Title, Text } = Typography;
const { Content } = Layout;

interface StatusSummary {
    total: number;
    pending_review: number;
    cv_dat: number;
    interview_scheduled: number;
    offer: number;
    rejected_cv: number;
    rejected_interview: number;
    [key: string]: number;
}

interface ICandidate {
    id: string;
    fullName?: string;
    name?: string;
    email: string;
    avatarUrl?: string;
    avatar?: string;
    job?: { id?: string; title?: string };
    jobId?: string;
    appliedForTitle?: string;
    matchScore?: number;
    status?: string;
    [key: string]: unknown;
}

interface CandidateListResponse {
    hits?: ICandidate[];
    data?: ICandidate[];
}

interface DirectMailSendResult {
    total: number;
    success: number;
    failed: number;
    details?: Array<{
        email: string;
        status: 'sent' | 'failed';
        error?: string;
    }>;
}

const TABS = [
    { key: 'all', label: 'Tất cả' },
    { key: 'sent_mail', label: 'Đã gửi email' },
    { key: 'invited', label: 'Mời phỏng vấn' },
    { key: 'rejected', label: 'Trượt phỏng vấn' },
    { key: 'offer', label: 'Mời nhận việc' }
];
const API_BASE = 'http://localhost:10010';
const TEMPLATES = {
    interview: {
        id: 'interview',
        subject: 'Thư mời tham gia phỏng vấn - {Role}',
        body: `
          <p>Kính gửi <strong>{Candidate_Name}</strong>,</p>

          <p>Cảm ơn bạn đã quan tâm đến vị trí <strong>{Role}</strong> tại <strong>SV Technologies JSC</strong>.</p>

          <p>Chúng tôi trân trọng mời bạn tham gia buổi phỏng vấn với thông tin chi tiết:</p>

          <table style="width:100%; border-collapse: collapse; margin-top: 16px;">
              <tr>
                  <td style="padding:8px; font-weight:600; width:180px;">Vị trí</td>
                  <td style="padding:8px;">{Role}</td>
              </tr>
              <tr style="background:#f9fafb;">
                  <td style="padding:8px; font-weight:600;">Phòng ban</td>
                  <td style="padding:8px;">{Department}</td>
              </tr>
              <tr>
                  <td style="padding:8px; font-weight:600;">Ngày</td>
                  <td style="padding:8px;">{Interview_Date}</td>
              </tr>
              <tr style="background:#f9fafb;">
                  <td style="padding:8px; font-weight:600;">Thời gian</td>
                  <td style="padding:8px;">{Interview_Time}</td>
              </tr>
              <tr>
                  <td style="padding:8px; font-weight:600;">Thời lượng</td>
                  <td style="padding:8px;">{Duration} phút</td>
              </tr>
              <tr style="background:#f9fafb;">
                  <td style="padding:8px; font-weight:600;">Hình thức</td>
                  <td style="padding:8px;">{Format}</td>
              </tr>
              <tr>
                  <td style="padding:8px; font-weight:600;">Địa điểm / Link</td>
                  <td style="padding:8px;">{Location}</td>
              </tr>
          </table>

          <p style="margin-top:16px;">
          Vui lòng phản hồi email này để xác nhận tham gia.
          </p>
        <p>Trân trọng,<br/><strong>Phòng Tuyển dụng - SV Technologies</strong></p>
          `
    },
    rejection: {
        id: 'rejection',
        label: 'interview.template_rejection',
        subject: 'Kết quả ứng tuyển - {Role}',
        body: `
<p>Kính gửi {Candidate_Name},</p>
<p>Cảm ơn bạn đã quan tâm và dành thời gian ứng tuyển cho vị trí <strong>{Role}</strong> tại <strong>SV Technologies JSC</strong>.</p>
<p>Chúng tôi đánh giá cao những kỹ năng và kinh nghiệm của bạn. Tuy nhiên, sau quá trình xem xét kỹ lưỡng, chúng tôi rất tiếc phải thông báo rằng ở thời điểm hiện tại, chúng tôi đã quyết định chọn các ứng viên khác phù hợp hơn với yêu cầu đặc thù của công việc này.</p>
<p>Hồ sơ của bạn sẽ được lưu giữ trong hệ thống và chúng tôi có thể liên hệ lại nếu có vị trí phù hợp trong tương lai.</p>
<p>Chúc bạn nhiều thành công trong sự nghiệp!</p>
<p>Trân trọng,<br/><strong>Nhóm Tuyển dụng</strong></p>
        `
    },
    meeting: {
        id: 'meeting',
        label: 'interview.template_meeting',
        subject: 'Lịch họp trao đổi - {Role}',
        body: `
<p>Kính gửi {Candidate_Name},</p>
<p>Chúng tôi muốn sắp xếp một buổi trao đổi ngắn về cơ hội hợp tác tại vị trí <strong>{Role}</strong>.</p>
<div style="background: #F8FAFC; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #E2E8F0;">
    <p style="margin-bottom: 8px;">1. Nội dung trao đổi: <strong>{Role}</strong></p>
    <p style="margin-bottom: 8px;">2. Phòng ban: <strong>{Department}</strong></p>
    <div style="margin-top: 16px;">
        <p>3. Thời gian họp:</p>
        <p style="padding-left: 20px; margin-top: 8px;">Ngày: <strong>{Interview_Date}</strong></p>
        <p style="padding-left: 20px;">Giờ bắt đầu: <strong>{Interview_Time}</strong></p>
    </div>
</div>
<p>Trân trọng,<br/><strong>Nhóm Tuyển dụng</strong></p>
        `
    },
    offer: {
        id: 'offer',
        subject: 'Thư mời nhận việc - {Role}',
        body: `
      <p>Kính gửi <strong>{Candidate_Name}</strong>,</p>

      <p>Chúc mừng bạn đã vượt qua quá trình tuyển dụng tại <strong>SV Technologies JSC</strong>.</p>

      <p>Chúng tôi trân trọng gửi tới bạn thư mời nhận việc với thông tin:</p>

      <table style="width:100%; border-collapse: collapse; margin-top: 16px;">
          <tr>
              <td style="padding:8px; font-weight:600; width:180px;">Vị trí</td>
              <td style="padding:8px;">{Role}</td>
          </tr>
          <tr style="background:#f0fdf4;">
              <td style="padding:8px; font-weight:600;">Phòng ban</td>
              <td style="padding:8px;">{Department}</td>
          </tr>
          <tr>
              <td style="padding:8px; font-weight:600;">Ngày bắt đầu</td>
              <td style="padding:8px;">{Start_Date}</td>
          </tr>
          <tr style="background:#f0fdf4;">
              <td style="padding:8px; font-weight:600;">Địa điểm làm việc</td>
              <td style="padding:8px;">{Location}</td>
          </tr>
      </table>

      <p style="margin-top:16px;">
      Vui lòng xác nhận lại email này để hoàn tất thủ tục.
      </p>

      <p>Trân trọng,<br/><strong>Phòng Tuyển dụng</strong></p>
      `
    }
};

export const EmailTab = () => {
    const { t } = useTranslation();
    const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof TEMPLATES>('interview');
    const [emailSubject, setEmailSubject] = useState(TEMPLATES['interview'].subject);
    const [emailHtml, setEmailHtml] = useState(TEMPLATES['interview'].body);
    const [isEditing, setIsEditing] = useState(false);

    const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
    const [date, setDate] = useState<Dayjs | null>(null);
    const [startTime, setStartTime] = useState<Dayjs | null>(null);
    const [intervalMinutes, setIntervalMinutes] = useState<number>(30);
    const [format, setFormat] = useState('online');
    const [locationLink, setLocationLink] = useState('https://meet.google.com/abc-defg-hij');

    const [searchText, setSearchText] = useState('');
    const [activeTab, setActiveTab] = useState('all');

    const [candidatesData, setCandidatesData] = useState<CandidateListResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [interviews, setInterviews] = useState<any[]>([]);
    const [department, setDepartment] = useState<string>();
    const [summary, setSummary] = useState<StatusSummary>({
        total: 0,
        pending_review: 0,
        cv_dat: 0,
        interview_scheduled: 0,
        offer: 0,
        rejected_cv: 0,
        rejected_interview: 0
    });

    const fetchSummary = async () => {
        try {
            const res = await http.get('/candidates/summary');
            setSummary(res as StatusSummary);
        } catch {
            // non-blocking
        }
    };

    const candidates: ICandidate[] = useMemo(() => {
        if (!candidatesData) return [];

        const all = candidatesData.data || [];

        switch (activeTab) {
            case 'sent_mail': {
                const ids = interviews.filter((i) => i.isSent).map((i) => i.candidate?.id);

                return all.filter((c) => ids.includes(c.id));
            }

            case 'invited': {
                const ids = interviews.filter((i) => i.status === 'scheduled').map((i) => i.candidate?.id);

                return all.filter((c) => ids.includes(c.id));
            }

            case 'rejected':
                return all.filter((c) => c.status === 'rejected');

            case 'offer':
                return all.filter((c) => c.status === 'offer');

            default:
                return all;
        }
    }, [candidatesData, interviews, activeTab]);

    const validSelectedCandidates = selectedCandidates.filter((id) => {
        const interview = interviews.find((i) => i.candidate?.id === id);

        return !(interview?.isSent || ['completed', 'cancelled'].includes(interview?.status));
    });

    const fetchCandidates = useCallback(async () => {
        setIsLoading(true);
        try {
            const [candidateRes, interviewRes] = await Promise.all([
                http.get<CandidateListResponse>('/candidates', {
                    params: {
                        q: searchText.trim(),
                        page: 1,
                        pageSize: 200,
                        department: department === 'ALL' ? undefined : department
                    }
                }),
                http.get('/interviews')
            ]);

            const allCandidates = candidateRes?.hits || candidateRes?.data || [];
            const interviewData = interviewRes?.hits || interviewRes?.data || [];

            setInterviews(interviewData);

            setCandidatesData({ data: allCandidates });
        } catch {
            notify.error('Không thể tải danh sách ứng viên');
        } finally {
            setIsLoading(false);
        }
    }, [searchText, department]);

    useEffect(() => {
        fetchSummary();
    }, []);

    useEffect(() => {
        fetchCandidates();
    }, [fetchCandidates]);

    const getCount = (key: string) => {
        const all = candidatesData?.data || [];

        switch (key) {
            case 'sent_mail':
                return interviews.filter((i) => i.isSent).length;

            case 'invited':
                return interviews.filter((i) => i.status === 'scheduled').length;

            case 'rejected':
                return all.filter((c) => c.status === 'rejected').length;

            case 'offer':
                return all.filter((c) => c.status === 'offer').length;

            case 'all':
                return all.length;

            default:
                return 0;
        }
    };

    const handleTemplateChange = (val: keyof typeof TEMPLATES) => {
        setSelectedTemplate(val);
        setEmailSubject(TEMPLATES[val].subject);
        setEmailHtml(TEMPLATES[val].body);
        setIsEditing(false);
    };

    const handleResetTemplate = () => {
        setEmailSubject(TEMPLATES[selectedTemplate].subject);
        setEmailHtml(TEMPLATES[selectedTemplate].body);
        setIsEditing(false);
    };

    const selectedVisibleCount = candidates.filter((candidate) => selectedCandidates.includes(candidate.id)).length;
    const isAllVisibleSelected = candidates.length > 0 && selectedVisibleCount === candidates.length;
    const isPartiallyVisibleSelected = selectedVisibleCount > 0 && selectedVisibleCount < candidates.length;

    const toggleCandidate = (id: string) => {
        setSelectedCandidates((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
    };
    const toggleAllVisibleCandidates = (checked: boolean) => {
        setSelectedCandidates(checked ? candidates.map((candidate) => candidate.id) : []);
    };

    const calculateInterviewTime = (index: number): string => {
        if (!startTime) return '';
        return startTime
            .clone()
            .add(index * intervalMinutes, 'minute')
            .format('HH:mm');
    };

    const handleSendInvites = async () => {
        if (selectedCandidates.length === 0) {
            notify.warning('Vui lòng chọn ít nhất một ứng viên.');
            return;
        }

        const selectedCandsInfo = candidates.filter((c) => selectedCandidates.includes(c.id));

        if (selectedCandsInfo.length === 0) {
            notify.warning('Không tìm thấy ứng viên hợp lệ để gửi.');
            return;
        }

        try {
            setIsProcessing(true);
            notify.loading({ content: 'Đang xử lý...', key: 'inviting' });

            const recipients = selectedCandsInfo.map((candidate: ICandidate) => {
                const interview = interviews.find((i) => i.candidate?.id === candidate.id);

                if (!interview) {
                    throw new Error(`Ứng viên ${candidate.fullName} chưa có lịch phỏng vấn`);
                }

                const candidateName = String(candidate.fullName || candidate.name || '');
                const role = String(candidate.job?.title || candidate.appliedForTitle || 'Vị trí ứng tuyển');
                const jobMeta = (candidate.job || {}) as Record<string, unknown>;
                const department = String(jobMeta.department || 'N/A');
                const formatText = interview.format === 'online' ? 'Phỏng vấn Online' : 'Phỏng vấn trực tiếp';

                return {
                    email: candidate.email,
                    fullName: candidateName,

                    htmlBody: emailHtml,

                    candidateName,
                    candidateId: candidate.id,
                    role,
                    department,
                    interviewDate: interview.interviewDate,
                    interviewTime: interview.interviewTime,
                    interviewId: interview.id,
                    duration: String(interview.durationMinutes || ''),
                    format: formatText,
                    location: interview.infoMeeting
                };
            });

            const result = await http.post('/recruitment/mail/send-invite-transaction', {
                subject: emailSubject,
                recipients
            });

            notify.success({
                content: `Đã gửi thành công ${result.success}/${result.total} email`,
                key: 'inviting'
            });

            setSelectedCandidates([]);
            fetchCandidates();
            fetchSummary();
        } catch (error: any) {
            notify.error({
                content: error?.message || t('interview.send_failed'),
                key: 'inviting'
            });

            console.log(error);
        } finally {
            setIsProcessing(false);
        }
    };

    const tabItems = TABS.map((tab) => {
        const count = getCount(tab.key) ?? 0;
        return {
            key: tab.key,
            label: (
                <span>
                    {t(tab.label)}
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

    const getTemplateByTab = (tab: string): keyof typeof TEMPLATES => {
        switch (tab) {
            case 'invited':
            case 'sent_mail':
                return 'interview';

            case 'rejected':
                return 'rejection';

            case 'offer':
                return 'meeting';

            default:
                return 'interview';
        }
    };

    useEffect(() => {
        const templateKey = getTemplateByTab(activeTab);

        setSelectedTemplate(templateKey);
        setEmailSubject(TEMPLATES[templateKey].subject);
        setEmailHtml(TEMPLATES[templateKey].body);
        setIsEditing(false);
        setSelectedCandidates([]);
    }, [activeTab]);

    return (
        <Row gutter={24}>
            <Col xs={24} lg={9}>
                <Card
                    style={{ height: '100%', borderRadius: '12px' }}
                    bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', height: '650px' }}
                    title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{t('interview.queue')}</span>
                            <Tag color='blue'>
                                {selectedCandidates.length} {t('interview.selected')}
                            </Tag>
                        </div>
                    }
                >
                    <Tabs
                        activeKey={activeTab}
                        onChange={(value) => {
                            setActiveTab(value);
                            setSelectedCandidates([]);
                        }}
                        items={tabItems}
                        size='small'
                        tabBarStyle={{ padding: '0 12px', margin: 0 }}
                    />

                    <div style={{ padding: '12px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                        <Space direction='vertical' size={8} style={{ width: '100%' }}>
                            <DepartmentSelect
                                value={department}
                                onChange={(val) => {
                                    setDepartment(val);
                                    setSelectedCandidates([]);
                                }}
                                isSelectAll
                            />
                            <Input
                                prefix={<SearchOutlined />}
                                placeholder={t('candidate.search_placeholder')}
                                onChange={(e) => {
                                    setSearchText(e.target.value);
                                    setSelectedCandidates([]);
                                }}
                            />
                            <Checkbox
                                checked={isAllVisibleSelected}
                                indeterminate={isPartiallyVisibleSelected}
                                disabled={candidates.length === 0}
                                onChange={(e) => toggleAllVisibleCandidates(e.target.checked)}
                            >
                                {t('interview.select_all')}
                            </Checkbox>
                        </Space>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {isLoading ? (
                            <div style={{ padding: '16px' }}>
                                <Skeleton active />
                            </div>
                        ) : (
                            <List
                                dataSource={candidates}
                                renderItem={(item: ICandidate) => {
                                    const interview = interviews.find((i) => i.candidate?.id === item.id);
                                    const isDisabled =
                                        interview?.isSent || ['completed', 'cancelled'].includes(interview?.status);
                                    return (
                                        <List.Item
                                            style={{
                                                padding: '12px 16px',
                                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                                                opacity: isDisabled ? 0.6 : 1,
                                                background: selectedCandidates.includes(item.id)
                                                    ? '#e6f7ff'
                                                    : 'transparent',
                                                borderBottom: '1px solid #f0f0f0'
                                            }}
                                            onClick={() => {
                                                if (!isDisabled) toggleCandidate(item.id);
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                                <span
                                                    style={{ marginRight: '12px' }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                    }}
                                                >
                                                    <Checkbox
                                                        checked={selectedCandidates.includes(item.id)}
                                                        disabled={isDisabled}
                                                        onClick={(e) => e.stopPropagation()}
                                                        onChange={() => {
                                                            if (!isDisabled) toggleCandidate(item.id);
                                                        }}
                                                    />
                                                </span>
                                                <Avatar
                                                    src={item.avatarUrl || item.avatar}
                                                    style={{ marginRight: '12px' }}
                                                />

                                                <div style={{ flex: 1 }}>
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            gap: 8,
                                                            justifyContent: 'space-between'
                                                        }}
                                                    >
                                                        <div>
                                                            <Text strong style={{ display: 'block' }}>
                                                                {item.fullName || item.name}
                                                            </Text>
                                                        </div>
                                                        <div>
                                                            {activeTab === 'sent_mail' && (
                                                                <div style={{ marginTop: 4 }}>
                                                                    {interview?.status === 'completed' && (
                                                                        <Tag color='green'>Đã xác nhận</Tag>
                                                                    )}
                                                                    {interview?.status === 'cancelled' && (
                                                                        <Tag color='red'>Đã từ chối</Tag>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Text
                                                        type='secondary'
                                                        style={{ display: 'block', fontSize: '12px' }}
                                                    >
                                                        {item.email}
                                                    </Text>

                                                    <Text type='secondary' style={{ fontSize: '12px' }}>
                                                        {item.job?.title || item.appliedForTitle || 'No Title'}
                                                    </Text>
                                                </div>
                                            </div>
                                        </List.Item>
                                    );
                                }}
                            />
                        )}
                    </div>
                </Card>
            </Col>

            <Col xs={24} lg={15}>
                <Card
                    style={{
                        borderRadius: '12px',
                        minHeight: '650px',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                    bodyStyle={{ display: 'flex', flexDirection: 'column', flex: 1 }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <div>
                            <Title level={4} style={{ margin: 0 }}>
                                {t('interview.configure_send')}
                            </Title>
                        </div>
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                            <Title
                                level={5}
                                style={{
                                    textTransform: 'uppercase',
                                    fontSize: '12px',
                                    color: '#1E40AF',
                                    margin: 0
                                }}
                            >
                                <MailOutlined style={{ marginRight: '8px' }} /> {t('interview.email_comm')}
                            </Title>
                        </div>

                        <Row gutter={16} style={{ marginBottom: '16px' }}>
                            <Col span={24}>
                                <Text strong>{t('interview.subject')}</Text>
                                <Input
                                    value={emailSubject}
                                    onChange={(e) => setEmailSubject(e.target.value)}
                                    style={{ marginTop: '8px' }}
                                />
                            </Col>
                        </Row>

                        <div
                            style={{
                                background: '#fff',
                                border: '1px solid #dbe0e6',
                                borderRadius: '8px',
                                padding: '24px',
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <div
                                style={{
                                    borderBottom: '1px solid #E2E8F0',
                                    paddingBottom: '12px',
                                    marginBottom: '20px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <Space>
                                    <Text
                                        style={{
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            color: '#8c8c8c',
                                            textTransform: 'uppercase'
                                        }}
                                    >
                                        {t('interview.preview')}
                                    </Text>
                                    <Tag color='processing'>HTML Format</Tag>
                                </Space>
                                <Space>
                                    <Button size='small' onClick={handleResetTemplate}>
                                        Khôi phục bản gốc
                                    </Button>
                                    <Button
                                        type={isEditing ? 'primary' : 'default'}
                                        size='small'
                                        icon={isEditing ? <SaveOutlined /> : <EditOutlined />}
                                        onClick={() => setIsEditing(!isEditing)}
                                    >
                                        {isEditing ? 'Xong' : 'Sửa thủ công'}
                                    </Button>
                                </Space>
                            </div>
                            <div
                                contentEditable={isEditing}
                                onBlur={(e) => setEmailHtml(e.currentTarget.innerHTML)}
                                dangerouslySetInnerHTML={{
                                    __html: emailHtml
                                }}
                                style={{
                                    flex: 1,
                                    fontSize: '14px',
                                    lineHeight: '1.8',
                                    color: '#262626',
                                    padding: isEditing ? '12px' : 0,
                                    border: isEditing ? '1px solid #1E40AF' : 'none',
                                    borderRadius: '8px',
                                    overflowY: 'auto',
                                    maxHeight: '300px',
                                    outline: 'none',
                                    background: isEditing ? '#fff' : 'transparent',
                                    transition: 'all 0.3s ease'
                                }}
                            />
                        </div>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '12px',
                            borderTop: '1px solid #E2E8F0',
                            paddingTop: '16px'
                        }}
                    >
                        <Button size='large' onClick={() => setSelectedCandidates([])}>
                            Hủy bỏ
                        </Button>
                        <Button
                            type='primary'
                            size='large'
                            icon={<SendOutlined />}
                            onClick={handleSendInvites}
                            disabled={validSelectedCandidates.length === 0}
                            loading={isProcessing}
                            style={{ background: '#10b981', borderColor: '#10b981' }}
                        >
                            {t('interview.schedule_send')} ({validSelectedCandidates.length})
                        </Button>
                    </div>
                </Card>
            </Col>
        </Row>
    );
};
