import { App } from 'antd';
import {
    CheckCircleFilled,
    CloseCircleFilled,
    CloseCircleOutlined,
    CloseOutlined,
    InfoCircleFilled,
    WarningFilled
} from '@ant-design/icons';

type AppInstance = ReturnType<typeof App.useApp>;

let messageApi: AppInstance['message'] | null = null;
let notificationApi: AppInstance['notification'] | null = null;

export const setMessageInstance = (instance: AppInstance) => {
    messageApi = instance.message;
    notificationApi = instance.notification;
};

type NotifyContent =
    | string
    | {
          content: string;
          key?: string;
          duration?: number;
      };

const resolveArgs = (input: NotifyContent) => {
    if (typeof input === 'string') {
        return { content: input };
    }
    return input;
};

const iconMap = {
    success: <CheckCircleFilled style={{ color: '#22c55e', fontSize: 22 }} />,
    error: <CloseCircleFilled style={{ color: '#ef4444', fontSize: 22 }} />,
    warning: <WarningFilled style={{ color: '#f59e0b', fontSize: 22 }} />,
    info: <InfoCircleFilled style={{ color: '#3b82f6', fontSize: 22 }} />
};

const openNotification = (type: 'success' | 'error' | 'warning' | 'info', input: NotifyContent) => {
    if (!notificationApi) {
        console.warn('[notify] notificationApi chưa được init');
        return;
    }

    const args = resolveArgs(input);

    notificationApi.open({
        message: null,
        description: (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {iconMap[type]}
                <span style={{ fontSize: 16, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap' }}>
                    {args.content}
                </span>
                <CloseOutlined
                    style={{ color: '#fff', fontSize: 18, cursor: 'pointer' }}
                    onClick={() => notificationApi.destroy(args.key)}
                />
            </div>
        ),
        key: args.key,
        duration: args.duration ?? 3,
        placement: 'topRight',
        className: `custom-notify custom-notify-${type}`
    });
};

export const notify = {
    success: (input: NotifyContent) => openNotification('success', input),
    error: (input: NotifyContent) => openNotification('error', input),
    warning: (input: NotifyContent) => openNotification('warning', input),
    info: (input: NotifyContent) => openNotification('info', input),

    loading: (input: NotifyContent) => {
        if (!notificationApi) return;
        const args = resolveArgs(input);

        notificationApi.open({
            message: null,
            description: (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <InfoCircleFilled style={{ color: '#3b82f6', fontSize: 22 }} />
                    <span style={{ fontSize: 15, fontWeight: 500, color: '#fff' }}>{args.content}</span>
                </div>
            ),
            key: args.key,
            duration: 0,
            placement: 'topRight',
            className: 'custom-notify custom-notify-info'
        });
    },

    destroy: (key?: string) => {
        if (!notificationApi) return;
        if (key) {
            notificationApi.destroy(key);
        } else {
            notificationApi.destroy();
        }
    }
};
