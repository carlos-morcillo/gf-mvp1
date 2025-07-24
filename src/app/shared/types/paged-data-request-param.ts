import { Filter } from './filter';

/**
 * Represents the parameters for requesting paginated data from a data source.
 * Includes pagination settings, filtering rules, full-text search, and sorting instructions.
 */
export interface PagedDataRequestParam {
  /**
   * Current page number (starting from 1).
   * Used to determine which slice of the data to retrieve.
   *
   * @example 1
   */
  page: number;

  /**
   * Number of items to return per page.
   * Defines the page size for each request.
   *
   * @example 10
   */
  perPage: number;

  /**
   * Optional array of property names to be included in the search operation.
   * If undefined or empty, the backend may use a default behavior or ignore the search.
   *
   * @example ['name', 'email']
   */
  searchKeys?: Array<string>;

  /**
   * Global search string to match against selected fields.
   * Useful for applying full-text search across multiple fields.
   *
   * @example "john doe"
   */
  searchTerm: string;

  /**
   * Array of filter conditions to apply to the dataset.
   * Each filter represents a specific constraint.
   */
  filters: Array<Filter>;

  /**
   * Sorting configuration indicating the field and direction.
   */
  ordination: Ordination;
}

/**
 * Defines the sorting configuration used in a paginated request.
 */
export interface Ordination {
  /**
   * Sorting direction: either "ASC" (ascending) or "DESC" (descending).
   *
   * @example "asc"
   */
  direction: OrdinationDirection;

  /**
   * Field name used to sort the results.
   *
   * @example "createdAt"
   */
  property: string;
}

export enum OrdinationDirection {
  'ASC' = 'ASC',
  'DESC' = 'DESC',
}
