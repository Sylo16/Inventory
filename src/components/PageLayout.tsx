import { ReactNode } from 'react';
import { useSidebar } from '../contexts/SidebarContext';
import Header from '../layouts/header';
import Sidemenu from '../layouts/sidemenu';

interface PageLayoutProps {
    children: ReactNode;
    className?: string;
}

function PageLayout({ children, className = '' }: PageLayoutProps) {
    const { isSidebarCollapsed } = useSidebar();

    return (
        <>
            <Header />
            <Sidemenu />
            <div className={`main-content app-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''} ${className}`}>
                {children}
            </div>
        </>
    );
}

export default PageLayout;
