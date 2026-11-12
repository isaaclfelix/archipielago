import { Module } from '@nestjs/common';

/**
 * Nest host module for Archipielago asset mounting.
 *
 * HTML pages are Handlebars views on the host. This module exists so hosts can
 * import a Nest package surface; asset mounting is {@link mountArchipielagoAssets}.
 */
@Module({})
export class ArchipielagoModule {}
