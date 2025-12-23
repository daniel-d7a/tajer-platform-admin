import { z } from "zod"
import { GetCategorySchema } from "./category"

export const UnitTypeSchema = z.enum(["piece_only", "pack_only", "piece_or_pack"])
export type UnitType = z.infer<typeof UnitTypeSchema>

export const ProductSchema = z.object({
  id: z.number(),
  src:z.string().nullable(),
  barcode: z.string().nullable(),
  name: z.string(),
  description: z.string().nullable(),
  piecePrice: z.number(), 
  packPrice: z.number().nullable(), 
  piecesPerPack: z.number().int().nullable(), 
  unitType: UnitTypeSchema, 
  discountType :z.string(),
  discountAmount :z.string(),
  categories : z.array(z.string()).optional() ,
  manufacturer: z.string(),
  imageUrl: z.string().nullable(),
  minOrderQuantity: z.number().nullable(),
  categoryIds: z.array(z.number()).optional(),
  name_ar:z.string(),
  image_public_id:z.string(),
  factoryId :z.number(),
  description_ar: z.string()
})

export const GetProductSchema = ProductSchema.extend({
  categories: z.array(GetCategorySchema).optional(),
})
export type GetProduct = z.infer<typeof GetProductSchema>
export const PostProductSchema = ProductSchema.omit({ id: true }).extend({
  name: z.string().min(2, { message: "اسم المنتج مطلوب" }),
  piecePrice: z.number().positive({ message: "يجب أن يكون سعر القطعة أكبر من صفر" }),
  manufacturer: z.string().min(1, { message: "اسم المصنع مطلوب" }),
  categoryIds: z.array(z.number()).optional(),
  factoryId : z.string(),
}).superRefine((data, ctx) => {
  if (data.unitType === "piece_only") {
    if (data.packPrice !== null && data.packPrice !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "سعر العبوة يجب أن يكون فارغاً لمنتج يباع بالقطعة فقط",
        path: ["packPrice"],
      });
    }
    if (data.piecesPerPack !== null && data.piecesPerPack !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "عدد القطع في العبوة يجب أن يكون فارغاً لمنتج يباع بالقطعة فقط",
        path: ["piecesPerPack"],
      });
    }
  } else if (data.unitType === "pack_only") {
    if (data.packPrice === null || data.packPrice === undefined || data.packPrice <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "سعر العبوة مطلوب ويجب أن يكون أكبر من صفر لمنتج يباع بالعبوة فقط",
        path: ["packPrice"],
      });
    }
    if (data.piecesPerPack === null || data.piecesPerPack === undefined || data.piecesPerPack <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "عدد القطع في العبوة مطلوب ويجب أن يكون أكبر من صفر لمنتج يباع بالعبوة فقط",
        path: ["piecesPerPack"],
      });
    }
  } else if (data.unitType === "piece_or_pack") {
    if (data.packPrice === null || data.packPrice === undefined || data.packPrice <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "سعر العبوة مطلوب ويجب أن يكون أكبر من صفر لمنتج يباع بالقطعة أو العبوة",
        path: ["packPrice"],
      });
    }
    if (data.piecesPerPack === null || data.piecesPerPack === undefined || data.piecesPerPack <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "عدد القطع في العبوة مطلوب ويجب أن يكون أكبر من صفر لمنتج يباع بالقطعة أو العبوة",
        path: ["piecesPerPack"],
      });
    }
  }
});
export type PostProduct = z.infer<typeof PostProductSchema>

export const PutProductSchema = ProductSchema.partial().superRefine((data, ctx) => {
  if (data.unitType === "piece_only") {
    if (data.packPrice !== null && data.packPrice !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "سعر العبوة يجب أن يكون فارغاً لمنتج يباع بالقطعة فقط",
        path: ["packPrice"],
      });
    }
    if (data.piecesPerPack !== null && data.piecesPerPack !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "عدد القطع في العبوة يجب أن يكون فارغاً لمنتج يباع بالقطعة فقط",
        path: ["piecesPerPack"],
      });
    }
  } else if (data.unitType === "pack_only") {
    if (data.packPrice === null || data.packPrice === undefined || data.packPrice <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "سعر العبوة مطلوب ويجب أن يكون أكبر من صفر لمنتج يباع بالعبوة فقط",
        path: ["packPrice"],
      });
    }
    if (data.piecesPerPack === null || data.piecesPerPack === undefined || data.piecesPerPack <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "عدد القطع في العبوة مطلوب ويجب أن يكون أكبر من صفر لمنتج يباع بالعبوة فقط",
        path: ["piecesPerPack"],
      });
    }
  } else if (data.unitType === "piece_or_pack") {
    if (data.packPrice === null || data.packPrice === undefined || data.packPrice <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "سعر العبوة مطلوب ويجب أن يكون أكبر من صفر لمنتج يباع بالقطعة أو العبوة",
        path: ["packPrice"],
      });
    }
    if (data.piecesPerPack === null || data.piecesPerPack === undefined || data.piecesPerPack <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "عدد القطع في العبوة مطلوب ويجب أن يكون أكبر من صفر لمنتج يباع بالقطعة أو العبوة",
        path: ["piecesPerPack"],
      });
    }
  }
});
export type PutProduct = z.infer<typeof PutProductSchema>
