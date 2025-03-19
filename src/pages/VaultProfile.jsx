import { useParams } from 'react-router-dom';

export const VaultProfile = () => {
  const { id } = useParams();

  return (
    <>
      <div className="flex justify-center pt-20 pb-8">
        <span className="font-russo text-[40px] uppercase">
          Vault {id}
        </span>
      </div>
      <div className="container mx-auto">
        <div className="bg-dark-600 rounded-xl p-6">
          <p className="text-lg">Vault details will be displayed here</p>
        </div>
      </div>
    </>
  );
};
