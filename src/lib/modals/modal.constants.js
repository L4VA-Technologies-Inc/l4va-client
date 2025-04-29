import { InvestModal } from '@/components/modals/InvestModal';
import { ProposalConfirmationModal } from '@/components/modals/ProposalConfirmationModal';
import { CreateProposalModal } from '@/components/modals/CreateProposalModal';
import { ContributeModal } from '@/components/modals/ContributeModal/ContributeModal';

export const MODAL_ENTRIES = [
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
