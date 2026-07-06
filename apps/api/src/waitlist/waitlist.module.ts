import { Module } from "@nestjs/common";
import { WaitlistController } from "./waitlist.controller";
import { WaitlistService } from "./waitlist.service";
import { EmailService } from "./email.service";

@Module({
  controllers: [WaitlistController],
  providers: [WaitlistService, EmailService],
})
export class WaitlistModule {}
