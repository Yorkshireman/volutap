export type Count = {
  id?: string;
  createdAt?: string;
  currentlyCounting?: boolean;
  lastModified?: string;
  title?: string;
  value: number;
};

export type SetCount = React.Dispatch<React.SetStateAction<Count>>;
export type SetShowCountSelector = React.Dispatch<React.SetStateAction<boolean>>;
export type SetShowSaveInputField = React.Dispatch<React.SetStateAction<boolean>>;
