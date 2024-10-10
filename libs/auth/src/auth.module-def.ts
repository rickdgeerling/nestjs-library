import { ConfigurableModuleBuilder } from '@nestjs/common';
import { AuthModuleConfig, AuthUser } from './auth.types';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<AuthModuleConfig<AuthUser>>().build();
