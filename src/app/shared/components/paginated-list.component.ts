import {
  computed,
  Directive,
  effect,
  EnvironmentInjector,
  inject,
  model,
  OnDestroy,
  OnInit,
  resource,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { PaginableTableHeader, TableRowEvent } from 'ng-hub-ui-table';
import { firstValueFrom, Observable, Subject, takeUntil } from 'rxjs';
// import { DefaultPagedDataRequestParam } from '../constants/default-paged-data-request-param';
// import { DefaultModalOptions } from '../constants/modal';
import { DefaultPagedDataRequestParam } from '../constants';
import { Confirmable } from '../decorators/confirm.decorator';
import { CollectionService, Toast } from '../services';
import { Filter } from '../types/filter';
import {
  Ordination,
  OrdinationDirection,
  PagedDataRequestParam,
} from '../types/paged-data-request-param';
// import {
//   Ordination,
//   OrdinationDirection,
//   PagedDataRequestParam,
// } from '../types/paged-data-request-param';

@Directive()
export abstract class PaginatedListComponent<
  T extends { id?: number | string | null }
> implements OnDestroy, OnInit
{
  #router = inject(Router);
  #activatedRoute = inject(ActivatedRoute);
  #environmentInjector = inject(EnvironmentInjector);
  #destroy$ = new Subject<void>();
  translocoSvc = inject(TranslocoService);

  protected debounceTime = 1024;

  // to be able to perform the generic search
  abstract headers?: PaginableTableHeader[] | null | undefined;

  protected fb: FormBuilder = inject(FormBuilder);
  abstract dataSvc?: CollectionService<T>;

  editComponent?: any;

  /**
   * Interval in milliseconds to automatically reload the table.
   * If the value is set, the table will refresh at that interval.
   */
  readonly reloadInterval: WritableSignal<number | null> = signal(null);

  /**
   * Holds the interval reference for automatic table reloads.
   */
  private reloadIntervalId: ReturnType<typeof setInterval> | undefined;

  /**
   * Effect that sets up an interval to automatically reload paginated data
   * based on the value of `reloadInterval`. If the value changes, the previous
   * interval is cleared and a new one is established.
   */
  readonly reloadEffect = effect(() => {
    if (this.reloadIntervalId) clearInterval(this.reloadIntervalId);

    const interval = this.reloadInterval();
    if (interval) {
      this.reloadIntervalId = setInterval(() => {
        this.paginatedData?.reload();
      }, interval);
    }
  });

  /**
   * Default parameters for paginated data requests.
   * @type {PagedDataRequestParam} Object containing pagination parameters like page number, page size, and sorting options.
   * @default DefaultPagedDataRequestParam
   * @see PagedDataRequestParam
   */
  defaultRequestParams: PagedDataRequestParam = DefaultPagedDataRequestParam;

  // Request params
  /**
   * Array of property keys to be used for searching/filtering table data.
   * Each string in the array represents a property name that will be checked
   * when performing search operations on table rows.
   * @default ['name']
   */
  searchKeys = signal<Array<string>>(['name']);

  /**
   * Array of mandatory filters that will always be applied to the table data.
   * These filters cannot be removed by the user and are essential for the table's functionality.
   * @type {Signal<Array<Filter>>}
   */
  mandatoryFilters: Signal<Array<Filter>> = signal<Array<Filter>>([]);

  /**
   * An object that stores dynamic filtering criteria for the table.
   * Uses a model wrapper to track its state and reactivity.
   * @type {Record<string, any>} Key-value pairs where:
   * - key: represents the filter field name
   * - value: represents the filter value of any type
   */
  dynamicFilters = model<Record<string, any>>({});

  /**
   * Computed property that combines mandatory filters and dynamic filters into a single array.
   *
   * This property logs the mandatory filters to the console and returns a merged array containing:
   * - Mandatory filters (if any)
   * - Dynamic filters converted to filter conditions
   *
   * @returns {Array} Combined array of mandatory and dynamic filter conditions
   */
  filters = computed(() => {
    return [
      //   ...(this.mandatoryFilters() ?? []),
      //   ...buildFilterConditions(this.dynamicFilters() ?? {}),
    ];
  });

  searchTerm = signal<string>('');

  page = signal<number>(1);

  perPage = signal<number>(20);

  ordination = signal<Ordination>({
    direction: OrdinationDirection.ASC,
    property: 'id',
  });

  request = computed<PagedDataRequestParam>(
    () => {
      this.mandatoryFilters();
      return {
        page: this.page(),
        perPage: this.perPage(),
        searchTerm: this.searchTerm(),
        filters: this.filters(),
        ordination: this.ordination(),
      };
    }
    // {
    //   equal: (prev, next) => {
    //     return isEqual(prev, next);
    //   },
    // }
  );

  paginatedData = resource({
    params: () => this.request(),
    loader: async () => {
      return firstValueFrom(this.fetchFn());
    },
  });

  //   lastPage = computed(() => {
  //     if (!this.paginatedData.hasValue()) {
  //       return null;
  //     }
  //     const { lastPage } = this.paginatedData.value();
  //     return lastPage;
  //   });

  /**
   * The `updateURLOnRequest` property is a boolean variable that determines whether the component should update the browser's URL
   * based on the current request state. When set to `true`, the component will synchronize the URL with the pagination parameters
   * such as page number, items per page, search term, and sorting parameters. This synchronization ensures that the URL reflects the
   * current state of the paginated table component, making it easier to share or bookmark specific views of the data.
   */
  updateURLOnRequest: boolean = true;

  get searchFields(): Array<string> | null {
    if (!this.headers?.length) {
      return null;
    }

    // performs the search with the headers' fields
    // does not include headers without property (buttons) or those that are relationships ('.')
    return this.headers
      .filter((h) => !!h.property && !h.property.includes('.'))
      .map((h) => h.property);
  }

  /**
   * Initializes URL synchronization.
   */
  ngOnInit(): void {
    if (this.updateURLOnRequest) {
      this.initializeUrlSync();
    }
  }

  /**
   * Destroys the component and cleans up subscriptions
   */
  ngOnDestroy() {
    if (this.reloadIntervalId) clearInterval(this.reloadIntervalId);
    this.#destroy$.next();
    this.#destroy$.complete();
  }

  /**
   * Initializes URL synchronization with pagination signals. It sets up two-way binding between URL query parameters and
   * pagination signals.
   */
  protected initializeUrlSync(): void {
    // Listen to URL changes and update signals
    this.#activatedRoute.queryParams
      .pipe(takeUntil(this.#destroy$))
      .subscribe(({ page, perPage, orderBy, orderDir, searchTerm }) => {
        this.page.set(parseInt(page ?? this.defaultRequestParams.page));
        this.perPage.set(
          parseInt(perPage ?? this.defaultRequestParams.perPage)
        );
        this.searchTerm.set(searchTerm ?? this.defaultRequestParams.searchTerm);
        this.ordination.set({
          direction: orderDir ?? this.defaultRequestParams.ordination.direction,
          property: orderBy ?? this.defaultRequestParams.ordination.property,
        });
      });

    this.handleUrlSyncEffect();
  }

  /**
   * Synchronizes the browser's URL with the current request state using an Angular effect.
   * This ensures that pagination, search terms, and sorting parameters are reflected in the URL.
   *
   * The function listens for changes in request parameters (`page`, `perPage`, `searchTerm`, `ordination`)
   * and updates the URL accordingly while preserving existing query parameters.
   *
   * The effect removes null or undefined values from the query parameters before updating the URL.
   */
  handleUrlSyncEffect() {
    effect(
      () => {
        const {
          page,
          perPage,
          searchTerm,
          ordination: { direction: orderDir, property: orderBy },
        } = this.request();

        const queryParams: any = {
          page,
          perPage,
          searchTerm,
          orderBy,
          orderDir,
        };

        // Remove null/undefined values
        Object.keys(queryParams).forEach(
          (key) => queryParams[key] === null && delete queryParams[key]
        );

        this.#router.navigate([], {
          replaceUrl: true,
          relativeTo: this.#activatedRoute,
          queryParams,
          queryParamsHandling: 'merge', // preserve other query params,
        });
      },
      { injector: this.#environmentInjector }
    );
  }

  /**
   * Loads paginated data from the data service using the current request parameters.
   *
   * This method extracts the `searchTerm` and `filters` from the request model and combines them
   * with the rest of the request data. It also includes the configured search keys, and forwards all
   * parameters to the `paginate` method of the data service.
   *
   * @returns {Observable<PaginatedData<T>>} An observable that emits the paginated data result.
   *
   * @example
   * this.fetchFn().subscribe((result) => {
   *   console.log(result.data); // Access returned items
   * });
   */
  fetchFn(): Observable<Array<T>> {
    const { filters = [], ...request } = this.request();
    if (!this.dataSvc) {
      throw new Error('fetch function not found');
    }
    return this.dataSvc.list({
      ...request,
      searchKeys: this.searchKeys(),
      filters,
    });
  }

  /**
   * Opens a modal with an edit component and sets the `id` property if an entity is provided.
   *
   * @param {T} entity - The `entity` parameter in the `view` function is an object of type `T`. It is used to pass an entity object
   * to the function for viewing purposes. The function opens a modal window to display the details of the entity. If an entity
   * object is provided, its `id` property
   */
  view(entity: T) {
    // if (!this.editComponent) {
    //   throw new Error('No edit component provided');
    // }
    // const modalRef: HubModalRef = this.modal.open(this.editComponent as any, {
    //   animation: true,
    //   backdrop: 'static',
    //   windowClass: 'paginated-table-modal',
    //   scrollable: true,
    //   fullscreen: 'sm',
    // });
    // if (entity) {
    //   modalRef.componentInstance['id'] = entity.id;
    // }
  }

  async edit(item?: T) {
    this.#router.navigateByUrl('./add');
    // if (!this.editComponent) {
    //   throw new Error('No edit component provided');
    // }
    // try {
    //   const modalRef: HubModalRef = this.modal.open(this.editComponent as any, {
    //     ...DefaultModalOptions,
    //     data: item,
    //     windowClass: 'paginated-table-modal',
    //     scrollable: true,
    //     fullscreen: 'sm',
    //     ...modalOptions,
    //   });
    //   if (item) {
    //     modalRef.componentInstance['id'] = item.id;
    //   }
    //   await modalRef.result;
    //   this.paginatedData.reload();
    // } catch (error) {
    //   if (
    //     error &&
    //     typeof error === 'number' &&
    //     ![ModalDismissReasons.ESC, ModalDismissReasons.BACKDROP_CLICK].includes(
    //       error
    //     )
    //   ) {
    //     Toast.error(error as any);
    //   }
    // }
  }

  /**
   * Asynchronously deletes an item, handles errors, and displays a success message using toast.
   *
   * @param {T} item - The `item` parameter in the `delete` function represents the object that you want to delete from the data
   * source. It is of type `T`, which means it can be any type of object that your application supports for deletion. When calling
   * the `delete` function, you pass an instance of
   */
  @Confirmable({
    title: 'GENERIC.TITLES.DELETE_ELEMENT',
    content: 'GENERIC.MESSAGES.WARNING.DELETE_ELEMENT?',
  })
  async delete(item: T) {
    try {
      if (this.deleteFn) {
        await firstValueFrom(this.deleteFn(item.id!));
      } else if (this.dataSvc?.delete) {
        await firstValueFrom(this.dataSvc.delete(item.id!));
        Toast.success(
          this.translocoSvc.translate('GENERIC.MESSAGES.INFO.REMOVED')
        );
      } else {
        throw new Error('DELETE_FUNCTION_NOT_PROVIDED');
      }
      this.paginatedData.reload();
    } catch (error: any) {
      console.error(error);
      Toast.error(this.translocoSvc.translate(error.message));
    }
  }

  protected deleteFn?: (id: number | string) => Observable<boolean>;

  /**
   * Navigates to a specific page using the router service.
   *
   * @param {TableRowEvent} event - The `event` parameter in the `navigateTo` function is of type `TableRowEvent`. It is an event
   * object that likely contains information about the item that was clicked, such as its ID.
   */
  navigateTo({ data }: TableRowEvent) {
    this.#router.navigate(['.', data.id], {
      relativeTo: this.#activatedRoute,
    });
  }

  /**
   * Navigates to a specific page using the router service.
   *
   * @param {TableRowEvent} event - The `event` parameter in the `navigateTo` function is of type `TableRowEvent`. It is an event
   * object that likely contains information about the item that was clicked, such as its ID.
   */
  navigateToEdition({ data }: TableRowEvent) {
    this.#router.navigate(['.', data.id], {
      relativeTo: this.#activatedRoute,
      queryParams: { action: 'edit' },
    });
  }
}
