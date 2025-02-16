import { useState } from 'react';
import { FirstStep } from '@/components/vaults/create/FirstStep';

export const CreateVaultForm = () => {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      number: 1,
      title: 'Configure Vault',
    },
    {
      number: 2,
      title: 'Configure Assets',
    },
    {
      number: 3,
      title: 'Governance',
    },
    {
      number: 4,
      title: 'Launch',
    },
  ];

  const handleStepClick = (stepNumber) => {
    setActiveStep(stepNumber);
  };

  return (
    <div className="flex">
      <div className="h-fit flex items-start bg-dark-600 p-4 rounded-[10px]">
        <div className="w-64 space-y-8">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="flex items-center cursor-pointer"
              onClick={() => handleStepClick(step.number)}
            >
              <div className="relative">
                <div
                  className={`w-8 h-8 text-[20px] rounded-full flex items-center justify-center ${
                    step.number === activeStep ? 'bg-main-red' : 'bg-dark-100'
                  }`}
                >
                  {step.number}
                </div>
                {index < steps.length - 1 && (
                  <div className="absolute top-8 left-4 w-px h-8 bg-dark-100"/>
                )}
              </div>
              <span className="ml-4 text-lg">
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 ml-14">
        <FirstStep />
      </div>
    </div>
  );
};
