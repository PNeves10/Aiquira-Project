import { z } from 'zod';

export const assetSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters'),
  price: z.number()
    .min(0, 'Price must be positive')
    .max(1000000000, 'Price must be less than 1 billion'),
  location: z.string()
    .min(2, 'Location must be at least 2 characters')
    .max(100, 'Location must be less than 100 characters'),
  type: z.enum(['Commercial', 'Residential', 'Industrial', 'Land']),
  status: z.enum(['Available', 'Pending', 'Sold', 'Rented']),
  imageUrl: z.string().url('Must be a valid URL'),
});

export type AssetFormData = z.infer<typeof assetSchema>;

export const validateAsset = (data: unknown) => {
  try {
    return assetSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      };
    }
    return {
      success: false,
      errors: [{ field: 'unknown', message: 'An unexpected error occurred' }],
    };
  }
};

export const getFieldError = (errors: Array<{ field: string; message: string }>, field: string) => {
  return errors.find(error => error.field === field)?.message;
}; 