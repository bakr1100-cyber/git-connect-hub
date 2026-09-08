import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

type RatioId = "portrait" | "square";

const RATIOS: Record<RatioId, number> = {
  // Classic German application photo (35 x 45 mm) and a square variant.
  portrait: 35 / 45,
  square: 1,
};

interface PhotoCropperProps {
  /** Source image as data URL. */
  src: string;
  /** Called with the cropped image whenever the user changes the frame. */
  onCropped: (dataUrl: string) => void;
}

/** Drag to move, slider to zoom — renders the visible frame into a data URL. */
export function PhotoCropper({ src, onCropped }: PhotoCropperProps) {
  const { t } = useI18n();
  const [ratio, setRatio] = useState<RatioId>("portrait");
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setImage(img);
    img.src = src;
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, [src]);

  const render = useCallback(() => {
    const frame = frameRef.current;
    if (!image || !frame) return;
    const frameWidth = frame.clientWidth;
    const frameHeight = frame.clientHeight;
    if (!frameWidth || !frameHeight) return;

    // "cover" base scale, then the user's zoom on top.
    const base = Math.max(frameWidth / image.naturalWidth, frameHeight / image.naturalHeight);
    const scale = base * zoom;
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    const left = (frameWidth - drawWidth) / 2 + offset.x;
    const top = (frameHeight - drawHeight) / 2 + offset.y;

    // Export at a print-friendly resolution (long edge ~1200 px).
    const exportScale = 1200 / Math.max(frameWidth, frameHeight);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(frameWidth * exportScale);
    canvas.height = Math.round(frameHeight * exportScale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      image,
      left * exportScale,
      top * exportScale,
      drawWidth * exportScale,
      drawHeight * exportScale
    );
    onCropped(canvas.toDataURL("image/png"));
  }, [image, offset.x, offset.y, onCropped, zoom]);

  useEffect(() => {
    render();
  }, [render, ratio]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY, ox: offset.x, oy: offset.y };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    setOffset({ x: drag.ox + (event.clientX - drag.x), y: drag.oy + (event.clientY - drag.y) });
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  const reset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1.5">
          {(Object.keys(RATIOS) as RatioId[]).map((id) => (
            <Button
              key={id}
              type="button"
              size="sm"
              variant={ratio === id ? "default" : "outline"}
              onClick={() => setRatio(id)}
            >
              {t(id === "portrait" ? "photo.crop.ratioPortrait" : "photo.crop.ratioSquare")}
            </Button>
          ))}
        </div>
        <Button type="button" size="sm" variant="ghost" onClick={reset}>
          <RotateCcw className="mr-1.5 h-4 w-4" /> {t("photo.crop.reset")}
        </Button>
      </div>

      <div
        ref={frameRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        style={{ aspectRatio: String(RATIOS[ratio]) }}
        className={cn(
          "relative mx-auto max-h-[46vh] w-auto touch-none overflow-hidden rounded-lg border-2 border-brand/40 bg-muted",
          "cursor-grab active:cursor-grabbing"
        )}
      >
        {image && (
          <img
            src={src}
            alt=""
            draggable={false}
            className="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none"
            style={{
              transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoom})`,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{t("photo.crop.zoom")}</span>
          <span>{Math.round(zoom * 100)} %</span>
        </div>
        <Slider
          value={[zoom]}
          min={1}
          max={3}
          step={0.02}
          onValueChange={(value) => setZoom(value[0] ?? 1)}
        />
        <p className="text-xs text-muted-foreground">{t("photo.crop.hint")}</p>
      </div>
    </div>
  );
}
