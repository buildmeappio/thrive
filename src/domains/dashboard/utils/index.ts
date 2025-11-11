import { CaseDetailsData } from "../types";

export const formatAddress = (
  address: CaseDetailsData["claimant"]["address"]
): string => {
  if (!address) return "N/A";
  // Use the full address field if available, otherwise build from parts
  if (address.address) {
    const parts = [address.address, address.suite].filter(Boolean);
    return parts.join(", ");
  }
  const parts = [
    address.street,
    address.suite,
    address.city,
    address.province,
    address.postalCode,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "N/A";
};
