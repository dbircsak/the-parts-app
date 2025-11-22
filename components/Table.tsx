import React from "react";

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

interface TableHeadProps {
  children: React.ReactNode;
}

interface TableBodyProps {
  children: React.ReactNode;
}

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
}

interface TableCellProps {
  children: React.ReactNode;
  header?: boolean;
  className?: string;
}

function Table({ children, className = "" }: TableProps) {
  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">{children}</table>
      </div>
    </div>
  );
}

function TableHead({ children }: TableHeadProps) {
  return <thead className="bg-gray-100">{children}</thead>;
}

function TableBody({ children }: TableBodyProps) {
  return <tbody>{children}</tbody>;
}

function TableRow({ children, className = "" }: TableRowProps) {
  return <tr className={`border-b hover:bg-gray-50 ${className}`}>{children}</tr>;
}

function TableCell({ children, header = false, className = "" }: TableCellProps) {
  if (header) {
    return (
      <th
        className={`px-4 py-2 text-left text-sm font-medium ${className}`}
      >
        {children}
      </th>
    );
  }
  return <td className={`px-4 py-2 text-sm ${className}`}>{children}</td>;
}

Table.Head = TableHead;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Cell = TableCell;

export default Table;
