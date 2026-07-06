import { Body, Controller, Get, Post, UsePipes } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { waitlistSchema, type WaitlistData } from "@aidar/shared";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { WaitlistService } from "./waitlist.service";

@Controller({ path: "waitlist", version: "1" })
export class WaitlistController {
  constructor(private readonly waitlist: WaitlistService) {}

  @Post()
  @Throttle({ default: { ttl: 60_000, limit: 8 } })
  @UsePipes(new ZodValidationPipe(waitlistSchema))
  async join(@Body() body: WaitlistData) {
    return this.waitlist.join(body);
  }

  @Get("count")
  async count() {
    return { count: await this.waitlist.count() };
  }
}
