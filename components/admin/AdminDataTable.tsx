"use client";

import { useMemo, useState } from 'react';
import {
    ColumnDef,
    SortingState,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';

interface AdminDataTableProps<TData> {
    data: TData[];
    columns: ColumnDef<TData>[];
    emptyMessage?: string;
    embedded?: boolean;
}

export default function AdminDataTable<TData>({
    data,
    columns,
    emptyMessage = 'No records found.',
    embedded = false,
}: AdminDataTableProps<TData>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const tableData = useMemo(() => data, [data]);
    const tableColumns = useMemo(() => columns, [columns]);

    const table = useReactTable({
        data: tableData,
        columns: tableColumns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <div className={embedded ? "overflow-hidden bg-card-bg" : "overflow-hidden rounded-lg border border-border bg-card-bg"}>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[760px]">
                    <thead className="border-b border-border bg-bg">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    const canSort = header.column.getCanSort();
                                    const sortDirection = header.column.getIsSorted();

                                    return (
                                        <th
                                            key={header.id}
                                            className="px-6 py-4 text-left text-sm font-medium text-text-muted"
                                            style={{ width: header.getSize() }}
                                        >
                                            {header.isPlaceholder ? null : (
                                                <button
                                                    type="button"
                                                    disabled={!canSort}
                                                    onClick={header.column.getToggleSortingHandler()}
                                                    className={`inline-flex items-center gap-2 text-left ${canSort ? 'cursor-pointer transition-colors hover:text-accent' : 'cursor-default'}`}
                                                >
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    {canSort && (
                                                        sortDirection === 'asc' ? (
                                                            <ArrowUp className="h-3.5 w-3.5" />
                                                        ) : sortDirection === 'desc' ? (
                                                            <ArrowDown className="h-3.5 w-3.5" />
                                                        ) : (
                                                            <ChevronsUpDown className="h-3.5 w-3.5 opacity-60" />
                                                        )
                                                    )}
                                                </button>
                                            )}
                                        </th>
                                    );
                                })}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map((row) => (
                            <tr key={row.id} className="border-b border-border transition-colors last:border-0 hover:bg-bg/50">
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id} className="px-6 py-4 align-middle">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {data.length === 0 && (
                <div className="px-6 py-10 text-center text-sm text-text-muted">{emptyMessage}</div>
            )}
        </div>
    );
}
