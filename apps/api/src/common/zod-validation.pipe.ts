import { BadRequestException, PipeTransform } from "@nestjs/common";
import { ZodError, type ZodSchema } from "zod";

/**
 * Validates/parses an incoming body against a Zod schema. On failure it returns
 * a 400 with flattened field errors the frontend maps back onto form fields.
 */
export class ZodValidationPipe<T> implements PipeTransform {
  constructor(private readonly schema: ZodSchema<T>) {}

  transform(value: unknown): T {
    try {
      return this.schema.parse(value);
    } catch (err) {
      if (err instanceof ZodError) {
        throw new BadRequestException({
          ok: false,
          error: "Please check the form and try again",
          fieldErrors: err.flatten().fieldErrors,
        });
      }
      throw new BadRequestException({ ok: false, error: "Invalid request body" });
    }
  }
}
