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
  precision highp float;
  
  attribute vec3 aVertexPosition;
  varying vec3 vPosition;
  
  attribute mediump vec2 aTextureCoord;
  varying mediump vec2 vTextureCoord;
  
  void main(void){
    vPosition = aVertexPosition;
    vTextureCoord = aTextureCoord;
    gl_Position = vec4(vPosition, 1.0);
  }
`;

const fragShaderSource = `
  #define MAX_H_BLUR_SIZE 20.0

  precision highp float;

  uniform vec3 uLens;
  uniform sampler2D uSampler;
  uniform vec2 u_resolution;
  uniform vec2 u_textureSize;
  uniform float u_hBlurSize;
  varying vec3 vPosition;
  varying mediump vec2 vTextureCoord;
  
  vec2 trim = vec2(0.0);
  
  mediump vec2 getMapping(vec2 c) {
    return c * vec2(1.0, -1.0) / 2.0 + vec2(0.5, 0.5);
  }
  
  float rand(vec2 co){
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }
  
  float luma(vec3 color) {
    return dot(color, vec3(0.2989, 0.5866, 0.1145));
  }
  
  mediump vec3 vignette(
    mediump vec3 texture, 
    vec3 color,
    float radius, 
    float smoothness,
    float intensity
  ) {
      float dim = max(u_resolution.x, u_resolution.y);
      vec2 pos = gl_FragCoord.xy / max(u_resolution.x, u_resolution.y);
      vec2 center = vec2(u_resolution) / dim * 0.5;
      
      float diff = radius - distance(pos, center);
      float l = luma(texture);
      float d = clamp(smoothstep(-smoothness, smoothness, diff), 1.0 - (intensity * l), 1.0);
      return mix(color, texture, d);
  } 
  
  void main(void){
    vec2 uv = gl_FragCoord.xy / u_resolution;
    mediump vec4 texture = vec4(0.0, 0.0, 0.0, 1.0);
    mediump vec2 vMapping = vPosition.xy;
      
    // Barrel Distortion
    {
      vMapping += ((vPosition.yx * vPosition.yx) / uLens.z) * (vPosition.xy / uLens.z) * (uLens.xy * -1.0);
      vMapping = getMapping(vMapping / uLens.z);
      texture.rgb = texture2D(uSampler, vMapping).rgb;
    }
    
    // H-Box Blur 
    {
      mediump vec2 onePixel = vec2(1.0, 1.0) / u_textureSize;
      mediump vec3 sum = texture.rgb;
      for (float i = 0.0; i < MAX_H_BLUR_SIZE; i+=1.0) {
        if (i >= u_hBlurSize) break; 
        sum += texture2D(uSampler, vMapping + onePixel * vec2(-1.0 * (i + 1.0), 0.0)).rgb;
        sum += texture2D(uSampler, vMapping + onePixel * vec2(1.0 * (i + 1.0), 0.0)).rgb;
      }
      texture.rgb = sum / (min(MAX_H_BLUR_SIZE, u_hBlurSize) * 2.0 + 1.0);
    }
    
    // Scanlines
    {

    }

    // Vignette    
    {
      texture.rgb = vignette(texture.rgb, vec3(0.0, 0.0, 0.0), 0.85, 0.55, 1.0);
      texture.rgb = vignette(texture.rgb, vec3(0.15, 0.15, 0.15), 0.66, 0.145, 0.2);
      texture.rgb = vignette(texture.rgb, vec3(1.0, 1.0, 1.0), 0.66, 0.145, 0.2);
    }
    
    // Grain
    {
      float grainAmount = 0.125;
      float l = luma(texture.rgb);
      float diff = ((rand(gl_FragCoord.xy) - 0.5) * grainAmount * (1.0 - l));
      texture.rgb += diff;
    }

    // Clipping    
    if(
      vMapping.x > (1.0 - trim.x) || 
      vMapping.x < (trim.x) || 
      vMapping.y > (1.0 - trim.y) || 
      vMapping.y < (trim.y)
    ) {
      texture = vec4(0.0);
    } 
    
    // Glare
    {

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
  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_MIN_FILTER,
    gl.LINEAR_MIPMAP_NEAREST,
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.generateMipmap(gl.TEXTURE_2D);
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
    uLens: gl.getUniformLocation(program, 'uLens'),
    u_resolution: gl.getUniformLocation(program, 'u_resolution'),
    u_textureSize: gl.getUniformLocation(program, 'u_textureSize'),
    u_hBlurSize: gl.getUniformLocation(program, 'u_hBlurSize'),
  };

  const buffers = {
    vertex: createBuffer(gl, gl.ARRAY_BUFFER, model.vertex),
    index: createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, model.indices),
    texture: createBuffer(gl, gl.ARRAY_BUFFER, model.textureCoords),
  };

  var lens = {
    Fx: -0.025,
    Fy: -0.035,
    scale: 0.999,
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
    let { width, height } = canvasEl.getBoundingClientRect();

    const imageAspectRatio = imageData.width / imageData.height;
    const canvasAspectRatio = width / height;
    if (imageAspectRatio > canvasAspectRatio) {
      width = height * imageAspectRatio;
    } else {
      height = width * (1 / imageAspectRatio);
    }

    canvasEl.width = width;
    canvasEl.height = height;
    gl.viewport(0, 0, canvasEl.width, canvasEl.height);

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
    gl.uniform3fv(attrs.uLens, [lens.Fx, lens.Fy, lens.scale]);
    gl.uniform2fv(attrs.u_resolution, [width, height]);
    gl.uniform2fv(attrs.u_textureSize, [imageData.width, imageData.height]);
    gl.uniform1f(attrs.u_hBlurSize, 3.0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
    gl.drawElements(gl.TRIANGLES, model.indices.length, gl.UNSIGNED_BYTE, 0);
  };
}
