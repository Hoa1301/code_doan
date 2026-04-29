export const getErrorMessage = (err: any) => {
    const data = err;
    console.log(data);

    if (!data) return err?.message || 'Lỗi hệ thống';

    if (data.stack) {
        const match = data.stack.match(/BadRequestException:\s(.+)/);
        if (match) return match[1];
    }

    return data.message || 'Lỗi hệ thống';
};
