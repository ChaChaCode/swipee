import { Field, ObjectType, ID, Int, Float } from '@nestjs/graphql';
import { Gender, LookingFor } from '../../profiles/models/profile.model';
import { PhotoModel } from '../../profiles/models/photo.model';

@ObjectType()
export class DiscoveryProfile {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  bio?: string;

  @Field(() => Int, { nullable: true })
  age?: number;

  @Field(() => Gender, { nullable: true })
  gender?: Gender;

  @Field(() => LookingFor, { nullable: true })
  lookingFor?: LookingFor;

  @Field({ nullable: true })
  city?: string;

  @Field(() => [PhotoModel])
  photos: PhotoModel[];

  @Field(() => [String])
  interests: string[];

  @Field(() => Float, { nullable: true, description: 'Distance in km' })
  distance?: number;
}

@ObjectType()
export class DiscoveryResult {
  @Field(() => [DiscoveryProfile])
  profiles: DiscoveryProfile[];

  @Field(() => Int)
  total: number;

  @Field()
  hasMore: boolean;
}
