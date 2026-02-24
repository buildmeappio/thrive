'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/layouts/dashboard';
import { toast } from 'sonner';
import type {
  EmailTemplateDetailDto,
  EmailTemplateVersionDto,
} from '@/domains/emailTemplates/types/emailTemplates';
import updateEmailTemplateAction from '@/domains/emailTemplates/actions/updateEmailTemplate';
import restoreEmailTemplateVersionAction from '@/domains/emailTemplates/actions/restoreEmailTemplateVersion';
import EmailTemplateEditor from '@/components/emailTemplates/EmailTemplateEditor';

type Props = {
  template: EmailTemplateDetailDto;
};

export default function EmailTemplateEditPageContent({ template }: Props) {
  const router = useRouter();
  const editorApiRef = useRef<any>(null);
  const [subject, setSubject] = useState(template.currentVersion?.subject ?? '');
  const [isActive, setIsActive] = useState(template.isActive);
  const [saving, setSaving] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>(template.currentVersion?.bodyHtml ?? '');
  const [latestDesignJson, setLatestDesignJson] = useState<unknown>(
    template.currentVersion?.designJson ?? {}
  );
  const [rightTab, setRightTab] = useState<'preview' | 'variables' | 'versions'>('preview');

  const allowedVarsText = useMemo(() => {
    return template.allowedVariables.map(v => `{{${v.name}}}`).join(', ');
  }, [template.allowedVariables]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const api = editorApiRef.current;

      const [html, designJson] = await new Promise<[string, unknown]>((resolve, reject) => {
        if (!api?.exportHtml || !api?.saveDesign) {
          // If editor isn't ready, still allow saving using existing preview HTML and empty design.
          resolve([previewHtml, latestDesignJson ?? {}]);
          return;
        }
        let gotHtml: any = null;
        let gotDesign: any = null;
        const maybeDone = () => {
          if (gotHtml !== null && gotDesign !== null) {
            resolve([String(gotHtml), gotDesign]);
          }
        };
        try {
          api.exportHtml((data: any) => {
            gotHtml = data?.html ?? '';
            maybeDone();
          });
          api.saveDesign((design: any) => {
            gotDesign = design ?? {};
            maybeDone();
          });
        } catch (e) {
          reject(e);
        }
      });

      await updateEmailTemplateAction({
        id: template.id,
        subject,
        bodyHtml: html,
        designJson,
        isActive,
      });
      toast.success('Template saved.');
      setPreviewHtml(html);
      setLatestDesignJson(designJson);
      router.refresh();
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to save template.');
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = async (v: EmailTemplateVersionDto) => {
    try {
      await restoreEmailTemplateVersionAction({
        templateId: template.id,
        versionId: v.id,
        isActive,
      });
      toast.success(`Restored version v${v.version}.`);
      router.refresh();
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to restore version.');
    }
  };

  const copyVariable = async (name: string) => {
    const text = `{{${name}}}`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`Copied ${text}`);
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <DashboardShell>
      {/* Editor-style toolbar */}
      <div className="dashboard-zoom-mobile sticky top-0 z-10 -mx-2 border-b border-gray-100 bg-gray-50/80 px-2 py-3 backdrop-blur sm:-mx-4 sm:px-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="font-mono text-xs text-gray-500">{template.key}</div>
              <h1 className="font-degular break-words text-[18px] font-semibold leading-tight text-[#000000] sm:text-[22px] lg:text-[26px]">
                {template.name}
              </h1>
              <div className="mt-1 line-clamp-1 text-xs text-gray-500">
                Allowed variables: {allowedVarsText || 'None'}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                />
                Active
              </label>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                type="button"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-3">
            <label className="text-xs font-medium text-gray-700">Subject</label>
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="font-poppins mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00A8FF]"
              placeholder="Email subject"
            />
          </div>
        </div>
      </div>

      {/* Workspace: Builder + Right panel */}
      <div className="dashboard-zoom-mobile mt-4 grid grid-cols-1 gap-4 2xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="min-w-0">
          <EmailTemplateEditor
            allowedVariables={template.allowedVariables}
            initialDesignJson={template.currentVersion?.designJson ?? {}}
            minHeight={950}
            className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
            onEditorReady={api => {
              editorApiRef.current = api;
            }}
            onLiveUpdate={({ html, designJson }) => {
              if (html) setPreviewHtml(html);
              setLatestDesignJson(designJson);
            }}
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="flex items-center gap-1 border-b border-gray-100 p-2">
            <button
              type="button"
              onClick={() => setRightTab('preview')}
              className={
                rightTab === 'preview'
                  ? 'rounded-xl bg-gray-900 px-3 py-2 text-sm font-medium text-white'
                  : 'rounded-xl bg-gray-100 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200'
              }
            >
              Preview
            </button>
            <button
              type="button"
              onClick={() => setRightTab('variables')}
              className={
                rightTab === 'variables'
                  ? 'rounded-xl bg-gray-900 px-3 py-2 text-sm font-medium text-white'
                  : 'rounded-xl bg-gray-100 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200'
              }
            >
              Variables
            </button>
            <button
              type="button"
              onClick={() => setRightTab('versions')}
              className={
                rightTab === 'versions'
                  ? 'rounded-xl bg-gray-900 px-3 py-2 text-sm font-medium text-white'
                  : 'rounded-xl bg-gray-100 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200'
              }
            >
              Versions
            </button>
          </div>

          {rightTab === 'preview' ? (
            <div className="p-3">
              <div className="mb-2 text-xs text-gray-500">Live preview (auto-updates)</div>
              <iframe
                title="Email preview"
                className="h-[950px] w-full rounded-xl border border-gray-200"
                sandbox=""
                srcDoc={previewHtml}
              />
            </div>
          ) : null}

          {rightTab === 'variables' ? (
            <div className="max-h-[980px] overflow-auto p-3">
              <div className="mb-3 text-xs text-gray-500">
                Click “Copy” and paste into the editor (or use Unlayer Merge Tags).
              </div>
              <div className="flex flex-col gap-2">
                {template.allowedVariables.map(v => (
                  <div
                    key={v.name}
                    className="flex items-start justify-between gap-3 rounded-xl border border-gray-100 p-3"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-gray-900">{v.label ?? v.name}</div>
                      <div className="font-mono text-xs text-gray-700">
                        {'{{'}
                        {v.name}
                        {'}}'}
                      </div>
                      {v.description ? (
                        <div className="mt-1 text-xs text-gray-500">{v.description}</div>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => copyVariable(v.name)}
                      className="shrink-0 rounded-full bg-gray-100 px-3 py-2 text-xs font-medium text-gray-800 hover:bg-gray-200"
                    >
                      Copy
                    </button>
                  </div>
                ))}
                {template.allowedVariables.length === 0 ? (
                  <div className="text-sm text-gray-500">No variables.</div>
                ) : null}
              </div>
            </div>
          ) : null}

          {rightTab === 'versions' ? (
            <div className="max-h-[980px] overflow-auto p-3">
              <div className="mb-3 text-xs text-gray-500">
                Restore creates a new version and sets it as current.
              </div>
              <div className="flex flex-col gap-2">
                {template.versions.map(v => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 p-3"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-gray-900">v{v.version}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(v.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRestore(v)}
                      className="shrink-0 rounded-full bg-gray-100 px-3 py-2 text-xs font-medium text-gray-800 hover:bg-gray-200"
                    >
                      Restore
                    </button>
                  </div>
                ))}
                {template.versions.length === 0 ? (
                  <div className="text-sm text-gray-500">No versions.</div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </DashboardShell>
  );
}
