import { Button, Col, Form, Input, InputNumber, Row, Select, message, Modal, DatePicker } from 'antd';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { JobPosition } from '../../../../services/Recruitment/jobPositions';
import { useResponsive } from '../../../../hooks/useResponsive';
import { notify } from '../../../../utils/notify';
import dayjs from 'dayjs';
import { DepartmentSelect } from '../../../../components/CommonSelect/DepartmentSelect';

interface CampaignOption {
    value: string;
    label: string;
    department?: string;
}

interface RecruitmentJobModalProps {
    open: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    onSubmit: (values: JobFormValues) => Promise<void>;
    campaignOptions: CampaignOption[];
    initialValues?: JobPosition | null;
    viewOnly?: boolean;
}

export interface JobFormValues {
    title: string;
    campaignId: string;
    department: string;
    requiredQuantity: number;
    status: 'draft' | 'open' | 'closed' | 'on_hold';
    description?: string;
    requirements?: string;
    location?: string;
    salaryRange?: string;
    deadline?: dayjs.Dayjs;
}

const normalizeStatus = (status?: string): JobFormValues['status'] => {
    const normalized = (status || 'draft').toLowerCase().replace(/\s+/g, '_');
    if (normalized === 'open') return 'open';
    if (normalized === 'closed') return 'closed';
    if (normalized === 'on_hold') return 'on_hold';
    return 'draft';
};

