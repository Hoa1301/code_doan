import { DownloadOutlined, LinkOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Card, Col, Empty, Input, InputNumber, Row, Space, Tag, Typography } from 'antd';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Phase1ModuleDetail } from '../../../../services/Internship/moduleAssessments';
import { getCompactFileLabel, getCompactLinkLabel } from '../../../../utils';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

type DraftState = Record<
    string,
    {
        score?: number | null;
        feedback?: string;
    }
>;

type Phase1ModuleEvaluationBoardProps = {
    modules: Phase1ModuleDetail[];
    readOnly: boolean;
    isLoading?: boolean;
    averageScore?: number | null;
    isAverageReady?: boolean;
    onSaveModuleEvaluation?: (moduleId: string, values: { score?: number | null; feedback?: string }) => Promise<void>;
};

const openResource = (url?: string | null) => {
    if (!url) {
        return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
};

const formatDateTime = (value?: string | null) => {
    if (!value) {
        return null;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date.toLocaleString('vi-VN');
};

const renderResourceButtons = (
    file?: { url?: string | null; fileName: string; originalName?: string | null } | null,
    link?: string | null
) => {
    const actions: ReactNode[] = [];

    if (file?.url) {
        actions.push(
            <Button key={`file-${file.fileName}`} icon={<DownloadOutlined />} onClick={() => openResource(file.url)}>
                {getCompactFileLabel(file.originalName || file.fileName, 'download')}
            </Button>
        );
    }

    if (link) {
        actions.push(
            <Button key={`link-${link}`} icon={<LinkOutlined />} onClick={() => openResource(link)}>
                {getCompactLinkLabel(link, 'Mở link')}
            </Button>
        );
    }

    return actions.length ? (
        <Space wrap size={[8, 8]}>
            {actions}
        </Space>
    ) : (
        <Text type='secondary'>Chưa có tài liệu hoặc đường link.</Text>
    );
};

const renderContentBlock = (
    title: string,
    description?: string | null,
    file?: { url?: string | null; fileName: string; originalName?: string | null } | null,
    link?: string | null,
    footerText?: string | null
) => (
    <div
        style={{
            height: '100%',
            border: '1px solid #E2E8F0',
            borderRadius: 16,
            padding: 20,
            background: '#FFFFFF'
        }}
    >
        <Text strong style={{ display: 'block', marginBottom: 12, fontSize: '18px', color: '#0F172A' }}>
            {title}
        </Text>
        <Paragraph style={{ minHeight: 48, color: description ? '#334155' : '#94A3B8' }}>
            {description || 'Chưa có mô tả thêm.'}
        </Paragraph>
        <div>{renderResourceButtons(file, link)}</div>
        {footerText ? (
            <Text type='secondary' style={{ display: 'block', marginTop: 16 }}>
                {footerText}
            </Text>
        ) : null}
    </div>
);

export const Phase1ModuleEvaluationBoard = ({
    modules,
    readOnly,
    isLoading,
    averageScore,
    isAverageReady,
    onSaveModuleEvaluation
}: Phase1ModuleEvaluationBoardProps) => {
    const [drafts, setDrafts] = useState<DraftState>({});
    const [savingModuleId, setSavingModuleId] = useState<string>('');

    useEffect(() => {
        const nextDrafts = modules.reduce<DraftState>((result, item) => {
            result[item.moduleId] = {
                score: item.evaluation?.score ?? null,
                feedback: item.evaluation?.feedback || ''
            };
            return result;
        }, {});
        setDrafts(nextDrafts);
    }, [modules]);

    const sortedModules = useMemo(
        () => [...modules].sort((firstModule, secondModule) => firstModule.orderIndex - secondModule.orderIndex),
        [modules]
    );

    const updateDraft = (moduleId: string, patch: { score?: number | null; feedback?: string }) => {
        setDrafts((currentDrafts) => ({
            ...currentDrafts,
            [moduleId]: {
                ...currentDrafts[moduleId],
                ...patch
            }
        }));
    };

    const handleSave = async (moduleId: string) => {
        if (!onSaveModuleEvaluation) {
            return;
        }

        const currentDraft = drafts[moduleId] || {};
        setSavingModuleId(moduleId);

        try {
            await onSaveModuleEvaluation(moduleId, currentDraft);
        } finally {
            setSavingModuleId('');
        }
    };

    if (isLoading) {
        return (
            <Card bordered={false} style={{ borderRadius: 16, border: '1px solid #E2E8F0' }}>
                <Text type='secondary'>Đang tải dữ liệu đánh giá giai đoạn đào tạo...</Text>
            </Card>
        );
    }

    if (!sortedModules.length) {
        return (
            <Card bordered={false} style={{ borderRadius: 16, border: '1px solid #E2E8F0' }}>
                <Empty description='Chưa có học phần nào trong lộ trình giai đoạn đào tạo.' />
            </Card>
        );
    }

    return (
        <Space direction='vertical' size={16} style={{ width: '100%' }}>
            {sortedModules.map((item, index) => {
                const evaluationStatus = item.evaluation?.status || '';
                const submissionStatus = item.submission?.status || '';
                const canGrade = Boolean(item.submission);
                const draft = drafts[item.moduleId] || {};

                return (
                    <Card
                        key={item.moduleId}
                        bordered={false}
                        style={{ borderRadius: 18, border: '1px solid #D7E3F4', boxShadow: '0 6px 20px rgba(15, 23, 42, 0.04)' }}
                    >
                        <Space direction='vertical' size={20} style={{ width: '100%' }}>
                            <div>
                                <Text strong style={{ fontSize: '30px', color: '#1E3A8A' }}>
                                    {`Học phần ${index + 1}: ${item.moduleTitle}`}
                                </Text>
                                <Space wrap size={[8, 8]} style={{ marginTop: 12 }}>
                                    {item.submission?.submittedAt ? (
                                        <Tag color='blue'>{`Đã nộp ${formatDateTime(item.submission.submittedAt)}`}</Tag>
                                    ) : (
                                        <Tag>Chưa nộp bài</Tag>
                                    )}
                                    {submissionStatus === 'graded' ? <Tag color='green'>Đã chấm</Tag> : null}
                                    {evaluationStatus === 'completed' ? <Tag color='green'>Đã đánh giá</Tag> : null}
                                </Space>
                            </div>

                            <Row gutter={[20, 20]}>
                                <Col xs={24} lg={12}>
                                    {renderContentBlock(
                                        'Đề bài cuối module',
                                        item.finalTest?.description,
                                        item.finalTest?.materialFile,
                                        item.finalTest?.materialLink
                                    )}
                                </Col>
                                <Col xs={24} lg={12}>
                                    {renderContentBlock(
                                        'Tài liệu thực tập sinh nộp',
                                        item.submission?.description,
                                        item.submission?.submissionFile,
                                        item.submission?.submissionLink,
                                        !item.submission ? 'Thực tập sinh chưa nộp bài cho học phần này.' : null
                                    )}
                                </Col>
                            </Row>

                            <div>
                                <Text strong style={{ display: 'block', marginBottom: 12, fontSize: '18px' }}>
                                    Nhận xét:
                                </Text>
                                <TextArea
                                    rows={6}
                                    value={draft.feedback}
                                    disabled={readOnly}
                                    onChange={(event) => updateDraft(item.moduleId, { feedback: event.target.value })}
                                    placeholder='Nhập nhận xét của mentor cho học phần này'
                                    style={{ borderRadius: 12 }}
                                />
                            </div>

                            <Space align='end' size={16} wrap>
                                <div>
                                    <Text strong style={{ display: 'block', marginBottom: 8, fontSize: '18px' }}>
                                        Điểm
                                    </Text>
                                    <InputNumber
                                        min={0}
                                        max={10}
                                        step={0.5}
                                        value={draft.score ?? undefined}
                                        disabled={readOnly}
                                        onChange={(value) => updateDraft(item.moduleId, { score: typeof value === 'number' ? value : null })}
                                        style={{ width: 220 }}
                                    />
                                </div>

                                {!readOnly ? (
                                    <Button
                                        type='primary'
                                        icon={<SaveOutlined />}
                                        disabled={!canGrade}
                                        loading={savingModuleId === item.moduleId}
                                        onClick={() => handleSave(item.moduleId)}
                                    >
                                        Lưu chấm điểm
                                    </Button>
                                ) : null}
                            </Space>

                            {!canGrade && !readOnly ? (
                                <Text type='secondary'>Thực tập sinh chưa nộp bài nên chưa thể chấm học phần này.</Text>
                            ) : null}
                        </Space>
                    </Card>
                );
            })}

            {isAverageReady ? (
                <Card
                    bordered={false}
                    style={{ borderRadius: 16, border: '1px solid #BFDBFE', background: '#EFF6FF' }}
                >
                    <Text strong style={{ display: 'block', fontSize: '18px', color: '#1D4ED8' }}>
                        Điểm trung bình giai đoạn đào tạo
                    </Text>
                    <Text style={{ display: 'block', marginTop: 8, fontSize: '28px', color: '#0F172A' }}>
                        {averageScore != null ? `${averageScore}/10` : '--'}
                    </Text>
                </Card>
            ) : null}
        </Space>
    );
};
