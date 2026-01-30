import { Info } from 'lucide-react';

import { Label } from '@/components/ui/label';
import { LavaRadio } from '@/components/shared/LavaRadio';
import { LavaInput } from '@/components/shared/LavaInput';
import { LavaIntervalPicker } from '@/components/shared/LavaIntervalPicker';
import { MAX_SUPPLY, TERMINATION_TYPE_OPTIONS } from '@/components/vaults/constants/vaults.constants';

export const Governance = ({ data, errors = {}, updateField }) => {
  const handlePercentageChange = value => {
    let numericValue = value.replace(/,/g, '.').replace(/[^0-9.]/g, '');

    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return null;
    }

    if (numericValue.startsWith('100') && numericValue.length > 3) {
      return null;
    }

    if (Number(numericValue) > 100) {
      return null;
    }

    if (parts[1] && parts[1].length > 1) {
      return null;
    }

    return numericValue;
  };

  const handleNumChange = e => {
    const { name, value } = e.target;

    const sanitizedValue = handlePercentageChange(value);

    if (sanitizedValue !== null) {
      if (sanitizedValue === '') {
        updateField(name, '');
        return;
      }

      if (parseFloat(sanitizedValue) > 100) {
        const limitedValue = Math.min(sanitizedValue, 100);
        updateField(name, +limitedValue);
      }

      if (parseFloat(sanitizedValue) <= 100) {
        updateField(name, sanitizedValue);
      }
    }
  };

  const handleMinOnePercentChange = e => {
    const { name, value } = e.target;

    const sanitizedValue = handlePercentageChange(value);

    if (sanitizedValue !== null) {
      if (sanitizedValue === '') {
        updateField(name, '');
        return;
      }

      const numValue = parseFloat(sanitizedValue);

      if (numValue > 0 && numValue < 1) {
        return;
      }

      if (numValue > 100) {
        const limitedValue = Math.min(sanitizedValue, 100);
        updateField(name, +limitedValue);
      }

      if (numValue >= 1 && numValue <= 100) {
        updateField(name, sanitizedValue);
      }
    }
  };

  const handleSupplyChange = e => {
    const { name, value } = e.target;
    const numericValue = value.replace(/[^0-9]/g, '');

    const numValue = parseInt(numericValue, 10);
    if (numValue <= 0 || numValue > MAX_SUPPLY) {
      return;
    }

    updateField(name, +numericValue);
  };

  return (
    <div className="my-16 grid grid-cols-1 md:grid-cols-2 gap-16">
      <div className="space-y-12">
        <div>
          <LavaInput
            error={errors.ftTokenSupply}
            label="VAULT TOKENS SUPPLY"
            name="ftTokenSupply"
            placeholder="XXX,XXX,XXX"
            value={data.ftTokenSupply || ''}
            onChange={handleSupplyChange}
          />
        </div>
      </div>
      <div className="space-y-12">
        <div>
          <div className="uppercase font-bold mb-4">TERMINATION TYPE</div>
          <LavaRadio
            name="terminationType"
            options={TERMINATION_TYPE_OPTIONS}
            value={data.terminationType || 'dao'}
            onChange={value => updateField('terminationType', value)}
          />
          {errors.terminationType && <p className="text-red-600 mt-1">{errors.terminationType}</p>}
        </div>
        {data.terminationType === 'programmed' && (
          <>
            <div>
              <Label className="uppercase font-bold" htmlFor="timeElapsedIsEqualToTime">
                *TIME ELAPSED IS EQUAL TO TIME
              </Label>
              <div className="mt-4">
                <LavaIntervalPicker
                  id="timeElapsedIsEqualToTime"
                  value={data.timeElapsedIsEqualToTime}
                  onChange={date => updateField('timeElapsedIsEqualToTime', date)}
                />
                {errors.timeElapsedIsEqualToTime && (
                  <p className="text-red-600 mt-1">{errors.timeElapsedIsEqualToTime}</p>
                )}
              </div>
            </div>

            <div>
              <LavaInput
                required
                error={errors.vaultAppreciation}
                icon={<Info color="white" size={16} />}
                label="VAULT APPRECIATION %"
                name="vaultAppreciation"
                placeholder="XX"
                suffix="%"
                value={data.vaultAppreciation || ''}
                onChange={handleNumChange}
              />
            </div>
          </>
        )}
        <>
          <div>
            <LavaInput
              required
              error={errors.creationThreshold}
              icon={<Info color="white" size={16} />}
              hint="Minimum Vault tokens held by user (as % of total supply) required to create a proposal. Set to 0% to allow anyone holding any vault token to create proposals."
              label="CREATION THRESHOLD (%)"
              name="creationThreshold"
              placeholder="XX"
              suffix="%"
              value={data.creationThreshold || ''}
              onChange={handleNumChange}
            />
          </div>
          {/*<div>*/}
          {/*  <LavaInput*/}
          {/*    required*/}
          {/*    error={errors.cosigningThreshold}*/}
          {/*    icon={<Info color="white" size={16} />}*/}
          {/*    hint="Minimum amount of VT that must be present in a stake for it to be able to cosign a transaction"*/}
          {/*    label="COSIGNING THRESHOLD (%)"*/}
          {/*    name="cosigningThreshold"*/}
          {/*    placeholder="XX"*/}
          {/*    suffix="%"*/}
          {/*    value={data.cosigningThreshold || ''}*/}
          {/*    onChange={handleNumChange}*/}
          {/*  />*/}
          {/*</div>*/}
          {/*<div>*/}
          {/*  <LavaInput*/}
          {/*    required*/}
          {/*    error={errors.startThreshold}*/}
          {/*    icon={<Info color="white" size={16} />}*/}
          {/*    hint="Minimum VT as % of total VT supply co-signed to start voting phase"*/}
          {/*    label="START THRESHOLD (%)"*/}
          {/*    name="startThreshold"*/}
          {/*    placeholder="XX"*/}
          {/*    suffix="%"*/}
          {/*    value={data.startThreshold || ''}*/}
          {/*    onChange={handleNumChange}*/}
          {/*  />*/}
          {/*</div>*/}
          <div>
            <LavaInput
              required
              error={errors.voteThreshold}
              icon={<Info color="white" size={16} />}
              hint="Minimum Vault tokens used to vote in proposals (as % of total supply) required for vote to be valid. If less, the proposal automatically fails. Minimum 1%."
              label="Vote Quorum Threshold (%)"
              name="voteThreshold"
              placeholder="XX"
              suffix="%"
              value={data.voteThreshold || ''}
              onChange={handleMinOnePercentChange}
            />
          </div>
          <div>
            <LavaInput
              required
              error={errors.executionThreshold}
              icon={<Info color="white" size={16} />}
              hint="Minimum Vault tokens votes for a given proposal option (as % of total votes) for a proposal to be approved. Minimum 1%."
              label="Approval Threshold (%)"
              name="executionThreshold"
              placeholder="XX"
              suffix="%"
              value={data.executionThreshold || ''}
              onChange={handleMinOnePercentChange}
            />
          </div>
        </>
      </div>
    </div>
  );
};
