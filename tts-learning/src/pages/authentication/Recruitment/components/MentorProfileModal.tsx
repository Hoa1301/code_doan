import {
    Avatar,
    Button,
    Card,
    Col,
    Descriptions,
    Divider,
    Modal,
    Progress,
    Row,
    Tag,
    Typography,
    Space
} from 'antd';
import { useTranslation } from 'react-i18next';
import { UserOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useResponsive } from '../../../../hooks/useResponsive';

const { Title, Text } = Typography;

interface MentorProfile {
    avatar?: string;
    name: string;
    track: string;
    status: string;
    moduleProgress: string;
    progressPercent: number;
    phaseColor: string;
    currentPhase: string;
}

interface MentorProfileModalProps {
    open: boolean;
    onCancel: () => void;
    intern: MentorProfile | null;
}

export const MentorProfileModal = ({ open, onCancel, intern }: MentorProfileModalProps) => {
    const { t } = useTranslation();
    const { isMobile, isLaptop } = useResponsive();

    if (!intern) return null;

    return (
        <Modal
            title={t('task_mgmt.view_profile')}
            open={open}
            onCancel={onCancel}
            footer={[
                <Button key="close" onClick={onCancel}>
                    {t('common.close')}
                </Button>
            ]}
            width={isMobile ? 'calc(100vw - 24px)' : isLaptop ? 620 : 700}
            destroyOnClose
        >
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <Avatar size={100} src={intern.avatar} icon={<UserOutlined />} />
                <Title level={3} style={{ margin: '16px 0 4px' }}>{intern.name}</Title>
                <Text type="secondary">{intern.track}</Text>
                <div style={{ marginTop: '8px' }}>
                    <Tag color={intern.status === 'On Track' ? 'success' : 'warning'}>
                        {intern.status === 'On Track' ? t('task_mgmt.on_track') : t('task_mgmt.behind')}
                    </Tag>
                </div>
            </div>

            <Row gutter={24}>
                <Col span={24}>
                    <Card size="small" title={t('learning_path.progress')} style={{ marginBottom: '16px' }}>
                        <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                            <Text>{intern.moduleProgress}</Text>
                            <Text strong>{intern.progressPercent}%</Text>
                        </div>
                        <Progress percent={intern.progressPercent} status={intern.status === 'Behind' ? 'exception' : 'active'} strokeColor="#1E40AF" />
                        <Divider style={{ margin: '12px 0' }} />
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Text type="secondary">{t('task_mgmt.project_phase')}:</Text>
                                <Tag color={intern.phaseColor}>{intern.currentPhase}</Tag>
                            </div>
                        </Space>
                    </Card>

                    <Descriptions title={t('candidate.contact_info')} column={1} bordered size="small">
                        <Descriptions.Item label={t('common.email')}>
                            <MailOutlined /> {intern.name.toLowerCase().replace(' ', '.')}@example.com
                        </Descriptions.Item>
                        <Descriptions.Item label={t('common.phone')}>
                            <PhoneOutlined /> +84 123 456 789
                        </Descriptions.Item>
                        <Descriptions.Item label={t('common.location')}>
                            <EnvironmentOutlined /> Ho Chi Minh City, Vietnam
                        </Descriptions.Item>
                    </Descriptions>
                </Col>
            </Row>
        </Modal>
    );
};
