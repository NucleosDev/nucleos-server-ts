// application/queries/auth/get-current-user.query.ts
import { IRequest } from "../../common/mediator/mediator";
import { UserDto } from "../../dto/user-dto";

export interface GetCurrentUserQuery extends IRequest<UserDto> {
  userId: string;
}
