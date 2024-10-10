import { applyDecorators, SetMetadata } from '@nestjs/common';

export const IS_PUBLIC = 'app:public';

export const Public = () => applyDecorators(SetMetadata(IS_PUBLIC, true));
