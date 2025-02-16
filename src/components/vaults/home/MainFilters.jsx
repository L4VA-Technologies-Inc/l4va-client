import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from 'lucide-react';

export const MainFilters = () => {
  return (
    <Button
      variant="outline"
      className="
        cursor-pointer
        h-[60px] px-6
        bg-white/5 backdrop-blur-sm
        border-2 border-white/5
        text-dark-100
        rounded-[10px]
        hover:bg-white/5
        hover:border-white/20
        transition-all duration-200
      "
    >
      Filter
      <SlidersHorizontal className="ml-2 w-5 h-5" />
    </Button>
  )
}
