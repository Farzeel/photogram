import { useEffect, useState } from "react";

type Status = "checking" | "ready" | "error";

export default function App() {
  const [status, setStatus] = useState<Status>("checking");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let ignoreResult = false;

    const timeout = window.setTimeout(() => {
      controller.abort();
    }, 8000);

    async function checkConnection() {
      try {
        const response = await fetch("/api/ready", {
          signal: controller.signal,
          cache: "no-store"
        });

        if (!response.ok) {
          throw new Error(`Readiness failed: ${response.status}`);
        }

        const body: unknown = await response.json();

        if (
          typeof body !== "object" ||
          body === null ||
          !("status" in body) ||
          body.status !== "ready"
        ) {
          throw new Error("Unexpected readiness response");
        }

        if (!ignoreResult) {
          setStatus("ready");
        }
      } catch {
        if (!ignoreResult) {
          setStatus("error");
        }
      } finally {
        window.clearTimeout(timeout);
      }
    }

    void checkConnection();

    return () => {
      ignoreResult = true;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [attempt]);

  function retry() {
    setStatus("checking");
    setAttempt((previous) => previous + 1);
  }

  const message = {
    checking: "Checking connection…",
    ready: "System connected",
    error: "Unable to connect"
  }[status];

  return (
    <main>
      <h1>Photogram</h1>
      <p>Our first full-stack connection.</p>

      <p role="status" aria-live="polite">
        {message}
      </p>

      <button
        type="button"
        onClick={retry}
        disabled={status === "checking"}
      >
        {status === "error" ? "Retry" : "Check again"}
      </button>
    </main>
  );
}