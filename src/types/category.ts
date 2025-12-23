import { z } from 'zod';

const baseCategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  parentId: z.number().nullable(),
  name_ar: z.string(),
  imageUrl: z.string().nullable(),
});

export type CategoryTree = z.infer<typeof baseCategorySchema> & {
  children: CategoryTree[];

};

export const GetCategorySchema: z.ZodType<CategoryTree> = baseCategorySchema.extend({
  children: z.lazy(() => GetCategorySchema.array()),
});

export type GetCategory = z.infer<typeof GetCategorySchema>;

export const PostCategorySchema = z.object({
  name: z.string().min(2, { message: 'اسم التصنيف مطلوب' }),
  parentId: z.preprocess(
    (val) => (val === '' ? null : Number(val)),
    z.number().nullable()
  ),
  name_ar: z.string().min(2, { message: 'اسم التصنيف بالعربية مطلوب' }),
});

export type PostCategory = z.infer<typeof PostCategorySchema>;

export const PutCategorySchema = PostCategorySchema.partial();
export type PutCategory = z.infer<typeof PutCategorySchema>;
