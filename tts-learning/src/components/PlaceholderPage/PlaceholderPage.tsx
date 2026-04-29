import { Card, Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';
import { ResultStatusType } from 'antd/es/result';

interface PlaceholderPageProps {
    title: string;
    subTitle?: string;
    status?: ResultStatusType;
}

export const PlaceholderPage = ({ title, subTitle, status = 'info' }: PlaceholderPageProps) => {
    const navigate = useNavigate();

    return (
        <Card title={title} bordered={false} style={{ margin: '24px', borderRadius: '16px', minHeight: '80vh' }}>
            <Result
                status={status}
                title={`Màn hình: ${title}`}
                subTitle={subTitle || 'Tính năng này đang được phát triển. Vui lòng quay lại sau.'}
                extra={[
                    <Button type='primary' key='home' icon={<HomeOutlined />} onClick={() => navigate('/')}>
                        Về trang chủ
                    </Button>
                ]}
            />
        </Card>
    );
};
