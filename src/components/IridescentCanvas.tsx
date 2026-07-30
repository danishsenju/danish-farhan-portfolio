import { useEffect, useRef } from 'react';

const VERT = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

// Domain-warped fbm (Inigo Quilez technique) lit like wet glass: a pseudo
// normal from the field gradient gives specular streaks and a fresnel rim,
// so the sage → amber → oxblood ribbons read as glossy liquid, not smoke.
const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;

float hash(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.5;
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 5; i++) {
    v += amp * noise(p);
    p = rot * p * 2.02;
    amp *= 0.5;
  }
  return v;
}

float field(vec2 uv, float t, vec2 m, out vec2 q, out vec2 r) {
  q = vec2(
    fbm(uv * 1.3 + t),
    fbm(uv * 1.3 + vec2(5.2, 1.3) - t * 0.6)
  );
  r = vec2(
    fbm(uv * 1.3 + 2.4 * q + vec2(1.7, 9.2) + t * 0.3 + m * 0.4),
    fbm(uv * 1.3 + 2.4 * q + vec2(8.3, 2.8) - t * 0.2)
  );
  return fbm(uv * 1.3 + 3.2 * r);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / min(u_res.x, u_res.y);
  float t = u_time * 0.03;

  vec2 q, r;
  float f = field(uv, t, u_mouse, q, r);

  /* gradient of the field -> pseudo surface normal for lighting */
  float e = 0.012;
  vec2 q2, r2;
  float fx = field(uv + vec2(e, 0.0), t, u_mouse, q2, r2);
  float fy = field(uv + vec2(0.0, e), t, u_mouse, q2, r2);
  vec3 n = normalize(vec3((fx - f) / e, (fy - f) / e, 2.4));

  vec3 base = vec3(0.012, 0.014, 0.013);
  vec3 sage = vec3(0.627, 0.878, 0.671);
  vec3 amber = vec3(1.0, 0.674, 0.180);
  vec3 oxblood = vec3(0.647, 0.176, 0.145);

  vec3 col = base;
  col = mix(col, oxblood * 0.55, smoothstep(0.18, 0.52, q.y) * (1.0 - smoothstep(0.5, 0.85, f)));
  col = mix(col, sage * 0.65, smoothstep(0.40, 0.85, f) * smoothstep(0.25, 0.75, r.x));
  col += amber * pow(smoothstep(0.45, 0.95, f * (0.6 + r.y)), 3.0) * 0.85;

  /* glossy lighting — this is what makes it glass instead of smoke */
  vec3 lightDir = normalize(vec3(-0.35, 0.55, 0.75));
  float spec = pow(clamp(dot(n, lightDir), 0.0, 1.0), 28.0);
  col += vec3(0.95, 0.97, 0.9) * spec * 0.45;

  /* fresnel rim — cool sheen where the surface turns away */
  float fresnel = pow(1.0 - abs(n.z), 2.5);
  col += vec3(0.55, 0.75, 0.65) * fresnel * 0.28;

  /* breathe darkness back in at the edges */
  col *= smoothstep(1.7, 0.35, length(uv));

  /* film grain to kill banding */
  col += (hash(gl_FragCoord.xy + fract(u_time)) - 0.5) * 0.025;

  gl_FragColor = vec4(pow(max(col, 0.0), vec3(0.9)), 1.0);
}
`;

function compileShader(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  return shader;
}

export default function IridescentCanvas({ speed = 1 }: { speed?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', {
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
    });
    if (!gl || gl.isContextLost()) return; // CSS fallback behind the canvas takes over

    const program = gl.createProgram()!;
    gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    gl.useProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const loc = gl.getAttribLocation(program, 'a_pos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, 'u_res');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uMouse = gl.getUniformLocation(program, 'u_mouse');

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const resize = () => {
      const w = Math.round(canvas.clientWidth * dpr);
      const h = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Pointer influence eased manually so the fluid trails the cursor with
    // momentum instead of sticking to it.
    let targetX = 0;
    let targetY = 0;
    let mouseX = 0;
    let mouseY = 0;
    const onPointer = (e: PointerEvent) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(canvas);

    let frame = 0;
    const start = performance.now();
    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);
      if (!visible) return;
      mouseX += (targetX - mouseX) * 0.04;
      mouseY += (targetY - mouseY) * 0.04;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, ((now - start) / 1000) * speed);
      gl.uniform2f(uMouse, mouseX, mouseY);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    if (reduce) {
      // One still frame — the atmosphere without the motion
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, 12.0);
      gl.uniform2f(uMouse, 0, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    } else {
      frame = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onPointer);
      // Deliberately NOT losing the GL context: the canvas element survives
      // React StrictMode's dev remount, and a lost context can never draw again.
    };
  }, [speed]);

  return (
    <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_60%_40%,#1c2a1e_0%,#120806_45%,#000000_100%)]">
      <canvas ref={canvasRef} className="h-full w-full" aria-hidden />
    </div>
  );
}
