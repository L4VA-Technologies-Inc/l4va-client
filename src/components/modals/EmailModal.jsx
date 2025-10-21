import { CircleX, Send } from 'lucide-react';
import { useState } from 'react';

import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { useModalControls } from '@/lib/modals/modal.context';
import { useAuth } from '@/lib/auth/auth';
import SecondaryButton from '@/components/shared/SecondaryButton.js';
import { LavaSteelInput } from '@/components/shared/LavaInput.jsx';

export const EmailModal = () => {
  const [email, setEmail] = useState('');

  const { closeModal } = useModalControls();
  const { user } = useAuth();

  const handleSaveEmail = () => {
    console.log(user.id);
    closeModal();
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
