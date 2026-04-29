import { Select } from 'antd';
import { useEffect, useState } from 'react';
import { http } from '../../utils/http';

interface Department {
    id: string;
    value: string;
    label: string;
}

interface Props {
    value?: string;
    onChange?: (value: string) => void;
    style?: React.CSSProperties;
    placeholder?: string | 'Chọn';
    isSelectAll?: boolean;
}

export const DepartmentSelect = ({ value, onChange, style, placeholder, isSelectAll }: Props) => {
    const [options, setOptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const res: any = await http.get('/departments');
            const data = res?.data || res;

            let opts = data.map((d: Department) => ({
                value: d.value,
                label: d.label
            }));

            if (isSelectAll) {
                opts = [{ value: 'ALL', label: 'Tất cả' }, ...opts];
            }

            setOptions(opts);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Select
            value={value}
            onChange={onChange}
            options={options}
            loading={loading}
            style={style || { width: '100%' }}
            placeholder={placeholder || 'Chọn phòng ban'}
        />
    );
};
