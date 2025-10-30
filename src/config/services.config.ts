import { LucideIcon, Users } from 'lucide-react';

export type ServiceConfig = {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  description?: string;
};

// Define all available services here
export const SERVICES: ServiceConfig[] = [
  {
    id: 'chaperones',
    label: 'Chaperones',
    icon: Users,
    href: '/dashboard/chaperones',
    description: 'Manage chaperone registry',
  },
  // Add more services here as needed
  // Example:
  // {
  //   id: 'interpreters',
  //   label: 'Interpreters',
  //   icon: Languages,
  //   href: '/dashboard/interpreters',
  //   description: 'Manage interpreter registry',
  // },
];

// Helper function to get service by id
export const getServiceById = (id: string): ServiceConfig | undefined => {
  return SERVICES.find(service => service.id === id);
};

// Helper function to check if a path matches a service
export const getServiceByPath = (pathname: string): ServiceConfig | undefined => {
  return SERVICES.find(service => pathname.startsWith(service.href));
};


