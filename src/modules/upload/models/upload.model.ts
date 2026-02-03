import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PresignedUpload {
  @Field()
  uploadUrl: string;

  @Field()
  key: string;

  @Field()
  publicUrl: string;
}

@ObjectType()
export class UploadResult {
  @Field()
  key: string;

  @Field()
  url: string;
}
