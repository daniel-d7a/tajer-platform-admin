import { z } from "zod"


export const SiteSettingsSchema = z.object({
  marketingPhrase: z.string(),
})

export const GetSiteSettingsSchema = SiteSettingsSchema
export type GetSiteSettings = z.infer<typeof GetSiteSettingsSchema>


export const PutSiteSettingsSchema = SiteSettingsSchema.partial()
export type PutSiteSettings = z.infer<typeof PutSiteSettingsSchema>
