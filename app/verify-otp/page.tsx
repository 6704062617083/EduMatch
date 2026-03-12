import { Suspense } from "react";
import Verifyotp from "./verifyotp";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Verifyotp />
    </Suspense>
  );
}