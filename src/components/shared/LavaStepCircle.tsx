import CheckmarkIcon from '@/icons/checkmark-vault.svg?react';

type LavaStepCircleProps = {
  status: 'in progress' | 'completed' | 'pending';
  number: number;
  isActive?: boolean;
};
export const LavaStepCircle = ({ status, number, isActive = true }: LavaStepCircleProps) => (
  <div className="flex justify-center">
    <div className="relative flex items-center justify-center" style={{ width: '80px', height: '80px' }}>
      {isActive ? (
        <>
          <div className="absolute inset-0 rounded-full border-2 border-yellow-500" />
          <div
            className="absolute rounded-full bg-gradient-to-br from-yellow-400 to-orange-500"
            style={{
              width: '48px',
              height: '48px',
              top: '16px',
              left: '16px',
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-black">{number}</span>
            </div>
          </div>
        </>
      ) : (
        <div
          className={`absolute rounded-full ${
            status === 'completed'
              ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
              : 'bg-transparent border border-white'
          }`}
          style={{
            width: '48px',
            height: '48px',
            top: '16px',
            left: '16px',
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            {status === 'completed' ? (
              <CheckmarkIcon className="w-4" />
            ) : (
              <span className="text-xl font-bold text-white">{number}</span>
            )}
          </div>
        </div>
      )}
    </div>
  </div>
);
