import { lazy, Suspense } from "react";
import LootDrop from "./LootDrop";

const Agentation = import.meta.env.DEV
  ? lazy(() =>
      import("agentation").then((m) => ({ default: m.Agentation })),
    )
  : null;

export default function App() {
  return (
    <>
      <LootDrop />
      {Agentation && (
        <Suspense fallback={null}>
          <Agentation
            endpoint="http://localhost:4747"
            onSessionCreated={(sessionId) => {
              console.log("Session started:", sessionId);
            }}
          />
        </Suspense>
      )}
    </>
  );
}
