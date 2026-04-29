import { Button, Col, DatePicker, Form, Input, Modal, Row, Select, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { useResponsive } from '../../../../hooks/useResponsive';
import { useCreateIntern, useMentorUpdateIntern, useUpdateIntern } from '../../../../hooks/Internship/useInterns';
import { http } from '../../../../utils/http';
import { DepartmentSelect } from '../../../../components/CommonSelect/DepartmentSelect';
import { notify } from '../../../../utils/notify';

interface InternFormValues {
    userId: string;
    mentorId: string;
    learningPathId?: string;
    track?: string;
    department: string;
    status?: string;
    dates?: [dayjs.Dayjs, dayjs.Dayjs];
}

interface InternModalProps {
    open: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    initialValues?: any;
    viewOnly?: boolean;
    hideLearningPathSelection?: boolean;
    hideTrackField?: boolean;
    mentorScopedEdit?: boolean;
}

interface UserOption {
    id: string;
    fullName: string;
    email?: string;
    role?: string;
}

interface LearningPathOption {
    id: string;
    title: string;
    track: string;
}

export const InternModal = ({
    open,
    onCancel,
    onSuccess,
    initialValues,
    viewOnly,
    hideLearningPathSelection = false,
    hideTrackField = false,
    mentorScopedEdit = false
}: InternModalProps) => {
    const { t } = useTranslation();
    const { isLaptop, isMobile } = useResponsive();
    const [form] = Form.useForm<InternFormValues>();
    const updateMutation = useUpdateIntern();
    const mentorUpdateMutation = useMentorUpdateIntern();
    const createMutation = useCreateIntern();

    const [users, setUsers] = useState<UserOption[]>([]);
    const [learningPaths, setLearningPaths] = useState<LearningPathOption[]>([]);
    const [isBootstrapping, setIsBootstrapping] = useState(false);
    const isMentorScopedEditMode = Boolean(mentorScopedEdit && initialValues?.id && !viewOnly);

    const mentorOptions = useMemo(
        () => users.filter((u) => ['mentor', 'hr', 'director', 'admin'].includes((u.role || '').toLowerCase())),
        [users]
    );

    const internUserOptions = useMemo(() => users, [users]);

    const loadOptions = async () => {
        setIsBootstrapping(true);
        try {
            const usersRes = await http.get<{ hits?: any[]; data?: any[] }>('/users');

            const userSource = (usersRes?.hits || usersRes?.data || []) as any[];
            setUsers(
                userSource
                    .map((u) => ({
                        id: String(u.id || ''),
                        fullName: String(u.fullName || ''),
                        email: u.email ? String(u.email) : undefined,
                        role: u.role ? String(u.role) : undefined
                    }))
                    .filter((u) => u.id && u.fullName)
            );

            if (!hideLearningPathSelection) {
                const learningPathRes = await http.get<{ hits?: any[]; data?: any[] }>('/learning-paths');
                const learningPathSource = (learningPathRes?.hits || learningPathRes?.data || []) as any[];
                setLearningPaths(
                    learningPathSource
                        .map((lp) => ({
                            id: String(lp.id || ''),
                            title: String(lp.title || ''),
                            track: String(lp.track || '')
                        }))
                        .filter((lp) => lp.id && lp.title)
                );
            } else {
                setLearningPaths([]);
            }
        } catch {
            notify.error('Không tải được dữ liệu danh mục cho thực tập sinh');
        } finally {
            setIsBootstrapping(false);
        }
    };

    useEffect(() => {
        if (!open) return;
        loadOptions();
    }, [open, hideLearningPathSelection]);

    useEffect(() => {
        if (!open) return;

        if (initialValues) {
            form.setFieldsValue({
                userId: initialValues.userId,
                mentorId: initialValues.mentorId,
                learningPathId: hideLearningPathSelection
                    ? undefined
                    : initialValues.learningPathId || initialValues.learningPath?.id,
                track: initialValues.track,
                department: initialValues.department,
                status: (initialValues.status || '').toLowerCase(),
                dates:
                    initialValues.startDate && initialValues.endDate
                        ? [dayjs(initialValues.startDate), dayjs(initialValues.endDate)]
                        : undefined
            });
        } else {
            form.resetFields();
            if (hideLearningPathSelection) {
                form.setFieldValue('learningPathId', undefined);
            }
        }
    }, [form, initialValues, open, hideLearningPathSelection]);

    const onLearningPathChange = (learningPathId?: string) => {
        const selected = learningPaths.find((lp) => lp.id === learningPathId);
        form.setFieldValue('track', selected?.track || undefined);
    };

    const onFinish = async (values: InternFormValues) => {
        if (!values.userId || !values.mentorId) {
            notify.warning('Vui lòng chọn đầy đủ thông tin');
            return;
        }
        try {
            const [startDate, endDate] = values.dates || [];
            const startDateValue = startDate?.format('YYYY-MM-DD');
            const endDateValue = endDate?.format('YYYY-MM-DD');
            const selectedLearningPath = learningPaths.find((lp) => lp.id === values.learningPathId);
            const resolvedTrack = values.track || selectedLearningPath?.track || initialValues?.track;

            if (initialValues?.id && isMentorScopedEditMode) {
                await mentorUpdateMutation.mutate({
                    id: initialValues.id,
                    learningPathId: hideLearningPathSelection ? undefined : values.learningPathId,
                    status: values.status,
                    startDate: startDateValue,
                    endDate: endDateValue
                });
            } else {
                const payload: Record<string, unknown> = {
                    userId: values.userId,
                    mentorId: values.mentorId,
                    department: values.department,
                    track: resolvedTrack,
                    startDate: startDateValue,
                    endDate: endDateValue
                };
                if (!hideLearningPathSelection && values.learningPathId) {
                    payload.learningPathId = values.learningPathId;
                }

                if (values.status) {
                    payload.status = values.status;
                }

                if (initialValues?.id) {
                    await updateMutation.mutate({ id: initialValues.id, ...(payload as any) });
                } else {
                    await createMutation.mutate(payload);
                }
            }

            notify.success(
                initialValues ? 'Cập nhật danh sách thực tập sinh thành công' : 'Tạo thực tập sinh thành công'
            );
            onSuccess();
        } catch {
            notify.error('Thao tác thất bại, vui lòng thử lại');
        }
    };

    const getTitle = () => {
        if (viewOnly) return t('common.view');
        return initialValues ? t('common.edit') : t('internship.add_intern');
    };

    return (
        <Modal
            title={getTitle()}
            open={open}
            onCancel={onCancel}
            onOk={() => form.submit()}
            confirmLoading={
                updateMutation.isLoading ||
                mentorUpdateMutation.isLoading ||
                createMutation.isLoading ||
                isBootstrapping
            }
            width={isMobile ? 'calc(100vw - 24px)' : isLaptop ? 620 : 720}
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
                          <Button
                              key='save'
                              type='primary'
                              loading={
                                  updateMutation.isLoading ||
                                  mentorUpdateMutation.isLoading ||
                                  createMutation.isLoading ||
                                  isBootstrapping
                              }
                              onClick={() => form.submit()}
                          >
                              {t('common.save')}
                          </Button>
                      ]
            }
        >
            <Form form={form} layout='vertical' onFinish={onFinish} disabled={viewOnly || isBootstrapping}>
                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label='Tài khoản thực tập sinh'
                            name='userId'
                            rules={[{ required: true, message: t('common.required_field') }]}
                        >
                            <Select
                                showSearch
                                optionFilterProp='label'
                                disabled={isMentorScopedEditMode}
                                placeholder='Chọn tài khoản'
                                options={internUserOptions.map((user) => ({
                                    value: user.id,
                                    label: `${user.fullName}${user.email ? ` - ${user.email}` : ''}`
                                }))}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label={t('internship.mentor')}
                            name='mentorId'
                            rules={[{ required: true, message: t('common.required_field') }]}
                        >
                            <Select
                                showSearch
                                optionFilterProp='label'
                                disabled={isMentorScopedEditMode}
                                placeholder={t('internship.select_mentor')}
                                options={mentorOptions.map((mentor) => ({
                                    value: mentor.id,
                                    label: `${mentor.fullName}${mentor.email ? ` - ${mentor.email}` : ''}`
                                }))}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    {!hideLearningPathSelection && (
                        <Col xs={24} md={hideTrackField ? 24 : 12}>
                            <Form.Item
                                label='Lộ trình đào tạo'
                                name='learningPathId'
                                rules={[{ required: true, message: t('common.required_field') }]}
                            >
                                <Select
                                    showSearch
                                    optionFilterProp='label'
                                    placeholder='Chọn lộ trình'
                                    onChange={onLearningPathChange}
                                    options={learningPaths.map((lp) => ({
                                        value: lp.id,
                                        label: `${lp.title} (${lp.track})`
                                    }))}
                                />
                            </Form.Item>
                        </Col>
                    )}
                    {hideLearningPathSelection ? (
                        <div></div>
                    ) : (
                        <Col xs={24} md={hideLearningPathSelection ? 24 : 12}>
                            <Form.Item
                                label={t('internship.track')}
                                name='track'
                                rules={[{ required: true, message: t('common.required_field') }]}
                            >
                                <Input
                                    disabled={isMentorScopedEditMode}
                                    readOnly={isMentorScopedEditMode || !hideLearningPathSelection}
                                    placeholder={'Track tự động theo lộ trình'}
                                />
                            </Form.Item>
                        </Col>
                    )}
                </Row>

                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label='Phòng ban'
                            name='department'
                            rules={[{ required: true, message: t('common.required_field') }]}
                        >
                            <DepartmentSelect style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item label={t('common.status')} name='status'>
                            <Select
                                options={[
                                    { value: 'active', label: t('internship.active') },
                                    { value: 'completed', label: t('internship.completed') },
                                    { value: 'terminated', label: t('internship.dropped') },
                                    { value: 'on_hold', label: t('internship.on_hold') }
                                ]}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    label={t('internship.internship_period')}
                    name='dates'
                    rules={[{ required: true, message: t('common.required_field') }]}
                >
                    <DatePicker.RangePicker style={{ width: '100%' }} />
                </Form.Item>
            </Form>
        </Modal>
    );
};
