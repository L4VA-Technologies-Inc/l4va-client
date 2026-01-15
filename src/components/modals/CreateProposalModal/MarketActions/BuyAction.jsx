import { TransactionAction } from './TransactionAction.jsx';

export const BuyAction = ({ vaultId, onDataChange, error }) => {
  return (
    <TransactionAction
      vaultId={vaultId}
      onDataChange={onDataChange}
      error={error}
      execType="BUY"
      title="Buy Options"
      useAssetIdInput={true}
    />
  );
};
