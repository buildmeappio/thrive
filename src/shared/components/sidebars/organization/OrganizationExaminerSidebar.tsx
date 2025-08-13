import React from 'react'

const OrganizationExaminerSidebar = () => {
  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border p-4">
      <h2 className="text-lg font-semibold text-sidebar-foreground mb-4">Organization</h2>
      <nav className="space-y-2">
        <a href="#" className="block px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent">
          Dashboard
        </a>
        <a href="#" className="block px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent">
          Medical Examiners
        </a>
        <a href="#" className="block px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent">
          Reports
        </a>
        <a href="#" className="block px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent">
          Settings
        </a>
      </nav>
    </div>
  )
}

export default OrganizationExaminerSidebar