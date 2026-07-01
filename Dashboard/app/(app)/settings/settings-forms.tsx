"use client";

import { useFormState } from "react-dom";
import { updateOwnProfile, updateOwnPassword } from "./actions";
import { Field, Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/button";
import type { ActionResult, Profile } from "@/types";

function FormMessage({ state }: { state: ActionResult | undefined }) {
  if (!state?.message) return null;
  return (
    <div
      className={
        state.ok
          ? "rounded-md border border-[hsl(var(--success)/0.4)] bg-[hsl(var(--success)/0.08)] px-3 py-2 text-sm text-[hsl(var(--success))]"
          : "rounded-md border border-[hsl(var(--destructive)/0.4)] bg-[hsl(var(--destructive)/0.08)] px-3 py-2 text-sm text-[hsl(var(--destructive))]"
      }
    >
      {state.message}
    </div>
  );
}

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, action] = useFormState(updateOwnProfile, undefined);
  return (
    <form action={action} className="space-y-4">
      <FormMessage state={state} />
      <Field label="Email">
        <Input value={profile.email} disabled />
      </Field>
      <Field label="Display name" htmlFor="name">
        <Input
          id="name"
          name="name"
          defaultValue={profile.name ?? ""}
          placeholder="Your name"
        />
      </Field>
      <SubmitButton>Save changes</SubmitButton>
    </form>
  );
}

export function PasswordForm() {
  const [state, action] = useFormState(updateOwnPassword, undefined);
  return (
    <form action={action} className="space-y-4">
      <FormMessage state={state} />
      <Field label="New password" htmlFor="password">
        <Input id="password" name="password" type="password" required />
      </Field>
      <Field label="Confirm new password" htmlFor="confirm">
        <Input id="confirm" name="confirm" type="password" required />
      </Field>
      <SubmitButton>Change password</SubmitButton>
    </form>
  );
}
