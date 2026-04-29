import { TranslationOutlined } from '@ant-design/icons';
import { Button, Dropdown, MenuProps, Space } from 'antd';
import { useTranslation } from 'react-i18next';

export const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const items: MenuProps['items'] = [
        {
            key: 'en',
            label: 'English',
            disabled: i18n.language === 'en',
        },
        {
            key: 'vi',
            label: 'Tiếng Việt',
            disabled: i18n.language === 'vi',
        },
    ];

    const handleMenuClick: MenuProps['onClick'] = (e) => {
        i18n.changeLanguage(e.key);
    };

    return (
        <Dropdown menu={{ items, onClick: handleMenuClick }} placement="bottomRight" trigger={['click']}>
            <Button type="text" icon={<TranslationOutlined />}>
                <Space>
                    {i18n.language === 'vi' ? 'Tiếng Việt' : 'English'}
                </Space>
            </Button>
        </Dropdown>
    );
};
