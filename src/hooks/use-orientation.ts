"use client";

import { useEffect, useState } from "react";

export function useOrientation() {
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "portrait"
  );

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(
        window.innerHeight > window.innerWidth ? "portrait" : "landscape"
      );
    };

    handleOrientationChange();
    window.addEventListener("resize", handleOrientationChange);

    return () => window.removeEventListener("resize", handleOrientationChange);
  }, []);

  return orientation;
}
