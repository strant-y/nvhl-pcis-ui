
export interface dynamicFormMethod {
  getFromValue: () => any;
  setFormValue: (data: any, noupdate?: boolean) => void;
  validate: () => any;
  validateField: (fields: string | string[]) => any
  setValue: (key: any, value: any, noupdate?: boolean) => void;
  getValue: (key: any) => any;
  checkKey: (key: any) => boolean;
  clearValidate: () => any;
  resetFields: () => any;
}