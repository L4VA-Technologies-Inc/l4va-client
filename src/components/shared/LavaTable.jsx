import { ArrowUpDown, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import clsx from 'clsx';

import { Pagination } from '@/components/shared/Pagination';
import { NoDataPlaceholder } from '@/components/shared/NoDataPlaceholder';

const TableLoadingState = () => (
  <div className="flex justify-center items-center py-20 gap-3">
    <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
    <span className="text-steel-300">Loading...</span>
  </div>
);

const DefaultEmptyState = ({ message }) => <NoDataPlaceholder message={message || 'No data found'} />;

const DefaultErrorState = ({ error }) => (
  <div className="text-center text-red-600 py-8">
    <p>{typeof error === 'string' ? error : 'Something went wrong'}</p>
  </div>
);

const getSortIcon = (column, sort) => {
  const sortKey = column.sortKey || column.key;
  if (!sort || sort.key !== sortKey) {
    return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
  }
  return sort.order === 'ASC' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />;
};

/**
 * @param {{
 *   columns: Array<{
 *     key: string,
 *     header: React.ReactNode,
 *     sortable?: boolean,
 *     sortKey?: string,
 *     render?: (item: any, index: number) => React.ReactNode,
 *     accessor?: string,
 *     cellClassName?: string,
 *     headerClassName?: string,
 *     hidden?: boolean,
 *   }>,
 *   data: any[],
 *   rowKey?: string | ((item: any, index: number) => string),
 *   sort?: { key: string, order: 'ASC' | 'DESC' },
 *   onSort?: (key: string) => void,
 *   isLoading?: boolean,
 *   error?: any,
 *   emptyMessage?: string,
 *   emptyComponent?: React.ReactNode,
 *   onRowClick?: (item: any, index: number) => void,
 *   getRowClassName?: (item: any, index: number) => string,
 *   mobileRender?: (item: any, index: number) => React.ReactNode,
 *   pagination?: { currentPage: number, totalPages: number, onPageChange: (page: number) => void },
 *   containerClassName?: string,
 *   tableClassName?: string,
 * }} props
 */
export const LavaTable = ({
  columns = [],
  data = [],
  rowKey = 'id',
  sort,
  onSort,
  isLoading = false,
  error,
  emptyMessage,
  emptyComponent,
  onRowClick,
  getRowClassName,
  mobileRender,
  pagination,
  containerClassName = '',
  tableClassName = '',
}) => {
  const visibleColumns = columns.filter(col => !col.hidden);

  const getKey = (item, index) => {
    if (typeof rowKey === 'function') return rowKey(item, index);
    return item[rowKey] ?? index;
  };

  const getCellValue = (item, col, index) => {
    if (col.render) return col.render(item, index);
    if (col.accessor) return item[col.accessor];
    return item[col.key];
  };

  const handleSortAction = col => {
    if (!col.sortable || !onSort) return;
    const key = col.sortKey || col.key;
    onSort(key);
  };

  /** @param {{ sortKey?: string, key: string }} col */
  const getAriaSort = col => {
    if (!col.sortable || !onSort) return undefined;
    const sortKey = col.sortKey || col.key;
    if (!sort || sort.key !== sortKey) return 'none';
    return sort.order === 'ASC' ? 'ascending' : 'descending';
  };

  const renderContent = () => {
    if (isLoading) {
      return <TableLoadingState />;
    }

    if (error) {
      return <DefaultErrorState error={error} />;
    }

    if (!data || data.length === 0) {
      return emptyComponent ?? <DefaultEmptyState message={emptyMessage} />;
    }

    return (
      <>
        <div
          className={clsx(
            'overflow-x-auto rounded-2xl border border-steel-750',
            mobileRender ? 'hidden md:block' : '',
            containerClassName
          )}
        >
          <table className={clsx('w-full', tableClassName)}>
            <thead>
              <tr className="bg-steel-850">
                {visibleColumns.map(col => {
                  const isSortable = col.sortable && onSort;
                  return (
                    <th
                      key={col.key}
                      scope="col"
                      aria-sort={getAriaSort(col)}
                      className={clsx(
                        'px-4 py-3 text-left text-dark-100 text-sm border-b border-steel-750',
                        col.headerClassName || ''
                      )}
                    >
                      {isSortable ? (
                        <button
                          type="button"
                          className="inline-flex items-center w-full min-w-0 text-left text-inherit text-sm font-inherit bg-transparent border-0 p-0 m-0 cursor-pointer hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/80 focus-visible:ring-offset-2 focus-visible:ring-offset-steel-850 rounded-sm"
                          onClick={() => handleSortAction(col)}
                        >
                          {col.header}
                          {getSortIcon(col, sort)}
                        </button>
                      ) : (
                        col.header
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr
                  key={getKey(item, index)}
                  className={clsx(
                    'bg-steel-850 hover:bg-steel-750 transition-colors border-b border-steel-750 last:border-b-0',
                    onRowClick ? 'cursor-pointer' : '',
                    getRowClassName ? getRowClassName(item, index) : ''
                  )}
                  onClick={onRowClick ? () => onRowClick(item, index) : undefined}
                >
                  {visibleColumns.map(col => (
                    <td key={col.key} className={clsx('px-4 py-3', col.cellClassName || '')}>
                      {getCellValue(item, col, index)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {mobileRender && (
          <div className="block md:hidden">
            {data.map((item, index) => (
              <div key={getKey(item, index)}>{mobileRender(item, index)}</div>
            ))}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
          />
        )}
      </>
    );
  };

  return <>{renderContent()}</>;
};
