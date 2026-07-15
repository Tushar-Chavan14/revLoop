import * as Yup from "yup";

export const magicLinkSchema = Yup.object({
  email: Yup.string().email("Enter a valid email address").required("Email is required"),
});

export type MagicLinkValues = Yup.InferType<typeof magicLinkSchema>;
