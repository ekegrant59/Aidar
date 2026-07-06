"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, Loader2 } from "lucide-react";
import {
  waitlistSchema,
  WAITLIST_ROLES,
  WAITLIST_ROLE_LABELS,
  SPECIALTIES,
  type WaitlistInput,
  type WaitlistResponse,
} from "@aidar/shared";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { track, events } from "@/lib/analytics";

interface WaitlistFormProps {
  onSuccess: (result: { position: number; alreadyJoined: boolean }) => void;
}

const labelCls = "block text-[15px] font-semibold text-spruce-900 mb-2";
const inputCls =
  "w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-[15px] text-ink placeholder:text-muted/60 outline-none transition focus:border-spruce-900/40 focus:ring-4 focus:ring-spruce-900/10";
const errorCls = "mt-1.5 text-[13px] text-coral-dark";

export function WaitlistForm({ onSuccess }: WaitlistFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<WaitlistInput>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      fullName: "",
      email: "",
      role: undefined,
      location: "",
      notifyByEmail: true,
    } as unknown as WaitlistInput,
  });

  const role = watch("role");
  const specialty = watch("specialty");

  async function onSubmit(values: WaitlistInput) {
    setServerError(null);
    track(events.waitlistSubmitted, { role: values.role });
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
      const res = await fetch(`${apiUrl}/api/v1/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await res.json()) as WaitlistResponse;

      if (!data.ok) {
        if (data.fieldErrors) {
          for (const [field, messages] of Object.entries(data.fieldErrors)) {
            if (messages?.[0]) {
              setError(field as keyof WaitlistInput, { message: messages[0] });
            }
          }
        }
        setServerError(data.error);
        track(events.waitlistFailed, { reason: data.error });
        return;
      }

      track(events.waitlistSucceeded, {
        role: data.role,
        position: data.position,
        alreadyJoined: data.alreadyJoined,
      });
      onSuccess({ position: data.position, alreadyJoined: data.alreadyJoined });
    } catch {
      setServerError("Network error. Please check your connection and try again.");
      track(events.waitlistFailed, { reason: "network" });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div>
        <label htmlFor="fullName" className={labelCls}>
          Full name
        </label>
        <input
          id="fullName"
          type="text"
          autoComplete="name"
          placeholder="your full name"
          className={inputCls}
          {...register("fullName")}
        />
        {errors.fullName && <p className={errorCls}>{errors.fullName.message}</p>}
      </div>

      <div>
        <label htmlFor="email" className={labelCls}>
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="example@gmail.com"
          className={inputCls}
          {...register("email")}
        />
        {errors.email && <p className={errorCls}>{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="role" className={labelCls}>
          I am a…
        </label>
        <div className="relative">
          <select
            id="role"
            defaultValue=""
            className={cn(inputCls, "appearance-none pr-11", !role && "text-muted/60")}
            {...register("role")}
          >
            <option value="" disabled>
              Select
            </option>
            {WAITLIST_ROLES.map((r) => (
              <option key={r} value={r} className="text-ink">
                {WAITLIST_ROLE_LABELS[r]}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-spruce-900/60" />
        </div>
        {errors.role && <p className={errorCls}>{errors.role.message}</p>}
      </div>

      {role === "practitioner" && (
        <div className="animate-fade-up">
          <label htmlFor="specialty" className={labelCls}>
            Specialty
          </label>
          <div className="relative">
            <select
              id="specialty"
              defaultValue=""
              className={cn(inputCls, "appearance-none pr-11")}
              {...register("specialty")}
            >
              <option value="" disabled>
                Select your specialty
              </option>
              {SPECIALTIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-spruce-900/60" />
          </div>
          {errors.specialty && <p className={errorCls}>{errors.specialty.message}</p>}

          {specialty === "Other" && (
            <div className="mt-4 animate-fade-up">
              <label htmlFor="specialtyOther" className={labelCls}>
                Please specify your specialty
              </label>
              <input
                id="specialtyOther"
                type="text"
                placeholder="Your specialty"
                className={inputCls}
                {...register("specialtyOther")}
              />
              {errors.specialtyOther && (
                <p className={errorCls}>{errors.specialtyOther.message}</p>
              )}
            </div>
          )}
        </div>
      )}

      <div>
        <label htmlFor="location" className={labelCls}>
          Location
        </label>
        <input
          id="location"
          type="text"
          autoComplete="address-level2"
          placeholder="City, State"
          className={inputCls}
          {...register("location")}
        />
        {errors.location && <p className={errorCls}>{errors.location.message}</p>}
      </div>

      <label className="flex cursor-pointer items-center gap-3 pt-1 text-[15px] text-ink">
        <input
          type="checkbox"
          className="size-5 shrink-0 rounded-full border-2 border-spruce-900/30 accent-coral"
          {...register("notifyByEmail")}
        />
        Notify me by mail when Aidar launches.
      </label>

      {serverError && (
        <p className="rounded-lg bg-coral/10 px-4 py-3 text-[14px] text-coral-dark">
          {serverError}
        </p>
      )}

      <Button type="submit" variant="coral" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="size-5 animate-spin" /> Joining…
          </>
        ) : (
          "Join Waitlist"
        )}
      </Button>

      <p className="text-center text-[13px] text-muted">
        Your information is private and will never be shared with third parties.
      </p>
    </form>
  );
}
