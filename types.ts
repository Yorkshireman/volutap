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
  createdAt?: string;
  currentlyCounting: boolean;
  id: string;
  lastModified?: string;
  saved: boolean;
  title?: string;
  value: number;
};

export type DbCount = {
  alerts: string; // JSON stringified array of alerts
  createdAt: string;
  currentlyCounting: boolean;
  id: string;
  lastModified: string;
  saved: true;
  title: string;
  value: number;
};

export type SetDropdownVisible = React.Dispatch<React.SetStateAction<boolean>>;
export type SetShowEditInputField = React.Dispatch<React.SetStateAction<boolean>>;
export type SetShowOptionsMenu = React.Dispatch<React.SetStateAction<boolean>>;
export type SetShowSaveInputField = React.Dispatch<React.SetStateAction<boolean>>;
export type SetTitleToSave = React.Dispatch<React.SetStateAction<string>>;
