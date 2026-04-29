import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    UserOutlined,
    RocketOutlined,
    SearchOutlined,
    MoreOutlined
} from '@ant-design/icons';
import {
    Avatar,
    Button,
    Card,
    Col,
    Input,
    List,
    Row,
    Space,
    Steps,
    Tag,
    Typography,
    message,
    Dropdown,
    MenuProps,
    Skeleton
} from 'antd';
import { useEffect, useState } from 'react';
import { http } from '../../../utils/http';
import { Onboarding, OnboardingStep } from '../../../services/Recruitment/onboarding';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

export const OnboardingList = () => {
    const { t } = useTranslation();
    const [searchText, setSearchText] = useState('');
    const [onboardingData, setOnboardingData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchOnboarding = async () => {
        setIsLoading(true);
        try {
            const params: any = {};
            if (searchText) {
                params.searcher = JSON.stringify({ keyword: searchText, field: 'fullName' });
            }
            const res = await http.get('/onboardings', { params });
            setOnboardingData(res);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOnboarding();
    }, [searchText]);

    const handleAction = async (key: string, item: any) => {
        if (key === 'next' || key === 'approve') {
            const nextStep = item.currentStep + 1;
            if (nextStep < item.steps.length) {
                const newSteps = [...item.steps];
                newSteps[item.currentStep].status = 'finish';
                newSteps[nextStep].status = 'process';

                await http.patch(`/onboardings/${item.id}`, {
                    currentStep: nextStep,
                    steps: newSteps
                });
                message.success(t('onboarding.advance_success', { name: item.fullName }));
                fetchOnboarding();
            } else if (nextStep === item.steps.length) {
                const newSteps = [...item.steps];
                newSteps[item.currentStep].status = 'finish';
                await http.patch(`/onboardings/${item.id}`, {
                    currentStep: nextStep,
                    steps: newSteps,
                    status: 'completed'
                });
                message.success(t('onboarding.complete_success', { name: item.fullName }));
                fetchOnboarding();
            }
        } else {
            message.info(`${key} for ${item.fullName}`);
        }
    };

    const getActionMenu = (item: any): MenuProps => ({
        items: [
            { key: 'reminder', label: t('onboarding.send_reminder') },
            { key: 'approve', label: t('onboarding.approve_step') },
            { type: 'divider' },
            { key: 'cancel', label: t('onboarding.cancel_onboarding'), danger: true }
        ],
        onClick: ({ key }) => handleAction(key, item)
    });

    const data = onboardingData?.data || [];

    return (
        <div style={{ padding: '24px' }}>
            <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}
            >
                <div>
                    <Title level={3} style={{ margin: 0 }}>
                        {t('onboarding.title')}
                    </Title>
                </div>
                <Space>
                    <Input
                        placeholder={t('onboarding.search_placeholder')}
                        prefix={<SearchOutlined />}
                        style={{ width: 250 }}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    <Button type='primary' icon={<RocketOutlined />}>
                        {t('onboarding.bulk_actions')}
                    </Button>
                </Space>
            </div>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={18}>
                    {isLoading ? (
                        <Skeleton active paragraph={{ rows: 10 }} />
                    ) : (
                        <List<any>
                            grid={{ gutter: 16, column: 1 }}
                            dataSource={data}
                            renderItem={(item: any) => (
                                <List.Item>
                                    <Card
                                        bordered={false}
                                        style={{ borderRadius: '12px' }}
                                        bodyStyle={{ padding: '20px' }}
                                    >
                                        <Row gutter={24} align='middle'>
                                            <Col xs={24} md={6}>
                                                <Space size='middle'>
                                                    <Avatar size={54} src={item.candidate?.avatarUrl} icon={<UserOutlined />} />
                                                    <div>
                                                        <Text strong style={{ display: 'block', fontSize: '16px' }}>
                                                            {item.candidate?.fullName || 'N/A'}
                                                        </Text>
                                                        <Text type='secondary' style={{ fontSize: '12px' }}>
                                                            {item.track}
                                                        </Text>
                                                        <Tag
                                                            color={
                                                                item.status === 'delayed'
                                                                    ? 'red'
                                                                    : item.status === 'completed'
                                                                      ? 'success'
                                                                      : 'processing'
                                                            }
                                                            style={{ marginTop: '4px' }}
                                                        >
                                                            {item.status === 'delayed'
                                                                ? t('onboarding.delayed')
                                                                : item.status === 'completed'
                                                                  ? t('onboarding.completed')
                                                                  : t('onboarding.in_onboarding')}
                                                        </Tag>
                                                    </div>
                                                </Space>
                                            </Col>
                                            <Col xs={24} md={14}>
                                                <div style={{ padding: '0 20px' }}>
                                                    <Steps
                                                        size='small'
                                                        current={item.currentStep}
                                                        items={(item.steps || []).map((s: any) => ({
                                                            title: s.title,
                                                            status: s.status
                                                        }))}
                                                    />
                                                </div>
                                            </Col>
                                            <Col xs={24} md={4} style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    <Button
                                                        type='primary'
                                                        size='small'
                                                        onClick={() => handleAction('next', item)}
                                                        disabled={item.status === 'completed'}
                                                    >
                                                        {item.status === 'completed'
                                                            ? t('onboarding.completed')
                                                            : t('onboarding.advance')}
                                                    </Button>
                                                    <Dropdown menu={getActionMenu(item)} trigger={['click']}>
                                                        <Button size='small' icon={<MoreOutlined />}>
                                                            {t('onboarding.more')}
                                                        </Button>
                                                    </Dropdown>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Card>
                                </List.Item>
                            )}
                        />
                    )}
                </Col>

                <Col xs={24} lg={6}>
                    <Space direction='vertical' size='large' style={{ width: '100%' }}>
                        <Card title={t('onboarding.next_steps')} bordered={false} style={{ borderRadius: '12px' }}>
                            <List
                                size='small'
                                dataSource={[
                                    { icon: <ClockCircleOutlined />, text: t('onboarding.next_steps_items.docs') },
                                    { icon: <CheckCircleOutlined />, text: t('onboarding.next_steps_items.accounts') },
                                    { icon: <UserOutlined />, text: t('onboarding.next_steps_items.mentor') }
                                ]}
                                renderItem={(item) => (
                                    <List.Item style={{ padding: '12px 0' }}>
                                        <Space>
                                            <span style={{ color: '#1E40AF' }}>{item.icon}</span>
                                            <Text style={{ fontSize: '13px' }}>{item.text}</Text>
                                        </Space>
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </Space>
                </Col>
            </Row>
        </div>
    );
};
