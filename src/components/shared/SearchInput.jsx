import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export const SearchInput = () => (
  <div className="relative w-[370px]">
    <Input
      className="
        h-[60px] pl-[20px] pr-12
        bg-white/5 backdrop-blur-sm
        border-2 border-white/5
        text-dark-100 placeholder:text-dark-100
        rounded-[10px]
        focus-visible:border-white/20
        focus-visible:ring-0
        focus-visible:ring-offset-0
        focus:shadow-[0_0_10px_rgba(0,102,255,0.2)]
        transition-all duration-200
      "
      placeholder="Search"
      type="text"
    />
    <Search
      className="
        absolute right-4 top-1/2 transform -translate-y-1/2
        text-dark-100
        w-6 h-6
      "
    />
  </div>
);
