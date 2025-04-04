import { useState } from 'react';
import { LavaCheckbox } from '../shared/LavaCheckbox';
import { LavaDatePicker } from '../shared/LavaDatePicker';
import { LavaInput } from '@/components/shared/LavaInput';
import { LavaTextarea } from '@/components/shared/LavaTextarea';
import { LavaSelect } from '@/components/shared/LavaSelect';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const CreateProposalModal = ({ isOpen, onClose, vaultName }) => {
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalDescription, setProposalDescription] = useState('');
  const [executionOptions, setExecutionOptions] = useState([
    {
      label: 'Staking',
      value: 'staking',
    },
    {
      label: 'Distributing',
      value: 'distributing',
    },
    {
      label: 'Terminating',
      value: 'terminating',
    },
  ]);

  const [assetName, setAssetName] = useState('');
  const [execType, setExecType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [method, setMethod] = useState('');
  const [duration, setDuration] = useState('');
  const [market, setMarket] = useState('');
  const [price, setPrice] = useState('');
  const [sellType, setSellType] = useState('');
  const [abstain, setAbstain] = useState(false);
  const [proposalEndDate, setProposalEndDate] = useState('');

  const execOptions = [
    { value: 'BUY', label: 'BUY' },
    { value: 'SELL', label: 'SELL' },
  ];

  const methodOptions = [
    { value: 'GTC', label: 'GTC' },
  ];

  const marketOptions = [
    { value: 'Dex hunter list', label: 'Dex hunter list' },
  ];

  const sellTypeOptions = [
    { value: 'Market', label: 'Market' },
    { value: 'Limit', label: 'Limit' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl p-0 bg-[#181a2a] text-white border-none">
        <DialogHeader className="py-2 bg-white/5 rounded-t-lg">
          <DialogTitle className="text-2xl text-center font-medium">Proposal for {vaultName}</DialogTitle>
        </DialogHeader>
        <div className="p-6 flex flex-col gap-8">
          <div>
            <p className="text-[20px] font-medium">Proposal Title</p>
            <LavaInput
              className="bg-steel-850"
              placeholder="Enter proposal title"
              value={proposalTitle}
              onChange={(e) => setProposalTitle(e.target.value)}
            />
          </div>
          <div>
            <p className="text-[20px] font-medium">Proposal Description</p>
            <LavaTextarea
              className="bg-steel-850"
              placeholder="Enter proposal description"
              value={proposalDescription}
              onChange={(e) => setProposalDescription(e.target.value)}
            />
          </div>
          <div>
            <p className="text-[20px] font-medium">Execution Options</p>
            <LavaSelect
              className="bg-steel-850"
              options={executionOptions}
              placeholder="Select execution options"
              onChange={(e) => setExecutionOptions(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-8">
            <p className="text-[20px] font-medium">Option 1</p>
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-1">
                <p className="font-medium mb-2">Asset Name:</p>
                <LavaSelect
                  className="bg-steel-850"
                  options={[{ value: 'SNEK', label: 'SNEK' }]}
                  placeholder="Select asset"
                  value={assetName}
                  onChange={(value) => setAssetName(value)}
                />
              </div>
              <div className="col-span-1">
                <p className="font-medium mb-2">Exec:</p>
                <LavaSelect
                  className="bg-steel-850"
                  options={execOptions}
                  placeholder="Select type"
                  value={execType}
                  onChange={(value) => setExecType(value)}
                />
              </div>
              <div className="col-span-1">
                <p className="font-medium mb-2">Quantity</p>
                <LavaInput
                  className="bg-steel-850"
                  placeholder="Enter quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <div className="col-span-1">
                <p className="font-medium mb-2">Sell Type</p>
                <LavaSelect
                  className="bg-steel-850"
                  options={sellTypeOptions}
                  placeholder="Select type"
                  value={sellType}
                  onChange={(value) => setSellType(value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-1">
                <p className="font-medium mb-2">Method</p>
                <LavaSelect
                  className="bg-steel-850"
                  options={methodOptions}
                  placeholder="Select method"
                  value={method}
                  onChange={(value) => setMethod(value)}
                />
              </div>
              <div className="col-span-1">
                <p className="font-medium mb-2">Duration</p>
                <LavaInput
                  className="bg-steel-850"
                  placeholder="Enter duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
              <div className="col-span-1">
                <p className="font-medium mb-2">Market</p>
                <LavaSelect
                  className="bg-steel-850"
                  options={marketOptions}
                  placeholder="Select market"
                  value={market}
                  onChange={(value) => setMarket(value)}
                />
              </div>
              <div className="col-span-1">
                <p className="font-medium mb-2">Price</p>
                <LavaInput
                  className="bg-steel-850"
                  placeholder="Enter price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div>
            <p className="text-[20px] font-medium mb-4">Option 2</p>
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-1">
                <p className="font-medium mb-2">No</p>
              </div>
            </div>
          </div>
          <LavaCheckbox
            label="Abstain"
            value={abstain}
            onChange={(e) => setAbstain(e.target.value)}
          />
          <div>
            <p className="text-[20px] font-medium mb-4">Proposal Start</p>
            <LavaDatePicker
              className="bg-steel-850"
              value={proposalEndDate}
              onChange={(e) => setProposalEndDate(e.target.value)}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};