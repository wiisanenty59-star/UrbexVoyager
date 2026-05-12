import { useEffect, useState, type ComponentType } from "react";
import { modules as discoveredModules } from "./.generated/mockup-components";

type ModuleMap = Record<string, () => Promise<Record<string, unknown>>>;

function resolveComponent(
  mod: Record<string, unknown>,
  name: string,
): ComponentType | null {
  const values = Object.values(mod).filter(
    (v) => typeof v === "function",
  ) as ComponentType[];

  return (
    (mod.default as ComponentType) ||
    (mod.Preview as ComponentType) ||
    (mod[name] as ComponentType) ||
    values[0] ||
    null
  );
}

function PreviewRenderer({
  componentPath,
  modules,
}: {
  componentPath: string;
  modules: ModuleMap;
}) {
  const [Component, setComponent] = useState<ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setComponent(null);
    setError(null);

    async function load() {
      const key = `./components/mockups/${componentPath}.tsx`;
      const loader = modules[key];

      if (!loader) {
        setError(`No component found: ${key}`);
        return;
      }

      try {
        const mod = await loader();
        if (cancelled) return;

        const name = componentPath.split("/").pop() ?? "";
        const comp = resolveComponent(mod, name);

        if (!comp) {
          setError(
            `No React component exported from: ${componentPath}.tsx`,
          );
          return;
        }

        setComponent(() => comp);
      } catch (e) {
        if (cancelled) return;

        setError(
          e instanceof Error ? e.message : "Unknown preview error",
        );
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [componentPath, modules]);

  if (error) {
    return (
      <div style={{ padding: 24, color: "red", fontFamily: "monospace" }}>
        {error}
      </div>
    );
  }

  if (!Component) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui" }}>
        Loading preview...
      </div>
    );
  }

  return <Component />;
}

function getBasePath(): string {
  return import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
}

function getPreviewExamplePath(): string {
  const base = getBasePath();
  return `${base}/preview/example-component`;
}

function Gallery() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-semibold mb-2">
          Component Preview Server
        </h1>
        <p className="text-gray-500 mb-4">
          This renders isolated UI components from the workspace.
        </p>

        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
          {getPreviewExamplePath()}
        </code>
      </div>
    </div>
  );
}

function getPreviewPath(): string | null {
  const base = getBasePath();
  const pathname = window.location.pathname;

  const local =
    base && pathname.startsWith(base)
      ? pathname.slice(base.length) || "/"
      : pathname;

  const match = local.match(/^\/preview\/(.+)$/);
  return match?.[1] ?? null;
}

export default function App() {
  const previewPath = getPreviewPath();

  if (previewPath) {
    return (
      <PreviewRenderer
        componentPath={previewPath}
        modules={discoveredModules}
      />
    );
  }

  return <Gallery />;
}