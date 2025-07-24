import { inject, Injectable } from '@angular/core';
import { IndividualConfig, ToastrService } from 'ngx-toastr';

/**
 * Global Toast notification service wrapper for ngx-toastr.
 *
 * Provides static methods to show success, info, warning and error messages
 * from anywhere in the application, without needing to inject the service manually.
 */
@Injectable({
	providedIn: 'root'
})
export class Toast {
	#toastrSvc = inject(ToastrService);

	static instance: Toast;

	private constructor() {
		Toast.instance = this;
	}

	/**
	 * Shows a success toast message.
	 * @param message - The body of the message.
	 * @param title - Optional title for the message.
	 * @param override - Optional configuration to override default settings.
	 */
	static success(
		message: string,
		title?: string,
		override?: Partial<IndividualConfig>
	): void {
		Toast.instance.#toastrSvc.success(message, title, override);
	}

	/**
	 * Shows an informational toast message.
	 * @param message - The body of the message.
	 * @param title - Optional title for the message.
	 * @param override - Optional configuration to override default settings.
	 */
	static info(
		message: string,
		title?: string,
		override?: Partial<IndividualConfig>
	): void {
		Toast.instance.#toastrSvc.info(message, title, override);
	}

	/**
	 * Shows an error toast message.
	 * @param message - The body of the message.
	 * @param title - Optional title for the message.
	 * @param override - Optional configuration to override default settings.
	 */
	static error(
		message: string,
		title?: string,
		override?: Partial<IndividualConfig>
	): void {
		Toast.instance.#toastrSvc.error(message, title, override);
	}

	/**
	 * Shows a warning toast message.
	 * @param message - The body of the message.
	 * @param title - Optional title for the message.
	 * @param override - Optional configuration to override default settings.
	 */
	static warning(
		message: string,
		title?: string,
		override?: Partial<IndividualConfig>
	): void {
		Toast.instance.#toastrSvc.warning(message, title, override);
	}
}
