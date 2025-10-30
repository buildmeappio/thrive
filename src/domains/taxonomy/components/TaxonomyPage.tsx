"use client";

import React, { useState } from "react";
import TaxonomyTable from "./TaxonomyTable";
import TaxonomyForm from "./TaxonomyForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { createTaxonomy, updateTaxonomy } from "../actions";
import {
  TaxonomyData,
  CreateTaxonomyInput,
  UpdateTaxonomyInput,
  TaxonomyType,
} from "../types/Taxonomy";
import { TaxonomyConfigs } from "../config/taxonomyConfig";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type TaxonomyPageProps = {
  type: TaxonomyType;
  initialData: TaxonomyData[];
  examinationTypeOptions?: { label: string; value: string }[];
};

const TaxonomyPage: React.FC<TaxonomyPageProps> = ({
  type,
  initialData,
  examinationTypeOptions = [],
}) => {
  const config = TaxonomyConfigs[type];
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedTaxonomy, setSelectedTaxonomy] = useState<
    TaxonomyData | undefined
  >(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = () => {
    setDialogMode("create");
    setSelectedTaxonomy(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (taxonomy: TaxonomyData) => {
    setDialogMode("edit");
    setSelectedTaxonomy(taxonomy);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (
    data: CreateTaxonomyInput | UpdateTaxonomyInput
  ) => {
    try {
      setIsSubmitting(true);

      if (dialogMode === "create") {
        const response = await createTaxonomy(
          type,
          data as CreateTaxonomyInput
        );
        if (response.success) {
          toast.success(`${config.singularName} created successfully`);
          setIsDialogOpen(false);
          router.refresh();
        }
      } else {
        if (!selectedTaxonomy) return;
        const response = await updateTaxonomy(
          type,
          selectedTaxonomy.id,
          data as UpdateTaxonomyInput
        );
        if (response.success) {
          toast.success(`${config.singularName} updated successfully`);
          setIsDialogOpen(false);
          router.refresh();
        }
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Failed to ${dialogMode} ${config.singularName.toLowerCase()}`;
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    if (!isSubmitting) {
      setIsDialogOpen(false);
      setSelectedTaxonomy(undefined);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#000000] text-[20px] sm:text-[28px] lg:text-[36px] font-semibold font-degular leading-tight break-words">
            {config.name}
          </h1>
        </div>
      </div>

      <TaxonomyTable
        taxonomyList={initialData}
        displayFields={config.displayFields}
        searchFields={config.searchFields}
        onEdit={handleEdit}
        onCreate={handleCreate}
        singularName={config.singularName}
      />

      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create"
                ? `Add New ${config.singularName}`
                : `Edit ${config.singularName}`}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "create"
                ? `Fill in the details to add a new ${config.singularName.toLowerCase()} to the system.`
                : `Update the ${config.singularName.toLowerCase()} information below.`}
            </DialogDescription>
          </DialogHeader>
          <TaxonomyForm
            mode={dialogMode}
            type={type}
            config={config}
            taxonomy={selectedTaxonomy}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            examinationTypeOptions={examinationTypeOptions}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaxonomyPage;
