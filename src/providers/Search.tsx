"use client";
import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface SearchContextType {
  searchString: string;
  setSearchString: (searchString: string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [searchString, setSearchString] = useState<string>("");

  return (
    <SearchContext.Provider value={{ searchString, setSearchString }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};
