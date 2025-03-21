import { Suspense } from "react";
import RecommendationsPage from "./page.js";

export default function RecommendationsWrapper() {
    return (
        <Suspense fallback={<div>Loading search params...</div>}>
            <RecommendationsPage />
        </Suspense>
    );
}
