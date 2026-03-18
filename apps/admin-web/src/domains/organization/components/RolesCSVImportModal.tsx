'use client';

import { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle, AlertCircle, Loader2, Download } from 'lucide-react';
import { toast } from 'sonner';
import roleActions from '../actions/roleActions';
import { useRouter } from 'next/navigation';
import { downloadCSV } from '@/utils/csv';

interface RolesCSVImportModalProps {
  open: boolean;
  onClose: () => void;
  organizationId: string;
  onSubmit: () => void;
}

interface ImportResult {
  row: number;
  name: string;
  status: 'created' | 'updated' | 'error' | 'skipped';
  roleId?: string;
  error?: string;
}

const RolesCSVImportModal: React.FC<RolesCSVImportModalProps> = ({
  open,
  onClose,
  organizationId,
  onSubmit,
}) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<{
    totalRows: number;
    created: number;
    updated: number;
    skipped: number;
    results: ImportResult[];
    errors: ImportResult[];
  } | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast.error('Please select a CSV file');
        return;
      }
      setFile(selectedFile);
      setImportResults(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setImportResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a CSV file');
      return;
    }

    setIsImporting(true);
    try {
      const text = await file.text();
      const result = await roleActions.importRolesFromCSV({
        organizationId,
        csvText: text,
      });

      setImportResults({
        totalRows: result.totalRows,
        created: result.created,
        updated: result.updated,
        skipped: result.skipped,
        results: result.results,
        errors: result.errors,
      });

      if (result.success) {
        toast.success(
          `Successfully imported ${result.created} new role(s) and updated ${result.updated} existing role(s)`
        );
        setTimeout(() => {
          onClose();
          onSubmit();
          router.refresh();
        }, 2000);
      } else {
        if (result.created > 0 || result.updated > 0) {
          toast.warning(
            `Imported ${result.created} new role(s) and updated ${result.updated} existing role(s), but ${result.errors.length} failed. Check the details below.`
          );
        } else {
          toast.error(`Failed to import roles. Check the errors below.`);
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to import roles');
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    if (!isImporting) {
      setFile(null);
      setImportResults(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onClose();
    }
  };

  const handleDownloadTemplate = () => {
    const headers = ['name', 'description'];
    const csvContent = headers.join(',') + '\n';
    downloadCSV(csvContent, 'roles-import-template.csv');
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={e => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-5 shadow-lg sm:p-8"
        onMouseDown={e => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-degular text-xl font-semibold sm:text-2xl">Import Roles from CSV</h2>
          <button
            onClick={handleClose}
            className="rounded-full p-2 transition-colors hover:bg-gray-100"
            disabled={isImporting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* File Upload Section */}
          {!importResults && (
            <div className="space-y-4">
              <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
                {file ? (
                  <div className="space-y-2">
                    <FileText className="mx-auto h-12 w-12 text-[#000093]" />
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                    <button
                      onClick={handleRemoveFile}
                      className="mt-2 rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      <X className="mr-2 inline h-4 w-4" />
                      Remove File
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div>
                      <label
                        htmlFor="csv-file"
                        className="inline-flex cursor-pointer items-center rounded-lg bg-[#000093] px-4 py-2 text-white transition-colors hover:bg-[#000080]"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Select CSV File
                      </label>
                      <input
                        ref={fileInputRef}
                        id="csv-file"
                        type="file"
                        accept=".csv,text/csv"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      CSV file with role data (name, description)
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="mb-1 text-sm font-semibold">Need a template?</h4>
                    <p className="text-xs text-gray-600">
                      Download our CSV template with the correct format
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadTemplate}
                    className="flex items-center gap-2 rounded-lg border border-[#000093] bg-white px-4 py-2 text-sm text-[#000093] hover:bg-[#E0E0FF]"
                  >
                    <Download className="h-4 w-4" />
                    Download Template
                  </button>
                </div>
                <div className="mt-4 border-t border-blue-300 pt-4">
                  <p className="text-xs text-gray-600">
                    <strong>Required:</strong> name
                    <br />
                    <strong>Optional:</strong> description
                    <br />
                    <strong>Note:</strong> Roles with the same name will be updated instead of
                    creating duplicates. SUPER_ADMIN role cannot be imported.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Import Results Section */}
          {importResults && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="rounded-lg bg-gray-50 p-4 text-center">
                  <p className="text-2xl font-bold text-gray-700">{importResults.totalRows}</p>
                  <p className="mt-1 text-xs text-gray-500">Total Rows</p>
                </div>
                <div className="rounded-lg bg-green-50 p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {importResults.created + importResults.updated}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">Processed</p>
                </div>
                <div className="rounded-lg bg-yellow-50 p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-600">{importResults.skipped}</p>
                  <p className="mt-1 text-xs text-gray-500">Skipped</p>
                </div>
                <div className="rounded-lg bg-red-50 p-4 text-center">
                  <p className="text-2xl font-bold text-red-600">{importResults.errors.length}</p>
                  <p className="mt-1 text-xs text-gray-500">Failed</p>
                </div>
              </div>

              {importResults.errors.length > 0 && (
                <div className="max-h-60 overflow-y-auto rounded-lg border border-red-200 p-4">
                  <h4 className="mb-2 flex items-center text-sm font-semibold text-red-600">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Errors ({importResults.errors.length})
                  </h4>
                  <div className="space-y-2">
                    {importResults.errors.slice(0, 10).map((error, index) => (
                      <div key={index} className="rounded bg-red-50 p-2 text-xs">
                        <span className="font-medium">Row {error.row}:</span> {error.name} -{' '}
                        {error.error}
                      </div>
                    ))}
                    {importResults.errors.length > 10 && (
                      <p className="text-xs text-gray-500">
                        ... and {importResults.errors.length - 10} more errors
                      </p>
                    )}
                  </div>
                </div>
              )}

              {importResults.skipped > 0 && (
                <div className="max-h-60 overflow-y-auto rounded-lg border border-yellow-200 p-4">
                  <h4 className="mb-2 flex items-center text-sm font-semibold text-yellow-600">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Skipped ({importResults.skipped})
                  </h4>
                  <div className="space-y-2">
                    {importResults.results
                      .filter(r => r.status === 'skipped')
                      .slice(0, 10)
                      .map((result, index) => (
                        <div key={index} className="rounded bg-yellow-50 p-2 text-xs">
                          <span className="font-medium">Row {result.row}:</span> {result.name} -{' '}
                          {result.error}
                        </div>
                      ))}
                    {importResults.results.filter(r => r.status === 'skipped').length > 10 && (
                      <p className="text-xs text-gray-500">
                        ... and{' '}
                        {importResults.results.filter(r => r.status === 'skipped').length - 10} more
                        skipped
                      </p>
                    )}
                  </div>
                </div>
              )}

              {(importResults.created > 0 || importResults.updated > 0) && (
                <div className="max-h-60 overflow-y-auto rounded-lg border border-green-200 p-4">
                  <h4 className="mb-2 flex items-center text-sm font-semibold text-green-600">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Successfully Processed ({importResults.created} Created, {importResults.updated}{' '}
                    Updated)
                  </h4>
                  <div className="space-y-2">
                    {importResults.results
                      .filter(r => r.status === 'created' || r.status === 'updated')
                      .slice(0, 10)
                      .map((result, index) => (
                        <div key={index} className="rounded bg-green-50 p-2 text-xs">
                          <span className="font-medium">Row {result.row}:</span> {result.name} -{' '}
                          {result.status}
                        </div>
                      ))}
                    {importResults.results.filter(
                      r => r.status === 'created' || r.status === 'updated'
                    ).length > 10 && (
                      <p className="text-xs text-gray-500">
                        ... and{' '}
                        {importResults.results.filter(
                          r => r.status === 'created' || r.status === 'updated'
                        ).length - 10}{' '}
                        more roles
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isImporting}
            className="font-poppins rounded-full border border-gray-200 px-6 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            {importResults ? 'Close' : 'Cancel'}
          </button>
          {!importResults && (
            <button
              onClick={handleImport}
              disabled={!file || isImporting}
              className="font-poppins flex items-center gap-2 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-6 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
            >
              {isImporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Import Roles
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RolesCSVImportModal;
