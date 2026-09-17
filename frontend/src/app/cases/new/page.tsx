"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewCasePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to cases page which has the create form
    router.push("/cases");
  }, [router]);

  return null;
}
