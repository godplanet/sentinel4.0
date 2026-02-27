export type FieldType = 'text' | 'textarea' | 'select' | 'date' | 'rating' | 'boolean' | 'attachment';

export interface CustomField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface AuditTemplate {
  id: string;
  name: string;
  description: string;
  module: 'PROCESS' | 'BRANCH' | 'IT' | 'REGULATION';
  fields: CustomField[];
  isDefault?: boolean;
  createdAt: string;
}
