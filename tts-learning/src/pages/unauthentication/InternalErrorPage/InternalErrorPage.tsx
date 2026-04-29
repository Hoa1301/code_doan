import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

export const InternalErrorPage = () => {
    const navigate = useNavigate();

    return (
        <Result
            status='500'
            title='500'
            subTitle='Xin lỗi, có lỗi xảy ra trong quá trình xử lý yêu cầu của bạn.'
            extra={
                <Button type='primary' onClick={() => navigate('/')}>
                    Quay về trang chủ
                </Button>
            }
        />
    );
};
