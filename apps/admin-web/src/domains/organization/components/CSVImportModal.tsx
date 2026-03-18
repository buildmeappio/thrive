'use client';

import { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle, AlertCircle, Loader2, Download } from 'lucide-react';
import { toast } from 'sonner';
import organizationActions from '../actions';
import { useRouter } from 'next/navigation';
import { downloadCSV } from '@/utils/csv';

interface CSVImportModalProps {
  open: boolean;
  onClose: () => void;
  organizationId: string;
}

interface ImportResult {
  row: number;
  email: string;
  status: 'success' | 'error';
  error?: string;
  userId?: string;
}

const CSVImportModal: React.FC<CSVImportModalProps> = ({ open, onClose, organizationId }) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<{
    totalRows: number;
    successful: number;
    failed: number;
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
      const result = await organizationActions.importUsersFromCSV(organizationId, text);

      setImportResults({
        totalRows: result.totalRows,
        successful: result.successful,
        failed: result.failed,
        results: result.results,
        errors: result.errors,
      });

      if (result.success) {
        toast.success(`Successfully imported ${result.successful} user(s)`);
        setTimeout(() => {
          onClose();
          router.refresh();
        }, 2000);
      } else {
        if (result.successful > 0) {
          toast.warning(
            `Imported ${result.successful} user(s), but ${result.failed} failed. Check the details below.`
          );
        } else {
          toast.error(`Failed to import users. Check the errors below.`);
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to import users');
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
    const headers = ['email', 'firstName', 'lastName', 'phoneNumber', 'role'];
    const csvContent = headers.join(',') + '\n';
    downloadCSV(csvContent, 'users-import-template.csv');
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
          <h2 className="font-degular text-xl font-semibold sm:text-2xl">Import Users from CSV</h2>
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
                      CSV file with user data (email, firstName, lastName, phoneNumber, role)
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
                    className="flex items-center gap-2 rounded-lg border border-[#000093] px-4 py-2 text-sm text-[#000093] hover:bg-[#E0E0FF]"
                  >
                    <Download className="h-4 w-4" />
                    Download Template
                  </button>
                </div>
                <div className="mt-4 border-t border-blue-300 pt-4">
                  <p className="text-xs text-gray-600">
                    <strong>Required:</strong> email, firstName, lastName, phoneNumber
                    <br />
                    <strong>Optional:</strong> role (if not provided, user will be created without a
                    role assignment)
                    <br />
                    <strong>Note:</strong> Users with the same email that already exist in the
                    organization will be updated. New users will receive invitation emails.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Import Results Section */}
          {importResults && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-gray-50 p-4 text-center">
                  <p className="text-2xl font-bold text-gray-700">{importResults.totalRows}</p>
                  <p className="mt-1 text-xs text-gray-500">Total Rows</p>
                </div>
                <div className="rounded-lg bg-green-50 p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{importResults.successful}</p>
                  <p className="mt-1 text-xs text-gray-500">Successful</p>
                </div>
                <div className="rounded-lg bg-red-50 p-4 text-center">
                  <p className="text-2xl font-bold text-red-600">{importResults.failed}</p>
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
                        <span className="font-medium">Row {error.row}:</span> {error.email} -{' '}
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

              {importResults.results.length > 0 && (
                <div className="max-h-60 overflow-y-auto rounded-lg border border-green-200 p-4">
                  <h4 className="mb-2 flex items-center text-sm font-semibold text-green-600">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Successfully Imported ({importResults.results.length})
                  </h4>
                  <div className="space-y-2">
                    {importResults.results.slice(0, 10).map((result, index) => (
                      <div key={index} className="rounded bg-green-50 p-2 text-xs">
                        <span className="font-medium">Row {result.row}:</span> {result.email}
                      </div>
                    ))}
                    {importResults.results.length > 10 && (
                      <p className="text-xs text-gray-500">
                        ... and {importResults.results.length - 10} more users
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t pt-4">
          <button
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
              className="font-poppins flex items-center gap-2 rounded-full bg-[#000093] px-6 py-2 text-sm text-white hover:bg-[#000080] disabled:opacity-50"
            >
              {isImporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Import Users
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CSVImportModal;
