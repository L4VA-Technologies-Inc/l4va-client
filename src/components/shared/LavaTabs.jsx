import clsx from 'clsx';

export const LavaTabs = ({
  tabs,
  activeTab,
  onTabChange,
  className = '',
  tabClassName = '',
  activeTabClassName = '',
  inactiveTabClassName = '',
}) => (
  <div className={clsx('inline-flex rounded-lg p-1', className)}>
    {tabs.map((tab) => (
      <button
        key={tab}
        className={clsx(
          'px-8 py-2 rounded-xl text-lg font-medium transition-all',
          activeTab === tab
            ? 'bg-[#2D3049]'
            : 'text-white hover:text-main-orange',
          tabClassName,
          activeTab === tab ? activeTabClassName : inactiveTabClassName,
        )}
        type="button"
        onClick={() => onTabChange(tab)}
      >
        <span
          className={clsx(
            activeTab === tab && 'text-orange-gradient',
          )}
        >
          {tab}
        </span>
      </button>
    ))}
  </div>
);
