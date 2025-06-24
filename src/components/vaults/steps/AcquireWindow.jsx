import { addMilliseconds } from 'date-fns';

import { Label } from '@/components/ui/label';
import { LavaRadio } from '@/components/shared/LavaRadio';
import { LavaDatePicker } from '@/components/shared/LavaDatePicker';
import { LavaWhitelist } from '@/components/shared/LavaWhitelist';
import { LavaIntervalPicker } from '@/components/shared/LavaIntervalPicker';
import { LavaInput } from '@/components/shared/LavaInput';
import {
  VAULT_PRIVACY_TYPES,
  RESERVE_HINT,
  LIQUIDITY_POOL_CONTRIBUTION_HINT,
} from '@/components/vaults/constants/vaults.constants';

export const AcquireWindow = ({ data, errors = {}, updateField }) => {
  const vaultPrivacy = data.privacy;

  const handleChange = e => {
    const { name, value } = e.target;
    const numericValue = value.replace(/[^0-9.]/g, '');

    const parts = numericValue.split('.');
    const sanitizedValue = parts.length > 2 ? `${parts[0]}.${parts[1]}` : numericValue;

    if (parts.length === 2 && parts[1].length > 2) {
      return;
    }

    updateField(name, sanitizedValue === '' ? '' : +sanitizedValue);
  };

  const getMinAcquireDate = () => {
    if (data.contributionOpenWindowType === 'custom') {
      return addMilliseconds(new Date(data.contributionOpenWindowTime), data.contributionDuration);
    }
    return null;
  };

  const minDate = getMinAcquireDate();

  return (
    <div className="my-16 grid grid-cols-1 md:grid-cols-2 gap-16">
      <div className="space-y-12">
        {vaultPrivacy === VAULT_PRIVACY_TYPES.PUBLIC ? null : (
          <div>
            <LavaWhitelist
              required
              allowCsv
              csvData={data.acquirersWhitelistCsv}
              itemFieldName="walletAddress"
              itemPlaceholder="Wallet address"
              label="Acquirer whitelist"
              setCsvData={csvData => updateField('acquirersWhitelistCsv', csvData)}
              setWhitelist={assets => updateField('acquirersWhitelist', assets)}
              whitelist={data.acquirersWhitelist || []}
            />
            {errors.acquirersWhitelist && <p className="text-red-600 mt-1">{errors.acquirersWhitelist}</p>}
          </div>
        )}
        <div>
          <Label className="uppercase font-bold" htmlFor="acquireWindowDuration">
            *ACQUIRE WINDOW DURATION
          </Label>
          <div className="mt-4">
            <LavaIntervalPicker
              value={data.acquireWindowDuration}
              onChange={date => updateField('acquireWindowDuration', date)}
            />
            {errors.acquireWindowDuration && <p className="text-red-600 mt-1">{errors.acquireWindowDuration}</p>}
          </div>
        </div>
        <div>
          <div className="uppercase font-bold">*ACQUIRE WINDOW OPEN TIME</div>
          <div className="mt-4">
            <LavaRadio
              name="acquireOpenWindowType"
              options={[
                {
                  name: 'upon-asset-window-closing',
                  label: 'Upon Asset Window Closing',
                },
                {
                  name: 'custom',
                  label: 'Custom',
                },
              ]}
              value={data.acquireOpenWindowType || ''}
              onChange={value => updateField('acquireOpenWindowType', value)}
            />
            {errors.acquireOpenWindowType && <p className="text-red-600 mt-1">{errors.acquireOpenWindowType}</p>}
            {data.acquireOpenWindowType === 'custom' && (
              <div className="mt-4">
                <LavaDatePicker
                  minDate={minDate}
                  value={data.acquireOpenWindowTime}
                  onChange={date => updateField('acquireOpenWindowTime', date)}
                />
                {errors.acquireOpenWindowTime && <p className="text-red-600 mt-1">{errors.acquireOpenWindowTime}</p>}
                {minDate && (
                  <p className="text-orange-500 mt-1">Cannot be earlier than {minDate.toLocaleDateString()}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="space-y-12">
        <div>
          <LavaInput
            required
            error={errors.tokensForAcquires}
            label="TOKENS FOR ACQUIRES (%)"
            name="tokensForAcquires"
            placeholder="XX.XX"
            suffix="%"
            type="text"
            value={data.tokensForAcquires || ''}
            onChange={handleChange}
            hint="The percentage (%) of total tokens minted which will be received by Acquirers when Vault locks; while asset Contributors will receive 100% minus this amount."
          />
        </div>
        <div>
          <LavaInput
            required
            error={errors.acquireReserve}
            label="RESERVE (%)"
            name="acquireReserve"
            placeholder="XX.XX"
            suffix="%"
            type="text"
            value={data.acquireReserve || ''}
            onChange={handleChange}
            hint={RESERVE_HINT}
          />
        </div>
        <div>
          <LavaInput
            required
            error={errors.liquidityPoolContribution}
            label="LIQUIDITY POOL (LP) CONTRIBUTION (%)"
            name="liquidityPoolContribution"
            placeholder="XX.XX"
            suffix="%"
            type="text"
            value={data.liquidityPoolContribution || ''}
            onChange={handleChange}
            hint={LIQUIDITY_POOL_CONTRIBUTION_HINT}
          />
        </div>
      </div>
    </div>
  );
};
