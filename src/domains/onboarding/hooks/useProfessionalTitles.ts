"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { UseFormReturn } from "@/lib/form";
import authActions from "@/domains/auth/actions";

interface UseProfessionalTitlesOptions {
  form: UseFormReturn<any>;
  initialValue?: string | null;
}

/**
 * Hook for fetching and managing professional titles options
 * Handles backward compatibility for old name-based values
 */
export function useProfessionalTitles({
  form,
  initialValue,
}: UseProfessionalTitlesOptions) {
  const [options, setOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfessionalTitles = async () => {
      try {
        setLoading(true);
        const titles = await authActions.getProfessionalTitles();
        const formattedTitles = titles.map((title) => ({
          value: title.id,
          label: title.description
            ? `${title.name} (${title.description})`
            : title.name,
        }));
        setOptions(formattedTitles);

        // Handle backward compatibility: if stored value is a name (not ID), find matching title
        if (initialValue) {
          const storedValue = initialValue as string;
          // Check if stored value is not a UUID (likely an old name-based value)
          const isUUID =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
              storedValue,
            );
          if (!isUUID) {
            // Try to find matching title by name (case-insensitive)
            const matchingTitle = titles.find(
              (title) => title.name.toLowerCase() === storedValue.toLowerCase(),
            );
            if (matchingTitle) {
              // Update form value to use the ID instead
              form.setValue("professionalTitle", matchingTitle.id, {
                shouldDirty: false,
              });
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch professional titles:", error);
        toast.error("Failed to load professional title options");
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProfessionalTitles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    options,
    loading,
  };
}
