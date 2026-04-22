"use client";

import { Suspense } from "react";
import ResultsContent from "./results-content";

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ResultsContent />
    </Suspense>
  );
}