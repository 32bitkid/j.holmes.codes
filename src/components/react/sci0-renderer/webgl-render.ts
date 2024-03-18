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
  attribute highp vec3 aVertexPosition;
  attribute mediump vec2 aTextureCoord;
  varying highp vec3 vPosition;
  varying mediump vec2 vTextureCoord;
  
  void main(void){
    vPosition = aVertexPosition;
    vTextureCoord = aTextureCoord;
    gl_Position = vec4(vPosition, 1.0);
  }
`;

const fragShaderSource = `
  uniform highp vec3 uLensS;
  uniform highp vec2 uLensF;
  uniform sampler2D uSampler;
  uniform highp vec2 u_resolution;
  varying highp vec3 vPosition;
  varying mediump vec2 vTextureCoord;
  
  highp vec2 trim = vec2(0.0);
  
  mediump vec2 getMapping(highp vec2 c) {
    return c * vec2(1.0, -1.0) / 2.0 + vec2(0.5, 0.5);
  }
  
  void main(void){
    mediump vec4 texture;
  
    // Barrel Distortion
    {
      highp float scale = uLensS.z;
      highp vec3 vPos = vPosition;
      highp float Fx = uLensF.x;
      highp float Fy = uLensF.y;
      mediump vec2 vMapping = vPos.xy;
      vMapping.x = vMapping.x + ((pow(vPos.y, 2.0) / scale) * vPos.x/scale) * -Fx;
      vMapping.y = vMapping.y + ((pow(vPos.x, 2.0) / scale) * vPos.y/scale) * -Fy;
      vMapping = vMapping * uLensS.xy;
      vMapping = getMapping(vMapping/scale);
      texture = texture2D(uSampler, vMapping);
      
      if(
        vMapping.x > (1.0 - trim.x) || 
        vMapping.x < (trim.x) || 
        vMapping.y > (1.0 - trim.y) || 
        vMapping.y < (trim.y)
      ) {
        texture = vec4(0.0);
      }      
    }
    
    // Vingette
    {
      highp float radius = 0.9;
      highp float smoothness = 0.6;
      highp vec2 pos = gl_FragCoord.xy / u_resolution;
      highp float diff = radius - distance(pos, vec2(0.5));
      texture = mix(vec4(0.0), texture, clamp(smoothstep(-smoothness, smoothness, diff), 0.0, 1.0));
    }
        
    gl_FragColor = texture;
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

function updateTexture(
  gl: WebGL2RenderingContext,
  texture: WebGLTexture,
  imgData: ImageDataLike,
) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    imgData.width,
    imgData.height,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    imgData.data,
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
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
    indices: Uint8Array.of(
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
    uLensS: gl.getUniformLocation(program, 'uLensS'),
    uLensF: gl.getUniformLocation(program, 'uLensF'),
    uFov: gl.getUniformLocation(program, 'uFov'),
    u_resolution: gl.getUniformLocation(program, 'u_resolution'),
  };

  const buffers = {
    vertex: createBuffer(gl, gl.ARRAY_BUFFER, model.vertex),
    index: createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, model.indices),
    texture: createBuffer(gl, gl.ARRAY_BUFFER, model.textureCoords),
  };

  var lens = {
    a: 1.0,
    b: 1.0,
    Fx: -0.025,
    Fy: -0.025,
    scale: 1,
  };

  const texture = gl.createTexture();
  assertNotNull(texture);
  updateTexture(gl, texture, {
    data: Uint8ClampedArray.of(255, 0, 0, 255),
    width: 1,
    height: 1,
  });
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
    updateTexture(gl, texture, imageData);

    gl.uniform1i(attrs.uSampler, 0);
    gl.uniform3fv(attrs.uLensS, [lens.a, lens.b, lens.scale]);
    gl.uniform2fv(attrs.uLensF, [lens.Fx, lens.Fy]);
    gl.uniform2fv(attrs.u_resolution, [imageData.width, imageData.height]);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
    gl.drawElements(gl.TRIANGLES, model.indices.length, gl.UNSIGNED_BYTE, 0);
  };
}
