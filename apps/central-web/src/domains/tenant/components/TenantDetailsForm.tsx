'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { checkSlugAction } from '@/domains/tenant/actions/check-slug.action';
import { uploadLogoToS3 } from '@/domains/tenant/actions/upload-logo.action';
import { createCheckoutAction } from '@/domains/tenant/actions/create-checkout.action';
import { createFreeTenantAction } from '@/domains/tenant/actions/create-free-tenant.action';
import { Upload, CheckCircle2, XCircle, Pencil } from 'lucide-react';
import Image from 'next/image';

const schema = z.object({
  tenantName: z.string().min(2, 'Name must be at least 2 characters'),
  tenantSlug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
});

type FormValues = z.infer<typeof schema>;

function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

type Props = {
  priceId?: string;
  planId?: string;
  adminUrlTemplate: string;
  defaultValues: { firstName: string; lastName: string; email: string };
};

export default function TenantDetailsForm({
  priceId,
  planId,
  adminUrlTemplate,
  defaultValues,
}: Props) {
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [slugEditable, setSlugEditable] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const slugTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const slugInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const tenantName = watch('tenantName');

  const handleSlugChange = useCallback((value: string) => {
    if (slugTimeout.current) clearTimeout(slugTimeout.current);
    setSlugStatus('idle');
    if (!value || value.length < 3) return;

    setSlugStatus('checking');
    slugTimeout.current = setTimeout(async () => {
      const { available } = await checkSlugAction(value);
      setSlugStatus(available ? 'available' : 'taken');
    }, 500);
  }, []);

  // Auto-generate slug from organization name when slug is not manually edited
  useEffect(() => {
    if (!slugEditable && tenantName) {
      const slug = nameToSlug(tenantName);
      setValue('tenantSlug', slug);
      if (slug.length >= 3) {
        handleSlugChange(slug);
      } else {
        setSlugStatus('idle');
      }
    }
  }, [tenantName, slugEditable, setValue, handleSlugChange]);

  const slugRegister = register('tenantSlug', {
    onChange: e => handleSlugChange(e.target.value),
  });

  function handleLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    toast.success('Logo selected');
  }

  async function onSubmit(values: FormValues) {
    if (slugStatus !== 'available') {
      toast.error('Please choose an available slug');
      return;
    }

    if (!priceId && !planId) {
      toast.error('Invalid plan selection');
      return;
    }

    setSubmitting(true);
    try {
      let logoKey: string | undefined;

      if (logoFile) {
        const formData = new FormData();
        formData.append('logo', logoFile);
        const uploadResult = await uploadLogoToS3(formData);
        if ('error' in uploadResult) {
          toast.error(uploadResult.error);
          setSubmitting(false);
          return;
        }
        logoKey = uploadResult.key;
      }

      const result = planId
        ? await createFreeTenantAction({
            ...values,
            planId,
            logoUrl: logoKey,
          })
        : await createCheckoutAction({
            ...values,
            priceId: priceId!,
            logoUrl: logoKey,
          });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.url) {
        window.location.href = result.url;
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {/* Personal info (read-only from Keycloak) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="First Name" error={errors.firstName?.message}>
          <input
            {...register('firstName')}
            readOnly
            className="input cursor-not-allowed bg-[#F2F5F6] text-[#7B8B91]"
          />
        </Field>
        <Field label="Last Name" error={errors.lastName?.message}>
          <input
            {...register('lastName')}
            readOnly
            className="input cursor-not-allowed bg-[#F2F5F6] text-[#7B8B91]"
          />
        </Field>
      </div>

      <Field label="Email" error={errors.email?.message}>
        <input
          {...register('email')}
          readOnly
          className="input cursor-not-allowed bg-[#F2F5F6] text-[#7B8B91]"
        />
      </Field>

      {/* Tenant info */}
      <Field label="Organization Name" error={errors.tenantName?.message}>
        <input {...register('tenantName')} placeholder="Acme Healthcare" className="input" />
      </Field>

      <Field label="Subdomain / Slug" error={errors.tenantSlug?.message}>
        <div className="relative">
          <input
            {...slugRegister}
            ref={el => {
              slugRegister.ref(el);
              slugInputRef.current = el;
            }}
            placeholder="acme"
            disabled={!slugEditable}
            className={`input pr-16 ${!slugEditable ? 'cursor-not-allowed bg-[#F2F5F6] text-[#7B8B91]' : ''}`}
          />
          <span className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
            {slugStatus === 'checking' && (
              <svg className="h-4 w-4 animate-spin text-[#7B8B91]" viewBox="0 0 24 24" fill="none">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            {slugStatus === 'available' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
            {slugStatus === 'taken' && <XCircle className="h-4 w-4 text-red-500" />}
            <button
              type="button"
              onClick={() => {
                setSlugEditable(true);
                setTimeout(() => slugInputRef.current?.focus(), 0);
              }}
              tabIndex={-1}
              className="text-[#7B8B91] transition-colors hover:text-[#0F1A1C] disabled:pointer-events-none disabled:opacity-50"
              disabled={slugEditable}
              aria-label="Edit slug"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </span>
        </div>
        {slugStatus === 'available' && (
          <p className="mt-1 text-xs text-green-600">
            {adminUrlTemplate.replace('{slug}', watch('tenantSlug')).replace(/^https?:\/\//, '')} is
            available
          </p>
        )}
        {slugStatus === 'taken' && (
          <p className="mt-1 text-xs text-red-500">This slug is already taken</p>
        )}
      </Field>

      {/* Logo upload */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-700">Organization Logo (optional)</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleLogoSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={submitting}
          className="flex items-center gap-3 rounded-xl border-2 border-dashed border-[#E4E9EC] bg-white p-4 text-left transition-all duration-200 hover:border-[#00A8FF] hover:bg-[#F2F5F6]"
        >
          {logoPreview ? (
            <Image
              src={logoPreview}
              alt="Logo preview"
              width={48}
              height={48}
              className="h-12 w-12 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F2F5F6]">
              <Upload className="h-5 w-5 text-[#7B8B91]" />
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-[#0F1A1C]">
              {logoPreview ? 'Change logo' : 'Upload logo'}
            </p>
            <p className="text-xs text-[#7B8B91]">PNG, JPG up to 5MB</p>
          </div>
        </button>
      </div>

      <button
        type="submit"
        disabled={submitting || slugStatus === 'taken' || slugStatus === 'checking'}
        className="w-full rounded-xl bg-gradient-to-r from-[#01F4C8] to-[#00A8FF] py-3.5 font-semibold text-white shadow-sm transition-all duration-200 hover:opacity-90 disabled:opacity-60"
      >
        {submitting
          ? planId
            ? 'Setting up...'
            : 'Redirecting to payment...'
          : planId
            ? 'Create Organization'
            : 'Continue to Payment'}
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[#0F1A1C]">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
