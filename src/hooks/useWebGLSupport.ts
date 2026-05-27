"use client";

import { useEffect, useState } from "react";

/** null while probing (SSR + first paint), then a definitive answer.
 *  Runs before the Canvas mounts so unsupported devices never load three. */
export function useWebGLSupport(): boolean | null {
  const [supported, setSupported] = useState<boolean | null>(null);
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2");
      setSupported(gl !== null);
    } catch {
      setSupported(false);
    }
  }, []);
  return supported;
}
