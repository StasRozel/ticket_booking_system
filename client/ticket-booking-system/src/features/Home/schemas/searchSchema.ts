import { z } from 'zod';

// Схема для формы поиска
export const searchSchema = z.object({
  searchFrom: z
    .string()
    .max(100, 'Пункт отправления не может быть длиннее 100 символов'),
  searchTo: z
    .string()
    .max(100, 'Пункт назначения не может быть длиннее 100 символов'),
  searchDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Неверный формат даты (гггг-мм-дд)'),
  searchPassengers: z
    .string()
    .min(0, 'Укажите количество пассажиров')
    .max(2, 'Количество пассажиров не должно быть больше 99')
    .regex(/^\d*$/, 'Количество пассажиров должно быть числом')
    .refine((val) => {
      if (val == '') val = '1'
      return parseInt(val) > 0
    }, {
      message: 'Количество пассажиров должно быть больше 0',
    }),
    
});

// Тип для формы, основанный на схеме
export type SearchFormData = z.infer<typeof searchSchema>;