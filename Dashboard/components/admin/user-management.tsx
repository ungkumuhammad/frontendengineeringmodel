"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Button, SubmitButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Field, Input, Select } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { formatDateTime } from "@/lib/utils";
import {
  createUser,
  updateUser,
  resetPassword,
  setUserDisabled,
  deleteUser,
} from "@/app/admin/users/actions";
import type { ActionResult, Profile } from "@/types";

// ---- Create ---------------------------------------------------------------

function CreateButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
        Add user
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Create user">
        <CreateUserForm onDone={() => setOpen(false)} />
      </Modal>
    </>
  );
}

function CreateUserForm({ onDone }: { onDone: () => void }) {
  const { notify } = useToast();
  const [state, action] = useFormState(
    async (prev: ActionResult | undefined, fd: FormData) => {
      const result = await createUser(prev, fd);
      if (result.ok) {
        notify(result.message ?? "User created", "success");
        onDone();
      } else if (result.message) {
        notify(result.message, "error");
      }
      return result;
    },
    undefined,
  );

  return (
    <form action={action} className="space-y-4">
      <Field label="Email" htmlFor="c-email">
        <Input id="c-email" name="email" type="email" required />
      </Field>
      <Field label="Name" htmlFor="c-name">
        <Input id="c-name" name="name" placeholder="Full name" />
      </Field>
      <Field label="Temporary password" htmlFor="c-pw" hint="Minimum 8 characters.">
        <Input id="c-pw" name="password" type="text" minLength={8} required />
      </Field>
      <Field label="Role" htmlFor="c-role">
        <Select id="c-role" name="role" defaultValue="user">
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </Select>
      </Field>
      {state && !state.ok && state.message ? (
        <p className="text-sm text-[hsl(var(--destructive))]">{state.message}</p>
      ) : null}
      <div className="flex justify-end gap-2 pt-2">
        <SubmitButton pendingLabel="Creating…">Create user</SubmitButton>
      </div>
    </form>
  );
}

// ---- Row actions ----------------------------------------------------------

type Dialog = "edit" | "reset" | "delete" | null;

function UserRow({
  user,
  currentAdminId,
}: {
  user: Profile;
  currentAdminId: string;
}) {
  const [dialog, setDialog] = useState<Dialog>(null);
  const isSelf = user.id === currentAdminId;

  return (
    <TR>
      <TD>
        <div className="font-medium">{user.name || "—"}</div>
        <div className="text-xs text-muted-foreground">{user.email}</div>
      </TD>
      <TD>
        <Badge tone={user.role === "admin" ? "info" : "default"}>
          {user.role}
        </Badge>
      </TD>
      <TD>
        {user.disabled ? (
          <Badge tone="danger">Disabled</Badge>
        ) : (
          <Badge tone="success">Active</Badge>
        )}
      </TD>
      <TD className="text-muted-foreground">{formatDateTime(user.created_at)}</TD>
      <TD>
        <div className="flex items-center justify-end gap-1">
          <Button size="sm" variant="ghost" onClick={() => setDialog("edit")}>
            Edit
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setDialog("reset")}>
            Reset PW
          </Button>
          <DisableToggle user={user} disabled={isSelf} />
          <Button
            size="sm"
            variant="ghost"
            className="text-[hsl(var(--destructive))]"
            disabled={isSelf}
            onClick={() => setDialog("delete")}
          >
            Delete
          </Button>
        </div>

        <Modal open={dialog === "edit"} onClose={() => setDialog(null)} title="Edit user">
          <EditUserForm user={user} onDone={() => setDialog(null)} />
        </Modal>
        <Modal open={dialog === "reset"} onClose={() => setDialog(null)} title="Reset password">
          <ResetPasswordForm user={user} onDone={() => setDialog(null)} />
        </Modal>
        <Modal open={dialog === "delete"} onClose={() => setDialog(null)} title="Delete user">
          <DeleteUserForm user={user} onDone={() => setDialog(null)} />
        </Modal>
      </TD>
    </TR>
  );
}

