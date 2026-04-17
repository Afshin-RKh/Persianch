import { Suspense } from "react";
import BusinessesContent from "./BusinessesContent";

export default function BusinessesPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading...</div>}>
      <BusinessesContent />
    </Suspense>
  );
}
