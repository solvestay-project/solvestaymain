type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

const hasStorageShape = (v: unknown): v is StorageLike => {
  if (!v || typeof v !== "object") return false;
  const s = v as Record<string, unknown>;
  return (
    typeof s.getItem === "function" &&
    typeof s.setItem === "function" &&
    typeof s.removeItem === "function"
  );
};

const createMemoryLocalStorage = (): StorageLike => {
  const map = new Map<string, string>();
  return {
    getItem(key) {
      return map.has(key) ? map.get(key)! : null;
    },
    setItem(key, value) {
      map.set(key, String(value));
    },
    removeItem(key) {
      map.delete(key);
    },
  };
};

export function register() {
  try {
    const ls = (globalThis as any).localStorage;
    if (!hasStorageShape(ls)) {
      (globalThis as any).localStorage = createMemoryLocalStorage();
    }
  } catch {
    // If the runtime forbids writing globals (e.g. edge), do nothing.
  }
}