function useActionToast(
  fn: (prev: ActionResult | undefined, fd: FormData) => Promise<ActionResult>,
  onDone: () => void,
) {
  const { notify } = useToast();
  return useFormState(
    async (prev: ActionResult | undefined, fd: FormData) => {
      const result = await fn(prev, fd);
      notify(result.message ?? "", result.ok ? "success" : "error");
      if (result.ok) onDone();
      return result;
    },
    undefined,
  );
}

function EditUserForm({ user, onDone }: { user: Profile; onDone: () => void }) {
  const [, action] = useActionToast(updateUser, onDone);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="userId" value={user.id} />
      <Field label="Email">
        <Input value={user.email} disabled />
      </Field>
      <Field label="Name" htmlFor="e-name">
        <Input id="e-name" name="name" defaultValue={user.name ?? ""} />
      </Field>
      <Field label="Role" htmlFor="e-role">
        <Select id="e-role" name="role" defaultValue={user.role}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </Select>
      </Field>
      <div className="flex justify-end pt-2">
        <SubmitButton pendingLabel="Saving…">Save changes</SubmitButton>
      </div>
    </form>
  );
}

function ResetPasswordForm({ user, onDone }: { user: Profile; onDone: () => void }) {
  const [, action] = useActionToast(resetPassword, onDone);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="userId" value={user.id} />
      <input type="hidden" name="email" value={user.email} />
      <p className="text-sm text-muted-foreground">
        Set a new password for <span className="font-medium">{user.email}</span>.
      </p>
      <Field label="New password" htmlFor="r-pw" hint="Minimum 8 characters.">
        <Input id="r-pw" name="password" type="text" minLength={8} required />
      </Field>
      <div className="flex justify-end pt-2">
        <SubmitButton pendingLabel="Resetting…">Reset password</SubmitButton>
      </div>
    </form>
  );
}

function DeleteUserForm({ user, onDone }: { user: Profile; onDone: () => void }) {
  const [, action] = useActionToast(deleteUser, onDone);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="userId" value={user.id} />
      <input type="hidden" name="email" value={user.email} />
      <p className="text-sm">
        Permanently delete <span className="font-medium">{user.email}</span>?
        This removes their auth account and profile and cannot be undone.
      </p>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <SubmitButton variant="destructive" pendingLabel="Deleting…">
          Delete user
        </SubmitButton>
      </div>
    </form>
  );
}

function DisableToggle({ user, disabled }: { user: Profile; disabled: boolean }) {
  const { notify } = useToast();
  const [, action] = useFormState(
    async (prev: ActionResult | undefined, fd: FormData) => {
      const result = await setUserDisabled(prev, fd);
      notify(result.message ?? "", result.ok ? "success" : "error");
      return result;
    },
    undefined,
  );
  return (
    <form action={action} className="inline">
      <input type="hidden" name="userId" value={user.id} />
      <input type="hidden" name="email" value={user.email} />
      <input type="hidden" name="disabled" value={String(!user.disabled)} />
      <SubmitButton
        size="sm"
        variant="ghost"
        pendingLabel="…"
      >
        {user.disabled ? "Enable" : "Disable"}
      </SubmitButton>
      {disabled ? null : null}
    </form>
  );
}

// ---- Table ----------------------------------------------------------------

function UsersTable({
  users,
  currentAdminId,
}: {
  users: Profile[];
  currentAdminId: string;
}) {
  return (
    <Table>
      <THead>
        <TR>
          <TH>User</TH>
          <TH>Role</TH>
          <TH>Status</TH>
          <TH>Created</TH>
          <TH className="text-right">Actions</TH>
        </TR>
      </THead>
      <TBody>
        {users.map((u) => (
          <UserRow key={u.id} user={u} currentAdminId={currentAdminId} />
        ))}
      </TBody>
    </Table>
  );
}

// Exported directly (not grouped into an object) because Next's React Server
// Components client-reference compiler only tracks direct named/default
// exports of a "use client" module. Accessing e.g. `UserManagement.Table`
// from a Server Component fails to resolve in the production client manifest
// ("Could not find the module ... in the React Client Manifest") even though
// it works in `next dev`, which skips that manifest check.
export { CreateButton as UserManagementCreateButton };
export { UsersTable as UserManagementTable };
