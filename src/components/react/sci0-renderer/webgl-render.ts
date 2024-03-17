import { type ImageDataLike } from '@4bitlabs/image';

function assertNotNull<T>(it: T | null): asserts it is T {
  if (it === null) throw new Error('value is null');
}

function assertCompilation<T extends WebGLShader>(
  gl: WebGL2RenderingContext,
  it: T,
): asserts it is T {
  if (!gl.getShaderParameter(it, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(it) ?? 'unknown error';
    gl.deleteShader(it);
    throw new Error(`Shader Error: ${log}`);
  }
}

const vertexShaderSource = `
#ifdef GL_ES
precision highp float;
#endif
      
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
varying vec3 vPosition;
varying vec2 vTextureCoord;

void main(void){
  vPosition = aVertexPosition;
  vTextureCoord = aTextureCoord;
  gl_Position = vec4(vPosition, 1.0);
}`;

const fragShaderSource = `
  varying mediump vec2 vTextureCoord;

  uniform sampler2D uSampler;

  void main(void) {
    gl_FragColor = texture2D(uSampler, vTextureCoord);
  }
`;

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type);
  assertNotNull(shader);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  assertCompilation(gl, shader);
  return shader;
}

function createBuffer(
  gl: WebGL2RenderingContext,
  type: typeof gl.ARRAY_BUFFER | typeof gl.ELEMENT_ARRAY_BUFFER,
  data: ArrayBufferView,
) {
  const buffer = gl.createBuffer();
  assertNotNull(buffer);
  gl.bindBuffer(type, buffer);
  gl.bufferData(type, data, gl.STATIC_DRAW);
  gl.bindBuffer(type, null);
  return buffer;
}

export function createRenderGL(
  canvasEl: HTMLCanvasElement,
): (imageData: ImageDataLike) => void {
  const gl = canvasEl.getContext('webgl2')!;

  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragShader = compileShader(gl, gl.FRAGMENT_SHADER, fragShaderSource);

  const program = gl.createProgram();
  assertNotNull(program);
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragShader);
  gl.linkProgram(program);
  gl.useProgram(program);

  const model = {
    // prettier-ignore
    vertex: Float32Array.of(
      -1.0, -1.0, 0.0,
       1.0, -1.0, 0.0,
       1.0,  1.0, 0.0,
      -1.0,  1.0, 0.0,
    ),
    // prettier-ignore
    indices: Uint16Array.of(
      0, 1, 2,
      0, 2, 3,
      2, 1, 0,
      3, 2, 0
    ),
    // prettier-ignore
    textureCoords: Float32Array.of(
      0.0, 1.0,
      1.0, 1.0,
      1.0, 0.0,
      0.0, 0.0,
    ),
  };

  const attrs = {
    aVertexPosition: gl.getAttribLocation(program, 'aVertexPosition'),
    aTextureCoord: gl.getAttribLocation(program, 'aTextureCoord'),
    uSampler: gl.getUniformLocation(program, 'uSampler'),
  };

  const buffers = {
    vertex: createBuffer(gl, gl.ARRAY_BUFFER, model.vertex),
    index: createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, model.indices),
    texture: createBuffer(gl, gl.ARRAY_BUFFER, model.textureCoords),
  };

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array([255, 0, 0, 255]),
  );

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.bindTexture(gl.TEXTURE_2D, null);

  return function renderGL(imageData) {
    if (
      canvasEl.width === imageData.width ||
      canvasEl.height !== imageData.height
    ) {
      gl.viewport(0, 0, imageData.width, imageData.height);
      canvasEl.width = imageData.width;
      canvasEl.height = imageData.height;
    }

    gl.clearColor(1.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enableVertexAttribArray(attrs.aVertexPosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex);
    gl.vertexAttribPointer(attrs.aVertexPosition, 3, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(attrs.aTextureCoord);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texture);
    gl.vertexAttribPointer(attrs.aTextureCoord, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      imageData.width,
      imageData.height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      imageData.data,
    );
    gl.uniform1i(attrs.uSampler, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
    gl.drawElements(gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT, 0);
  };
}
