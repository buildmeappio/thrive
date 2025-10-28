"use client";

import React, { useState } from "react";
import Section from "@/components/Section";
import FieldRow from "@/components/FieldRow";
import { cn } from "@/lib/utils";
import { TransporterData } from "../types/TransporterData";
import { updateTransporter } from "../server/actions";
import { Check, Edit, X } from "lucide-react";
import { toast } from "sonner";
import { formatPhoneNumber } from "@/utils/phone";
import { provinceOptions } from "@/constants/options";
import { VEHICLE_TYPES, TRANSPORTER_STATUSES } from "../types/TransporterData";

const mapStatus = {
  ACTIVE: "active",
  SUSPENDED: "suspended",
} as const;

type Props = { transporter: TransporterData };

export default function TransporterDetail({ transporter }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: transporter.companyName,
    contactPerson: transporter.contactPerson,
    phone: transporter.phone,
    email: transporter.email,
    baseAddress: transporter.baseAddress,
    fleetInfo: transporter.fleetInfo || "",
    status: transporter.status,
    serviceAreas: transporter.serviceAreas,
    vehicleTypes: transporter.vehicleTypes,
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const result = await updateTransporter(transporter.id, formData);
      if (result.success) {
        toast.success("Transporter updated successfully");
        setIsEditing(false);
        // Refresh the page to get updated data
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to update transporter");
      }
    } catch (error) {
      toast.error("An error occurred while updating transporter", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      companyName: transporter.companyName,
      contactPerson: transporter.contactPerson,
      phone: transporter.phone,
      email: transporter.email,
      baseAddress: transporter.baseAddress,
      fleetInfo: transporter.fleetInfo || "",
      status: transporter.status,
      serviceAreas: transporter.serviceAreas,
      vehicleTypes: transporter.vehicleTypes,
    });
    setIsEditing(false);
  };

  const addServiceArea = () => {
    setFormData((prev) => ({
      ...prev,
      serviceAreas: [...prev.serviceAreas, { province: "", address: "" }],
    }));
  };

  const removeServiceArea = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      serviceAreas: prev.serviceAreas.filter((_, i) => i !== index),
    }));
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {transporter.companyName}
          </h1>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 shadow-sm text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                <Check className="w-4 h-4" />
                {isLoading ? "Saving..." : "Save"}
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 shadow-sm text-white rounded-lg hover:bg-gray-600">
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] shadow-sm hover:from-[#00A8FF]/80 hover:to-[#01F4C8]/80 text-white rounded-lg">
              <Edit className="w-4 h-4" />
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-lg p-6">
        {/* Left Column - Basic Information */}
        <div className="space-y-6">
          <Section title="Basic Information">
            <div className="space-y-4">
              <FieldRow
                label="Company Name"
                type="text"
                value={
                  isEditing ? (
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          companyName: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    transporter.companyName
                  )
                }
              />
              <FieldRow
                label="Contact Person"
                type="text"
                value={
                  isEditing ? (
                    <input
                      type="text"
                      value={formData.contactPerson}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          contactPerson: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    transporter.contactPerson
                  )
                }
              />
              <FieldRow
                label="Email"
                type="text"
                value={
                  isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    transporter.email
                  )
                }
              />
              <FieldRow
                label="Phone"
                type="text"
                value={
                  isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    formatPhoneNumber(transporter.phone)
                  )
                }
              />
              <FieldRow
                label="Base Address"
                type="text"
                value={
                  isEditing ? (
                    <textarea
                      value={formData.baseAddress}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          baseAddress: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Enter base address"
                    />
                  ) : (
                    transporter.baseAddress
                  )
                }
              />
            </div>
          </Section>

          {/* Vehicle Types */}
          <Section title="Vehicle Types">
            {isEditing ? (
              <div className="space-y-2">
                {VEHICLE_TYPES.map((type) => (
                  <label
                    key={type.value}
                    className="flex items-center space-x-2">
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
            ) : (
              <div className="flex flex-wrap gap-2">
                {transporter.vehicleTypes.map((type) => (
                  <span
                    key={type}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {VEHICLE_TYPES.find((t) => t.value === type)?.label || type}
                  </span>
                ))}
              </div>
            )}
          </Section>
        </div>

        {/* Right Column - Service Areas */}
        <div className="space-y-6">
          <Section title="Service Areas">
            {isEditing ? (
              <div className="space-y-4">
                {formData.serviceAreas.map((area, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Province
                        </label>
                        <select
                          value={area.province}
                          onChange={(e) =>
                            updateServiceArea(index, "province", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="">Select Province</option>
                          {provinceOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address
                        </label>
                        <input
                          type="text"
                          value={area.address}
                          onChange={(e) =>
                            updateServiceArea(index, "address", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter address"
                        />
                      </div>
                      <button
                        onClick={() => removeServiceArea(index)}
                        className="px-3 py-2 text-red-600 hover:text-red-800">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addServiceArea}
                  className="px-4 py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:text-gray-800 hover:border-gray-400">
                  + Add Service Area
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {transporter.serviceAreas.map((area, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium">{area.province}</div>
                    <div className="text-gray-600">{area.address}</div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Status Management - Bottom Right */}
          <Section title="Status Management">
            {isEditing ? (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value as any,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {TRANSPORTER_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Current Status:
                </span>
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium",
                    mapStatus[transporter.status] === "active" &&
                      "bg-green-100 text-green-800",
                    mapStatus[transporter.status] === "suspended" &&
                      "bg-red-100 text-red-800"
                  )}>
                  {transporter.status === "ACTIVE" && "Active"}
                  {transporter.status === "SUSPENDED" && "Suspended"}
                </span>
              </div>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}
