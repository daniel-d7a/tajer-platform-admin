import { z } from "zod"

export const BannerSchema = z.object({
  id: z.number(),
  imageUrl: z.string(),
  headline: z.string().nullable(),
  link: z.string().nullable(),
  isActive: z.boolean().nullable(),
  position: z.enum(["top", "middle", "bottom"]),
})

export const GetBannerSchema = BannerSchema
export type GetBanner = z.infer<typeof GetBannerSchema>

export const PostBannerSchema = BannerSchema.omit({ id: true })
export type PostBanner = z.infer<typeof PostBannerSchema>

export const PutBannerSchema = PostBannerSchema.partial()
export type PutBanner = z.infer<typeof PutBannerSchema>
