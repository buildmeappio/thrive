import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
export const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const buildCentralDomainURL = (path: string) => {
  let p = path;
  if (path.startsWith('/')) {
    p = path.slice(1);
  }

  if (process.env.NODE_ENV === 'development') {
    return `http://localhost:3003/${p}`;
  }
  return `${protocol}://central.${rootDomain}/${p}`;
};

export const buildAdminDomainURL = (subdomain: string, path: string) => {
  let p = path;
  if (path.startsWith('/')) {
    p = path.slice(1);
  }
  return `${protocol}://${rootDomain}/s/${subdomain}/${p}`;
};

export const buildTenantHostURL = (subdomain: string, path: string) => {
  let p = path;
  if (path.startsWith('/')) {
    p = path.slice(1);
  }
  return `${protocol}://${subdomain}.${rootDomain}/${p}`;
};
