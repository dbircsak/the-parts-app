import { ChevronUp, ChevronDown } from "lucide-react";

interface TableHeaderProps<T extends string = string> {
  field: T;
  label: string;
  currentSortField: T | string;
  sortDirection: "asc" | "desc";
  onSort: (field: T) => void;
  className?: string;
}

export default function TableHeader<T extends string = string>({
  field,
  label,
  currentSortField,
  sortDirection,
  onSort,
  className = "",
}: TableHeaderProps<T>) {
  const isActive = currentSortField === field;

  return (
    <th
      className={`px-4 py-2 text-left text-sm font-medium cursor-pointer hover:bg-gray-200 transition-colors ${className}`}
      onClick={() => onSort(field)}
    >
      {label}
      {isActive && (
        sortDirection === "asc" ? (
          <ChevronUp className="w-4 h-4 inline ml-1" />
        ) : (
          <ChevronDown className="w-4 h-4 inline ml-1" />
        )
      )}
    </th>
  );
}
