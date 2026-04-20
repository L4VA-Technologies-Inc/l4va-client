import { HoverHelp } from '@/components/shared/HoverHelp';
import { ModalWrapper } from '@/components/shared/ModalWrapper';

const TLDR_HINT = `Users earn $L4VA by creating or interacting with vaults. The Oracle Vault is the first vault—it mints ORACLE for "Relics of Magma" NFTs. Maximum alignment bonus is 15%.`;

const STAKING_HINT = `Stake L4VA or VLRM tokens to earn base rewards from treasury budgets. These rewards are independent of protocol activity rewards.`;

export const RewardsInfoModal = ({ isOpen, onClose }) => {
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="L4VA Rewards — How it works" size="lg" allowBodyScroll>
      <div className="space-y-6">
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-orange-500 font-semibold">TL;DR</h3>
            <HoverHelp hint={TLDR_HINT} />
          </div>
          <p className="text-steel-300 text-sm leading-relaxed">
            Users earn $L4VA by creating or interacting with vaults. The Oracle Vault is the first vault on the
            protocol—it mints ORACLE for &quot;Relics of Magma&quot; NFTs. Maximum alignment bonus is 15%.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-orange-500 font-semibold">Base Staking Rewards</h3>
            <HoverHelp hint={STAKING_HINT} />
          </div>
          <p className="text-steel-300 text-sm leading-relaxed">
            Stake L4VA or VLRM tokens to earn base rewards from treasury budgets. These rewards are independent of
            protocol rewards.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-orange-500 font-semibold">Protocol Reward Bonuses (Alignment)</h3>
            <HoverHelp hint="Additive bonuses applied to protocol rewards. Bonuses stack up to a maximum of 15%." />
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
                  <td className="px-4 py-3">
                    Hold Oracle (ORACLE)
                    <span className="block text-xs text-steel-500 mt-1">
                      Requires both L4VA and VLRM bonuses unlocked
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-orange-500 font-medium">+5%</td>
                </tr>
                <tr className="border-b border-steel-800 bg-steel-850/50">
                  <td className="px-4 py-3 font-medium">Maximum Total Alignment Bonus</td>
                  <td className="px-4 py-3 text-right text-orange-500 font-semibold">+15%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-3 p-3 rounded-lg bg-steel-900/50 border border-steel-750">
            <p className="text-steel-400 text-xs leading-relaxed">
              <span className="text-orange-500 font-medium">How it works:</span> Bonuses are additive. For example, if
              you stake 100,000 L4VA (+5%) and 20,000 VLRM (+5%), and hold ORACLE (+5%), you receive a total +15% bonus
              on all protocol rewards.
            </p>
          </div>
        </section>
      </div>
    </ModalWrapper>
  );
};
