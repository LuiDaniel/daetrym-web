import { index, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { idColumn, timestampColumns } from './columns.helpers';
import { leadStatusEnum } from './contact';

export const projectTypeEnum = pgEnum('project_type', [
  'web_app',
  'custom_software',
  'security',
  'consulting',
  'other',
]);

export const budgetRangeEnum = pgEnum('budget_range', [
  'lt_5k',
  '5k_15k',
  '15k_40k',
  'gt_40k',
  'not_sure',
]);

export const timelineEnum = pgEnum('timeline', ['asap', '1_3_months', '3_6_months', 'flexible']);

/** Solicitudes de propuesta (formulario multi-paso, src/actions/quote.ts). */
export const quoteRequests = pgTable(
  'quote_requests',
  {
    ...idColumn,
    name: text('name').notNull(),
    email: text('email').notNull(),
    company: text('company'),
    projectType: projectTypeEnum('project_type').notNull(),
    /** Servicios concretos que interesan, subconjunto de `projectTypeEnum` (sin "other"). */
    services: text('services').array().notNull(),
    budgetRange: budgetRangeEnum('budget_range').notNull(),
    timeline: timelineEnum('timeline').notNull(),
    description: text('description').notNull(),
    locale: text('locale').notNull(),
    ipHash: text('ip_hash').notNull(),
    userAgent: text('user_agent'),
    status: leadStatusEnum('status').notNull().default('new'),
    privacyConsentAt: timestamp('privacy_consent_at', { withTimezone: true }).notNull(),
    ...timestampColumns,
  },
  (table) => [
    index('quote_requests_status_created_idx').on(table.status, table.createdAt),
    index('quote_requests_email_idx').on(table.email),
  ],
);
