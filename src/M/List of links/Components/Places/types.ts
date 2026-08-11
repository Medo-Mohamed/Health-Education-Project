// types.ts

export type PlaceType = "administrative" | "operational" | "external_location";

export interface IPlaceMetadata {
  description?: string;
  address_details?: string;
  phone_numbers?: string[];
  photo_url?: string;
}

export interface IPlace {
  _id: string;
  name: string;
  type: PlaceType;
  parent_id?: string | null;
  ancestors?: string[];
  created_by: string;
  metadata?: IPlaceMetadata;
  createdAt?: string;
  updatedAt?: string;
}
