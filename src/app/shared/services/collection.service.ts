import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { PaginationState } from 'ng-hub-ui-table';
import { firstValueFrom, map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagedDataRequestParam } from '../types/paged-data-request-param';

export abstract class CollectionService<
  T extends { id?: number | string | null }
> {
  protected abstract path: string;
  protected http: HttpClient = inject(HttpClient);

  /**
   * Returns an Observable array of data by paginating with a high perPage value.
   *
   * @param request - The `list` function takes a `request` parameter which is a partial object containing a combination of
   * `PagedDataRequestParam` and `FilterChangeEvent` properties. The `request` parameter has a default value of an empty
   * object `{}`.
   * @returns An Observable of an array of items of type T is being returned.
   */
  list(request: Partial<PagedDataRequestParam> = {}): Observable<Array<T>> {
    // throw new Error('list not developed');
    return this.http.get<Array<T>>(`${environment.baseURL}/${this.path} `);
  }

  /**
   * To handle pagination with filtering and sorting options for retrieving data from a server.
   *
   * @param request - is a partial object that includes properties from `PagedDataRequestParam`
   * and an additional `filters` property.
   * @param genericSearchFields - an array that contains the fields to be used for generic search.
   * When performing a generic search, the function will search for the provided `searchTerm` in these fields.
   *
   * @returns an Observable of type `PaginatedData<T>`. This Observable contains paginated data including the
   * content data, current page number, total number of pages, total number of elements, and number of elements per page.
   */
  /* @Cacheable({
		maxAge: 60 * 1024,
		cacheBusterObserver: cacheBuster$
	}) */
  paginate(
    request: Partial<PagedDataRequestParam> = {}
  ): Observable<PaginationState<T>> {
    const {
      page = 1,
      perPage = 20,
      searchTerm,
      searchKeys,
      ordination,
      filters = [],
    } = request;

    return this.list(request).pipe(
      map((all) => {
        let data = [...all];

        // 1. Filtrado por término de búsqueda
        if (searchTerm?.trim()) {
          const term = searchTerm.toLowerCase();
          data = data.filter((item) => {
            if (typeof item === 'string') {
              return (item as string).toLowerCase().includes(term);
            }
            if (typeof item === 'object') {
              const keys = Object.keys(item) as Array<keyof T>;

              return keys.some((key) => {
                const value = (item as any)[key];
                return (
                  typeof value === 'string' &&
                  value.toLowerCase().includes(term)
                );
              });
            } else {
              return false;
            }
          });
        }

        // 2. Ordenación
        if (ordination?.property) {
          const { property, direction } = ordination;
          const asc = direction.toLowerCase() === 'asc';

          data.sort((a: any, b: any) => {
            const aVal = a[property];
            const bVal = b[property];

            if (aVal == null) return asc ? -1 : 1;
            if (bVal == null) return asc ? 1 : -1;

            if (typeof aVal === 'string' && typeof bVal === 'string') {
              return asc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            }

            return asc ? aVal - bVal : bVal - aVal;
          });
        }

        // 3. Paginación
        const totalItems = data.length;
        const start = (page - 1) * perPage;
        const paged = data.slice(start, start + perPage);

        return {
          data: paged,
          page,
          totalItems,
          perPage,
        };
      })
    );
  }

  // const {
  // 	perPage: size,
  // 	page,
  // 	ordination: { direction: sort = null, property: sortField = null } = {},
  // 	filters,
  // 	searchTerm
  // } = { ...DEFAULT_PAGINATION_PARAMS, ...request };
  // const params: ServerPaginationRequest = {
  // 	size,
  // 	page: page - 1,
  // 	sort: sort as any,
  // 	sortField
  // };
  // let httpParams = new HttpParams();

  // removeEmptyProperties(params);
  // Object.entries(params).forEach(([key, value]) => {
  // 	httpParams = httpParams.set(key, value.toString());
  // });

  // const query = {
  // 	sortField,
  // 	sort,
  // 	where: filters ?? []
  // };

  // if (searchTerm && request.searchKeys?.length) {
  // 	query['generalSearch'] = {
  // 		value: searchTerm.trim(),
  // 		fields: request.searchKeys
  // 	};
  // }

  // return this.http
  // 	.post<
  // 		PaginatedResponse<T>
  // 	>(`${environment.baseURL}/${this.path}/search`, query, { params: httpParams })
  // 	.pipe(
  // 		map((response: PaginatedResponse<T>) => ({
  // 			data: response.content,
  // 			currentPage: response.number + 1,
  // 			lastPage: response.totalPages,
  // 			total: response.totalElements,
  // 			perPage: response.size
  // 		})),
  // 		catchError((error) => {
  // 			return of(null);
  // 		})
  // 	);
  //   }

  /**
   * Retrieves data from the backend based on a backend ID and returns a promise of an array of objects.
   *
   * @deprecated Use paginate instead
   * @returns An observable that resolves to an array of type `T[]`.
   */
  get(search?: string): Observable<Array<T>> {
    throw new Error('get not developed');

    // let params = new HttpParams().set('page', 0).set('size', 9999);

    // if (search) {
    // 	params = params.set('search', search);
    // }

    // return this.http
    // 	.get<PaginatedResponse<T>>(`${environment.baseURL}/${this.path}/search`, {
    // 		params
    // 	})
    // 	.pipe(map((result: PaginatedResponse<T>) => result.content));
  }

  /**
   * Retrieves an object of type `T` from the server using an HTTP GET request with the specified `id`.
   *
   * @param {string | number} id - Can be either a string or a number. It is used to identify the resource that
   * needs to be retrieved from the server.
   *
   * @returns an HTTP GET request to the specified URL. The response from the server will be of type
   * `T`, which is a generic type parameter.
   */
  find(id: string | number): Observable<T> {
    return this.http.get<T>(`http://localhost:3000/${this.path}/${id}`);
  }

  /**
   * An asynchronous function that saves an item to a backend server using HTTP POST or PUT methods, with optional parameters,
   * and returns the saved item.
   * @param {T} item - The `item` parameter is of type `T`, which means it can be any type. It represents the item that you want to
   * save.
   * @param [optionalParam] - optionalParam is an optional parameter of type object. It is used to pass additional parameters to the
   * save method. The keys of the optionalParam object are strings, and the values are numbers.
   *
   * @returns a Promise of type T.
   */
  async save(
    item: T,
    optionalParam?: { [key: string]: number }
  ): Promise<{ data: T }> {
    return firstValueFrom(
      this.http.post<{ data: T }>(
        `http://localhost:3000/${this.path}/save`,
        item
      )
    );
    throw new Error('save not developed');
    // let params: HttpParams = new HttpParams();
    // let url = `${environment.baseURL}/${this.path}`;
    // let method = 'post';

    // if (optionalParam) {
    // 	const paramKeys = Object.keys(optionalParam);

    // 	paramKeys.forEach(
    // 		(paramKey) => (params = params.set(paramKey, optionalParam[paramKey]))
    // 	);
    // }

    // if (item.id) {
    // 	url = `${environment.baseURL}/${this.path}/${item.id}`;
    // 	method = 'put';
    // }

    // try {
    // 	const result: T = await firstValueFrom(
    // 		this.http[method]<T>(url, item, { params })
    // 	);

    // 	cacheBuster$.next();

    // 	return result;
    // } catch (error) {
    // 	throw error;
    // }
  }

  /**
   * Sends a DELETE request to the specified URL and handles success and error cases by displaying toast messages.
   *
   * @param {number} id - The `id` parameter is a number that represents the identifier of the item to be deleted.
   *
   * @returns an `Observable<void>`.
   */
  delete(id: number | string): Observable<void> {
    throw new Error('paginate not developed');
    // return this.http
    //   .delete<void>(`${environment.baseURL}/${this.path}/${id}`)
    //   .pipe(
    //     tap(() => {
    //       cacheBuster$.next();
    //       // TODO: elimnar los mensajes
    //       Toast.success(Translations.instant('GENERIC.MESSAGES.INFO.REMOVED'));
    //     }),
    //     catchError((error) => {
    //       // TODO: elimnar los mensajes
    //       Toast.error(Translations.instant('GENERIC.MESSAGES.ERROR.REMOVED'));

    //       return of(error);
    //     })
    //   );
  }

  /**
   * Updates an existing object if it has an ID, otherwise it creates a new object.
   *
   * @param {T} value - The `value` parameter is of type `any`, which means it can accept any data type.
   *
   * @returns Treturns a Promise of type `T`.
   */
  updateOrCreate(value: Partial<T> | FormData): Promise<T> {
    throw new Error('updateOrCreate not developed');

    // let id: number | string;

    // if (value instanceof FormData) {
    //   id = value.get('id') as string;
    //   value.delete('id');
    // } else {
    //   id = value.id;
    //   delete value.id;
    // }

    // let url = `${environment.baseURL}/${this.path}`;

    // if (id) {
    //   url += `/${id}`;
    // }

    // return firstValueFrom(
    //   this.http[id ? 'put' : 'post'](url, value).pipe(
    //     tap((_) => cacheBuster$.next())
    //   ) as Observable<T>
    // );
  }
}
