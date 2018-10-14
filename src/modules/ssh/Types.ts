export interface IKeyboardResult {
  type: KeyboardResultType;
  cancel: boolean;
  key: string | undefined;
}

export const enum KeyboardResultType {
  SEND_KEY,
  SELECT_ALL,
  PAGE_UP,
  PAGE_DOWN
}

export interface IKeyboardEvent {
  altKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
  keyCode: number;
  key: string;
  type: string;
}
