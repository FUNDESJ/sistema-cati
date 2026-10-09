import { type ReactNode } from 'react';

interface Column<T> {
  key: string;
  header: string;
  headerClassName?: string;
  className?: string;
  render: (row: T, index: number) => ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
  className?: string;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'Nenhum registro encontrado',
  className = '',
}: TableProps<T>) {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-[#d8d8d8]">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`px-4 py-3 font-semibold text-[13px] uppercase tracking-wide text-[#595959] ${col.headerClassName ?? ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e5e5e5]">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-[#595959]">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={keyExtractor(row)}
                className="hover:bg-[#fafafa] transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 align-middle">
                    {col.render(row, index)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}