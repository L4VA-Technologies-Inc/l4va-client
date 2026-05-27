import { ModalWrapper } from '@/components/shared/ModalWrapper';

export const RewardsInfoModal = ({ isOpen, onClose }) => {
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="L4VA Rewards — How it works" size="lg" allowBodyScroll>
      <div className="space-y-6">
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-orange-500 font-semibold">Overview</h3>
          </div>
          <p className="text-steel-300 text-sm leading-relaxed">
            Users earn $L4VA by creating or interacting with vaults. The Oracle Vault is the first vault on the protocol
            — it mints ORACLE for &quot;Relics of Magma&quot; NFTs. Total bonuses across staking and alignment are
            capped at 20%.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-orange-500 font-semibold">Base Staking Rewards</h3>
          </div>
          <p className="text-steel-300 text-sm leading-relaxed">
            Stake L4VA or VLRM tokens to earn base rewards from treasury budgets. These rewards are independent of
            protocol rewards.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-orange-500 font-semibold">How to Earn Protocol Rewards</h3>
          </div>
          <div className="text-steel-300 text-sm leading-relaxed space-y-2">
            <p>Earn $L4VA rewards through various protocol activities:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Contributing assets into vaults</li>
              <li>Acquiring</li>
              <li>Providing liquidity for vault tokens (VT/ADA or VT/USDCx pools)</li>
              <li>Swapping vault tokens using the widget</li>
              <li>Participating in governance</li>
            </ul>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-orange-500 font-semibold">Vesting & Unlocking</h3>
          </div>
          <p className="text-steel-300 text-sm leading-relaxed">
            Protocol rewards are split into 50% immediate and 50% vested over 4 weeks. To unlock the vested portion,
            continue holding your vault tokens either directly in your wallet or through eligible LP positions. The
            system tracks your effective VT balance over time, and vested rewards unlock based on how much of the
            required VT balance you maintain during the vesting period.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-orange-500 font-semibold">Claiming Your Rewards</h3>
          </div>
          <p className="text-steel-300 text-sm leading-relaxed">
            Once rewards are unlocked from vesting, navigate to the Claims section to submit an on-chain claim
            transaction. Your unlocked $L4VA will be transferred to your wallet. Unclaimed rewards remain safely in the
            protocol until you&apos;re ready.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-orange-500 font-semibold">Protocol Reward Bonuses (Alignment)</h3>
          </div>
          <div className="overflow-x-auto rounded-lg border border-steel-750">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-steel-750">
                  <th className="px-4 py-3 text-left text-steel-400 font-medium">Alignment Action</th>
                  <th className="px-4 py-3 text-right text-steel-400 font-medium">Bonus on Protocol Rewards</th>
                </tr>
              </thead>
              <tbody className="text-white">
                <tr className="border-b border-steel-800">
                  <td className="px-4 py-3">Stake at least 100,000 L4VA</td>
                  <td className="px-4 py-3 text-right text-orange-500 font-medium">+5%</td>
                </tr>
                <tr className="border-b border-steel-800">
                  <td className="px-4 py-3">Stake at least 20,000 VLRM</td>
                  <td className="px-4 py-3 text-right text-orange-500 font-medium">+5%</td>
                </tr>
                <tr className="border-b border-steel-800">
                  <td className="px-4 py-3">Hold Oracle (ORACLE)</td>
                  <td className="px-4 py-3 text-right text-orange-500 font-medium">+0.5% to +5%</td>
                </tr>
                <tr className="border-b border-steel-800">
                  <td className="px-4 py-3">Full alignment (L4VA + VLRM + ORACLE)</td>
                  <td className="px-4 py-3 text-right text-orange-500 font-medium">+5%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-steel-400">Maximum total alignment bonus</td>
                  <td className="px-4 py-3 text-right text-orange-500 font-semibold">20% Capped</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </ModalWrapper>
  );
};
