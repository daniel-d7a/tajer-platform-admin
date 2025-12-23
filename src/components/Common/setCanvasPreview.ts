const setCanvasPreview = (image: HTMLImageElement, canvas: HTMLCanvasElement, crop: { x: number; y: number; width: number; height: number; }) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("No 2d context");
  }

  const pixelRatio = window.devicePixelRatio || 1;

  canvas.width = Math.floor(crop.width * pixelRatio);
  canvas.height = Math.floor(crop.height * pixelRatio);

  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  ctx.imageSmoothingQuality = "high";

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height
  );
};

export default setCanvasPreview;