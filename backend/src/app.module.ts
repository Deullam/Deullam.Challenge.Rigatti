/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Módulo raiz que delega para o RootModule (composition root).
 */

import { Module } from '@nestjs/common';
import { RootModule } from './Presentation/Modules/RootModule';

@Module({
  imports: [RootModule],
})
export class AppModule {}

