import { CircleX, Send } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { useModalControls } from '@/lib/modals/modal.context';
import SecondaryButton from '@/components/shared/SecondaryButton.js';
import { LavaSteelInput } from '@/components/shared/LavaInput.jsx';
import { CoreApiProvider } from '@/services/api/core';

export const EmailModal = () => {
  const [email, setEmail] = useState('');

  const { closeModal } = useModalControls();

  const handleSaveEmail = async () => {
    if (!email.trim()) {
      toast.error('Please enter a valid email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      await CoreApiProvider.updateProfile({ email });
      toast.success('Email saved successfully!');
      closeModal();
    } catch {
      toast.error('Failed to save email. Please try again.');
    }
  };

  return (
    <ModalWrapper isOpen title="Email" onClose={closeModal} size="md">
      <div className="flex flex-col space-y-4">
        <LavaSteelInput
          label="Enter your email to receive notifications about vault statuses and rewards"
          placeholder="Email"
          value={email}
          onChange={value => setEmail(value)}
        />

        <p className="text-sm text-gray-400 text-center">
          You can add or change your email anytime later in your{' '}
          <span className="text-gray-200 font-medium">profile settings</span>.
        </p>

        <SecondaryButton className="w-full justify-center gap-3 text-left" onClick={handleSaveEmail}>
          <Send size={20} />
          Save
        </SecondaryButton>
        <SecondaryButton
          className="w-full justify-center gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/30"
          onClick={closeModal}
        >
          <CircleX size={20} />
          Close
        </SecondaryButton>
      </div>
    </ModalWrapper>
  );
};
