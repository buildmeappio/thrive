"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Section from "@/components/Section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/utils";

export default function CreateTransporterPageContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    phone: "",
    email: "",
    serviceAreas: [{ province: "", address: "" }],
    vehicleTypes: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate email
      if (!isValidEmail(formData.email)) {
        toast.error("Please enter a valid email address");
        setIsLoading(false);
        return;
      }

      // Trim all fields before validation
      const trimmedCompanyName = formData.companyName.trim();
      const trimmedContactPerson = formData.contactPerson.trim();
      const trimmedEmail = formData.email.trim();

      // Check if required fields are not empty after trimming
      if (!trimmedCompanyName || !trimmedContactPerson || !trimmedEmail) {
        toast.error("Please fill in all required fields");
        setIsLoading(false);
        return;
      }

      // Check if fields contain only spaces
      if (isOnlySpaces(formData.companyName) || isOnlySpaces(formData.contactPerson)) {
        toast.error("Fields cannot contain only spaces");
        setIsLoading(false);
        return;
      }

      // Validate service areas
      const validServiceAreas = formData.serviceAreas.filter(
        (area) => area.province && area.address
      );

      if (validServiceAreas.length === 0) {
        toast.error("Please add at least one service area");
        setIsLoading(false);
        return;
      }

      // Validate vehicle types
      if (formData.vehicleTypes.length === 0) {
        toast.error("Please select at least one vehicle type");
        setIsLoading(false);
        return;
      }

      const result = await createTransporter({
        ...formData,
        companyName: trimmedCompanyName,
        contactPerson: trimmedContactPerson,
        email: trimmedEmail,
        phone: formData.phone.trim() || undefined,
        baseAddress: "", // Default empty string for baseAddress
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

  // Validation handlers
  const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/[^a-zA-Z\s]/g, '').slice(0, 25);
    value = value.replace(/^\s+/, ''); // Remove leading spaces
    setFormData((prev) => ({ ...prev, companyName: value }));
  };

  const handleCompanyNameBlur = () => {
    setFormData((prev) => ({
      ...prev,
      companyName: prev.companyName.replace(/\s+$/, '').trim() // Remove trailing spaces on blur
    }));
  };

  const handleContactPersonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/[^a-zA-Z\s]/g, '').slice(0, 25);
    value = value.replace(/^\s+/, ''); // Remove leading spaces
    setFormData((prev) => ({ ...prev, contactPerson: value }));
  };

  const handleContactPersonBlur = () => {
    setFormData((prev) => ({
      ...prev,
      contactPerson: prev.contactPerson.replace(/\s+$/, '').trim() // Remove trailing spaces on blur
    }));
  };

  const isOnlySpaces = (value: string) => {
    return value.trim().length === 0 && value.length > 0;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/\s/g, ''); // Remove all spaces immediately
    setFormData((prev) => ({ ...prev, email: value }));
  };

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ') {
      e.preventDefault(); // Prevent spacebar from being typed
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow numbers and + (only at the start)
    let filtered = value.replace(/[^0-9+]/g, '');
    // If + exists, ensure it's only at the start
    if (filtered.includes('+')) {
      const plusCount = (filtered.match(/\+/g) || []).length;
      // If there are multiple +, keep only the first one
      if (plusCount > 1) {
        filtered = '+' + filtered.replace(/\+/g, '');
      } else if (!filtered.startsWith('+')) {
        // Move + to the start if it's not there
        filtered = '+' + filtered.replace(/\+/g, '');
      }
    }
    setFormData((prev) => ({ ...prev, phone: filtered }));
  };

  // Email validation - must have at least one letter before @
  const isValidEmail = (email: string) => {
    if (!email || !email.includes('@')) return false;
    const [localPart, domain] = email.split('@');
    if (!localPart || !domain || !domain.includes('.')) return false;
    // Must have at least one letter (a-z or A-Z) in the local part before @
    return /[a-zA-Z]/.test(localPart) && /^[a-zA-Z0-9._-]+$/.test(localPart) && /^[^\s@]+\.[^\s@]+$/.test(domain);
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
                  onChange={handleCompanyNameChange}
                  onBlur={handleCompanyNameBlur}
                  maxLength={25}
                  className={cn(
                    isOnlySpaces(formData.companyName)
                      ? "border-red-300 focus:ring-red-500"
                      : ""
                  )}
                  placeholder="Enter company name (alphabets only, max 25)"
                  required
                />
                {isOnlySpaces(formData.companyName) && (
                  <p className="text-xs text-red-500 mt-1">Company name cannot be only spaces</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Person *
                </label>
                <Input
                  value={formData.contactPerson}
                  onChange={handleContactPersonChange}
                  onBlur={handleContactPersonBlur}
                  maxLength={25}
                  className={cn(
                    isOnlySpaces(formData.contactPerson)
                      ? "border-red-300 focus:ring-red-500"
                      : ""
                  )}
                  placeholder="Enter contact person name (alphabets only, max 25)"
                  required
                />
                {isOnlySpaces(formData.contactPerson) && (
                  <p className="text-xs text-red-500 mt-1">Contact person cannot be only spaces</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={handleEmailChange}
                  onKeyDown={handleEmailKeyDown}
                  className={cn(
                    formData.email && !isValidEmail(formData.email)
                      ? "border-red-300 focus:ring-red-500"
                      : ""
                  )}
                  placeholder="Enter email address"
                  required
                />
                {formData.email && !isValidEmail(formData.email) && (
                  <p className="text-xs text-red-500 mt-1">Please enter a valid email address</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone *
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="Enter phone number (numbers only, + allowed at start)"
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
