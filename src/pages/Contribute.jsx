import { VaultsList } from "@/components/vaults/VaultsList";

export const Contribute = ({ isMyVaults = false }) => (
  <div className="min-h-screen">
    <div className="flex justify-center py-8">
      <span className="font-russo text-[40px] uppercase">
        Contribute
      </span>
    </div>
    <div className="container mx-auto">
      <VaultsList isMyVaults={isMyVaults} />
    </div>
  </div>
);
