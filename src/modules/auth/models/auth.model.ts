import { Field, ObjectType } from '@nestjs/graphql';
import { UserModel } from '../../users/models/user.model';
import { ProfileModel } from '../../profiles/models/profile.model';

@ObjectType()
export class AuthPayload {
  @Field(() => UserModel)
  user: UserModel;

  @Field(() => ProfileModel, { nullable: true })
  profile?: ProfileModel;

  @Field()
  isNewUser: boolean;
}
