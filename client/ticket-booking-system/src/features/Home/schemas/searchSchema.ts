import { z } from 'zod';

// Схема для формы поиска
export const searchSchema = z.object({
  searchFrom: z
    .string()
    .min(2, 'Пункт отправления должен содержать минимум 2 символа')
    .max(100, 'Пункт отправления не может быть длиннее 100 символов'),
  searchTo: z
    .string()
    .min(2, 'Пункт назначения должен содержать минимум 2 символа')
    .max(100, 'Пункт назначения не может быть длиннее 100 символов'),
  searchDate: z
    .string()
    .min(1, 'Дата обязательна')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Неверный формат даты (гггг-мм-дд)'),
  searchPassengers: z
    .string()
    .min(1, 'Укажите количество пассажиров')
    .regex(/^\d+$/, 'Количество пассажиров должно быть числом')
    .refine((val) => parseInt(val) > 0, {
      message: 'Количество пассажиров должно быть больше 0',
    }),
});

// Тип для формы, основанный на схеме
export type SearchFormData = z.infer<typeof searchSchema>;