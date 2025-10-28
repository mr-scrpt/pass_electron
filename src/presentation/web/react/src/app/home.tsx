import { useState } from "react";
import { useLoaderData } from "react-router";
import { useRandomResourceAction } from "../hooks/useRandomResourceAction";
import { useKeymapListener } from "../hooks/useKeymap";
import type { ResourceItemListDTO } from "@/application";

interface LoaderData {
  resources?: ResourceItemListDTO[];
  errors?: unknown;
}

export default function Home() {
  const data = useLoaderData<LoaderData>();
  const resources = data.resources ?? [];

  const [randomResource, setRandomResource] =
    useState<ResourceItemListDTO | null>(null);

  useKeymapListener({
    route: "/",
    mode: "navigation",
  });

  useRandomResourceAction(resources, setRandomResource);

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

        {}
        {randomResource && (
          <div className="mb-8 p-4 bg-ctp-yellow/10 border-2 border-ctp-yellow rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🎲</span>
              <h2 className="text-xl font-semibold text-ctp-yellow">
                Random Resource
              </h2>
            </div>
            <div className="text-ctp-text">
              <span className="text-ctp-subtext0">
                [{randomResource.namespace}]
              </span>{" "}
              <span className="font-medium">{randomResource.name}</span>
            </div>
            <button
              onClick={() => setRandomResource(null)}
              className="mt-2 text-sm text-ctp-subtext0 hover:text-ctp-text"
            >
              Clear
            </button>
          </div>
        )}

        {}
        <div>
          <h2 className="text-2xl font-semibold text-ctp-text mb-4">
            Resources ({resources.length})
          </h2>
          {resources.length === 0 ? (
            <p className="text-ctp-subtext0">
              No resources yet. Create one to get started!
            </p>
          ) : (
            <ul className="space-y-2">
              {resources.map((resource) => (
                <li
                  key={resource.id}
                  className={
                    randomResource?.id === resource.id
                      ? "p-4 bg-ctp-yellow/20 border-2 border-ctp-yellow rounded-lg"
                      : "p-4 bg-ctp-surface0 rounded-lg hover:bg-ctp-surface1"
                  }
                >
                  <div className="text-ctp-text">
                    <span className="text-ctp-subtext0">
                      [{resource.namespace}]
                    </span>{" "}
                    <span className="font-medium">{resource.name}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
