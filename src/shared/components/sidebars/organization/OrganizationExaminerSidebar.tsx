import React from 'react';


interface OrganizationSidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}
  const OrganizationExaminerSidebar = ({ isMobileOpen = false, onMobileClose }: OrganizationSidebarProps) => {

  return (
    <div className="bg-sidebar border-sidebar-border w-64 border-r p-4">
      <h2 className="text-sidebar-foreground mb-4 text-lg font-semibold">Organization</h2>
      <nav className="space-y-2">
        <a
          href="#"
          className="text-sidebar-foreground hover:bg-sidebar-accent block rounded-md px-3 py-2"
        >
          Dashboard
        </a>
        <a
          href="#"
          className="text-sidebar-foreground hover:bg-sidebar-accent block rounded-md px-3 py-2"
        >
          Medical Examiners
        </a>
        <a
          href="#"
          className="text-sidebar-foreground hover:bg-sidebar-accent block rounded-md px-3 py-2"
        >
          Reports
        </a>
        <a
          href="#"
          className="text-sidebar-foreground hover:bg-sidebar-accent block rounded-md px-3 py-2"
        >
          Settings
        </a>
      </nav>
    </div>
  );
};

export default OrganizationExaminerSidebar;
