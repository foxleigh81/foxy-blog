/**
 * Utility functions for handling pagination
 */

export interface PaginationParams {
  page?: string;
  pageSize?: string;
}

export interface PaginationResult<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

/**
 * Paginates an array of items
 * 
 * @param items The array of items to paginate
 * @param params The pagination parameters
 * @param defaultPageSize The default page size
 * @returns The paginated results
 */
export function paginateItems<T>(
  items: T[],
  params: PaginationParams = {},
  defaultPageSize = 9
): PaginationResult<T> {
  // Parse pagination parameters
  const currentPage = params.page ? parseInt(params.page, 10) : 1;
  const pageSize = params.pageSize ? parseInt(params.pageSize, 10) : defaultPageSize;
  
  // Calculate pagination values
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  
  // Get the items for the current page
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = items.slice(startIndex, endIndex);
  
  return {
    items: paginatedItems,
    currentPage,
    totalPages,
    totalItems
  };
}

/**
 * Extracts pagination parameters from search params
 * 
 * @param searchParams The search params object
 * @returns The pagination parameters
 */
export function getPaginationParams(searchParams: Record<string, string | string[] | undefined>): PaginationParams {
  const page = typeof searchParams.page === 'string' ? searchParams.page : '1';
  const pageSize = typeof searchParams.pageSize === 'string' ? searchParams.pageSize : undefined;
  
  return {
    page,
    pageSize
  };
}
