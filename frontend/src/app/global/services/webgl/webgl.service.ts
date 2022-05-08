import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WebglService {
  public renderContext: RenderingContext;
  public get gl(): WebGLRenderingContext {
    return this.renderContext as WebGLRenderingContext;
  }

  constructor() { }

  


  public initContext(canvas: HTMLCanvasElement) {

    this.renderContext = canvas.getContext('webgl');

    if (!this.gl) {
      alert('Unable to init WebGL!');
      return;
    }

    this.setCanvasDimensions(canvas);

    // this.gl.clearColor(1.0, 0.0, 0.0, 1.0);
    // this.gl.enable(this.gl.DEPTH_TEST);
    // this.gl.depthFunc(this.gl.LEQUAL);
    // this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

  }

  public setCanvasDimensions(canvas: HTMLCanvasElement) {
    this.gl.canvas.width = canvas.clientWidth;
    this.gl.canvas.height = canvas.clientHeight;
  }
}
