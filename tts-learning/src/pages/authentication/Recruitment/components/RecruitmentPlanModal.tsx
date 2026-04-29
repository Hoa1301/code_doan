import { SaveOutlined } from '@ant-design/icons';
import { Button, Col, DatePicker, Form, Input, InputNumber, Row, Select, message, Divider, Modal } from 'antd';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { useResponsive } from '../../../../hooks/useResponsive';
import { http } from '../../../../utils/http';
import { RecruitmentPlan } from '../../../../services/Recruitment/recruitmentPlans';
import { DepartmentSelect } from '../../../../components/CommonSelect/DepartmentSelect';
import { notify } from '../../../../utils/notify';

const { RangePicker } = DatePicker;

interface RecruitmentPlanModalProps {
    open: boolean;
    onCancel: () => void;
    onSuccess: (data?: any) => void;
    initialValues?: RecruitmentPlan | null;
    viewOnly?: boolean;
}

interface PlanFormValues {
    name: string;
    batch: string;
    status?: 'draft' | 'pending_approval' | 'request_edit' | 'active' | 'closed' | 'rejected';
    description?: string;
    period?: [dayjs.Dayjs, dayjs.Dayjs];
    positions?: Array<{
        title: string;
        count: number;
        department?: string;
        requirements?: string;
    }>;
}

