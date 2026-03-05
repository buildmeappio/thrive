export default function AccessDeniedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <h1 className="text-xl font-semibold text-red-900">Access denied</h1>
        <p className="mt-2 text-sm text-red-800">
          You do not have permission to access this resource.
        </p>
      </div>
    </main>
  );
}
