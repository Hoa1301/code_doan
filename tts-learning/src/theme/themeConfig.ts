import type { ThemeConfig } from 'antd';

// Design System Colors
// Primary:   #1E40AF (Trust Blue)
// Secondary: #0D9488 (Teal - Training)
// Warning:   #F59E0B (Amber - Pending)
// Success:   #10B981 (Green)
// Error:     #EF4444 (Red)
// BgLayout:  #F8FAFC
// TextMain:  #1E293B
// Border:    #E2E8F0

export const themeConfig: ThemeConfig = {
    token: {
        colorPrimary: '#1E40AF',
        colorInfo: '#1E40AF',
        colorSuccess: '#10B981',
        colorWarning: '#F59E0B',
        colorError: '#EF4444',
        colorTextBase: '#1E293B',
        colorBgBase: '#ffffff',
        colorBorder: '#E2E8F0',
        colorBorderSecondary: '#E2E8F0',
        colorBgContainer: '#ffffff',
        colorBgLayout: '#F8FAFC',
        borderRadius: 8,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.04)'
    },
    components: {
        Button: {
            controlHeight: 40,
            boxShadow: 'none',
            primaryShadow: '0 4px 14px 0 rgba(30, 64, 175, 0.3)'
        },
        Input: {
            controlHeight: 42,
            activeShadow: '0 0 0 2px rgba(30, 64, 175, 0.1)'
        },
        Card: {
            borderRadiusLG: 16,
            boxShadowTertiary: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
            colorBorderSecondary: '#E2E8F0'
        },
        Menu: {
            itemBorderRadius: 8,
            itemHeight: 45,
            itemMarginInline: 12,
            itemSelectedBg: 'rgba(30, 64, 175, 0.08)',
            itemSelectedColor: '#1E40AF',
            itemHoverBg: 'rgba(30, 64, 175, 0.05)',
            itemHoverColor: '#1E40AF'
        },
        Table: {
            headerBg: '#F8FAFC',
            headerColor: '#1E293B',
            headerSplitColor: '#E2E8F0',
            rowHoverBg: 'rgba(30, 64, 175, 0.04)',
            borderColor: '#E2E8F0'
        },
        Layout: {
            bodyBg: '#F8FAFC',
            siderBg: '#ffffff',
            headerBg: 'rgba(255, 255, 255, 0.85)'
        },
        Tag: {
            colorSuccessBg: '#ECFDF5',
            colorSuccessBorder: '#10B981',
            colorWarningBg: '#FFFBEB',
            colorWarningBorder: '#F59E0B',
            colorErrorBg: '#FEF2F2',
            colorErrorBorder: '#EF4444'
        },
        Badge: {
            colorBgContainer: '#EF4444'
        },
        Progress: {
            defaultColor: '#1E40AF'
        },
        Steps: {
            colorPrimary: '#1E40AF',
            colorTextDescription: '#64748B'
        },
        Divider: {
            colorSplit: '#E2E8F0'
        },
        Select: {
            optionSelectedBg: 'rgba(30, 64, 175, 0.08)',
            optionSelectedColor: '#1E40AF'
        }
    }
};
