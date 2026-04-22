"use client";

import { Suspense } from "react";
import CityDetailsContent from "./city-details-content";

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <CityDetailsContent />
    </Suspense>
  );
}