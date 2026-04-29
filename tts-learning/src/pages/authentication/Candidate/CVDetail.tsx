import {
    DownloadOutlined,
    EnvironmentOutlined,
    FilePdfOutlined,
    LinkedinOutlined,
    LeftOutlined,
    MailOutlined,
    PhoneOutlined,
    UserOutlined
} from '@ant-design/icons';
import {
    Avatar,
    Button,
    Card,
    Col,
    Descriptions,
    Divider,
    Input,
    Layout,
    List,
    Modal,
    Row,
    Space,
    Tag,
    Timeline,
    Typography,
    message,
    Spin,
    Empty
} from 'antd';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    useCandidate,
    useShortlistCandidate,
    useRejectCandidate,
    usePassInterviewCandidate
} from '../../../hooks/Recruitment/useCandidates';
import { ConvertToInternModal } from './components/ConvertToInternModal';
import { getCompactFileLabel } from '../../../utils';
import { notify } from '../../../utils/notify';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

export const CVDetail = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);

    const { data: candidateData, isLoading: isCandidateLoading, refetch: refetchCandidate } = useCandidate(id || '');
    const shortlistMutation = useShortlistCandidate();
    const rejectMutation = useRejectCandidate();
    const passInterviewMutation = usePassInterviewCandidate();

    const handleApprove = async () => {
        if (!id) return;
        try {
            await shortlistMutation.mutate({ id });
            notify.success(t('common.success'));
        } catch {
            notify.error(t('common.error'));
        }
    };

    const handlePassInterview = async () => {
        if (!id) return;
        try {
            await passInterviewMutation.mutate({ id });
            notify.success(t('candidate.passed_interview_success'));
        } catch {
            notify.error(t('common.error'));
        }
    };

    const handleReject = async () => {
        if (!id) return;
        try {
            await rejectMutation.mutate({ id, reason: rejectReason });
            setIsRejectModalOpen(false);
            notify.success(t('common.success'));
        } catch {
            notify.error(t('common.error'));
        }
    };

    if (isCandidateLoading) {
        return (
            <div style={{ padding: '100px', textAlign: 'center' }}>
                <Spin size='large' />
            </div>
        );
    }

    const candidate = candidateData;

    if (!candidate) {
        return (
            <div style={{ padding: '100px' }}>
                <Empty description='Không tìm thấy ứng viên' />
            </div>
        );
    }

    const status = candidate.status;

    return (
        <Layout style={{ minHeight: '100vh', background: '#f6f7f8' }}>
            <Content style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                <div style={{ marginBottom: '24px' }}>
                    <Button
                        icon={<LeftOutlined />}
                        type='link'
                        onClick={() => navigate('/recruitment/cvs')}
                        style={{ paddingLeft: 0 }}
                    >
                        {t('candidate.back_to_candidates')}
                    </Button>
                </div>

                <div
                    style={{
                        background: '#fff',
                        borderRadius: '12px',
                        padding: '24px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        marginBottom: '24px'
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            flexWrap: 'wrap',
                            gap: '16px'
                        }}
                    >
                        <div style={{ display: 'flex', gap: '24px' }}>
                            <Avatar size={80} src={candidate.avatarUrl} />
                            <div>
                                <Title level={2} style={{ margin: '0 0 8px 0' }}>
                                    {candidate.fullName}
                                </Title>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <Text type='secondary' style={{ fontSize: '16px' }}>
                                        {candidate.role}
                                    </Text>
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '16px',
                                            color: '#64748B',
                                            fontSize: '14px'
                                        }}
                                    >
                                        <span>
                                            <MailOutlined /> {candidate.email}
                                        </span>
                                        <span>
                                            <PhoneOutlined /> {candidate.phone}
                                        </span>
                                        <span>
                                            <EnvironmentOutlined /> {candidate.location}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ marginBottom: '16px' }}>
                                <Tag
                                    color={
                                        status === 'passed_interview'
                                            ? 'success'
                                            : status === 'shortlisted' || status === 'interview_scheduled'
                                                ? 'processing'
                                                : status === 'offer'
                                                    ? 'cyan'
                                                : status === 'rejected'
                                                    ? 'error'
                                                    : status === 'converted_to_intern'
                                                        ? 'purple'
                                                        : 'warning'
                                    }
                                    style={{ fontSize: '14px', padding: '4px 12px' }}
                                >
                                    {status === 'passed_interview'
                                        ? t('candidate.passed_interview')
                                        : status === 'interview_scheduled'
                                            ? t('candidate.interview_scheduled')
                                            : status === 'offer'
                                                ? t('candidate.offer')
                                            : status === 'shortlisted'
                                                ? t('candidate.shortlisted')
                                                : status === 'rejected'
                                                    ? t('candidate.rejected')
                                                    : status === 'converted_to_intern'
                                                        ? t('candidate.converted_to_intern')
                                                        : t('candidate.pending_review')}
                                </Tag>
                            </div>
                            <Space>
                                <Button
                                    icon={<DownloadOutlined />}
                                    disabled={!candidate.resumeUrl}
                                    onClick={() => {
                                        if (candidate.resumeUrl) {
                                            window.open(candidate.resumeUrl, '_blank', 'noopener,noreferrer');
                                        }
                                    }}
                                >
                                    {t('candidate.download_cv')}
                                </Button>
                                {status === 'offer' && (
                                    <Button
                                        type='primary'
                                        onClick={() => setIsConvertModalOpen(true)}
                                        style={{ background: '#722ed1', borderColor: '#722ed1' }}
                                    >
                                        {t('onboarding.convert_to_intern')}
                                    </Button>
                                )}
                                {status !== 'rejected' &&
                                    status !== 'passed_interview' &&
                                    status !== 'offer' &&
                                    status !== 'converted_to_intern' && (
                                        <>
                                            <Button
                                                danger
                                                onClick={() => setIsRejectModalOpen(true)}
                                                loading={rejectMutation.isLoading}
                                            >
                                                {t('candidate.reject_candidate_btn')}
                                            </Button>
                                            {status === 'interview_scheduled' ? (
                                                <Button
                                                    type='primary'
                                                    onClick={handlePassInterview}
                                                    loading={passInterviewMutation.isLoading}
                                                    style={{ background: '#10B981', borderColor: '#10B981' }}
                                                >
                                                    {t('candidate.pass_interview_btn')}
                                                </Button>
                                            ) : (
                                                <Button
                                                    type='primary'
                                                    onClick={handleApprove}
                                                    disabled={status === 'shortlisted'}
                                                    loading={shortlistMutation.isLoading}
                                                >
                                                    {status === 'shortlisted'
                                                        ? t('candidate.shortlisted')
                                                        : t('candidate.shortlist_candidate_btn')}
                                                </Button>
                                            )}
                                        </>
                                    )}
                            </Space>
                        </div>
                    </div>
                </div>

                <Row gutter={24}>
                    <Col xs={24} lg={16}>
                        <Card
                            title={t('candidate.candidate_info')}
                            bordered={false}
                            style={{ borderRadius: '12px', marginBottom: '24px' }}
                        >
                            <Descriptions column={1} labelStyle={{ fontWeight: 600, width: '150px' }}>
                                <Descriptions.Item label={t('candidate.education')}>
                                    {candidate.education}
                                </Descriptions.Item>
                                <Descriptions.Item label={t('candidate.experience')}>
                                    {candidate.experience}
                                </Descriptions.Item>
                                <Descriptions.Item label={t('candidate.skills')}>
                                    <Space size={[0, 8]} wrap>
                                        {candidate.skills?.map((skill) => <Tag key={skill}>{skill}</Tag>)}
                                    </Space>
                                </Descriptions.Item>
                                <Descriptions.Item label='LinkedIn'>
                                    <a href='#' style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <LinkedinOutlined /> linkedin.com/in/
                                        {candidate.fullName.toLowerCase().replace(' ', '')}
                                    </a>
                                </Descriptions.Item>
                            </Descriptions>

                            <Divider />

                            <Title level={5}>{t('candidate.cover_letter')}</Title>
                            <Paragraph style={{ color: '#64748B' }}>
                                {candidate.coverLetter || 'Chưa có thư giới thiệu.'}
                            </Paragraph>

                            <Divider />

                            <Title level={5}>{t('candidate.resume_preview')}</Title>
                            <div
                                style={{
                                    height: '400px',
                                    background: '#F8FAFC',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px dashed #E2E8F0'
                                }}
                            >
                                <div style={{ textAlign: 'center' }}>
                                    <FilePdfOutlined
                                        style={{ fontSize: '48px', color: '#EF4444', marginBottom: '16px' }}
                                    />
                                    <Text type='secondary' style={{ display: 'block' }}>
                                        {getCompactFileLabel(candidate.resumeUrl, `${candidate.fullName}_Resume.pdf`)}
                                    </Text>
                                    <Button
                                        type='link'
                                        disabled={!candidate.resumeUrl}
                                        onClick={() => {
                                            if (candidate.resumeUrl) {
                                                window.open(candidate.resumeUrl, '_blank', 'noopener,noreferrer');
                                            }
                                        }}
                                    >
                                        {t('candidate.click_to_preview')}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} lg={8}>
                        <Card
                            title={t('candidate.app_timeline')}
                            bordered={false}
                            style={{ borderRadius: '12px', marginBottom: '24px' }}
                        >
                            <Timeline
                                items={[
                                    {
                                        color: 'green',
                                        children: (
                                            <>
                                                <Text strong>{t('candidate.applied')}</Text>
                                                <br />
                                                <Text type='secondary' style={{ fontSize: '12px' }}>
                                                    {candidate.appliedDate} - {t('candidate.via_website')}
                                                </Text>
                                            </>
                                        )
                                    },
                                    {
                                        color: 'blue',
                                        children: (
                                            <>
                                                <Text strong>{t('candidate.screening')}</Text>
                                                <br />
                                                <Text type='secondary' style={{ fontSize: '12px' }}>
                                                    {candidate.createdAt} - {t('candidate.auto_screened')} (Match:{' '}
                                                    {candidate.matchScore}%)
                                                </Text>
                                            </>
                                        )
                                    },
                                    {
                                        color: status === 'Shortlisted' ? 'blue' : 'gray',
                                        children: (
                                            <>
                                                <Text strong>{t('candidate.shortlisted')}</Text>
                                                <br />
                                                <Text type='secondary' style={{ fontSize: '12px' }}>
                                                    {status === 'Shortlisted'
                                                        ? `${t('candidate.just_now')} - bởi HR`
                                                        : t('learning_path.draft')}
                                                </Text>
                                            </>
                                        )
                                    },
                                    {
                                        color: 'gray',
                                        children: t('candidate.interview')
                                    },
                                    {
                                        color: 'gray',
                                        children: t('candidate.offer')
                                    }
                                ]}
                            />
                        </Card>

                        <Card title={t('candidate.internal_notes')} bordered={false} style={{ borderRadius: '12px' }}>
                            <List
                                itemLayout='horizontal'
                                dataSource={[
                                    {
                                        user: 'Hệ thống',
                                        text: `Điểm phù hợp được tính toán: ${candidate.matchScore}% dựa trên từ khóa.`,
                                        time: candidate.timeAgo
                                    }
                                ]}
                                renderItem={(item) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={<Avatar icon={<UserOutlined />} size='small' />}
                                            title={
                                                <Text style={{ fontSize: '12px' }}>
                                                    {item.user}{' '}
                                                    <Text type='secondary' style={{ marginLeft: '4px' }}>
                                                        {item.time}
                                                    </Text>
                                                </Text>
                                            }
                                            description={<Text style={{ fontSize: '13px' }}>{item.text}</Text>}
                                        />
                                    </List.Item>
                                )}
                            />
                            <div style={{ marginTop: '16px' }}>
                                <Input.TextArea placeholder={`${t('candidate.add_note')}...`} rows={2} />
                                <Button type='primary' size='small' style={{ marginTop: '8px', float: 'right' }}>
                                    {t('candidate.add_note')}
                                </Button>
                            </div>
                        </Card>
                    </Col>
                </Row>

                <Modal
                    title={t('candidate.reject_confirm_title')}
                    open={isRejectModalOpen}
                    onOk={handleReject}
                    onCancel={() => setIsRejectModalOpen(false)}
                    okText={t('candidate.reject_candidate_btn')}
                    okButtonProps={{ danger: true, loading: rejectMutation.isLoading }}
                >
                    <p>{t('candidate.reject_confirm_msg')}</p>
                    <Input.TextArea
                        placeholder={t('candidate.reject_reason_label')}
                        rows={3}
                        style={{ marginTop: '16px' }}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                    />
                </Modal>

                <ConvertToInternModal
                    open={isConvertModalOpen}
                    onCancel={() => setIsConvertModalOpen(false)}
                    onSuccess={async () => {
                        await refetchCandidate();
                    }}
                    candidateId={candidate.id}
                    candidateName={candidate.fullName}
                />
            </Content>
        </Layout>
    );
};
