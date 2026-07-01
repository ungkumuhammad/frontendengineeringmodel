"use client";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/states";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <ErrorState
        title="Something went wrong"
        description={error.message || "An unexpected error occurred."}
      />
      <Button variant="outline" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
