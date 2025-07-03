export type Count = {
  id?: string;
  createdAt?: string;
  currentlyCounting?: boolean;
  lastModified?: string;
  title?: string;
  value: number;
};

export type DbCount = {
  id: string;
  createdAt: string;
  currentlyCounting: boolean;
  lastModified: string;
  title: string;
  count: number;
};
