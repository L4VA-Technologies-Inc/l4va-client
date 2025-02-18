import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';

import { VaultsApiProvider } from '@/services/api/vaults';

import { PrimaryButton } from '@/components/shared/PrimaryButton';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { LavaRadioGroup } from '@/components/shared/LavaRadioGroup';

import {
  createSteps,
  createVaultSchema,
} from '@/components/vaults/constants/vaults.constants';

export const CreateVaultForm = () => {
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: '',
      type: 'multi',
      privacy: 'public',
      description: '',
    },
    validationSchema: createVaultSchema,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);

        await VaultsApiProvider.createVault({
          name: values.name,
          type: values.type,
          privacy: values.privacy,
          description: values.description,
        });
        navigate('/vaults');
      } catch (error) {
        console.error('Error creating vault:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleStepClick = (stepNumber) => {
    setActiveStep(stepNumber);
  };

  const shouldShowError = (fieldName) => formik.touched[fieldName] && formik.errors[fieldName];

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
              <Label className="text-lg font-semibold" htmlFor="name">
                VAULT NAME
              </Label>
              <Input
                className="bg-[#0a0b1e] border-[#2a2b3d] h-12"
                id="name"
                name="name"
                placeholder="Enter the name of your Vault"
                value={formik.values.name}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
              />
              {shouldShowError('name') && (
                <div className="text-main-red">{formik.errors.name}</div>
              )}
            </div>
            <LavaRadioGroup
              label="Vault type"
              name="type"
              options={[
                { id: 'single', label: 'Single NFT' },
                { id: 'multi', label: 'Multi NFT' },
                { id: 'cnt', label: 'Any CNT' },
              ]}
              value={formik.values.type}
              onBlur={() => formik.setFieldTouched('type')}
              onChange={(value) => formik.setFieldValue('type', value)}
            />
            <LavaRadioGroup
              label="Vault privacy"
              name="privacy"
              options={[
                { id: 'private', label: 'Private Vault' },
                { id: 'public', label: 'Public Vault' },
                { id: 'semi-private', label: 'Semi-Private Vault' },
              ]}
              value={formik.values.privacy}
              onBlur={() => formik.setFieldTouched('privacy')}
              onChange={(value) => formik.setFieldValue('privacy', value)}
            />
            <div className="space-y-2">
              <Label className="text-lg font-semibold" htmlFor="description">
                VAULT BRIEF <span className="text-gray-400">(OPTIONAL)</span>
              </Label>
              <Textarea
                className="bg-[#0a0b1e] border-[#2a2b3d] min-h-32"
                id="description"
                name="description"
                placeholder="Add a description for your Vault"
                value={formik.values.description}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
              />
            </div>
            <div className="flex justify-end">
              <PrimaryButton
                disabled={isSubmitting || !formik.isValid}
                type="submit"
              >
                {isSubmitting ? 'Creating...' : 'Create Vault'}
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
