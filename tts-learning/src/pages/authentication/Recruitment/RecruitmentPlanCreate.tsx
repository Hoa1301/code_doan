import { LeftOutlined, SaveOutlined, LoadingOutlined } from '@ant-design/icons';
import {
    Button,
    Card,
    Col,
    DatePicker,
    Form,
    Input,
    InputNumber,
    Row,
    Select,
    Space,
    Typography,
    message,
    Divider
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { RouteConfig } from '../../../constants';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { notify } from '../../../utils/notify';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export const RecruitmentPlanCreate = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const onFinish = (values: any) => {
        setLoading(true);
        console.log('Form values:', values);

        setTimeout(() => {
            setLoading(false);
            notify.success(t('common.success'));
            navigate(RouteConfig.RecruitmentPlanList.path);
        }, 1500);
    };

    return (
        <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
            <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}
            >
                <Space align='center'>
                    <Button
                        icon={<LeftOutlined />}
                        onClick={() => navigate(RouteConfig.RecruitmentPlanList.path)}
                        type='text'
                    />
                    <Title level={3} style={{ margin: 0 }}>
                        {t('recruitment.create_new_plan')}
                    </Title>
                </Space>
                <Space>
                    <Button onClick={() => navigate(RouteConfig.RecruitmentPlanList.path)}>{t('common.cancel')}</Button>
                    <Button
                        type='primary'
                        icon={loading ? <LoadingOutlined /> : <SaveOutlined />}
                        onClick={() => form.submit()}
                        loading={loading}
                    >
                        {t('recruitment.save_plan')}
                    </Button>
                </Space>
            </div>

            <Form
                form={form}
                layout='vertical'
                onFinish={onFinish}
                initialValues={{
                    status: 'draft',
                    department: 'Engineering'
                }}
            >
                <Row gutter={24}>
                    <Col xs={24} lg={16}>
                        <Card
                            title={t('recruitment.general_info')}
                            bordered={false}
                            style={{ borderRadius: '12px', marginBottom: '24px' }}
                        >
                            <Form.Item
                                label={t('recruitment.campaign_name')}
                                name='name'
                                rules={[{ required: true, message: t('common.required_field') }]}
                            >
                                <Input placeholder={t('recruitment.campaign_name')} size='large' />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        label={t('recruitment.batch_name')}
                                        name='batch'
                                        rules={[{ required: true, message: t('common.required_field') }]}
                                    >
                                        <Input placeholder={t('recruitment.batch_name')} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label={t('common.department')}
                                        name='department'
                                        rules={[{ required: true, message: t('common.required_field') }]}
                                    >
                                        <Select
                                            options={[
                                                { value: 'Engineering', label: 'Engineering' },
                                                { value: 'Marketing', label: 'Marketing' },
                                                { value: 'Design', label: 'Design' },
                                                { value: 'Data', label: 'Data Science' },
                                                { value: 'HR', label: 'Human Resources' }
                                            ]}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item label={t('recruitment.campaign_desc')} name='description'>
                                <Input.TextArea rows={4} placeholder={t('recruitment.campaign_desc')} />
                            </Form.Item>
                        </Card>

                        <Card title={t('recruitment.positions_reqs')} bordered={false} style={{ borderRadius: '12px' }}>
                            <Form.List name='positions'>
                                {(fields, { add, remove }) => (
                                    <>
                                        {fields.map(({ key, name, ...restField }) => (
                                            <div
                                                key={key}
                                                style={{
                                                    marginBottom: '16px',
                                                    padding: '16px',
                                                    background: '#fafafa',
                                                    borderRadius: '8px',
                                                    position: 'relative'
                                                }}
                                            >
                                                <Row gutter={16}>
                                                    <Col span={14}>
                                                        <Form.Item
                                                            {...restField}
                                                            name={[name, 'title']}
                                                            label={t('recruitment.job_title')}
                                                            rules={[
                                                                { required: true, message: t('common.required_field') }
                                                            ]}
                                                        >
                                                            <Input placeholder={t('recruitment.job_title')} />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={10}>
                                                        <Form.Item
                                                            {...restField}
                                                            name={[name, 'count']}
                                                            label={t('recruitment.quantity')}
                                                            rules={[
                                                                { required: true, message: t('common.required_field') }
                                                            ]}
                                                        >
                                                            <InputNumber min={1} style={{ width: '100%' }} />
                                                        </Form.Item>
                                                    </Col>
                                                </Row>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'requirements']}
                                                    label={t('recruitment.requirements')}
                                                >
                                                    <Input.TextArea
                                                        rows={2}
                                                        placeholder={t('recruitment.requirements')}
                                                    />
                                                </Form.Item>
                                                {fields.length > 1 && (
                                                    <Button
                                                        type='text'
                                                        danger
                                                        onClick={() => remove(name)}
                                                        style={{ position: 'absolute', top: 8, right: 8 }}
                                                    >
                                                        {t('common.delete')}
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                        <Button type='dashed' onClick={() => add()} block icon={<SaveOutlined />}>
                                            {t('recruitment.add_position')}
                                        </Button>
                                    </>
                                )}
                            </Form.List>
                        </Card>
                    </Col>

                    <Col xs={24} lg={8}>
                        <Card
                            title={t('recruitment.timeline_status')}
                            bordered={false}
                            style={{ borderRadius: '12px', marginBottom: '24px' }}
                        >
                            <Form.Item
                                label={t('recruitment.campaign_period')}
                                name='period'
                                rules={[{ required: true, message: t('common.required_field') }]}
                            >
                                <RangePicker style={{ width: '100%' }} placeholder={['Ngày bắt đầu', 'Ngày kết thúc']} />
                            </Form.Item>

                            <Form.Item label={t('common.status')} name='status'>
                                <Select
                                    options={[
                                        { value: 'draft', label: t('recruitment.draft') },
                                        { value: 'pending_approval', label: t('recruitment.pending_approval') },
                                        { value: 'request_edit', label: t('recruitment.request_edit') },
                                        { value: 'active', label: t('internship.active') },
                                        { value: 'closed', label: t('recruitment.closed') }
                                    ]}
                                />
                            </Form.Item>

                            <Divider />

                            <div style={{ background: '#e6f7ff', padding: '16px', borderRadius: '8px' }}>
                                <Text type='secondary' style={{ fontSize: '12px' }}>
                                    Tip: Once active, the campaign will be visible on the public job board.
                                </Text>
                            </div>
                        </Card>

                        <Card
                            title={t('recruitment.approval_workflow')}
                            bordered={false}
                            style={{ borderRadius: '12px' }}
                        >
                            <Form.Item label={t('recruitment.assign_approver')} name='approver'>
                                <Select
                                    placeholder={t('recruitment.assign_approver')}
                                    options={[
                                        { value: 'dir1', label: 'John Director (CTO)' },
                                        { value: 'dir2', label: 'Jane Director (CEO)' }
                                    ]}
                                />
                            </Form.Item>
                            <Text type='secondary' style={{ fontSize: '12px' }}>
                                Notifications will be sent to the approver upon submission.
                            </Text>
                        </Card>
                    </Col>
                </Row>
            </Form>
        </div>
    );
};
