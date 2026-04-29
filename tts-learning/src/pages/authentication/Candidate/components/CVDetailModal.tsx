import { DownloadOutlined, FilePdfOutlined, UserOutlined } from '@ant-design/icons';
import {
    Avatar,
    Button,
    Card,
    Col,
    Descriptions,
    Divider,
    Input,
    Modal,
    Row,
    Space,
    Tag,
    Typography,
    message,
    Spin,
    Empty
} from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { http } from '../../../../utils/http';
import { useResponsive } from '../../../../hooks/useResponsive';

import { Candidate } from '../../../../services/Recruitment/candidates';
import { getCompactFileLabel } from '../../../../utils';
import { notify } from '../../../../utils/notify';

const { Title, Text } = Typography;

interface CVDetailModalProps {
    open: boolean;
    onCancel: () => void;
    candidate: Candidate | null;
    onUpdated?: () => void;
}

export const CVDetailModal = ({ open, onCancel, candidate: initialCandidate, onUpdated }: CVDetailModalProps) => {
    const { t } = useTranslation();
    const { isMobile, isLaptop } = useResponsive();
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const [candidateData, setCandidateData] = useState<any>(null);
    const [isCandidateLoading, setIsCandidateLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchCandidate = async () => {
        if (!initialCandidate?.id) return;
        setIsCandidateLoading(true);
        try {
            const res = await http.get(`/candidates/${initialCandidate.id}`);
            setCandidateData(res);
        } catch (error) {
            console.error(error);
            notify.error('Không tải được thông tin ứng viên');
        } finally {
            setIsCandidateLoading(false);
        }
    };

    useEffect(() => {
        if (open) fetchCandidate();
    }, [open, initialCandidate?.id]);

    const candidate = candidateData || initialCandidate;

    const handleApprove = async () => {
        if (!candidate?.id) return;
        setIsProcessing(true);
        try {
            await http.patch(`/candidates/${candidate.id}`, { status: 'shortlisted' });
            notify.success(`Đã shortlist ${candidate.fullName}`);
            fetchCandidate();
            onUpdated?.();
        } catch {
            notify.error(t('common.error'));
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!candidate?.id) return;
        if (!rejectReason.trim()) {
            notify.warning('Vui lòng nhập lý do từ chối');
            return;
        }
        setIsProcessing(true);
        try {
            await http.patch(`/candidates/${candidate.id}`, {
                status: 'rejected_cv',
                rejectionReason: rejectReason
            });
            setIsRejectModalOpen(false);
            nnotify.success(`Đã từ chối ${candidate.fullName}`);
            fetchCandidate();
            onUpdated?.();
        } catch {
            notify.error(t('common.error'));
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Modal
            title={t('candidate.candidate_info')}
            open={open}
            onCancel={onCancel}
            width={isMobile ? 'calc(100vw - 24px)' : isLaptop ? 860 : 1000}
            footer={[
                <Button key='close' onClick={onCancel}>
                    {t('common.close')}
                </Button>
            ]}
            destroyOnClose
        >
            {isCandidateLoading && !initialCandidate ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                    <Spin size='large' />
                </div>
            ) : !candidate ? (
                <Empty description='Candidate not found' />
            ) : (
                <div style={{ padding: '10px' }}>
                    <Card size='small' style={{ marginBottom: '20px', borderRadius: '8px' }}>
                        <Row gutter={24} align='middle'>
                            <Col xs={24} lg={16}>
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                    <Avatar size={64} src={candidate.avatarUrl} icon={<UserOutlined />} />
                                    <div>
                                        <Title level={4} style={{ margin: 0 }}>
                                            {candidate.fullName}
                                        </Title>
                                        <Text type='secondary'>{candidate.email}</Text>
                                    </div>
                                </div>
                            </Col>
                            <Col xs={24} lg={8} style={{ textAlign: isMobile ? 'left' : 'right' }}>
                                <Tag
                                    color={
                                        candidate.status === 'passed_interview'
                                            ? 'success'
                                            : candidate.status === 'shortlisted' ||
                                                candidate.status === 'interview_scheduled'
                                              ? 'processing'
                                              : candidate.status === 'rejected' ||
                                                  candidate.status === 'rejected_cv' ||
                                                  candidate.status === 'rejected_interview'
                                                ? 'error'
                                                : candidate.status === 'converted_to_intern'
                                                  ? 'purple'
                                                  : 'warning'
                                    }
                                    style={{ fontSize: '14px', padding: '4px 12px' }}
                                >
                                    {candidate.status === 'passed_interview'
                                        ? t('candidate.passed_interview')
                                        : candidate.status === 'interview_scheduled'
                                          ? t('candidate.interview_scheduled')
                                          : candidate.status === 'shortlisted'
                                            ? t('candidate.shortlisted')
                                            : candidate.status === 'rejected'
                                              ? t('candidate.rejected')
                                              : candidate.status === 'rejected_cv'
                                                ? t('candidate.tab_reject_cv')
                                                : candidate.status === 'rejected_interview'
                                                  ? t('candidate.tab_reject_pv')
                                                  : candidate.status === 'converted_to_intern'
                                                    ? t('candidate.converted_to_intern')
                                                    : t('candidate.pending_review')}
                                </Tag>
                            </Col>
                        </Row>
                    </Card>

                    <Descriptions bordered column={1} size='small' labelStyle={{ width: '150px', fontWeight: 600 }}>
                        <Descriptions.Item label={t('candidate.job_title')}>
                            {candidate.job?.title || candidate.role}
                        </Descriptions.Item>
                        <Descriptions.Item label={t('candidate.applied_date')}>
                            {candidate.appliedDate}
                        </Descriptions.Item>
                        <Descriptions.Item label={t('common.email')}>{candidate.email}</Descriptions.Item>
                    </Descriptions>

                    <div style={{ marginTop: '24px' }}>
                        <Title level={5} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FilePdfOutlined /> {t('candidate.resume_preview')}
                        </Title>
                        {candidate.resumeUrl ? (
                            <div
                                style={{
                                    padding: '24px',
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
                                        style={{ fontSize: '48px', color: '#EF4444', marginBottom: '12px' }}
                                    />
                                    <Text strong style={{ display: 'block' }}>
                                        {getCompactFileLabel(candidate.resumeUrl, `${candidate.fullName}_Resume.pdf`)}
                                    </Text>
                                    <Space wrap style={{ marginTop: '12px' }}>
                                        <Button
                                            icon={<DownloadOutlined />}
                                            onClick={() =>
                                                window.open(candidate.resumeUrl, '_blank', 'noopener,noreferrer')
                                            }
                                        >
                                            {t('candidate.download_cv')}
                                        </Button>
                                        <Button
                                            type='primary'
                                            onClick={() => {
                                                notify.info('Đang mở CV...');
                                                window.open(candidate.resumeUrl, '_blank', 'noopener,noreferrer');
                                            }}
                                        >
                                            {t('candidate.click_to_preview')}
                                        </Button>
                                    </Space>
                                </div>
                            </div>
                        ) : (
                            <Empty description='Ứng viên chưa tải CV lên hệ thống' />
                        )}
                    </div>

                    <div style={{ marginTop: '16px' }}>
                        <Title level={5}>{t('candidate.cover_letter')}</Title>
                        <Input.TextArea
                            value={candidate.coverLetter || 'Ứng viên chưa để lại nội dung giới thiệu.'}
                            readOnly
                            rows={4}
                        />
                    </div>

                    <Divider />

                    <div style={{ textAlign: 'right' }}>
                        <Space wrap>
                            {candidate.status !== 'rejected' &&
                                candidate.status !== 'rejected_cv' &&
                                candidate.status !== 'rejected_interview' &&
                                candidate.status !== 'converted_to_intern' &&
                                candidate.status !== 'passed_interview' && (
                                    <>
                                        <Button
                                            danger
                                            onClick={() => setIsRejectModalOpen(true)}
                                            loading={isProcessing}
                                            disabled={candidate.status === 'offer'}
                                        >
                                            {t('candidate.reject_candidate_btn')}
                                        </Button>
                                        <Button
                                            type='primary'
                                            onClick={handleApprove}
                                            disabled={
                                                candidate.status === 'shortlisted' ||
                                                candidate.status === 'interview_scheduled'
                                            }
                                            loading={isProcessing}
                                        >
                                            {candidate.status === 'shortlisted' ||
                                            candidate.status === 'interview_scheduled'
                                                ? t('candidate.shortlisted')
                                                : t('candidate.shortlist_candidate_btn')}
                                        </Button>
                                    </>
                                )}
                        </Space>
                    </div>
                </div>
            )}

            <Modal
                title={t('candidate.reject_confirm_title')}
                open={isRejectModalOpen}
                onOk={handleReject}
                onCancel={() => setIsRejectModalOpen(false)}
                okText={t('candidate.reject_candidate_btn')}
                okButtonProps={{ danger: true, loading: isProcessing }}
                zIndex={1100}
                width={isMobile ? 'calc(100vw - 24px)' : 520}
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
        </Modal>
    );
};
