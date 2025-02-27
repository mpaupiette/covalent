import { Injectable, Provider, SkipSelf, Optional, Type } from '@angular/core';
import { Validators, ValidatorFn, FormControl, AbstractControl } from '@angular/forms';

import { TdDynamicInputComponent } from '../dynamic-elements/dynamic-input/dynamic-input.component';
import { TdDynamicFileInputComponent } from '../dynamic-elements/dynamic-file-input/dynamic-file-input.component';
import { TdDynamicTextareaComponent } from '../dynamic-elements/dynamic-textarea/dynamic-textarea.component';
import { TdDynamicSlideToggleComponent } from '../dynamic-elements/dynamic-slide-toggle/dynamic-slide-toggle.component';
import { TdDynamicCheckboxComponent } from '../dynamic-elements/dynamic-checkbox/dynamic-checkbox.component';
import { TdDynamicSliderComponent } from '../dynamic-elements/dynamic-slider/dynamic-slider.component';
import { TdDynamicSelectComponent } from '../dynamic-elements/dynamic-select/dynamic-select.component';
import { TdDynamicDatepickerComponent } from '../dynamic-elements/dynamic-datepicker/dynamic-datepicker.component';

export enum TdDynamicType {
  Text = 'text',
  Boolean = 'boolean',
  Number = 'number',
  Array = 'array',
  Date = 'date',
}

export enum TdDynamicElement {
  Input = 'input',
  Datepicker = 'datepicker',
  Password = 'password',
  Textarea = 'textarea',
  Slider = 'slider',
  SlideToggle = 'slide-toggle',
  Checkbox = 'checkbox',
  Select = 'select',
  FileInput = 'file-input',
}

export interface ITdDynamicElementValidator {
  validator: ValidatorFn;
}

// Property values to be set in custom component
export interface ITdDynamicElementCustomConfig {
  [name: string]: any;
}

export interface ITdDynamicElementConfig {
  label?: string;
  name: string;
  hint?: string;
  type: TdDynamicType | TdDynamicElement | Type<any>;
  required?: boolean;
  disabled?: boolean;
  min?: any;
  max?: any;
  minLength?: any;
  maxLength?: any;
  selections?: string[] | { value: any; label: string }[];
  multiple?: boolean;
  default?: any;
  flex?: number;
  validators?: ITdDynamicElementValidator[];
  customConfig?: ITdDynamicElementCustomConfig;
  placeholder?: string;
}

export const DYNAMIC_ELEMENT_NAME_REGEX: RegExp = /^[^0-9][^\@]*$/;

@Injectable()
export class TdDynamicFormsService {
  /**
   * Method to validate if the [name] is a proper element name.
   * Throws error if name is not valid.
   */
  validateDynamicElementName(name: string): void {
    if (!DYNAMIC_ELEMENT_NAME_REGEX.test(name)) {
      throw new Error('Dynamic element name: "${name}" is not valid.');
    }
  }

  /**
   * Gets component to be rendered depending on [TdDynamicElement | TdDynamicType]
   * Throws error if it does not exists or not supported.
   */
  getDynamicElement(element: TdDynamicElement | TdDynamicType | Type<any>): any {
    switch (element) {
      case TdDynamicType.Text:
      case TdDynamicType.Number:
      case TdDynamicElement.Input:
      case TdDynamicElement.Password:
        return TdDynamicInputComponent;
      case TdDynamicElement.Textarea:
        return TdDynamicTextareaComponent;
      case TdDynamicType.Boolean:
      case TdDynamicElement.SlideToggle:
        return TdDynamicSlideToggleComponent;
      case TdDynamicElement.Checkbox:
        return TdDynamicCheckboxComponent;
      case TdDynamicElement.Slider:
        return TdDynamicSliderComponent;
      case TdDynamicType.Array:
      case TdDynamicElement.Select:
        return TdDynamicSelectComponent;
      case TdDynamicElement.FileInput:
        return TdDynamicFileInputComponent;
      case TdDynamicElement.Datepicker:
      case TdDynamicType.Date:
        return TdDynamicDatepickerComponent;
      default:
        throw new Error(`Error: type ${element} does not exist or not supported.`);
    }
  }

  /**
   * Creates form control for element depending [ITdDynamicElementConfig] properties.
   */
  createFormControl(config: ITdDynamicElementConfig): FormControl {
    const validator: ValidatorFn = this.createValidators(config);
    return new FormControl({ value: config.default, disabled: config.disabled }, validator);
  }

  /**
   * Creates form validationdepending [ITdDynamicElementConfig] properties.
   */
  createValidators(config: ITdDynamicElementConfig): ValidatorFn {
    let validator: ValidatorFn;
    if (config.required) {
      validator = Validators.required;
    }
    if (config.max || config.max === 0) {
      validator = Validators.compose([validator, Validators.max(parseFloat(config.max))]);
    }
    if (config.min || config.min === 0) {
      validator = Validators.compose([validator, Validators.min(parseFloat(config.min))]);
    }
    if (config.maxLength || config.maxLength === 0) {
      validator = Validators.compose([validator, Validators.maxLength(parseFloat(config.maxLength))]);
    }
    if (config.minLength || config.minLength === 0) {
      validator = Validators.compose([validator, Validators.minLength(parseFloat(config.minLength))]);
    }
    // Add provided custom validators to the validator function
    if (config.validators) {
      config.validators.forEach((validatorConfig: ITdDynamicElementValidator) => {
        validator = Validators.compose([validator, validatorConfig.validator]);
      });
    }
    return validator;
  }
}

export function DYNAMIC_FORMS_PROVIDER_FACTORY(parent: TdDynamicFormsService): TdDynamicFormsService {
  return parent || new TdDynamicFormsService();
}

export const DYNAMIC_FORMS_PROVIDER: Provider = {
  // If there is already a service available, use that. Otherwise, provide a new one.
  provide: TdDynamicFormsService,
  deps: [[new Optional(), new SkipSelf(), TdDynamicFormsService]],
  useFactory: DYNAMIC_FORMS_PROVIDER_FACTORY,
};
