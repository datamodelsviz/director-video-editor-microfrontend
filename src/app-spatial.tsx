import { useEffect } from "react";
import { SpatialTimelineEditor } from "./features/spatial-timeline/SpatialTimelineEditor";
import useDataState from "./features/editor/store/use-data-state";
import { getCompactFontData } from "./features/editor/utils/fonts";
import { FONTS } from "./features/editor/data/fonts";
import "./services/parentCommunication";

export default function SpatialApp() {
  const { setCompactFonts, setFonts } = useDataState();

  useEffect(() => {
    setCompactFonts(getCompactFontData(FONTS));
    setFonts(FONTS);
  }, []);

  return <SpatialTimelineEditor />;
}
