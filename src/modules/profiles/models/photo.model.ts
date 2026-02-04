import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class PhotoModel {
  @Field()
  url: string;

  @Field(() => Int)
  position: number;
}

// Helper function to convert string[] to PhotoModel[]
export function toPhotoModels(photos: string[] | null | undefined): PhotoModel[] {
  if (!photos || !Array.isArray(photos)) return [];
  return photos.map((url, index) => ({ url, position: index }));
}

// Helper function to convert PhotoModel[] to string[]
export function toPhotoUrls(photos: PhotoModel[]): string[] {
  return photos
    .sort((a, b) => a.position - b.position)
    .map((p) => p.url);
}
