// import { isUpperSnakeCaseWithDots } from '@utils/strings';
// import { ConfirmDialogComponent } from '../components/confirm-dialog/confirm-dialog.component';
import { ConfirmableParams } from '../types/modal';

// Confirmable is now a factory function, with an optional parameter object
export function Confirmable(options: ConfirmableParams = {}) {
  // our factory function will return our actual decorator function, but now we have
  // an actual options object to configure our alert box :)
  return (
    target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => {
    // the usual, caching the original implementation
    const originalMethod = descriptor.value;
    // from here it’s the same as before. We write the new implementation
    descriptor.value = async function (...args: Array<any>) {
      // default values for our config, we’ll overwrite this with our options parameter
      const config: ConfirmableParams = {
        title: 'GENERIC.TITLES.DELETE_ELEMENT',
        content: 'GENERIC.MESSAGES.WARNING.DELETE_ELEMENT?',
        showDenyButton: true,
        confirmButtonText: 'GENERIC.BUTTONS.DELETE',
        denyButtonText: 'GENERIC.BUTTONS.CANCEL',
        icon: 'question',
        ...options,
      };

      for (const key in config) {
        if (Object.prototype.hasOwnProperty.call(config, key)) {
          //   const value = config[key];
          // if (typeof value === 'string' && isUpperSnakeCaseWithDots(value)) {
          // 	config[key] = Translations.instant(value);
          // }
        }
      }

      return true;

      // fire modal with the config object
      debugger;
      // const modalRef: HubModalRef = modal().open(ConfirmDialogComponent, {
      // 	windowClass: 'modal-with-side-background',
      // 	size: 'lg',
      // 	animation: true,
      // 	backdrop: 'static'
      // });
      // Object.keys(config).forEach(
      // 	(k) => (modalRef.componentInstance[k] = config[k])
      // );

      // try {
      // 	const result = await modalRef.result;
      // 	// if user clicked yes,
      // 	if (result) {
      // 		// run original implementation if user confirms
      // 		return originalMethod.apply(this, args);
      // 	}
      // } catch (error) {
      // 	if (
      // 		error &&
      // 		![
      // 			ModalDismissReasons.ESC,
      // 			ModalDismissReasons.BACKDROP_CLICK
      // 		].includes(error)
      // 	) {
      // 		Toast.error(error);
      // 	}
      // }
    };
    return descriptor;
  };
}
