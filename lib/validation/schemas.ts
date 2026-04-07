import { z } from 'zod';

/**
 * Registration form validation schema
 */
export const registrationSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(255, 'Name is too long'),
    churchName: z
      .string()
      .min(2, 'Church name must be at least 2 characters')
      .max(255, 'Church name is too long'),
    preferredDate: z.string().refine(
      (date) => {
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate >= today;
      },
      { message: 'Date must be today or in the future' }
    ),
    totalPeople: z
      .number()
      .int()
      .min(1, 'At least 1 person required')
      .max(50, 'Maximum 50 people per registration'),
    tamilCount: z.number().int().min(0, 'Tamil count cannot be negative'),
    englishCount: z.number().int().min(0, 'English count cannot be negative'),
    phone: z.string().optional(),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
  })
  .refine((data) => data.tamilCount + data.englishCount === data.totalPeople, {
    message: 'Tamil count + English count must equal total people',
    path: ['tamilCount'],
  })
  .refine((data) => data.tamilCount > 0 || data.englishCount > 0, {
    message: 'At least one language must be selected',
    path: ['tamilCount'],
  });

export type RegistrationFormData = z.infer<typeof registrationSchema>;

/**
 * Admin login schema
 */
export const adminLoginSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

export type AdminLoginData = z.infer<typeof adminLoginSchema>;

/**
 * Schedule update schema
 */
export const scheduleUpdateSchema = z.object({
  isActive: z.boolean(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  notes: z.string().optional(),
});

export type ScheduleUpdateData = z.infer<typeof scheduleUpdateSchema>;

// Made with Bob
