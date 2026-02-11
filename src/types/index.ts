export interface Link {
  id: number;
  originalUrl: string;
  shortCode: string;
  createdAt: Date;
}

export interface Click {
  id: number;
  linkId: number;
  validClick: boolean;
  createdAt: Date;
}

export interface LinkStats {
  originalUrl: string;
  shortCode: string;
  totalValidClicks: number;
  clicksByMonth: {
    [key: string]: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
