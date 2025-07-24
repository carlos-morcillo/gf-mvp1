import { Observable } from 'rxjs';

/**
 * Configuration parameters for displaying a confirmation dialog.
 *
 * This interface defines all optional properties that can be used to customize
 * the behavior and appearance of a confirmation prompt (e.g. via a modal or alert).
 */
export interface ConfirmableParams {
  /**
   * The title of the confirmation dialog.
   * Can be a static string or an observable of a string.
   */
  title?: string | Observable<string>;

  /**
   * The content/message shown inside the confirmation dialog.
   * Can be a static string or an observable of a string.
   */
  content?: string | Observable<string>;

  /**
   * Whether to show a "Deny" button alongside the confirmation button.
   * Defaults to false if not provided.
   */
  showDenyButton?: boolean;

  /**
   * Text to display on the confirmation button.
   * Can be a static string or an observable of a string.
   */
  confirmButtonText?: string | Observable<string>;

  /**
   * Text to display on the deny button.
   * Can be a static string or an observable of a string.
   */
  denyButtonText?: string | Observable<string>;

  /**
   * Icon to be shown in the dialog (e.g. success, warning, info).
   * Can be a string representing the icon name or an observable of one.
   */
  icon?: string | Observable<string>;
}
