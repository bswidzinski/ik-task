export interface Store {
  id: string;
  name: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStoreInput {
  name: string;
  address: string;
}

export interface UpdateStoreInput {
  name?: string;
  address?: string;
}
