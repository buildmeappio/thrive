declare module "canada" {
  export const cities: Array<[string, string, string]>; // [name, provinceCode, type]
  export const provinces: { [code: string]: string }; // { "AB": "ALBERTA", "BC": "BRITISH COLUMBIA", ... }
  export const territories: { [code: string]: string }; // { "NT": "NORTHWEST TERRITORIES", ... }
}

