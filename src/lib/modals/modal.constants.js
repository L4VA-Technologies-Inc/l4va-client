import { LoginModal } from '@/components/modals/LoginModal';
import { AcquireModal } from '@/components/modals/AcquireModal';
import { ProposalConfirmationModal } from '@/components/modals/ProposalConfirmationModal';
import { CreateProposalModal } from '@/components/modals/CreateProposalModal';
import { ContributeModal } from '@/components/modals/ContributeModal/ContributeModal';
import { ProfileModal } from '@/components/modals/ProfileModal';
import { VaultFiltersModal } from '@/components/modals/VaultFiltersModal';
import { ChartModal } from '@/components/modals/ChartModal';

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
    name: 'AcquireModal',
    Component: AcquireModal,
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
  {
    name: 'VaultFiltersModal',
    Component: VaultFiltersModal,
  },
  {
    name: 'ChartModal',
    Component: ChartModal,
  },
];
