// import { useState } from "react";
// import { useLoaderData } from "react-router";
// import { useRandomResourceAction } from "../hooks/useRandomResourceAction";
// import { useKeymapListener } from "../hooks/useKeymap";
// import type { ResourceItemListDTO } from "@/main/composition";

// interface LoaderData {
//   resources?: ResourceItemListDTO[];
//   errors?: unknown;
// }

export default function Home() {
  // const data = useLoaderData<LoaderData>();
  // const resources = data.resources ?? [];
  //
  // const [randomResource, setRandomResource] =
  //   useState<ResourceItemListDTO | null>(null);
  //
  // useKeymapListener({
  //   route: "/",
  //   mode: "navigation",
  // });
  //
  // useRandomResourceAction(resources, setRandomResource);

  return (
    <div className="min-h-screen bg-ctp-base p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-ctp-mauve mb-2">
          Password Manager
        </h1>
        <p className="text-ctp-subtext0 mb-4">
          Press <kbd className="px-2 py-1 bg-ctp-surface0 rounded">Ctrl+I</kbd>{" "}
          to show random resource
        </p>

        {}
        <div className="mb-8 flex gap-4">
          <a
            href="/test-notifications"
            className="inline-block px-4 py-2 bg-ctp-mauve text-ctp-base rounded hover:bg-ctp-pink transition-colors"
          >
            🧪 Test Notifications
          </a>
          <a
            href="/test-keymaps"
            className="inline-block px-4 py-2 bg-ctp-blue text-ctp-base rounded hover:bg-ctp-sapphire transition-colors"
          >
            🎹 Test Keymaps & Errors
          </a>
        </div>
      </div>
    </div>
  );
}
