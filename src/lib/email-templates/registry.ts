import type { ReactElement } from "react";

export interface TemplateEntry {
  component: (props: Record<string, unknown>) => ReactElement;
  subject: string;
  displayName?: string;
  previewData?: Record<string, unknown>;
  to?: string;
}

import { template as welcome } from "./welcome";
import { template as unfinishedDocument } from "./unfinished-document";

export const TEMPLATES: Record<string, TemplateEntry> = {
  welcome,
  "unfinished-document": unfinishedDocument,
};

export type TemplateName = keyof typeof TEMPLATES;
