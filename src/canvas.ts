const element = document.getElementById("game") as HTMLCanvasElement;
const context = element.getContext("2d") as CanvasRenderingContext2D;

const { width, height } = element;

export const Canvas = {
  width,
  height,
  context,
  element
}