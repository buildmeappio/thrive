import { provinces, territories } from "canada";

// Map full province names to province codes
const provinceNameToCode: { [key: string]: string } = {
  Alberta: "AB",
  "British Columbia": "BC",
  Manitoba: "MB",
  "New Brunswick": "NB",
  "Newfoundland and Labrador": "NL",
  "Northwest Territories": "NT",
  "Nova Scotia": "NS",
  Nunavut: "NU",
  Ontario: "ON",
  "Prince Edward Island": "PE",
  Quebec: "QC",
  Saskatchewan: "SK",
  Yukon: "YT",
};

// Map province codes to full province names
const provinceCodeToName: { [key: string]: string } = {
  AB: "Alberta",
  BC: "British Columbia",
  MB: "Manitoba",
  NB: "New Brunswick",
  NL: "Newfoundland and Labrador",
  NT: "Northwest Territories",
  NS: "Nova Scotia",
  NU: "Nunavut",
  ON: "Ontario",
  PE: "Prince Edward Island",
  QC: "Quebec",
  SK: "Saskatchewan",
  YT: "Yukon",
};

/**
 * Get province code from full province name
 */
export const getProvinceCode = (provinceName: string): string | null => {
  return provinceNameToCode[provinceName] || null;
};

/**
 * Get full province name from province code
 */
export const getProvinceName = (provinceCode: string): string | null => {
  return provinceCodeToName[provinceCode] || null;
};

// Curated list of major cities by province (excluding small communities)
const majorCitiesByProvince: { [key: string]: string[] } = {
  AB: [
    "Calgary",
    "Edmonton",
    "Red Deer",
    "Lethbridge",
    "St. Albert",
    "Medicine Hat",
    "Grande Prairie",
    "Airdrie",
    "Spruce Grove",
    "Leduc",
    "Fort McMurray",
    "Cochrane",
    "Camrose",
    "Cold Lake",
    "Brooks",
    "Wetaskiwin",
    "Lloydminster",
    "Canmore",
    "Strathmore",
    "Okotoks",
  ],
  BC: [
    "Vancouver",
    "Victoria",
    "Surrey",
    "Burnaby",
    "Richmond",
    "Kelowna",
    "Abbotsford",
    "Coquitlam",
    "Saanich",
    "Langley",
    "Delta",
    "Kamloops",
    "Nanaimo",
    "Prince George",
    "Chilliwack",
    "Maple Ridge",
    "North Vancouver",
    "New Westminster",
    "Port Coquitlam",
    "Vernon",
  ],
  MB: [
    "Winnipeg",
    "Brandon",
    "Steinbach",
    "Thompson",
    "Portage la Prairie",
    "Winkler",
    "Selkirk",
    "Morden",
    "Dauphin",
    "The Pas",
  ],
  NB: [
    "Saint John",
    "Moncton",
    "Fredericton",
    "Dieppe",
    "Miramichi",
    "Edmundston",
    "Riverview",
    "Quispamsis",
    "Bathurst",
    "Campbellton",
  ],
  NL: [
    "St. John's",
    "Mount Pearl",
    "Corner Brook",
    "Conception Bay South",
    "Grand Falls-Windsor",
    "Gander",
    "Happy Valley-Goose Bay",
    "Labrador City",
    "Stephenville",
    "Torbay",
  ],
  NS: [
    "Halifax",
    "Dartmouth",
    "Sydney",
    "Truro",
    "New Glasgow",
    "Glace Bay",
    "Kentville",
    "Amherst",
    "Bridgewater",
    "Yarmouth",
  ],
  ON: [
    "Toronto",
    "Ottawa",
    "Mississauga",
    "Brampton",
    "Hamilton",
    "London",
    "Markham",
    "Vaughan",
    "Kitchener",
    "Windsor",
    "Richmond Hill",
    "Oakville",
    "Burlington",
    "Greater Sudbury",
    "Oshawa",
    "Barrie",
    "St. Catharines",
    "Cambridge",
    "Kingston",
    "Guelph",
    "Thunder Bay",
    "Waterloo",
    "Brantford",
    "Pickering",
    "Ajax",
    "Sarnia",
    "Sault Ste. Marie",
    "Peterborough",
    "Belleville",
    "Niagara Falls",
  ],
  PE: [
    "Charlottetown",
    "Summerside",
    "Stratford",
    "Cornwall",
    "Montague",
    "Kensington",
    "Souris",
    "Alberton",
    "Tignish",
    "Georgetown",
  ],
  QC: [
    "Montreal",
    "Quebec City",
    "Laval",
    "Gatineau",
    "Longueuil",
    "Sherbrooke",
    "Saguenay",
    "Levis",
    "Trois-Rivieres",
    "Terrebonne",
    "Saint-Jean-sur-Richelieu",
    "Repentigny",
    "Brossard",
    "Drummondville",
    "Saint-Jerome",
    "Granby",
    "Blainville",
    "Saint-Hyacinthe",
    "Shawinigan",
    "Dollard-des-Ormeaux",
  ],
  SK: [
    "Saskatoon",
    "Regina",
    "Prince Albert",
    "Moose Jaw",
    "Swift Current",
    "Yorkton",
    "North Battleford",
    "Estevan",
    "Weyburn",
    "Corman Park",
  ],
  NT: [
    "Yellowknife",
    "Hay River",
    "Inuvik",
    "Fort Smith",
    "Behchoko",
    "Fort Simpson",
    "Tuktoyaktuk",
    "Fort McPherson",
    "Norman Wells",
    "Fort Providence",
  ],
  NU: [
    "Iqaluit",
    "Rankin Inlet",
    "Arviat",
    "Baker Lake",
    "Cambridge Bay",
    "Pangnirtung",
    "Pond Inlet",
    "Kugluktuk",
    "Cape Dorset",
    "Gjoa Haven",
  ],
  YT: [
    "Whitehorse",
    "Dawson City",
    "Watson Lake",
    "Haines Junction",
    "Carmacks",
    "Faro",
    "Ross River",
    "Teslin",
    "Mayo",
    "Pelly Crossing",
  ],
};

