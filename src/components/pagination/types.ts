export type PaginatedData<T> = {
  list: T[];
  metadata: {
    count: number;
    hasNextPage: boolean;
    cursor?: {
      createdAt: number;
      id: string;
    };
  };
};
