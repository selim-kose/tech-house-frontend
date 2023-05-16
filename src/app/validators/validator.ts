import { FormControl, ValidationErrors } from "@angular/forms";

export class Validator {

   static nonBlank(control: FormControl): ValidationErrors {

      if (control.value != null && control.value.trim().length === 0) {
         return { 'nonBlank': true }
      }

      return null;
   }
}
