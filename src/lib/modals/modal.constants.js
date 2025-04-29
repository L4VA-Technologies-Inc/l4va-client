import { LoginModal } from '@/components/modals/LoginModal';
import { InvestModal } from '@/components/modals/InvestModal';
import { ProposalConfirmationModal } from '@/components/modals/ProposalConfirmationModal';
import { CreateProposalModal } from '@/components/modals/CreateProposalModal';
import { ContributeModal } from '@/components/modals/ContributeModal/ContributeModal';
import { ProfileModal } from '@/components/modals/ProfileModal';

export const MODAL_ENTRIES = [
  {
    name: 'LoginModal',
    Component: LoginModal,
  },
  {
    name: 'ProfileModal',
    Component: ProfileModal,
  },
  {
    name: 'InvestModal',
    Component: InvestModal,
  },
  {
    name: 'ProposalConfirmationModal',
    Component: ProposalConfirmationModal,
  },
  {
    name: 'CreateProposalModal',
    Component: CreateProposalModal,
  },
  {
    name: 'ContributeModal',
    Component: ContributeModal,
  },
];
