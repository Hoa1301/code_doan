import { useState, useEffect } from 'react';
import { Layout } from 'antd';
import { HeaderDashboard } from './components/HeaderDashboard';
import { NavbarDashboard } from './components/NavbarDashboard';
import { Outlet } from 'react-router-dom';
import { useResponsive } from '../../hooks/useResponsive';

const { Content } = Layout;

export const DashboardLayout = () => {
    const { isMobile, isLaptop } = useResponsive();
    const sidebarExpandedWidth = isLaptop ? 240 : 260;
    const sidebarCollapsedWidth = isLaptop ? 72 : 80;
    const [collapsed, setCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const sidebarWidth = isMobile ? 0 : collapsed ? sidebarCollapsedWidth : sidebarExpandedWidth;

    // Offset all Ant Design modals so they center over the content area, not the full viewport
    useEffect(() => {
        const style = document.createElement('style');
        style.id = 'modal-sidebar-offset';
        document.head.appendChild(style);
        return () => {
            document.getElementById('modal-sidebar-offset')?.remove();
        };
    }, []);

    useEffect(() => {
        const el = document.getElementById('modal-sidebar-offset') as HTMLStyleElement | null;
        if (el) {
            el.textContent = `
                .ant-modal-root .ant-modal-wrap,
                .ant-modal-root .ant-modal-mask {
                    left: ${sidebarWidth}px !important;
                }
            `;
        }
    }, [sidebarWidth]);

    const toggleCollapsed = () => {
        if (isMobile) {
            setMobileMenuOpen((prev) => !prev);
            return;
        }
        setCollapsed((prev) => !prev);
    };

    return (
        <Layout style={{ background: '#fff' }}>
            <Layout
                style={{
                    marginLeft: isMobile ? 0 : collapsed ? sidebarCollapsedWidth : sidebarExpandedWidth,
                    minHeight: '100vh',
                    transition: 'all 0.2s',
                    background: '#F8FAFC'
                }}
            >
                <HeaderDashboard
                    collapsed={collapsed}
                    toggleCollapsed={toggleCollapsed}
                    isMobile={isMobile}
                    isLaptop={isLaptop}
                />
                <Content
                    style={{
                        margin: isMobile ? '12px 8px' : '24px 16px',
                        padding: isMobile ? 12 : isLaptop ? 18 : 24,
                        background: '#ffffff',
                        borderRadius: '8px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
            <NavbarDashboard
                collapsed={collapsed}
                isMobile={isMobile}
                isLaptop={isLaptop}
                mobileOpen={mobileMenuOpen}
                onMobileClose={() => setMobileMenuOpen(false)}
            />
        </Layout>
    );
};
