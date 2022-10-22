import { Canvas } from "./canvas";

function center(value: number, size: number): {start: number, end: number} {
  return {
    start: size / 2 - value / 2,
    end: size / 2 + value / 2
  }
}

export function centeredXCoordsFor(width: number): { start: number; end: number } {
  return center(width, Canvas.width)
}

export function centeredYCoordsFor(height: number): { start: number; end: number } {
  return center(height, Canvas.height)
}