export const RecruitmentJobModal = ({
    open,
    onCancel,
    onSuccess,
    onSubmit,
    campaignOptions,
    initialValues,
    viewOnly
}: RecruitmentJobModalProps) => {
    const { t } = useTranslation();
    const { isMobile, isLaptop } = useResponsive();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const normalizedCampaignOptions = [...campaignOptions];

    if (
        initialValues?.recruitmentPlanId &&
        !normalizedCampaignOptions.some((option) => option.value === initialValues.recruitmentPlanId)
    ) {
        normalizedCampaignOptions.push({
            value: initialValues.recruitmentPlanId,
            label: initialValues.recruitmentPlan?.title || initialValues.recruitmentPlanId,
            department: initialValues.department
        });
    }

    useEffect(() => {
        if (open) {
            let salaryFrom, salaryTo, salaryCurrency;

            if (initialValues?.salaryRange) {
                const match = initialValues.salaryRange.match(/(\d+)\s*-\s*(\d+)\s*(\w+)/);
                if (match) {
                    salaryFrom = Number(match[1]);
                    salaryTo = Number(match[2]);
                    salaryCurrency = match[3];
                }
            }
            if (initialValues) {
                form.setFieldsValue({
                    title: initialValues.title,
                    campaignId: initialValues.recruitmentPlanId,
                    department: initialValues.department,
                    requiredQuantity: initialValues.requiredQuantity,
                    status: normalizeStatus(initialValues.status),
                    description: initialValues.description,
                    requirements: initialValues.requirements,
                    location: initialValues.location,
                    deadline: initialValues?.deadline ? dayjs(initialValues.deadline) : undefined,
                    salaryFrom,
                    salaryTo,
                    salaryCurrency: salaryCurrency || 'VND'
                });
            } else {
                form.resetFields();
                const defaultCampaign = campaignOptions[0];
                form.setFieldsValue({
                    campaignId: defaultCampaign?.value,
                    department: defaultCampaign?.department || 'Engineering',
                    status: 'draft'
                });
            }
        }
    }, [open, initialValues, form, campaignOptions]);

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const { salaryFrom, salaryTo, salaryCurrency, ...rest } = values;

            const salaryRange = salaryFrom && salaryTo ? `${salaryFrom} - ${salaryTo} ${salaryCurrency}` : undefined;

            await onSubmit({
                ...rest,
                salaryRange,
                deadline: values.deadline ? values.deadline.format('YYYY-MM-DD') : undefined
            });

            notify.success(t('common.success'));
            onSuccess();
        } catch {
            notify.error(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    const getTitle = () => {
        if (viewOnly) return t('common.view');
        return initialValues ? t('common.edit') : t('recruitment.create_job_post');
    };

    const handleCampaignChange = (campaignId: string) => {
        const selectedCampaign = normalizedCampaignOptions.find((option) => option.value === campaignId);

        if (selectedCampaign?.department) {
            form.setFieldValue('department', selectedCampaign.department);
        }
    };

    return (
        <Modal
            title={getTitle()}
            open={open}
            onCancel={onCancel}
            onOk={() => form.submit()}
            confirmLoading={loading}
            width={isMobile ? 'calc(100vw - 24px)' : isLaptop ? 620 : 700}
            destroyOnClose
            footer={
                viewOnly
                    ? [
                          <Button key='close' onClick={onCancel}>
                              {t('common.close')}
                          </Button>
                      ]
                    : [
                          <Button key='cancel' onClick={onCancel}>
                              {t('common.cancel')}
                          </Button>,
                          <Button key='save' type='primary' loading={loading} onClick={() => form.submit()}>
                              {t('common.save')}
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
                }}
            >
                <Form.Item
                    label={t('recruitment.job_title')}
                    name='title'
                    rules={[{ required: true, message: t('common.required_field') }]}
                >
                    <Input placeholder={t('recruitment.job_title')} size='large' />
                </Form.Item>

                <Form.Item
                    label={t('recruitment.campaign_name')}
                    name='campaignId'
                    rules={[{ required: true, message: t('common.required_field') }]}
                >
                    <Select
                        placeholder={t('recruitment.campaign_name')}
                        options={normalizedCampaignOptions}
                        onChange={handleCampaignChange}
                    />
                </Form.Item>

                <Row gutter={16}>
                    <Col xs={24}>
                        <Form.Item
                            label={t('common.department')}
                            name='department'
                            rules={[{ required: true, message: t('common.required_field') }]}
                        >
                            <DepartmentSelect />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    label={t('recruitment.quantity')}
                    name='requiredQuantity'
                    rules={[{ required: true, message: t('common.required_field') }]}
                >
                    <InputNumber min={1} style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item label={t('common.status')} name='status'>
                    <Select
                        options={[
                            { value: 'draft', label: t('recruitment.draft') },
                            { value: 'open', label: t('common.open') },
                            { value: 'on_hold', label: t('recruitment.on_hold') },
                            { value: 'closed', label: t('common.closed') }
                        ]}
                    />
                </Form.Item>

                <Form.Item label={t('recruitment.campaign_desc')} name='description'>
                    <Input.TextArea rows={3} placeholder={t('recruitment.campaign_desc')} />
                </Form.Item>

                <Form.Item label={t('recruitment.requirements')} name='requirements'>
                    <Input.TextArea rows={3} placeholder={t('recruitment.requirements')} />
                </Form.Item>

                <Form.Item label='Deadline' name='deadline'>
                    <DatePicker style={{ width: '100%' }} format='DD/MM/YYYY' />
                </Form.Item>

                <Form.Item label={t('recruitment.location')} name='location'>
                    <Input placeholder='Hà Nội / TP.HCM / Remote' />
                </Form.Item>

                <Row gutter={12}>
                    <Col span={10}>
                        <Form.Item label={t('recruitment.salary')} name='salaryFrom'>
                            <InputNumber style={{ width: '100%' }} type='number' min={0} placeholder='Từ' />
                        </Form.Item>
                    </Col>

                    <Col span={10}>
                        <Form.Item label={t('recruitment.salary')} name='salaryTo'>
                            <InputNumber style={{ width: '100%' }} type='number' min={0} placeholder='Đến' />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item label=' ' name='salaryCurrency' initialValue='VND'>
                            <Select
                                options={[
                                    { value: 'VND', label: 'VND' },
                                    { value: 'USD', label: 'USD' }
                                ]}
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};
