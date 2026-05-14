"use client";

import { Suspense } from "react";
import LoginContent from "./login-content";

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <LoginContent />
    </Suspense>
  );
}