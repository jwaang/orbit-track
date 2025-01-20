"use client";

import {
    ColumnDef,
    Row,
    SortDirection,
    SortingState,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";

import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/20/solid'
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { HTMLAttributes, forwardRef, useState } from "react";
import { TableVirtuoso } from "react-virtuoso";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { TrendingPools } from "../../types/TrendingPools";

// Original Table is wrapped with a <div> (see https://ui.shadcn.com/docs/components/table#radix-:r24:-content-manual), 
// but here we don't want it, so let's use a new component with only <table> tag
const TableComponent = forwardRef<
    HTMLTableElement,
    React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
    <table
        ref={ref}
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
    />
));
TableComponent.displayName = "TableComponent";

const TableRowComponent = <TData,>(rows: Row<TData>[]) =>
    function getTableRow(props: HTMLAttributes<HTMLTableRowElement>) {
        // @ts-expect-error data-index is a valid attribute
        const index = props["data-index"];
        const row = rows[index];

        if (!row) return null;

        return (
            <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="border-b border-gray-800 hover:bg-gray-800"
                {...props}
            >
                {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                ))}
            </TableRow>
        );
    };

function SortingIndicator({ isSorted }: { isSorted: SortDirection | false }) {
    if (!isSorted) return null;
    return (
        <div>
            {
                {
                    asc: <ArrowUpIcon className="inline w-4 h-4 ml-1" />,
                    desc: <ArrowDownIcon className="inline w-4 h-4 ml-1" />,
                }[isSorted]
            }
        </div>
    );
}

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    height: string;
    isLoading?: boolean;
    onLoadMore?: () => void;
    trendingPools: TrendingPools;
    isFavorites?: boolean;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    height,
    isLoading,
    onLoadMore,
    trendingPools,
    isFavorites,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([{ id: 'marketCap', desc: true }]);
    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    const { rows } = table.getRowModel();

    const handleEndReached = () => {
        if (!isLoading && trendingPools?.hasNextPage && onLoadMore) {
            onLoadMore();
        }
    };

    const renderLoader = () => {
        if (!isLoading) {
            return null;
        }
        return (
            <TableRow className="border-b border-gray-800 hover:bg-gray-800 data-[state=selected]:bg-muted">
                <TableCell colSpan={columns.length} className="h-24">
                    <div className="flex justify-center items-center w-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                </TableCell>
            </TableRow>
        );
    };

    if (rows.length === 0) {
        return <div className="flex justify-center items-center w-full">
            <motion.div
                className="text-center text-gray-400 py-4 text-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                No tokens found 😔
            </motion.div>
        </div>
    }

    return (
        <>
            <TableVirtuoso
                style={{ height }}
                totalCount={rows.length}
                components={{
                    Table: TableComponent,
                    TableRow: TableRowComponent(rows),
                    // EmptyPlaceholder causes hydration error
                    // EmptyPlaceholder: renderEmptyState
                }}
                endReached={handleEndReached}
                overscan={200}
                fixedHeaderContent={() =>
                    table.getHeaderGroups().map((headerGroup) => (
                        <TableRow className="bg-gray-800 !hover:bg-gray-800" key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead
                                        key={header.id}
                                        colSpan={header.colSpan}
                                        style={{
                                            width: header.getSize(),
                                        }}
                                        className="border-b border-gray-800"
                                    >
                                        {header.isPlaceholder ? null : (
                                            <div
                                                className="flex items-center py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-purple-400"
                                                {...{
                                                    style: header.column.getCanSort()
                                                        ? {
                                                            cursor: "pointer",
                                                            userSelect: "none",
                                                        }
                                                        : {},
                                                    onClick: header.column.getToggleSortingHandler(),
                                                }}
                                            >
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext(),
                                                )}
                                                <SortingIndicator
                                                    isSorted={header.column.getIsSorted()}
                                                />
                                            </div>
                                        )}
                                    </TableHead>
                                );
                            })}
                        </TableRow>
                    ))
                }
                fixedFooterContent={renderLoader}
            />
        </>
    );
}
