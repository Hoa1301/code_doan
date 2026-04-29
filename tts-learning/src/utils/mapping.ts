export const ColorMappingStatus = {
    active: 'success',
    inactive: 'error',
    pending: 'warning'
};

export const LabelMappingStatus = {
    active: 'Hoạt động',
    inactive: 'Dừng hoạt động',
    pending: 'Chờ duyệt'
};

export const mapPlanStatusToUI = (status?: string) => {
    const s = String(status || '').toLowerCase();

    switch (s) {
        case 'draft':
            return { label: 'Nháp', color: 'default' };

        case 'pending_approval':
            return { label: 'Đang chờ phê duyệt', color: 'warning' };

        case 'request_edit':
            return { label: 'Yêu cầu chỉnh sửa', color: 'processing' }; 

        case 'active':
            return { label: 'Đang hoạt động', color: 'success' };

        case 'closed':
            return { label: 'Đã đóng', color: 'error' };

        case 'rejected':
            return { label: 'Bị từ chối', color: 'error' };

        default:
            return { label: status || 'N/A', color: 'default' };
    }
};