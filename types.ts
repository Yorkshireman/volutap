export enum AlertType {
  SOUND = 'sound',
  SOUND_AND_VIBRATE = 'sound and vibrate',
  VIBRATE = 'vibrate'
}

export type Alert = {
  at: number;
  on: boolean;
  repeat: boolean;
  type: AlertType;
  id: string;
};

export type Count = {
  alerts: Alert[] | [];
  createdAt: string;
  currentlyCounting: 1 | 0;
  id: string;
  lastModified: string;
  saved: 1 | 0;
  title?: string;
  value: number;
};

export type DbCount = {
  alerts: string; // JSON stringified array of alerts
  createdAt: string;
  currentlyCounting: 1 | 0;
  id: string;
  lastModified: string;
  saved: 1;
  title: string;
  value: number;
};

export type SetDropdownVisible = React.Dispatch<React.SetStateAction<boolean>>;
export type SetShowEditInputField = React.Dispatch<React.SetStateAction<boolean>>;
export type SetShowOptionsMenu = React.Dispatch<React.SetStateAction<boolean>>;
export type SetShowSaveInputField = React.Dispatch<React.SetStateAction<boolean>>;
export type SetTitleToSave = React.Dispatch<React.SetStateAction<string>>;
