import { useEffect, useState } from "react";
import { getHealth } from "../api/health";

export type HealthStatus = "checking" | "online" | "offline";

export function useHealth() {
  const [status, setStatus] = useState<HealthStatus>("checking");

  useEffect(() => {
    const controller = new AbortController();

    getHealth(controller.signal)
      .then((res) => setStatus(res.status === "ok" ? "online" : "offline"))
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setStatus("offline");
      });

    return () => controller.abort();
  }, []);

  return status;
}
