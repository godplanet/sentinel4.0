export const DEPARTMENTS = [
  { id: 'dept-kredi',   name: 'Kurumsal Kredi'      },
  { id: 'dept-uyum',    name: 'Uyum & Regulasyon'   },
  { id: 'dept-it',      name: 'IT Risk & Guvenlik'   },
  { id: 'dept-ops',     name: 'Operasyon Yonetimi'   },
  { id: 'dept-hazine',  name: 'Hazine'               },
  { id: 'dept-retail',  name: 'Bireysel Bankacilik'  },
  { id: 'dept-cibs',    name: 'CIB & Kurumsal'       },
  { id: 'dept-kobi',    name: 'KOBI Bankaciligi'     },
];

export const DEPT_ID_TO_NAME: Record<string, string> = Object.fromEntries(
  DEPARTMENTS.map((d) => [d.id, d.name]),
);
