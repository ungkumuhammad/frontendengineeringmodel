"use client";

import { useFormState } from "react-dom";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { SubmitButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { ICONS } from "@/components/layout/nav-config";
import { setModuleHidden } from "@/app/admin/modules/actions";
import type { ModuleDefinition } from "@/lib/modules";
import type { ActionResult } from "@/types";

function VisibilityToggle({ module, hidden }: { module: ModuleDefinition; hidden: boolean }) {
  const { notify } = useToast();
  const [, action] = useFormState(
    async (prev: ActionResult | undefined, fd: FormData) => {
      const result = await setModuleHidden(prev, fd);
      notify(result.message ?? "", result.ok ? "success" : "error");
      return result;
    },
    undefined,
  );

  return (
    <form action={action} className="inline">
      <input type="hidden" name="slug" value={module.slug} />
      <input type="hidden" name="hidden" value={String(!hidden)} />
      <SubmitButton size="sm" variant={hidden ? "primary" : "outline"} pendingLabel="Saving…">
        {hidden ? "Show" : "Hide"}
      </SubmitButton>
    </form>
  );
}

export function ModuleVisibilityTable({
  modules,
  hiddenSlugs,
}: {
  modules: ModuleDefinition[];
  hiddenSlugs: string[];
}) {
  const hidden = new Set(hiddenSlugs);
  return (
    <Table>
      <THead>
        <TR>
          <TH>Module</TH>
          <TH>Category</TH>
          <TH>Status</TH>
          <TH className="text-right">Action</TH>
        </TR>
      </THead>
      <TBody>
        {modules.map((m) => {
          const isHidden = hidden.has(m.slug);
          return (
            <TR key={m.slug}>
              <TD>
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d={ICONS[m.icon] ?? ICONS.grid} />
                    </svg>
                  </span>
                  <div>
                    <div className="font-medium">{m.title}</div>
                    <div className="text-xs text-muted-foreground">/modules/{m.slug}</div>
                  </div>
                </div>
              </TD>
              <TD className="text-muted-foreground">{m.category}</TD>
              <TD>
                {isHidden ? <Badge tone="warning">Hidden</Badge> : <Badge tone="success">Visible</Badge>}
              </TD>
              <TD className="text-right">
                <VisibilityToggle module={m} hidden={isHidden} />
              </TD>
            </TR>
          );
        })}
      </TBody>
    </Table>
  );
}
