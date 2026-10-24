"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  browserAccounts,
  safeReturnPath,
} from "@/features/tools-workspace/supabase";
export default function Callback() {
  const started = useRef(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    async function finish() {
      try {
        const params = new URLSearchParams(location.search);
        if (params.has("error")) throw Error();
        const code = params.get("code");
        const client = await browserAccounts();
        if (!code || !client) throw Error();
        const result = await client.auth.exchangeCodeForSession(code);
        if (result.error) throw result.error;
        const path = safeReturnPath(sessionStorage.getItem("tools:return"));
        sessionStorage.removeItem("tools:return");
        location.replace(path);
      } catch {
        setError(
          "Sign-in could not finish. Please return to the tools and try again.",
        );
      }
    }
    void finish();
  }, []);
  return (
    <div className="mx-auto max-w-xl px-6 py-24">
      <h1 className="text-2xl font-bold">
        {error ? "Sign-in interrupted" : "Finishing your sign-in…"}
      </h1>
      <p role="status" className="my-5">
        {error || "You will return to your tools shortly."}
      </p>
      <Link href="/tools" className="text-primary underline">
        Return to tools
      </Link>
    </div>
  );
}
