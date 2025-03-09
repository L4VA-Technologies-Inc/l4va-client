import { Edit } from 'lucide-react';
import FacebookIcon from '@/icons/facebook.svg?react';
import XIcon from '@/icons/x.svg?react';

export const Launch = ({ data }) => {
  console.log(data);
  return (
    <div>
      <div className="rounded-t-[10px] py-4 px-8 flex justify-between bg-white/5">
        <p className="font-bold text-2xl">
          Configure Vault
        </p>
        <button
          className="flex items-center gap-2 text-dark-100"
          type="button"
          onClick={() => {
          }}
        >
          <Edit size={24}/>
          Edit
        </button>
      </div>
      <div className="grid grid-cols-2 gap-8 rounded-b-[10px] bg-input-bg pt-4 pb-8 px-16">
        <div className="space-y-10">
          <div>
            <p className="uppercase font-semibold text-dark-100">
              Vault name
            </p>
            <p className="text-[20px]">
              {data.name || 'No name'}
            </p>
          </div>
          <div>
            <p className="uppercase font-semibold text-dark-100">
              Vault type
            </p>
            <p className="text-[20px]">
              {data.type}
            </p>
          </div>
          <div>
            <p className="uppercase font-semibold text-dark-100">
              Vault privacy
            </p>
            <p className="text-[20px]">
              {data.privacy}
            </p>
          </div>
          <div>
            <p className="uppercase font-semibold text-dark-100">
              Vault brief
            </p>
            <p className="text-[20px]">
              {data.description || 'No description'}
            </p>
          </div>
          <div>
            <p className="uppercase font-semibold text-dark-100">
              Social links
            </p>
            <p className="text-[20px]">
              {data.description || 'No description'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
