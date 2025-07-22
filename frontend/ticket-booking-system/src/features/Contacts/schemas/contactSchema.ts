import { z } from 'zod';

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(50, 'Имя не может быть длиннее 50 символов'),
  email: z
    .string()
    .min(1, 'Email обязателен')
    .email('Неверный формат email'),
  message: z
    .string()
    .min(10, 'Сообщение должно содержать минимум 10 символов')
    .max(500, 'Сообщение не может быть длиннее 500 символов'),
});

export type ContactFormData = z.infer<typeof contactSchema>;