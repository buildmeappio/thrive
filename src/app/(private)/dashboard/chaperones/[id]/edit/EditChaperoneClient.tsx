"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ChaperoneFormPage from "@/domains/services/components/ChaperoneFormPage";
import { updateChaperone } from "@/domains/services/actions";
import {
  UpdateChaperoneInput,
  ChaperoneWithAvailability,
} from "@/domains/services/types/Chaperone";

type EditChaperoneClientProps = {
  chaperone: ChaperoneWithAvailability;
};

const EditChaperoneClient: React.FC<EditChaperoneClientProps> = ({
  chaperone,
}) => {
  const router = useRouter();

  const handleSubmit = async (data: UpdateChaperoneInput) => {
    const response = await updateChaperone(chaperone.id, data);

    if (response.success) {
      toast.success("Chaperone updated successfully");
      router.push("/dashboard/chaperones");
      router.refresh();
    } else {
      throw new Error("Failed to update chaperone");
    }
  };

  return (
    <ChaperoneFormPage
      mode="edit"
      chaperone={chaperone}
      onSubmit={handleSubmit}
    />
  );
};

export default EditChaperoneClient;
