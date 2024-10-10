import { applyDecorators, SetMetadata } from '@nestjs/common';

export const IS_ADMIN = 'app:admin';

export const Admin = () => applyDecorators(SetMetadata(IS_ADMIN, true));
