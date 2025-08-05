import { ChevronLeft } from 'lucide-react';

import SecondaryButton from '../shared/SecondaryButton';

import PrimaryButton from '@/components/shared/PrimaryButton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const ProposalConfirmationModal = ({ onClose, proposalData, onConfirm }) => {
  const { proposalTitle, proposalDescription, options, abstain, proposalEndDate } = proposalData;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl p-0 bg-steel-950 border-none max-h-[90vh] flex flex-col">
        <DialogHeader className="py-2 bg-white/5 rounded-t-lg">
          <DialogTitle className="text-2xl text-center font-medium">Confirm</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 flex flex-col gap-8">
            <div>
              <h3 className="text-xl font-medium mb-2">Proposal Title</h3>
              <p className="text-white/80">{proposalTitle}</p>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-2">Description</h3>
              <p className="text-white/80">{proposalDescription}</p>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-4">Options</h3>
              <div className="space-y-4">
                {options.map((option, index) => (
                  <div key={option.id} className="border border-white/20 p-4 rounded-lg">
                    <h4 className="text-lg font-medium mb-2">Option {index + 1}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-white/60 text-sm">Asset Name</p>
                        <p className="text-white/80">{option.assetName}</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">Exec</p>
                        <p className="text-white/80">{option.exec}</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">Quantity</p>
                        <p className="text-white/80">{option.quantity}</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">Sell Type</p>
                        <p className="text-white/80">{option.sellType}</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">Method</p>
                        <p className="text-white/80">{option.method}</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">Duration</p>
                        <p className="text-white/80">{option.duration}</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">Market</p>
                        <p className="text-white/80">{option.market}</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">Price</p>
                        <p className="text-white/80">{option.price}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-2">Abstain</h3>
              <p className="text-white/80">{abstain ? 'Yes' : 'No'}</p>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-2">Proposal End Date</h3>
              <p className="text-white/80">{proposalEndDate}</p>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-white/10">
          <div className="flex justify-center gap-4">
            <SecondaryButton onClick={onClose}>
              <ChevronLeft size={24} />
            </SecondaryButton>
            <PrimaryButton className="uppercase" onClick={onConfirm}>
              Confirm & Launch
            </PrimaryButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
