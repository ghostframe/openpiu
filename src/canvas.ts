const element = document.getElementById('game') as HTMLCanvasElement;
const context = element.getContext('2d') as CanvasRenderingContext2D;

context.fillStyle = 'white';
context.font = 'Arial 36px';
context.fillText('loading...', element.width / 2, element.height / 2);

const { width, height } = element;

export const Canvas = {
  width,
  height,
  context,
  element,
};
