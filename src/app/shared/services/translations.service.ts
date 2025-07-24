import { Injectable, Signal, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AvailableLangs,
  HashMap,
  SetTranslationOptions,
  TranslateParams,
  Translation,
  TranslocoScope,
  TranslocoService,
} from '@jsverse/transloco';
import { PaginableTranslationService } from 'ng-hub-ui-table';
import { Observable } from 'rxjs';

export const defaultLanguage: string = navigator.language.substring(0, 2);

const timeagoLanguageStrings = { es: {}, en: {} };

/**
 * Translations service that wraps Transloco and provides a static API to access translations,
 * active language, and related configurations throughout the app. Also integrates with ngx-timeago
 * and paginable table translations.
 */
@Injectable({ providedIn: 'root' })
export class Translations {
  #translocoSvc = inject(TranslocoService);
  // #timeAgoIntl = inject(TimeagoIntl);
  #paginableTranslationSvc = inject(PaginableTranslationService);

  static translateInstance: TranslocoService;

  /**
   * Returns the translation synchronously for the provided key.
   */
  static instant(
    key: TranslateParams,
    params?: HashMap,
    lang?: string
  ): string {
    return Translations.translateInstance.translate(key, params, lang);
  }

  /**
   * Returns an observable for a translation key.
   */
  static watch<T = any>(
    key: TranslateParams,
    params?: HashMap,
    lang?: string | TranslocoScope | TranslocoScope[],
    _isObject?: boolean
  ): Observable<T> {
    return Translations.translateInstance.selectTranslate(
      key,
      params,
      lang,
      _isObject
    );
  }

  /**
   * Sets a new translation object manually.
   */
  static setTranslation(
    translation: Translation,
    lang?: string,
    options?: SetTranslationOptions
  ): void {
    Translations.translateInstance.setTranslation(translation, lang, options);
  }

  /**
   * Sets the active language and stores it in localStorage.
   */
  static setActiveLang(lang: string): TranslocoService {
    localStorage.setItem('language', lang);
    return Translations.translateInstance.setActiveLang(lang);
  }

  /**
   * Returns the current active language.
   */
  static getActiveLang(): string {
    return Translations.translateInstance.getActiveLang();
  }

  /**
   * Sets the default language.
   */
  static setDefaultLang(lang: string): void {
    return Translations.translateInstance.setDefaultLang(lang);
  }

  /**
   * Returns the default language.
   */
  static getDefaultLang(): string {
    return Translations.translateInstance.getDefaultLang();
  }

  /**
   * Sets the available languages for the app.
   */
  static setAvailableLangs(langs: AvailableLangs): void {
    Translations.translateInstance.setAvailableLangs(langs);
  }

  /**
   * Returns the list of available languages.
   */
  static getAvailableLangs(): AvailableLangs {
    return Translations.translateInstance.getAvailableLangs();
  }

  /**
   * A reactive signal that emits the current active language.
   */
  static langChanges: Signal<string | undefined>;

  /**
   * Effect to react to language changes and update dependent services,
   * like paginable translation labels.
   */
  langChangeEffect = effect(() => {
    if (!Translations.langChanges()) {
      return;
    }
    Translations.langChanges();
    setTimeout(() => {
      const translations = this.#translocoSvc.translateObject('PAGINABLE');
      this.#paginableTranslationSvc.setTranslations(
        typeof translations === 'object' ? translations : {}
      );
    }, 128);
  });

  /**
   * An array of available language objects with their code and display names.
   */
  static availableLangs: {
    code: string;
    nativeName: string;
    englishName: string;
  }[] = [
    { code: 'es', nativeName: 'castellano', englishName: 'spanish' },
  ]; /* Object.keys(languages).reduce((acc, code) => {
		if (availableLanguages.includes(code)) {
			acc.push({ code, ...languages[code] });
		}
		return acc;
	}, []); */

  /**
   * Constructor that sets up the default language, signals and timeago integration.
   */
  private constructor() {
    Translations.translateInstance = this.#translocoSvc;
    Translations.langChanges = toSignal(
      Translations.translateInstance.langChanges$
    );
    this.setTimeagoLang(localStorage.getItem('language') ?? defaultLanguage);
  }

  // /**
  //  * Constructor that sets up the default language, signals and timeago integration.
  //  */
  // private constructor() {
  // 	Translations.translateInstance = this.#translocoSvc;
  // 	console.log('constructor', Translations.translateInstance.langChanges$);

  // 	// Translations.langChanges = toSignal(
  // 	// 	Translations.translateInstance.langChanges$
  // 	// );

  // 	this.setTimeagoLang(localStorage.getItem('language') ?? defaultLanguage);
  // }
  // ngAfterViewInit() {
  // 	Translations.langChanges = toSignal(
  // 		Translations.translateInstance.langChanges$
  // 	);
  // }

  /**
   * Sets the language strings for ngx-timeago based on the selected language.
   */
  setTimeagoLang(lang: string): void {
    // this.#timeAgoIntl.strings = timeagoLanguageStrings[lang];
    // this.#timeAgoIntl.changes.next();
  }
}
