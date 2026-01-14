import { TransactionAction } from './TransactionAction.jsx';

export const SellAction = ({ vaultId, onDataChange, error }) => {
  return (
    <TransactionAction
      vaultId={vaultId}
      onDataChange={onDataChange}
      error={error}
      execType="SELL"
      title="Sell Options"
    />
  );
};