/**
 * Get all cities for a given province (only major cities, excluding communities)
 * @param provinceName - Full province name (e.g., "Ontario", "British Columbia")
 * @param includeExistingCity - Optional: if a city is already selected but not in major cities, include it
 * @returns Array of city options formatted for dropdown
 */
export const getCitiesByProvince = (
  provinceName: string,
  includeExistingCity?: string
): { value: string; label: string }[] => {
  if (!provinceName) return [];

  const provinceCode = getProvinceCode(provinceName);
  if (!provinceCode) return [];

  // Get major cities for the province
  const majorCities = majorCitiesByProvince[provinceCode] || [];

  // If there's an existing city that's not in the major cities list, add it
  const citiesSet = new Set(majorCities);
  if (includeExistingCity && includeExistingCity.trim() && !citiesSet.has(includeExistingCity)) {
    citiesSet.add(includeExistingCity);
  }

  // Format as dropdown options and sort alphabetically
  return Array.from(citiesSet)
    .map((city) => ({
      value: city,
      label: city,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

/**
 * Convert province name to title case
 * e.g., "BRITISH COLUMBIA" -> "British Columbia"
 */
const toTitleCase = (str: string): string => {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Get all provinces and territories formatted for dropdown
 * Returns provinces and territories in title case (e.g., "British Columbia" instead of "BRITISH COLUMBIA")
 * Territories are already in title case, so they don't need conversion
 */
export const getProvinceOptions = (): { value: string; label: string }[] => {
  // Get provinces (object with code as key and name as value) and convert to title case
  const provinceOptions = Object.entries(provinces).map(([_code, name]) => {
    const titleCaseName = toTitleCase(name);
    return {
      value: titleCaseName,
      label: titleCaseName,
    };
  });

  // Get territories (object with code as key and name as value)
  const territoryOptions = Object.entries(territories).map(([_code, name]) => ({
    value: name,
    label: name,
  }));

  // Combine and sort alphabetically
  return [...provinceOptions, ...territoryOptions].sort((a, b) =>
    a.label.localeCompare(b.label)
  );
};

