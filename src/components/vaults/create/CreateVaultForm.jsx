import { useState } from 'react';

import { useFormik } from 'formik';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { LavaRadioGroup } from '@/components/shared/LavaRadioGroup';

import {
  createSteps,
  createVaultSchema,
} from '@/components/vaults/create/constants/vaults.constants';

export const CreateVaultForm = () => {
  const [activeStep, setActiveStep] = useState(1);

  const formik = useFormik({
    initialValues: {
      vaultName: '',
      vaultType: 'multi',
      vaultPrivacy: 'public',
      vaultBrief: '',
    },
    validationSchema: createVaultSchema,
    onSubmit: (values) => {
      console.log(values);
    },
  });

  const handleStepClick = (stepNumber) => {
    setActiveStep(stepNumber);
  };

  return (
    <div className="flex">
      <div className="h-fit flex items-start bg-dark-600 p-4 rounded-[10px]">
        <div className="w-64 space-y-8">
          {createSteps.map((step, index) => (
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
                {index < createSteps.length - 1 && (
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
        <div className="mx-auto space-y-8 bg-[#0a0b1e] text-white">
          <form className="space-y-8" onSubmit={formik.handleSubmit}>
            <div className="space-y-2">
              <Label className="text-lg font-semibold" htmlFor="vaultName">
                VAULT NAME
              </Label>
              <Input
                className="bg-[#0a0b1e] border-[#2a2b3d] h-12"
                id="vaultName"
                name="vaultName"
                placeholder="Enter the name of your Vault"
                value={formik.values.vaultName}
                onChange={formik.handleChange}
              />
              {formik.errors.vaultName && (
                <div className="text-red-500">{formik.errors.vaultName}</div>
              )}
            </div>
            <LavaRadioGroup
              label="Vault type"
              name="vaultType"
              options={[
                { id: 'single', label: 'Single NFT' },
                { id: 'multi', label: 'Multi NFT' },
                { id: 'cnt', label: 'Any CNT' },
              ]}
              value={formik.values.vaultType}
              onChange={(value) => formik.setFieldValue('vaultType', value)}
            />
            <div className="space-y-2">
              <Label className="text-lg font-semibold" htmlFor="vaultBrief">
                VAULT BRIEF <span className="text-gray-400">(OPTIONAL)</span>
              </Label>
              <Textarea
                className="bg-[#0a0b1e] border-[#2a2b3d] min-h-32"
                id="vaultBrief"
                name="vaultBrief"
                placeholder="Add a description for your Vault"
                value={formik.values.vaultBrief}
                onChange={formik.handleChange}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
