"use client";

import { Suspense } from "react";
import FinalTripContent from "./final-trip-content";

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <FinalTripContent />
    </Suspense>
  );
}