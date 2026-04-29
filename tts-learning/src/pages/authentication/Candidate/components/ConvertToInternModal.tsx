import { Form, Modal, Select, message } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useResponsive } from '../../../../hooks/useResponsive';
import { convertCandidateToIntern } from '../../../../services/Recruitment/candidates';
import { getUsers, User } from '../../../../services/System/users';
import { notify } from '../../../../utils/notify';

interface ConvertToInternModalProps {
    open: boolean;
    onCancel: () => void;
    onSuccess?: () => void | Promise<void>;
    candidateId: string;
    candidateName: string;
}

type SelectOption = {
    label: string;
    value: string;
};

const mapMentorOptions = (users: User[]): SelectOption[] =>
    users
        .filter((user) => {
            const legacyRole = user.role?.toLowerCase();
            const roleNames = user.roles?.map((role) => role.name?.toLowerCase()) || [];
            return legacyRole === 'mentor' || roleNames.includes('mentor');
        })
        .map((user) => ({
            value: user.id,
            label: user.email ? `${user.fullName} - ${user.email}` : user.fullName
        }));

export const ConvertToInternModal = ({
    open,
    onCancel,
    onSuccess,
    candidateId,
    candidateName
}: ConvertToInternModalProps) => {
    const { t } = useTranslation();
    const { isMobile, isLaptop } = useResponsive();
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingOptions, setIsLoadingOptions] = useState(false);
    const [mentorOptions, setMentorOptions] = useState<SelectOption[]>([]);

    useEffect(() => {
        if (!open) {
            form.resetFields();
            return;
        }

        let isMounted = true;

        const loadOptions = async () => {
            setIsLoadingOptions(true);
            try {
                const usersResult = await getUsers();
                if (!isMounted) return;

                setMentorOptions(mapMentorOptions(usersResult.data || []));
            } catch {
                if (isMounted) {
                    notify.error(t('common.error'));
                }
            } finally {
                if (isMounted) {
                    setIsLoadingOptions(false);
                }
            }
        };

        loadOptions();

        return () => {
            isMounted = false;
        };
    }, [form, open, t]);

    const handleClose = () => {
        form.resetFields();
        onCancel();
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setIsSubmitting(true);

            await convertCandidateToIntern(candidateId, values.mentorId);

            notify.success(t('onboarding.convert_success', { name: candidateName }));
            form.resetFields();
            await onSuccess?.();
            onCancel();
        } catch (error: unknown) {
            const formError = (error as { errorFields?: unknown })?.errorFields;
            if (!formError) {
                const errorMessage = (error as { message?: string })?.message;
                notify.error(errorMessage || t('common.error'));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            title={t('onboarding.convert_to_intern')}
            open={open}
            onOk={handleSubmit}
            onCancel={handleClose}
            okText={t('onboarding.create_intern_profile')}
            cancelText={t('common.cancel')}
            confirmLoading={isSubmitting}
            width={isMobile ? 'calc(100vw - 24px)' : isLaptop ? 540 : 600}
        >
            <Form form={form} layout='vertical'>
                <Form.Item
                    label={t('onboarding.mentor')}
                    name='mentorId'
                    rules={[{ required: true, message: t('onboarding.mentor_required') }]}
                >
                    <Select
                        showSearch
                        loading={isLoadingOptions}
                        placeholder={t('onboarding.select_mentor')}
                        options={mentorOptions}
                        optionFilterProp='label'
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};
