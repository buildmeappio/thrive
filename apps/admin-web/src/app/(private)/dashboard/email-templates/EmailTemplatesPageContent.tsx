'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/layouts/dashboard';
import type { EmailTemplateListItem } from '@/domains/emailTemplates/types/emailTemplates';

type Props = {
  templates: EmailTemplateListItem[];
};

export default function EmailTemplatesPageContent({ templates }: Props) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return templates;
    return templates.filter(t =>
      [t.name, t.key, t.description ?? ''].some(v => String(v).toLowerCase().includes(q))
    );
  }, [query, templates]);

  return (
    <DashboardShell>
      <div className="dashboard-zoom-mobile mb-4 flex items-center justify-between sm:mb-6">
        <h1 className="font-degular break-words text-[20px] font-semibold leading-tight text-[#000000] sm:text-[28px] lg:text-[36px]">
          Email Templates
        </h1>
      </div>

      <div className="dashboard-zoom-mobile flex flex-col gap-4">
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="w-full flex-1 sm:max-w-md">
            <input
              type="text"
              placeholder="Search by name or key"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="font-poppins w-full rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00A8FF]"
            />
          </div>
        </div>

        <div className="w-full overflow-x-auto rounded-[28px] bg-white px-4 py-4 shadow-sm">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-500">
                <th className="px-3 py-3">Name</th>
                <th className="px-3 py-3">Key</th>
                <th className="px-3 py-3">Active</th>
                <th className="px-3 py-3">Updated</th>
                <th className="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} className="border-t border-gray-100">
                  <td className="px-3 py-3">
                    <div className="font-medium text-gray-900">{t.name}</div>
                    {t.description ? (
                      <div className="mt-1 text-xs text-gray-500">{t.description}</div>
                    ) : null}
                  </td>
                  <td className="px-3 py-3 font-mono text-sm text-gray-700">{t.key}</td>
                  <td className="px-3 py-3">
                    <span
                      className={
                        t.isActive
                          ? 'inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700'
                          : 'inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700'
                      }
                    >
                      {t.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-700">
                    {new Date(t.updatedAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <Link
                      href={`/dashboard/email-templates/${t.id}`}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td className="px-3 py-10 text-center text-sm text-gray-500" colSpan={5}>
                    No templates found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}
