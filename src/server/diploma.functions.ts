import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { appendDiplomaRow } from "./diploma.server";

const schema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().max(255),
  whatsapp: z.string().min(5).max(40),
  affiliateCode: z.string().min(1).max(60),
  dob: z.string().min(4).max(20),
  sex: z.enum(["male", "female"]),
  documentNumber: z.string().min(1).max(60),
  fatherName: z.string().max(120).optional().default(""),
  motherName: z.string().max(120).optional().default(""),
  belt: z.string().min(1).max(60),
  martialArt: z.string().min(1).max(60),
  language: z.string().min(2).max(5),
  currency: z.enum(["BRL", "EUR", "USD"]),
  price: z.number().nonnegative(),
});

export const submitDiplomaRequest = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    try {
      await appendDiplomaRow(data);
      return { ok: true as const };
    } catch (error) {
      console.error("submitDiplomaRequest failed:", error);
      return {
        ok: false as const,
        error:
          error instanceof Error ? error.message : "Unable to record request",
      };
    }
  });
