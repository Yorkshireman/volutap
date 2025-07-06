export type Count = {
  id?: string;
  createdAt?: string;
  currentlyCounting?: boolean;
  lastModified?: string;
  title?: string;
  value: number;
};

export type DbCount = {
  createdAt: string;
  currentlyCounting: boolean;
  id: string;
  lastModified: string;
  title: string;
  value: number;
};

export type SetCount = React.Dispatch<React.SetStateAction<Count>>;
export type SetDropdownVisible = React.Dispatch<React.SetStateAction<boolean>>;
export type SetShowEditInputField = React.Dispatch<React.SetStateAction<boolean>>;
export type SetShowSaveInputField = React.Dispatch<React.SetStateAction<boolean>>;
export type SetTitleToSave = React.Dispatch<React.SetStateAction<string>>;
