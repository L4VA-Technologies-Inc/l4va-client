import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { LavaSteelInput } from '@/components/shared/LavaInput';
import { LavaSteelTextarea } from '@/components/shared/LavaTextarea';
import { LavaSteelSelect } from '@/components/shared/LavaSelect';
import { LavaCheckbox } from '@/components/shared/LavaCheckbox';
import { LavaDatePicker } from '@/components/shared/LavaDatePicker';
import { PrimaryButton } from '@/components/shared/PrimaryButton';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const CreateProposalModal = ({ isOpen, onClose, vaultName }) => {
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalDescription, setProposalDescription] = useState('');
  const [options, setOptions] = useState([]);
  const [abstain, setAbstain] = useState(false);
  const [proposalEndDate, setProposalEndDate] = useState('');
  const [executionOption, setExecutionOption] = useState('');

  const handleAddOption = () => {
    setOptions([...options, {
      id: Date.now(),
      assetName: '',
      exec: '',
      quantity: '',
      sellType: '',
      method: '',
      duration: '',
      market: '',
      price: '',
    }]);
  };

  const handleRemoveOption = (id) => {
    setOptions(options.filter(option => option.id !== id));
  };

  const handleOptionChange = (id, field, value) => {
    setOptions(options.map(option =>
      option.id === id ? { ...option, [field]: value } : option,
    ));
  };

  const executionOptions = [
    { value: 'buying-selling', label: 'Buying/Selling' },
    { value: 'staking', label: 'Staking' },
    { value: 'distributing', label: 'Distributing' },
    { value: 'terminating', label: 'Terminating' },
  ];

  const execOptions = [
    { value: 'SELL', label: 'SELL' },
    { value: 'BUY', label: 'BUY' },
  ];

  const methodOptions = [
    { value: 'N/A', label: 'N/A' },
  ];

  const marketOptions = [
    { value: 'WayUp', label: 'WayUp' },
  ];

  const sellTypeOptions = [
    { value: 'List', label: 'List' },
    { value: 'Market', label: 'Market' },
  ];

  const assetOptions = [
    { value: 'Derplings', label: 'Derplings' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl p-0 bg-steel-950 border-none">
        <DialogHeader className="py-2 bg-white/5 rounded-t-lg">
          <DialogTitle className="text-2xl text-center font-medium">
            Proposal for {vaultName}
          </DialogTitle>
        </DialogHeader>
        <div className="p-6 flex flex-col gap-8">
          <LavaSteelInput
            label="Proposal Title"
            placeholder="Enter proposal title"
            value={proposalTitle}
            onChange={(e) => setProposalTitle(e.target.value)}
          />
          <LavaSteelTextarea
            label="Proposal Description"
            placeholder="Enter proposal description"
            value={proposalDescription}
            onChange={(e) => setProposalDescription(e.target.value)}
          />
          <div>
            <div>
              <p className="text-[20px] font-medium mb-4">
                Execution Options
              </p>
              <div className="flex items-center justify-between mb-4">
                <LavaSteelSelect
                  options={executionOptions}
                  placeholder="Buying/Selling"
                  value={executionOption}
                  onChange={(value) => setExecutionOption(value)}
                />
                <button
                  className="flex items-center gap-2 bg-steel-850 hover:bg-steel-850/70 text-white/60 px-4 py-2 rounded-lg transition-colors"
                  type="button"
                  onClick={handleAddOption}
                >
                  Add Option
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            {options.length === 0 ? (
              <p className="text-center text-white/60 py-8">Start by clicking Add option</p>
            ) : (
              <div className="space-y-8">
                {options.map((option, index) => (
                  <div key={option.id} className="relative border border-white/60 p-6 rounded-[10px]">
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-[20px] font-medium">Option {index + 1}</p>
                      <button
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm px-3 py-1 rounded-md flex items-center gap-1.5 transition-colors"
                        type="button"
                        onClick={() => handleRemoveOption(option.id)}
                      >
                        <X className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <p className="font-medium mb-2">Asset Name:</p>
                        <LavaSteelSelect
                          options={assetOptions}
                          placeholder="Select asset"
                          value={option.assetName}
                          onChange={(value) => handleOptionChange(option.id, 'assetName', value)}
                        />
                      </div>
                      <div>
                        <p className="font-medium mb-2">Exec:</p>
                        <LavaSteelSelect
                          options={execOptions}
                          placeholder="Select type"
                          value={option.exec}
                          onChange={(value) => handleOptionChange(option.id, 'exec', value)}
                        />
                      </div>
                      <div>
                        <p className="font-medium mb-2">Quantity</p>
                        <LavaSteelInput
                          placeholder="Enter quantity"
                          value={option.quantity}
                          onChange={(value) => handleOptionChange(option.id, 'quantity', value)}
                        />
                      </div>
                      <div>
                        <p className="font-medium mb-2">Sell Type</p>
                        <LavaSteelSelect
                          options={sellTypeOptions}
                          placeholder="Select type"
                          value={option.sellType}
                          onChange={(value) => handleOptionChange(option.id, 'sellType', value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="font-medium mb-2">Method</p>
                        <LavaSteelSelect
                          options={methodOptions}
                          placeholder="Select method"
                          value={option.method}
                          onChange={(value) => handleOptionChange(option.id, 'method', value)}
                        />
                      </div>
                      <div>
                        <p className="font-medium mb-2">Duration</p>
                        <LavaSteelInput
                          placeholder="Enter duration"
                          value={option.duration}
                          onChange={(value) => handleOptionChange(option.id, 'duration', value)}
                        />
                      </div>
                      <div>
                        <p className="font-medium mb-2">Market</p>
                        <LavaSteelSelect
                          options={marketOptions}
                          placeholder="Select market"
                          value={option.market}
                          onChange={(value) => handleOptionChange(option.id, 'market', value)}
                        />
                      </div>
                      <div>
                        <p className="font-medium mb-2">Price</p>
                        <LavaSteelInput
                          placeholder="Enter price"
                          value={option.price}
                          onChange={(value) => handleOptionChange(option.id, 'price', value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <LavaCheckbox
            checked={abstain}
            label="Abstain"
            onChange={(e) => setAbstain(e.target.checked)}
          />
          <div>
            <p className="text-[20px] font-medium mb-4">Proposal Start</p>
            <LavaDatePicker
              className="bg-steel-900"
              value={proposalEndDate}
              onChange={(value) => setProposalEndDate(value)}
            />
          </div>
          <div className="flex justify-center">
            <PrimaryButton
              className="uppercase"
              disabled={options.length <= 1}
              onClick={() => {
                // Handle proposal creation
                console.log('Creating proposal:', {
                  proposalTitle,
                  proposalDescription,
                  options,
                  abstain,
                  proposalEndDate,
                });
              }}
            >
              Propose
            </PrimaryButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};