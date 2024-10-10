import { Request } from 'express';

export interface AppRequest<User> extends Request {
  user?: User;
}
