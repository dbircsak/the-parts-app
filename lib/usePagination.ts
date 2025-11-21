import { useState } from "react";

const ITEMS_PER_PAGE = 30;

export function usePagination<T>(items: T[], itemsPerPage = ITEMS_PER_PAGE) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = items.slice(startIndex, endIndex);

  const resetPage = () => setCurrentPage(1);
  const goToPage = (page: number) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  const nextPage = () => setCurrentPage(Math.min(totalPages, currentPage + 1));
  const prevPage = () => setCurrentPage(Math.max(1, currentPage - 1));

  return {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    paginatedItems,
    setCurrentPage: goToPage,
    resetPage,
    nextPage,
    prevPage,
  };
}
