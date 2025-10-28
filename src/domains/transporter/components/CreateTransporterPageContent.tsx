"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Section from "@/components/Section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTransporter } from "../server/actions";
import { toast } from "sonner";
import { provinceOptions } from "@/constants/options";
import { VEHICLE_TYPES } from "../types/TransporterData";
import { X, Plus } from "lucide-react";

export default function CreateTransporterPageContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    phone: "",
    email: "",
    baseAddress: "",
    serviceAreas: [{ province: "", address: "" }],
    vehicleTypes: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate service areas
      const validServiceAreas = formData.serviceAreas.filter(
        (area) => area.province && area.address
      );

      if (validServiceAreas.length === 0) {
        toast.error("Please add at least one service area");
        return;
      }

      // Validate vehicle types
      if (formData.vehicleTypes.length === 0) {
        toast.error("Please select at least one vehicle type");
        return;
      }

      const result = await createTransporter({
        ...formData,
        serviceAreas: validServiceAreas,
      });

      if (result.success) {
        toast.success("Transporter created successfully");
        router.push("/transporter");
      } else {
        toast.error(result.error || "Failed to create transporter");
      }
    } catch (error) {
      toast.error("An error occurred while creating transporter", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addServiceArea = () => {
    setFormData((prev) => ({
      ...prev,
      serviceAreas: [...prev.serviceAreas, { province: "", address: "" }],
    }));
  };

  const removeServiceArea = (index: number) => {
    if (formData.serviceAreas.length > 1) {
      setFormData((prev) => ({
        ...prev,
        serviceAreas: prev.serviceAreas.filter((_, i) => i !== index),
      }));
    }
  };

  const updateServiceArea = (
    index: number,
    field: "province" | "address",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      serviceAreas: prev.serviceAreas.map((area, i) =>
        i === index ? { ...area, [field]: value } : area
      ),
    }));
  };

  const toggleVehicleType = (vehicleType: string) => {
    setFormData((prev) => ({
      ...prev,
      vehicleTypes: prev.vehicleTypes.includes(vehicleType)
        ? prev.vehicleTypes.filter((vt) => vt !== vehicleType)
        : [...prev.vehicleTypes, vehicleType],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Create New Transporter
            </h1>
            <p className="text-gray-600">
              Add a new medical transportation service provider
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-lg p-6">
        {/* Left Column - Basic Information */}
        <div className="space-y-6">
          <Section title="Basic Information">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name *
                </label>
                <Input
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      companyName: e.target.value,
                    }))
                  }
                  placeholder="Enter company name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Person *
                </label>
                <Input
                  value={formData.contactPerson}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contactPerson: e.target.value,
                    }))
                  }
                  placeholder="Enter contact person name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone *
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Address *
                </label>
                <Textarea
                  value={formData.baseAddress}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      baseAddress: e.target.value,
                    }))
                  }
                  placeholder="Enter base address"
                  rows={3}
                  required
                />
              </div>
            </div>
          </Section>

          {/* Vehicle Types */}
          <Section title="Vehicle Types">
            <div className="space-y-2">
              {VEHICLE_TYPES.map((type) => (
                <label key={type.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.vehicleTypes.includes(type.value)}
                    onChange={() => toggleVehicleType(type.value)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>{type.label}</span>
                </label>
              ))}
            </div>
          </Section>
        </div>

        {/* Right Column - Service Areas */}
        <div className="space-y-6">
          <Section title="Service Areas">
            <div className="space-y-4">
              {formData.serviceAreas.map((area, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Province
                      </label>
                      <Select
                        value={area.province}
                        onValueChange={(value) =>
                          updateServiceArea(index, "province", value)
                        }>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Province" />
                        </SelectTrigger>
                        <SelectContent>
                          {provinceOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {formData.serviceAreas.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeServiceArea(index)}
                        className="text-red-600 hover:text-red-800">
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <Input
                      value={area.address}
                      onChange={(e) =>
                        updateServiceArea(index, "address", e.target.value)
                      }
                      placeholder="Enter address"
                    />
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addServiceArea}
                className="w-full border-dashed">
                <Plus className="w-4 h-4 mr-2" />
                Add Service Area
              </Button>
            </div>
          </Section>
        </div>

        {/* Actions */}
        <div className="col-span-full flex justify-end gap-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white shadow-sm hover:from-[#00A8FF]/80 hover:to-[#01F4C8]/80">
            {isLoading ? "Creating..." : "Create Transporter"}
          </Button>
        </div>
      </div>
    </div>
  );
}
