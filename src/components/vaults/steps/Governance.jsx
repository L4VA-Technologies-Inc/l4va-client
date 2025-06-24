import { Info } from 'lucide-react';

import { Label } from '@/components/ui/label';
import { LavaRadio } from '@/components/shared/LavaRadio';
import { UploadZone } from '@/components/shared/LavaUploadZone';
import { LavaInput } from '@/components/shared/LavaInput';
import { LavaIntervalPicker } from '@/components/shared/LavaIntervalPicker';
import { TERMINATION_TYPE_OPTIONS } from '@/components/vaults/constants/vaults.constants';

export const Governance = ({ data, errors = {}, updateField }) => {
  const handlePercentageChange = value => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    const parts = numericValue.split('.');
    const sanitizedValue = parts.length > 2 ? `${parts[0]}.${parts[1]}` : numericValue;

    if (parts.length === 2 && parts[1].length > 2) {
      return null;
    }

    return sanitizedValue === '' ? '' : +sanitizedValue;
  };

  const handleNumChange = e => {
    const { name, value } = e.target;
    const sanitizedValue = handlePercentageChange(value);
    if (sanitizedValue !== null) {
      updateField(name, +sanitizedValue);
    }
  };

  const handleSupplyChange = e => {
    const { name, value } = e.target;
    const numericValue = value.replace(/[^0-9]/g, '');

    const numValue = parseInt(numericValue, 10);
    if (numValue <= 0 || numValue > 100000000) {
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
            label="FT TOKEN SUPPLY"
            name="ftTokenSupply"
            placeholder="XXX,XXX,XXX"
            value={data.ftTokenSupply || ''}
            onChange={handleSupplyChange}
          />
        </div>
        <div>
          <UploadZone
            required
            image={data.ftTokenImg}
            label="FT Token Image"
            setImage={image => updateField('ftTokenImg', image)}
          />
          {errors.ftTokenImg && <p className="text-red-600 mt-1">{errors.ftTokenImg}</p>}
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
                placeholder="XX.XX"
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
              hint="Minimum FT as % of total FT supply required to create a proposal"
              label="CREATION THRESHOLD (%)"
              name="creationThreshold"
              placeholder="XX.XX"
              suffix="%"
              value={data.creationThreshold || ''}
              onChange={handleNumChange}
            />
          </div>
          <div>
            <LavaInput
              required
              error={errors.startThreshold}
              icon={<Info color="white" size={16} />}
              hint="Minimum FT as % of total FT supply co-signed to start voting phase"
              label="START THRESHOLD (%)"
              name="startThreshold"
              placeholder="XX.XX"
              suffix="%"
              value={data.startThreshold || ''}
              onChange={handleNumChange}
            />
          </div>
          <div>
            <LavaInput
              required
              error={errors.voteThreshold}
              icon={<Info color="white" size={16} />}
              hint="Minimum FT as % of total staked FT for vote to be valid"
              label="VOTE THRESHOLD (%)"
              name="voteThreshold"
              placeholder="XX.XX"
              suffix="%"
              value={data.voteThreshold || ''}
              onChange={handleNumChange}
            />
          </div>
          <div>
            <LavaInput
              required
              error={errors.executionThreshold}
              icon={<Info color="white" size={16} />}
              hint="Minimum FT as % of total FT voted, for the largest vote tallied for proposal to win"
              label="EXECUTION THRESHOLD (%)"
              name="executionThreshold"
              placeholder="XX.XX"
              suffix="%"
              value={data.executionThreshold || ''}
              onChange={handleNumChange}
            />
          </div>
          <div>
            <LavaInput
              required
              error={errors.cosigningThreshold}
              icon={<Info color="white" size={16} />}
              hint="Minimum amount of FT that must be present in a stake for it to be able to cosign a transaction"
              label="COSIGNING THRESHOLD (%)"
              name="cosigningThreshold"
              placeholder="XX.XX"
              suffix="%"
              value={data.cosigningThreshold || ''}
              onChange={handleNumChange}
            />
          </div>
        </>
      </div>
    </div>
  );
};
