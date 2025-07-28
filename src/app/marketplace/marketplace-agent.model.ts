export interface MarketplaceAgent {
  id: string;
  name: string;
  description?: string;
  category?: string;
  rating?: number;
  meta?: {
    profile_image_url?: string;
    description?: string;
    [key: string]: any;
  };
  [key: string]: any;
}
