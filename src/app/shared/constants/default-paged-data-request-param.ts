import {
  OrdinationDirection,
  PagedDataRequestParam,
} from '../types/paged-data-request-param';

export const DefaultPagedDataRequestParam: PagedDataRequestParam = {
  page: 1,
  perPage: 20,
  searchTerm: '',
  filters: [],
  ordination: {
    direction: OrdinationDirection.DESC,
    property: 'id',
  },
};
