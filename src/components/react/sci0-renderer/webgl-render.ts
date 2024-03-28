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

interface FragShaderSourceOptions {
  maxHBlur?: number;
}

const fragShaderSource = ({ maxHBlur = 10 }: FragShaderSourceOptions = {}) => `
  #define MAX_H_BLUR_SIZE ${maxHBlur.toFixed(1)}
  #define PI 3.141592653589793115997963468544185161590576171875
  #define TAU 6.28318530717958623199592693708837032318115234375

  precision highp float;

  uniform vec3 u_Lens;
  uniform sampler2D uSampler;
  uniform vec2 u_resolution;
  uniform vec2 u_textureSize;
  uniform vec2 u_monitorRes;
  uniform float u_hBlurSize;
  uniform float u_grainAmount;
  uniform float u_vignetteAmount;
  uniform bool u_scanLines;
  varying vec3 vPosition;
  varying mediump vec2 vTextureCoord;
  
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
      
      float diff = radius - distance(pos , center)  / u_Lens.z;
      float l = luma(texture);
      float d = clamp(smoothstep(-smoothness, smoothness, diff), 0.0, 1.0);
      return mix(color, texture, d);
  } 
  
  void main(void){
    vec2 uv = gl_FragCoord.xy / u_resolution;
    vec2 onePixel = vec2(1.0, 1.0) / u_textureSize;
    mediump vec4 texture = vec4(0.0);
    mediump vec2 vMapping = vPosition.xy;
      
    // Barrel Distortion
    {
      vMapping += ((vPosition.yx * vPosition.yx) / u_Lens.z) * (vPosition.xy / u_Lens.z) * (u_Lens.xy * -1.0);
      vMapping = getMapping(vMapping / u_Lens.z);
      texture = texture2D(uSampler, vMapping);
    }
    
    // H-Box Blur 
    {
      if (u_hBlurSize > 0.0) {

        mediump vec3 sum = texture.rgb;
        for (float i = 0.0; i < MAX_H_BLUR_SIZE; i+=1.0) {
          if (i >= u_hBlurSize) break; 
          sum += texture2D(uSampler, vMapping + onePixel * vec2(-1.0 * (i + 1.0), 0.0)).rgb;
          sum += texture2D(uSampler, vMapping + onePixel * vec2(1.0 * (i + 1.0), 0.0)).rgb;
        }
        texture.rgb = sum / (min(MAX_H_BLUR_SIZE, u_hBlurSize) * 2.0 + 1.0);
      }      
    }
    
    // Scanlines
    {
      if (u_scanLines) {
        float vScan = smoothstep(1080.0 / 4.0 / u_Lens.z, 1440.0 / u_Lens.z, u_resolution.y) * 0.20;
        texture.rgb *= 1.0 - clamp(
          pow((1.0 - cos(vMapping.y * TAU * u_monitorRes.y + PI)) / 2.0, 5.0) * vScan,
          0.0, 1.0
        );
        
        float rgbMaskInt = 0.10;
        float hScan = smoothstep(1080.0 / 4.0 / u_Lens.z, 1440.0 / u_Lens.z, u_resolution.y) * 0.05;
        float odd = mod(floor(vMapping.y * u_monitorRes.y), 2.0) * PI;
        texture.rgb *= 1.0 - clamp(
          ((cos(vMapping.x * TAU * u_monitorRes.x + odd) - 1.0) / 2.0) * hScan, 
          -1.0, 0.0
        );
      }
    }

    // Vignette    
    {
      if (u_vignetteAmount > 0.0) {
        texture.rgb = vignette(texture.rgb, vec3(-0.05), 0.85, 0.55, 1.0 * u_vignetteAmount);
        texture.rgb = vignette(texture.rgb, vec3(0.05), 0.66, 0.145, 0.2 * u_vignetteAmount);
      }
    }
    
    // Grain
    {
      if (u_grainAmount > 0.0) { 
        float l = luma(texture.rgb);
        float diff = ((rand(gl_FragCoord.xy) - 0.5) * u_grainAmount * (1.0 - l));
        texture.rgb += diff;
      }
    }

    // Clipping    
    if(
      vMapping.x > 1.0 || vMapping.x < 0.0 || 
      vMapping.y > 1.0 || vMapping.y < 0.0
    ) {
      vec2 oob = 1.5 - (abs(vMapping - 0.5) - 0.5) / (vec2(1.0, 1.0) / u_resolution);
      float a = clamp(min(oob.x, oob.y), 0.0, 1.0);
      texture = mix(vec4(0.0),texture,  a);
    } 
    
    // Glare
    {
      // TODO
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
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
  gl.generateMipmap(gl.TEXTURE_2D);
}

export interface RenderGlOptions {
  Fx?: number;
  Fy?: number;
  S?: number;
  hBlur?: number;
  grain?: number;
  vignette?: number;
  scanLines?: boolean;
}

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

export function createRenderGL(
  canvasEl: HTMLCanvasElement,
): (imageData: ImageDataLike) => void {
  const gl = canvasEl.getContext('webgl2', {
    desynchronized: true,
    alpha: true,
    powerPreference: 'low-power',
  })!;

  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragShader = compileShader(gl, gl.FRAGMENT_SHADER, fragShaderSource());

  const program = gl.createProgram();
  assertNotNull(program);
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragShader);
  gl.linkProgram(program);
  gl.useProgram(program);

  const attrs = {
    aVertexPosition: gl.getAttribLocation(program, 'aVertexPosition'),
    aTextureCoord: gl.getAttribLocation(program, 'aTextureCoord'),
    uSampler: gl.getUniformLocation(program, 'uSampler'),

    u_Lens: gl.getUniformLocation(program, 'u_Lens'),
    u_resolution: gl.getUniformLocation(program, 'u_resolution'),
    u_textureSize: gl.getUniformLocation(program, 'u_textureSize'),
    u_monitorRes: gl.getUniformLocation(program, 'u_monitorRes'),
    u_hBlurSize: gl.getUniformLocation(program, 'u_hBlurSize'),
    u_grainAmount: gl.getUniformLocation(program, 'u_grainAmount'),
    u_vignetteAmount: gl.getUniformLocation(program, 'u_vignetteAmount'),
    u_scanLines: gl.getUniformLocation(program, 'u_scanLines'),
  };

  const buffers = {
    vertex: createBuffer(gl, gl.ARRAY_BUFFER, model.vertex),
    index: createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, model.indices),
    texture: createBuffer(gl, gl.ARRAY_BUFFER, model.textureCoords),
  };

  const texture = gl.createTexture();
  assertNotNull(texture);
  updateTexture(gl, texture, {
    data: Uint8ClampedArray.of(255, 0, 0, 255),
    width: 1,
    height: 1,
  });
  gl.bindTexture(gl.TEXTURE_2D, null);

  return function renderGL(imageData, options: RenderGlOptions = {}) {
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
    gl.uniform2fv(attrs.u_resolution, [width, height]);
    gl.uniform2fv(attrs.u_textureSize, [imageData.width, imageData.height]);
    gl.uniform2fv(attrs.u_monitorRes, [320, 200]);

    {
      const {
        Fx = -0.0,
        Fy = -0.0,
        S = 1.0,
        hBlur = 0.0,
        grain = 0.0,
        vignette = 0.0,
        scanLines = true,
      } = options;

      gl.uniform3fv(attrs.u_Lens, [Fx, Fy, S]);
      gl.uniform1f(attrs.u_hBlurSize, hBlur);
      gl.uniform1f(attrs.u_grainAmount, grain);
      gl.uniform1f(attrs.u_vignetteAmount, vignette);
      gl.uniform1i(attrs.u_scanLines, scanLines ? 1.0 : 0.0);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
    gl.drawElements(gl.TRIANGLES, model.indices.length, gl.UNSIGNED_BYTE, 0);
  };
}
