import { Info } from 'lucide-react';

import { Label } from '@/components/ui/label';

import { LavaRadio } from '@/components/shared/LavaRadio';
import { UploadZone } from '@/components/shared/LavaUploadZone';
import { LavaInput } from '@/components/shared/LavaInput';
import { LavaIntervalPicker } from '@/components/shared/LavaIntervalPicker';

export const Governance = ({
  data,
  errors = {},
  updateField,
}) => {
  const handleNumChange = (e) => {
    const { name, value } = e.target;
    const numericValue = value.replace(/[^0-9.]/g, '');
    const parts = numericValue.split('.');
    const sanitizedValue = parts.length > 2 ? `${parts[0]}.${parts[1]}` : numericValue;

    if (parts.length === 2 && parts[1].length > 2) {
      return;
    }

    const numValue = parseFloat(sanitizedValue);
    if (!isNaN(numValue) && numValue > 100) {
      return;
    }

    updateField(name, sanitizedValue);
  };

  const handleSupplyChange = (e) => {
    const { name, value } = e.target;
    const numericValue = value.replace(/[^0-9]/g, '');

    const numValue = parseInt(numericValue, 10);
    if (numValue <= 0 || numValue > 100000000) {
      return;
    }

    updateField(name, numericValue);
  };

  const handleDecimalsChange = (e) => {
    const { name, value } = e.target;
    const numericValue = value.replace(/[^0-9]/g, '');

    const numValue = parseInt(numericValue, 10);
    if (numValue < 1 || numValue > 9) {
      return;
    }

    updateField(name, numericValue);
  };

  return (
    <div className="grid grid-cols-2">
      <div className="px-[36px]">
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
        <div className="mt-[60px]">
          <LavaInput
            error={errors.ftTokenDecimals}
            label="FT TOKEN DECIMALS"
            name="ftTokenDecimals"
            placeholder="Integer between 1-9"
            value={data.ftTokenDecimals || ''}
            onChange={handleDecimalsChange}
          />
        </div>
        <div className="mt-[60px]">
          <UploadZone
            image={data.ftTokenImg}
            label="FT Token Image"
            setImage={(image) => updateField('ftTokenImg', image)}
          />
          {errors.ftTokenImg && (
            <p className="text-main-red mt-1">{errors.ftTokenImg}</p>
          )}
        </div>
      </div>
      <div className="px-[36px]">
        <div>
          <div className="uppercase text-[20px] font-bold mb-4">
            TERMINATION TYPE
          </div>
          <LavaRadio
            name="terminationType"
            options={[
              { name: 'dao', label: 'DAO' },
              { name: 'programmed', label: 'Programmed' },
            ]}
            value={data.terminationType || 'dao'}
            onChange={(value) => updateField('terminationType', value)}
          />
          {errors.terminationType && (
            <p className="text-main-red mt-1">{errors.terminationType}</p>
          )}
        </div>
        {data.terminationType === 'programmed' && (
          <>
            <div className="mt-[60px]">
              <Label className="uppercase text-[20px] font-bold flex items-center" htmlFor="timeElapsedIsEqualToTime">
                *TIME ELAPSED IS EQUAL TO TIME
                <Info className="ml-2 inline-block" color="white" size={16} />
              </Label>
              <div className="mt-4">
                <LavaIntervalPicker
                  value={data.timeElapsedIsEqualToTime}
                  onChange={(date) => updateField('timeElapsedIsEqualToTime', date)}
                />
                {errors.timeElapsedIsEqualToTime && (
                  <p className="text-main-red mt-1">{errors.timeElapsedIsEqualToTime}</p>
                )}
              </div>
            </div>

            <div className="mt-[60px]">
              <LavaInput
                required
                error={errors.vaultAppreciation}
                icon={<Info color="white" size={16} />}
                label="VAULT APPRECIATION %"
                name="vaultAppreciation"
                placeholder="XX.XX%"
                value={data.vaultAppreciation || ''}
                onChange={handleNumChange}
              />
            </div>
          </>
        )}

        {data.terminationType === 'dao' && (
          <>
            <div className="mt-[60px]">
              <LavaInput
                error={errors.creationThreshold}
                icon={<Info color="white" size={16} />}
                label="CREATION THRESHOLD %"
                name="creationThreshold"
                placeholder="XX.XX%"
                value={data.creationThreshold || ''}
                onChange={handleNumChange}
              />
            </div>

            <div className="mt-[60px]">
              <LavaInput
                error={errors.startThreshold}
                icon={<Info color="white" size={16} />}
                label="START THRESHOLD %"
                name="startThreshold"
                placeholder="XX.XX%"
                value={data.startThreshold || ''}
                onChange={handleNumChange}
              />
            </div>

            <div className="mt-[60px]">
              <LavaInput
                error={errors.voteThreshold}
                icon={<Info color="white" size={16} />}
                label="VOTE THRESHOLD %"
                name="voteThreshold"
                placeholder="XX.XX%"
                value={data.voteThreshold || ''}
                onChange={handleNumChange}
              />
            </div>

            <div className="mt-[60px]">
              <LavaInput
                error={errors.executionThreshold}
                icon={<Info color="white" size={16} />}
                label="EXECUTION THRESHOLD %"
                name="executionThreshold"
                placeholder="XX.XX%"
                value={data.executionThreshold || ''}
                onChange={handleNumChange}
              />
            </div>

            <div className="mt-[60px]">
              <LavaInput
                error={errors.cosigningThreshold}
                label="COSIGNING THRESHOLD %"
                name="cosigningThreshold"
                placeholder="XX.XX%"
                value={data.cosigningThreshold || ''}
                onChange={handleNumChange}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
