'use client';
import { Input } from '@/shared/components/ui/input';
import { Search } from 'lucide-react';
import { useSearch } from '../providers/SearchProvider';

const getSearchPlaceholder = (name: string | undefined) => {
  if (!name) return '';
  switch (name) {
    case 'dashboard':
      return 'Search dashboard...';
    case 'referrals':
      return 'Search referrals...';
    case 'support':
      return 'Search support tickets...';
    case 'ime-referral':
      return 'Search IME referrals...';
    default:
      return 'Search...';
  }
};

interface SearchbarProps {
  currentPage: { name: string };
  isMobile: boolean;
}

const Searchbar: React.FC<SearchbarProps> = ({ currentPage, isMobile }) => {
  const { searchString, setSearchString } = useSearch();

  const placeholder = getSearchPlaceholder(currentPage?.name);

  if (!isMobile) {
    return (
      <div className="relative mx-4 flex max-w-3xl flex-grow items-center">
        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          placeholder={placeholder}
          value={searchString}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setSearchString(event.target.value)
          }
          className="h-11 w-full rounded-full border border-[#DBDBFF] bg-white pr-4 pl-10 text-base text-gray-700 hover:border-[#000093] focus:border-[#000093] focus:ring-2 focus:ring-[#000093]/20"
        />
      </div>
    );
  }

  return (
    <div className="md:hidden">
      <div className="relative flex items-center">
        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          placeholder={placeholder}
          value={searchString}
          onChange={event => setSearchString(event.target.value)}
          className="h-11 w-full rounded-full border border-[#DBDBFF] bg-white pr-4 pl-10 text-sm text-gray-700 hover:border-[#000093] focus:border-[#000093] focus:ring-2 focus:ring-[#000093]/20"
        />
      </div>
    </div>
  );
};

export default Searchbar;
