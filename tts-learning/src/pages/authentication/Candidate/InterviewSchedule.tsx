import { Layout, Typography, Tabs } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EmailTab } from './components/Tabs/EmailTab';
import { ScheduleTab } from './components/Tabs/ScheduleTab';

const { Title } = Typography;
const { Content } = Layout;

export const InterviewSchedule = () => {
    const { t } = useTranslation();
    const [mainTab, setMainTab] = useState<'schedule' | 'email'>('schedule');

    return (
        <Layout>
            <Title level={2}>{t('interview.schedule_title')}</Title>

            <Tabs
                activeKey={mainTab}
                onChange={(k) => setMainTab(k as any)}
                items={[
                    {
                        key: 'schedule',
                        label: 'Xếp lịch phỏng vấn',
                        children: <ScheduleTab />
                    },
                    {
                        key: 'email',
                        label: 'Email',
                        children: <EmailTab />
                    }
                ]}
            />
        </Layout>
    );
};
