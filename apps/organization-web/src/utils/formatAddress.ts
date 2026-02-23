interface Address {
  suite?: string;
  street?: string;
  city?: string;
  province?: string;
  postalCode?: string;
}

type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};

export const formatAddress = (address: Nullable<Address> | null | undefined): string => {
  if (!address) return '';
  const { suite, street, city, province, postalCode } = address;
  return [suite, street, city, province, postalCode].filter(Boolean).join(', ');
};
