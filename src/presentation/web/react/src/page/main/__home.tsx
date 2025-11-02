import { ResourceList } from "@/features/resourceList";

export default function Home() {
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

        <ResourceList />
        <div className="mb-8 flex flex-col gap-4">
          <div className="flex gap-4">
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
              🎹 Test Keymaps
            </a>
          </div>

          <div className="flex gap-4">
            <a
              href="/errors-test"
              className="inline-block px-4 py-2 bg-ctp-red text-ctp-base rounded hover:bg-ctp-maroon transition-colors"
            >
              🚨 Error Handling Tests
            </a>
            <a
              href="/test-folder-routing"
              className="inline-block px-4 py-2 bg-ctp-green text-ctp-base rounded hover:bg-ctp-teal transition-colors"
            >
              📁 Folder-Based Routing Test
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