export const RecruitmentPlanModal = ({
    open,
    onCancel,
    onSuccess,
    initialValues,
    viewOnly
}: RecruitmentPlanModalProps) => {
    const { t } = useTranslation();
    const { isMobile, isLaptop } = useResponsive();
    const [form] = Form.useForm();
    const [isLoading, setIsLoading] = useState(false);

    // const planStatusOptions = [
    //     { value: 'draft', label: t('recruitment.draft') },
    //     { value: 'pending_approval', label: t('recruitment.pending_approval') },
    //     { value: 'request_edit', label: t('recruitment.request_edit') },
    //     { value: 'active', label: t('internship.active') },
    //     { value: 'closed', label: t('recruitment.closed') }
    // ];

    const getPlanStatusOptions = () => {
        const s = String(initialValues?.status || 'draft');

        if (s === 'draft') {
            return [
                { value: 'draft', label: t('recruitment.draft') },
                { value: 'pending_approval', label: t('recruitment.pending_approval') },
                { value: 'closed', label: t('recruitment.closed') }
            ];
        }

        if (s === 'pending_approval') {
            return [{ value: 'pending_approval', label: t('recruitment.pending_approval') }];
        }

        if (s === 'request_edit') {
            return [
                { value: 'draft', label: t('recruitment.draft') },
                { value: 'pending_approval', label: t('recruitment.pending_approval') },
                { value: 'request_edit', label: t('recruitment.request_edit') },
                { value: 'closed', label: t('recruitment.closed') }
            ];
        }

        if (s === 'active') {
            return [{ value: 'closed', label: t('recruitment.closed') }];
        }

        if (s === 'closed') {
            return [{ value: 'closed', label: t('recruitment.closed') }];
        }
        if (s === 'rejected') {
            return [{ value: 'rejected', label: t('recruitment.reject') }];
        }
        return [];
    };

    const [submitType, setSubmitType] = useState<'draft' | 'submit'>('draft');

    useEffect(() => {
        if (open) {
            if (initialValues) {
                form.setFieldsValue({
                    ...initialValues,
                    positions: initialValues.jobPositions?.map((jp) => ({
                        title: jp.title,
                        count: jp.count ?? jp.requiredQuantity,
                        department: jp.department || initialValues.department,
                        requirements: jp.requirements
                    })),
                    period:
                        initialValues.startDate && initialValues.endDate
                            ? [dayjs(initialValues.startDate), dayjs(initialValues.endDate)]
                            : undefined
                });
            } else {
                form.resetFields();
            }
        }
    }, [open, initialValues, form]);

    const onFinish = async (values: PlanFormValues) => {
        setIsLoading(true);
        try {
            const planDepartment =
                values.positions?.[0]?.department?.trim() || initialValues?.department?.trim() || 'Engineering';

            const formData = {
                name: values.name,
                batch: values.batch,
                department: planDepartment,
                status: initialValues?.id ? values.status : submitType === 'submit' ? 'pending_approval' : 'draft',
                description: values.description,
                startDate: values.period ? values.period[0].format('YYYY-MM-DD') : '',
                endDate: values.period ? values.period[1].format('YYYY-MM-DD') : '',
                jobPositions: values.positions || []
            };

            if (initialValues?.id) {
                await http.patch(`/recruitment-plans/${initialValues.id}`, formData);
            } else {
                await http.post('/recruitment-plans', formData);
            }

            const finalStatus = formData.status;

            if (!initialValues?.id) {
                if (finalStatus === 'draft') {
                    notify.success('Tạo kế hoạch tuyển dụng thành công (Lưu nháp) - Trạng thái: Nháp');
                } else if (finalStatus === 'pending_approval') {
                    notify.success('Gửi yêu cầu phê duyệt thành công');
                }
            } else {
                if (finalStatus === 'draft') {
                    notify.success('Cập nhật kế hoạch thành công - Trạng thái: Nháp');
                } else if (finalStatus === 'pending_approval') {
                    notify.success('Gửi lại yêu cầu phê duyệt thành công - Trạng thái: Đang chờ phê duyệt');
                } else {
                    notify.success('Cập nhật kế hoạch thành công');
                }
            }

            onSuccess({ status: finalStatus });
        } catch (error) {
            console.error(error);
            notify.error('Có lỗi xảy ra khi lưu kế hoạch. Vui lòng thử lại!');
        } finally {
            setIsLoading(false);
        }
    };

    const getTitle = () => {
        if (viewOnly) return t('common.view');
        return initialValues ? t('common.edit') : t('recruitment.create_new_plan');
    };

    return (
        <Modal
            title={getTitle()}
            open={open}
            onCancel={onCancel}
            // onOk={() => form.submit()}
            confirmLoading={isLoading}
            width={isMobile ? 'calc(100vw - 24px)' : isLaptop ? 700 : 800}
            destroyOnClose
            footer={
                viewOnly
                    ? [
                          <Button key='close' onClick={onCancel}>
                              {t('common.close')}
                          </Button>
                      ]
                    : initialValues?.id
                      ? [
                            // 👉 EDIT MODE
                            <Button key='cancel' onClick={onCancel}>
                                {t('common.cancel')}
                            </Button>,
                            <Button
                                key='save'
                                type='primary'
                                loading={isLoading}
                                onClick={() => {
                                    setSubmitType('draft');
                                    form.submit();
                                }}
                            >
                                {t('common.save')}
                            </Button>
                        ]
                      : [
                            <Button key='cancel' onClick={onCancel}>
                                {t('common.cancel')}
                            </Button>,
                            <Button
                                key='draft'
                                style={{ borderColor: '#f59e0b', color: '#f59e0b' }}
                                loading={isLoading}
                                onClick={() => {
                                    setSubmitType('draft');
                                    form.submit();
                                }}
                            >
                                {t('recruitment.save_draft')}
                            </Button>,
                            <Button
                                key='submit'
                                type='primary'
                                loading={isLoading}
                                onClick={() => {
                                    setSubmitType('submit');
                                    form.submit();
                                }}
                            >
                                {t('recruitment.request_approval')}
                            </Button>
                        ]
            }
        >
            <Form
                form={form}
                layout='vertical'
                onFinish={onFinish}
                disabled={viewOnly}
                initialValues={{
                    status: 'draft',
                    positions: [{ department: 'Engineering' }]
                }}
            >
                <Row gutter={24}>
                    <Col span={24}>
                        <Form.Item
                            label={t('recruitment.campaign_name')}
                            name='name'
                            rules={[{ required: true, message: t('common.required_field') }]}
                        >
                            <Input placeholder={t('recruitment.campaign_name')} size='large' />
                        </Form.Item>

                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label={t('recruitment.batch_name')}
                                    name='batch'
                                    rules={[{ required: true, message: t('common.required_field') }]}
                                >
                                    <Input placeholder={t('recruitment.batch_name')} />
                                </Form.Item>
                            </Col>
                            {initialValues?.id && (
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label={t('common.status')}
                                        name='status'
                                        rules={[{ required: true, message: t('common.required_field') }]}
                                    >
                                        <Select
                                            options={getPlanStatusOptions()}
                                            disabled={
                                                viewOnly ||
                                                ['pending_approval', 'closed'].includes(initialValues?.status || '')
                                            }
                                        />
                                    </Form.Item>
                                </Col>
                            )}
                        </Row>

                        <Form.Item label={t('recruitment.campaign_desc')} name='description'>
                            <Input.TextArea rows={3} placeholder={t('recruitment.campaign_desc')} />
                        </Form.Item>

                        <Divider orientation='left'>{t('recruitment.positions_reqs')}</Divider>

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
                                                <Col xs={24} md={12}>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'title']}
                                                        label={t('recruitment.job_title')}
                                                        rules={[
                                                            { required: true, message: t('common.required_field') }
                                                        ]}
                                                    >
                                                        <Input placeholder='VD: Frontend Developer Intern' />
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={24} md={12}>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'count']}
                                                        label={t('recruitment.quantity')}
                                                        rules={[
                                                            { required: true, message: t('common.required_field') }
                                                        ]}
                                                    >
                                                        <InputNumber
                                                            min={1}
                                                            style={{ width: '100%' }}
                                                            placeholder='5'
                                                            type='number'
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={24} md={12}>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'department']}
                                                        label={t('common.department')}
                                                        rules={[
                                                            { required: true, message: t('common.required_field') }
                                                        ]}
                                                    >
                                                        <DepartmentSelect />
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                            <Row gutter={16}>
                                                <Col span={24}>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'requirements']}
                                                        label={t('recruitment.requirements')}
                                                        rules={[
                                                            { required: true, message: 'Vui lòng nhập yêu cầu chính' }
                                                        ]}
                                                    >
                                                        <Input.TextArea
                                                            rows={2}
                                                            placeholder='VD: ReactJS, TypeScript, 6 tháng kinh nghiệm, có khả năng làm việc nhóm...'
                                                        />
                                                    </Form.Item>
                                                </Col>
                                            </Row>

                                            <Button
                                                type='text'
                                                danger
                                                onClick={() => remove(name)}
                                                style={{ position: 'absolute', top: 8, right: 8 }}
                                            >
                                                {t('common.delete')}
                                            </Button>
                                        </div>
                                    ))}
                                    <Button type='dashed' onClick={() => add()} block icon={<SaveOutlined />}>
                                        {t('recruitment.add_position')}
                                    </Button>
                                </>
                            )}
                        </Form.List>

                        <Divider orientation='left'>{t('recruitment.timeline_status')}</Divider>

                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label={t('recruitment.campaign_period')}
                                    name='period'
                                    rules={[{ required: true, message: t('common.required_field') }]}
                                >
                                    <RangePicker
                                        style={{ width: '100%' }}
                                        placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};
