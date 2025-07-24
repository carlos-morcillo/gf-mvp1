/**
 * Represents the pagination information for a paginable table.
 * This interface is used to manage data pagination in a table component.
 *
 * @template T - The type of data contained in the table rows. Defaults to `any`.
 */
export interface PaginatedData<T = any> {
	/**
	 * The array of data items for the current page.
	 *
	 * @type {Array<T>}
	 * @optional
	 */
	data?: Array<T>;

	/**
	 * The current page number being viewed.
	 *
	 * @type {number}
	 */
	currentPage: number;

	/**
	 * The total number of pages available.
	 *
	 * @type {number}
	 * @optional
	 */
	lastPage?: number;

	/**
	 * The total number of data items across all pages.
	 *
	 * @type {number}
	 */
	total: number;

	/**
	 * The number of data items displayed per page.
	 *
	 * @type {number}
	 */
	perPage: number;
}
