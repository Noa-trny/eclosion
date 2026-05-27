"use client";

import { useEffect } from "react";

interface Disposable {
  dispose: () => void;
}

/** Disposes GPU resources (geometries, materials, textures) when the owning
 *  component unmounts or the resource is replaced — acts unmount as you
 *  scroll past them, and HMR would otherwise leak GPU memory. */
export function useDisposable(...resources: Array<Disposable | null | undefined>): void {
  useEffect(() => {
    return () => {
      for (const resource of resources) resource?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, resources);
}
