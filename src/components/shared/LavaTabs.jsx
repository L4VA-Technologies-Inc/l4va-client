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
  <div className={clsx('inline-flex rounded-lg', className)}>
    {tabs.map(tab => (
      <button
        key={tab}
        className={clsx(
          'px-6 sm:px-8 py-2 rounded-xl font-medium transition-all',
          activeTab === tab ? 'bg-steel-750' : 'text-white hover:text-orange-500',
          tabClassName,
          activeTab === tab ? activeTabClassName : inactiveTabClassName
        )}
        type="button"
        onClick={() => onTabChange(tab)}
      >
        <span className={clsx(activeTab === tab && 'text-orange-gradient')}>{tab}</span>
      </button>
    ))}
  </div>
);
