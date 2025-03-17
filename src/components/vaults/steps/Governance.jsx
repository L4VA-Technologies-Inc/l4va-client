import { Info } from 'lucide-react';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { LavaRadio } from '@/components/shared/LavaRadio';
import { UploadZone } from '@/components/shared/LavaUploadZone';
import { LavaDatePicker } from '@/components/shared/LavaDatePicker';

export const Governance = ({
  data,
  errors = {},
  updateField,
}) => {
  const handleChange = (e) => {
    const { id, value } = e.target;
    updateField(id, value);
  };

  return (
    <div className="grid grid-cols-2">
      <div className="px-[36px]">
        <div>
          <Label className="uppercase text-[20px] font-bold" htmlFor="ftTokenSupply">
            FT TOKEN SUPPLY
          </Label>
          <Input
            className="rounded-[10px] py-4 pl-5 text-[20px] bg-input-bg border-dark-600 h-[60px] mt-4"
            id="ftTokenSupply"
            placeholder="XXX,XXX,XXX"
            style={{ fontSize: '20px' }}
            value={data.ftTokenSupply || ''}
            onChange={handleChange}
          />
          {errors.ftTokenSupply && (
            <p className="text-main-red mt-1">{errors.ftTokenSupply}</p>
          )}
        </div>

        <div className="mt-[60px]">
          <Label className="uppercase text-[20px] font-bold" htmlFor="ftTokenDecimals">
            FT TOKEN DECIMALS
          </Label>
          <Input
            className="rounded-[10px] py-4 pl-5 text-[20px] bg-input-bg border-dark-600 h-[60px] mt-4"
            id="ftTokenDecimals"
            placeholder="integer between 1-9"
            style={{ fontSize: '20px' }}
            value={data.ftTokenDecimals || ''}
            onChange={handleChange}
          />
          {errors.ftTokenDecimals && (
            <p className="text-main-red mt-1">{errors.ftTokenDecimals}</p>
          )}
        </div>

        <div className="mt-[60px]">
          <UploadZone
            image={data.ftTokenImage}
            label="FT Token Image"
            setImage={(image) => updateField('ftTokenImage', image)}
          />
          {errors.ftTokenImage && (
            <p className="text-main-red mt-1">{errors.ftTokenImage}</p>
          )}
        </div>

        {data.terminationType === 'programmed' && (
          <div className="mt-[60px]">
            <Label className="uppercase text-[20px] font-bold" htmlFor="ftTokenDescription">
              FT TOKEN DESCRIPTION
            </Label>
            <Textarea
              className="resize-none rounded-[10px] py-4 pl-5 text-[20px] bg-input-bg border-dark-600 mt-4 min-h-32"
              id="ftTokenDescription"
              placeholder="Add a description for your Token"
              style={{ fontSize: '20px' }}
              value={data.ftTokenDescription || ''}
              onChange={handleChange}
            />
            {errors.ftTokenDescription && (
              <p className="text-main-red mt-1">{errors.ftTokenDescription}</p>
            )}
          </div>
        )}
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
                TIME ELAPSED IS EQUAL TO TIME
                <Info className="ml-2 inline-block" color="white" size={16} />
              </Label>
              <div className="mt-4">
                <LavaDatePicker
                  value={data.timeElapsedIsEqualToTime}
                  onChange={(date) => updateField('timeElapsedIsEqualToTime', date)}
                />
                {errors.timeElapsedIsEqualToTime && (
                  <p className="text-main-red mt-1">{errors.timeElapsedIsEqualToTime}</p>
                )}
              </div>
            </div>

            <div className="mt-[60px]">
              <Label className="uppercase text-[20px] font-bold flex items-center" htmlFor="assetAppreciation">
                ASSET APPRECIATION %
                <Info className="ml-2 inline-block" color="white" size={16} />
              </Label>
              <div className="flex items-center mt-4">
                <span className="flex-shrink-0 text-dark-100 mr-4">Asset A</span>
                <Input
                  className="rounded-[10px] py-4 pl-5 text-[20px] bg-input-bg border-dark-600 h-[60px]"
                  id="assetAppreciation"
                  placeholder="XX.XX%"
                  style={{ fontSize: '20px' }}
                  value={data.assetAppreciation || ''}
                  onChange={handleChange}
                />
              </div>
              {errors.assetAppreciation && (
                <p className="text-main-red mt-1">{errors.assetAppreciation}</p>
              )}
            </div>
          </>
        )}

        {data.terminationType === 'dao' && (
          <>
            <div className="mt-[60px]">
              <Label className="uppercase text-[20px] font-bold flex items-center" htmlFor="creationThreshold">
                CREATION THRESHOLD %
                <Info className="ml-2 inline-block" color="white" size={16} />
              </Label>
              <Input
                className="rounded-[10px] py-4 pl-5 text-[20px] bg-input-bg border-dark-600 h-[60px] mt-4"
                id="creationThreshold"
                placeholder="XX.XX%"
                style={{ fontSize: '20px' }}
                value={data.creationThreshold || ''}
                onChange={handleChange}
              />
              {errors.creationThreshold && (
                <p className="text-main-red mt-1">{errors.creationThreshold}</p>
              )}
            </div>

            <div className="mt-[60px]">
              <Label className="uppercase text-[20px] font-bold flex items-center" htmlFor="startThreshold">
                START THRESHOLD %
                <Info className="ml-2 inline-block" color="white" size={16} />
              </Label>
              <Input
                className="rounded-[10px] py-4 pl-5 text-[20px] bg-input-bg border-dark-600 h-[60px] mt-4"
                id="startThreshold"
                placeholder="XX.XX%"
                style={{ fontSize: '20px' }}
                value={data.startThreshold || ''}
                onChange={handleChange}
              />
              {errors.startThreshold && (
                <p className="text-main-red mt-1">{errors.startThreshold}</p>
              )}
            </div>

            <div className="mt-[60px]">
              <Label className="uppercase text-[20px] font-bold flex items-center" htmlFor="voteThreshold">
                VOTE THRESHOLD %
                <Info className="ml-2 inline-block" color="white" size={16} />
              </Label>
              <Input
                className="rounded-[10px] py-4 pl-5 text-[20px] bg-input-bg border-dark-600 h-[60px] mt-4"
                id="voteThreshold"
                placeholder="XX.XX%"
                style={{ fontSize: '20px' }}
                value={data.voteThreshold || ''}
                onChange={handleChange}
              />
              {errors.voteThreshold && (
                <p className="text-main-red mt-1">{errors.voteThreshold}</p>
              )}
            </div>

            <div className="mt-[60px]">
              <Label className="uppercase text-[20px] font-bold flex items-center" htmlFor="executionThreshold">
                EXECUTION THRESHOLD %
                <Info className="ml-2 inline-block" color="white" size={16} />
              </Label>
              <Input
                className="rounded-[10px] py-4 pl-5 text-[20px] bg-input-bg border-dark-600 h-[60px] mt-4"
                id="executionThreshold"
                placeholder="XX.XX%"
                style={{ fontSize: '20px' }}
                value={data.executionThreshold || ''}
                onChange={handleChange}
              />
              {errors.executionThreshold && (
                <p className="text-main-red mt-1">{errors.executionThreshold}</p>
              )}
            </div>

            <div className="mt-[60px]">
              <Label className="uppercase text-[20px] font-bold flex items-center" htmlFor="cosigningThreshold">
                COSIGNING THRESHOLD %
              </Label>
              <Input
                className="rounded-[10px] py-4 pl-5 text-[20px] bg-input-bg border-dark-600 h-[60px] mt-4"
                id="cosigningThreshold"
                placeholder="XX.XX%"
                style={{ fontSize: '20px' }}
                value={data.cosigningThreshold || ''}
                onChange={handleChange}
              />
              {errors.cosigningThreshold && (
                <p className="text-main-red mt-1">{errors.cosigningThreshold}</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
