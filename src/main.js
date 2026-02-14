import "./style.css";
import * as THREE from "three";
import { Pane } from "tweakpane";

const params = {
  // Performance
  renderScale: 0.62,
  maxDpr: 1.0,

  // Motion
  timeScale: 0.16,
  flowX: 0.18,
  flowY: 0.1,
  swirlFreqX: 0.38,
  swirlFreqY: 0.26,
  swirlStrength: 0.08,

  // Noise
  mistScaleA: 1.28,
  mistScaleB: 1.08,
  waterScale: 2.6,
  waterStrength: 0.08,
  detailScaleA: 5.4,
  detailStrengthA: 0.045,
  detailScaleB: 7.8,
  detailStrengthB: 0.025,
  mixBase: 0.46,
  mixDetail: 0.36,
  mistLow: 0.24,
  mistHigh: 0.88,
  mistPow: 0.86,

  // Mouse
  mouseFalloff: 2.6,
  mouseStrength: 0.17,
  mouseWaveFreq: 8.2,
  mouseWaveFalloff: 2.2,
  mouseWaveStrength: 0.03,

  // Accent layer
  accentScaleA: 1.35,
  accentScaleB: 2.15,
  accentSpeedAX: 0.42,
  accentSpeedAY: 0.15,
  accentSpeedBX: 0.18,
  accentSpeedBY: 0.36,
  accentStrength: 0.22,
  hueDriftStrength: 0.04,

  // Glow + vignette
  enableBloom: true,
  enableMouseGlow: true,
  enableVignette: true,
  enablePostNoise: true,
  bloomLow: 0.62,
  bloomHigh: 1.18,
  bloomStrength: 0.2,
  mouseGlowStrength: 0.28,
  vignetteOuter: 1.35,
  vignetteInner: 0.2,
  vignetteMin: 0.86,
  postNoiseAmount: 0.02,
  postNoiseScale: 2.4,
  postNoiseSpeed: 0.12,
  postNoiseMaskScale: 1.15,
  postNoiseMaskFlowX: 0.12,
  postNoiseMaskFlowY: 0.08,
  postNoiseMaskLow: 0.32,
  postNoiseMaskHigh: 0.78,

  // Colors
  colorDeep: "#574a75",
  colorMauve: "#8c78a8",
  colorPink: "#bd9ec2",
  colorPale: "#e0d4eb",
  colorPeriwinkle: "#8a94cc",
  colorOrchid: "#a885bd",
  bloomTint: "#1a1221",
};

let defaultParams = { ...params };
const PRESET_STORAGE_KEY = "soft-lifes.mist.preset";
const DEFAULTS_JSON_URL = "/mist-defaults.json";
const SHOW_TWEAKPANE =
  import.meta.env.DEV || new URLSearchParams(window.location.search).has("controls");

if (!SHOW_TWEAKPANE) {
  const style = document.createElement("style");
  style.textContent = ".tp-dfwv { display: none !important; }";
  document.head.append(style);
}

function applyKnownParams(source) {
  if (!source || typeof source !== "object") {
    return;
  }

  for (const key of Object.keys(params)) {
    if (key in source) {
      params[key] = source[key];
    }
  }
}

async function loadDefaultsFromJson() {
  try {
    const response = await fetch(`${DEFAULTS_JSON_URL}?v=${Date.now()}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      return;
    }

    const json = await response.json();
    applyKnownParams(json);
    defaultParams = { ...params };
  } catch {
    // ignore missing/invalid defaults file
  }
}

function loadCapturedPreset() {
  try {
    const raw = localStorage.getItem(PRESET_STORAGE_KEY);
    if (!raw) {
      return;
    }

    const saved = JSON.parse(raw);
    applyKnownParams(saved);
  } catch {
    // ignore malformed saved data
  }
}

function persistCapturedPreset() {
  try {
    localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(params));
  } catch {
    // ignore storage errors
  }
}

function randomFloat(min, max) {
  return min + Math.random() * (max - min);
}

function randomStep(min, max, step) {
  const value = randomFloat(min, max);
  return Math.round(value / step) * step;
}

function randomHslHex(hMin, hMax, sMin, sMax, lMin, lMax) {
  const color = new THREE.Color();
  color.setHSL(
    randomFloat(hMin, hMax),
    randomFloat(sMin, sMax),
    randomFloat(lMin, lMax),
  );
  return `#${color.getHexString()}`;
}

function resetToDefaults() {
  Object.assign(params, defaultParams);
}

function randomizePerformance() {
  params.renderScale = randomStep(0.45, 0.95, 0.01);
  params.maxDpr = randomStep(0.85, 1.5, 0.05);
}

function randomizeMotion() {
  params.timeScale = randomStep(0.08, 0.36, 0.005);
  params.flowX = randomStep(0.04, 0.32, 0.005);
  params.flowY = randomStep(0.03, 0.26, 0.005);
  params.swirlFreqX = randomStep(0.15, 0.8, 0.01);
  params.swirlFreqY = randomStep(0.12, 0.7, 0.01);
  params.swirlStrength = randomStep(0.03, 0.13, 0.002);
}

function randomizeNoise() {
  params.mistScaleA = randomStep(0.8, 2.2, 0.02);
  params.mistScaleB = randomStep(0.7, 2.0, 0.02);
  params.waterScale = randomStep(1.0, 4.4, 0.05);
  params.waterStrength = randomStep(0.01, 0.16, 0.005);
  params.detailScaleA = randomStep(2.2, 8.8, 0.1);
  params.detailStrengthA = randomStep(0.01, 0.09, 0.002);
  params.detailScaleB = randomStep(3.5, 11.2, 0.1);
  params.detailStrengthB = randomStep(0.005, 0.06, 0.001);
  params.mixBase = randomStep(0.3, 0.72, 0.01);
  params.mixDetail = randomStep(0.2, 0.58, 0.01);
  params.mistLow = randomStep(0.14, 0.42, 0.01);
  params.mistHigh = randomStep(
    Math.max(params.mistLow + 0.22, 0.52),
    1.1,
    0.01,
  );
  params.mistPow = randomStep(0.65, 1.15, 0.01);
}

function randomizeMouse() {
  params.mouseFalloff = randomStep(1.2, 5.2, 0.1);
  params.mouseStrength = randomStep(0.04, 0.34, 0.01);
  params.mouseWaveFreq = randomStep(3.5, 14.0, 0.1);
  params.mouseWaveFalloff = randomStep(1.1, 4.6, 0.1);
  params.mouseWaveStrength = randomStep(0.0, 0.055, 0.001);
}

function randomizeAccentLayer() {
  params.accentScaleA = randomStep(0.8, 3.1, 0.05);
  params.accentScaleB = randomStep(1.1, 4.2, 0.05);
  params.accentSpeedAX = randomStep(0.05, 0.9, 0.01);
  params.accentSpeedAY = randomStep(0.03, 0.8, 0.01);
  params.accentSpeedBX = randomStep(0.03, 0.8, 0.01);
  params.accentSpeedBY = randomStep(0.03, 0.9, 0.01);
  params.accentStrength = randomStep(0.06, 0.4, 0.01);
  params.hueDriftStrength = randomStep(0.0, 0.12, 0.005);
}

function randomizePost() {
  params.enableBloom = Math.random() > 0.2;
  params.enableMouseGlow = Math.random() > 0.2;
  params.enableVignette = Math.random() > 0.15;
  params.enablePostNoise = Math.random() > 0.1;
  params.bloomLow = randomStep(0.38, 0.92, 0.01);
  params.bloomHigh = randomStep(
    Math.max(params.bloomLow + 0.25, 0.72),
    1.45,
    0.01,
  );
  params.bloomStrength = randomStep(0.02, 0.42, 0.01);
  params.mouseGlowStrength = randomStep(0.04, 0.52, 0.01);
  params.vignetteOuter = randomStep(1.0, 1.8, 0.01);
  params.vignetteInner = randomStep(0.06, 0.42, 0.01);
  params.vignetteMin = randomStep(0.68, 0.96, 0.01);
  params.postNoiseAmount = randomStep(0.005, 0.08, 0.005);
  params.postNoiseScale = randomStep(1.2, 5.0, 0.05);
  params.postNoiseSpeed = randomStep(0.0, 0.4, 0.01);
  params.postNoiseMaskScale = randomStep(0.6, 2.5, 0.01);
  params.postNoiseMaskFlowX = randomStep(0.01, 0.35, 0.01);
  params.postNoiseMaskFlowY = randomStep(0.01, 0.35, 0.01);
  params.postNoiseMaskLow = randomStep(0.16, 0.52, 0.01);
  params.postNoiseMaskHigh = randomStep(
    Math.max(params.postNoiseMaskLow + 0.12, 0.5),
    0.96,
    0.01,
  );
}

function randomizeColors() {
  params.colorDeep = randomHslHex(0.67, 0.78, 0.2, 0.4, 0.2, 0.36);
  params.colorMauve = randomHslHex(0.69, 0.82, 0.2, 0.45, 0.36, 0.54);
  params.colorPink = randomHslHex(0.8, 0.95, 0.2, 0.45, 0.58, 0.72);
  params.colorPale = randomHslHex(0.72, 0.92, 0.14, 0.3, 0.78, 0.92);
  params.colorPeriwinkle = randomHslHex(0.58, 0.72, 0.2, 0.45, 0.54, 0.72);
  params.colorOrchid = randomHslHex(0.74, 0.9, 0.2, 0.45, 0.5, 0.68);
  params.bloomTint = randomHslHex(0.66, 0.9, 0.16, 0.4, 0.06, 0.2);
}

function randomizeAll() {
  randomizePerformance();
  randomizeMotion();
  randomizeNoise();
  randomizeMouse();
  randomizeAccentLayer();
  randomizePost();
  randomizeColors();
}

async function exportPreset() {
  const json = JSON.stringify(params, null, 2);

  try {
    await navigator.clipboard.writeText(json);
    window.alert(
      "Preset copied. Paste into public/mist-defaults.json to make it the new default.",
    );
  } catch {
    window.prompt("Copy preset JSON:", json);
  }
}

const renderer = new THREE.WebGLRenderer({
  antialias: false,
  alpha: false,
  powerPreference: "high-performance",
});

renderer.domElement.id = "bg";
renderer.domElement.className = "fixed inset-0 -z-10 h-full w-full";
document.body.prepend(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

const uniforms = {
  u_time: { value: 0 },
  u_resolution: {
    value: new THREE.Vector2(window.innerWidth, window.innerHeight),
  },
  u_mouse: { value: new THREE.Vector2(0.5, 0.5) },

  u_timeScale: { value: params.timeScale },
  u_flow: { value: new THREE.Vector2(params.flowX, params.flowY) },
  u_swirlFreq: {
    value: new THREE.Vector2(params.swirlFreqX, params.swirlFreqY),
  },
  u_swirlStrength: { value: params.swirlStrength },

  u_mistScaleA: { value: params.mistScaleA },
  u_mistScaleB: { value: params.mistScaleB },
  u_waterScale: { value: params.waterScale },
  u_waterStrength: { value: params.waterStrength },
  u_detailScaleA: { value: params.detailScaleA },
  u_detailStrengthA: { value: params.detailStrengthA },
  u_detailScaleB: { value: params.detailScaleB },
  u_detailStrengthB: { value: params.detailStrengthB },
  u_mixBase: { value: params.mixBase },
  u_mixDetail: { value: params.mixDetail },
  u_mistLow: { value: params.mistLow },
  u_mistHigh: { value: params.mistHigh },
  u_mistPow: { value: params.mistPow },

  u_mouseFalloff: { value: params.mouseFalloff },
  u_mouseStrength: { value: params.mouseStrength },
  u_mouseWaveFreq: { value: params.mouseWaveFreq },
  u_mouseWaveFalloff: { value: params.mouseWaveFalloff },
  u_mouseWaveStrength: { value: params.mouseWaveStrength },

  u_accentScaleA: { value: params.accentScaleA },
  u_accentScaleB: { value: params.accentScaleB },
  u_accentSpeedA: {
    value: new THREE.Vector2(params.accentSpeedAX, params.accentSpeedAY),
  },
  u_accentSpeedB: {
    value: new THREE.Vector2(params.accentSpeedBX, params.accentSpeedBY),
  },
  u_accentStrength: { value: params.accentStrength },
  u_hueDriftStrength: { value: params.hueDriftStrength },

  u_enableBloom: { value: params.enableBloom ? 1.0 : 0.0 },
  u_enableMouseGlow: { value: params.enableMouseGlow ? 1.0 : 0.0 },
  u_enableVignette: { value: params.enableVignette ? 1.0 : 0.0 },
  u_enablePostNoise: { value: params.enablePostNoise ? 1.0 : 0.0 },
  u_bloomLow: { value: params.bloomLow },
  u_bloomHigh: { value: params.bloomHigh },
  u_bloomStrength: { value: params.bloomStrength },
  u_mouseGlowStrength: { value: params.mouseGlowStrength },
  u_vignetteOuter: { value: params.vignetteOuter },
  u_vignetteInner: { value: params.vignetteInner },
  u_vignetteMin: { value: params.vignetteMin },
  u_postNoiseAmount: { value: params.postNoiseAmount },
  u_postNoiseScale: { value: params.postNoiseScale },
  u_postNoiseSpeed: { value: params.postNoiseSpeed },
  u_postNoiseMaskScale: { value: params.postNoiseMaskScale },
  u_postNoiseMaskFlow: {
    value: new THREE.Vector2(
      params.postNoiseMaskFlowX,
      params.postNoiseMaskFlowY,
    ),
  },
  u_postNoiseMaskLow: { value: params.postNoiseMaskLow },
  u_postNoiseMaskHigh: { value: params.postNoiseMaskHigh },

  u_colorDeep: { value: new THREE.Color(params.colorDeep) },
  u_colorMauve: { value: new THREE.Color(params.colorMauve) },
  u_colorPink: { value: new THREE.Color(params.colorPink) },
  u_colorPale: { value: new THREE.Color(params.colorPale) },
  u_colorPeriwinkle: { value: new THREE.Color(params.colorPeriwinkle) },
  u_colorOrchid: { value: new THREE.Color(params.colorOrchid) },
  u_bloomTint: { value: new THREE.Color(params.bloomTint) },
};

const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader: /* glsl */ `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    precision highp float;

    varying vec2 vUv;

    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    uniform float u_timeScale;
    uniform vec2 u_flow;
    uniform vec2 u_swirlFreq;
    uniform float u_swirlStrength;

    uniform float u_mistScaleA;
    uniform float u_mistScaleB;
    uniform float u_waterScale;
    uniform float u_waterStrength;
    uniform float u_detailScaleA;
    uniform float u_detailStrengthA;
    uniform float u_detailScaleB;
    uniform float u_detailStrengthB;
    uniform float u_mixBase;
    uniform float u_mixDetail;
    uniform float u_mistLow;
    uniform float u_mistHigh;
    uniform float u_mistPow;

    uniform float u_mouseFalloff;
    uniform float u_mouseStrength;
    uniform float u_mouseWaveFreq;
    uniform float u_mouseWaveFalloff;
    uniform float u_mouseWaveStrength;

    uniform float u_accentScaleA;
    uniform float u_accentScaleB;
    uniform vec2 u_accentSpeedA;
    uniform vec2 u_accentSpeedB;
    uniform float u_accentStrength;
    uniform float u_hueDriftStrength;

    uniform float u_enableBloom;
    uniform float u_enableMouseGlow;
    uniform float u_enableVignette;
    uniform float u_enablePostNoise;
    uniform float u_bloomLow;
    uniform float u_bloomHigh;
    uniform float u_bloomStrength;
    uniform float u_mouseGlowStrength;
    uniform float u_vignetteOuter;
    uniform float u_vignetteInner;
    uniform float u_vignetteMin;
    uniform float u_postNoiseAmount;
    uniform float u_postNoiseScale;
    uniform float u_postNoiseSpeed;
    uniform float u_postNoiseMaskScale;
    uniform vec2 u_postNoiseMaskFlow;
    uniform float u_postNoiseMaskLow;
    uniform float u_postNoiseMaskHigh;

    uniform vec3 u_colorDeep;
    uniform vec3 u_colorMauve;
    uniform vec3 u_colorPink;
    uniform vec3 u_colorPale;
    uniform vec3 u_colorPeriwinkle;
    uniform vec3 u_colorOrchid;
    uniform vec3 u_bloomTint;

    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 345.45));
      p += dot(p, p + 34.345);
      return fract(p.x * p.y);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);

      float a = hash(i + vec2(0.0, 0.0));
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));

      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    float fbm(vec2 p) {
      float value = 0.0;
      float amp = 0.6;
      for (int i = 0; i < 4; i++) {
        value += amp * noise(p);
        p *= 1.85;
        amp *= 0.54;
      }
      return value;
    }

    float softMist(vec2 p) {
      float m = 0.0;
      m += fbm(p);
      m += fbm(p + vec2(0.09, -0.07));
      m += fbm(p + vec2(-0.08, 0.11));
      return m / 3.0;
    }

    void main() {
      vec2 uv = vUv * 2.0 - 1.0;
      uv.x *= u_resolution.x / u_resolution.y;

      vec2 mouse = u_mouse * 2.0 - 1.0;
      mouse.x *= u_resolution.x / u_resolution.y;

      float t = u_time * u_timeScale;
      vec2 flow = vec2(t * u_flow.x, -t * u_flow.y);
      vec2 swirl = vec2(
        sin((uv.y + t * u_swirlFreq.x) * 2.4),
        cos((uv.x - t * u_swirlFreq.y) * 2.1)
      ) * u_swirlStrength;

      float mistBase = softMist(uv * u_mistScaleA + flow + swirl);
      float mistDetail = softMist(uv * u_mistScaleB - flow * 0.62 + swirl * 0.35);
      float waterSheen = noise(uv * u_waterScale + vec2(t * 0.28, -t * 0.24)) * u_waterStrength;
      float microDetail = noise(uv * u_detailScaleA + vec2(-t * 0.34, t * 0.26)) * u_detailStrengthA;
      microDetail += noise(uv * u_detailScaleB + vec2(t * 0.22, t * 0.16)) * u_detailStrengthB;

      float mist = mistBase * u_mixBase + mistDetail * u_mixDetail + waterSheen + microDetail;
      mist = smoothstep(u_mistLow, u_mistHigh, mist);
      mist = pow(mist, u_mistPow);

      float distToMouse = length(uv - mouse);
      float mouseBloom = exp(-distToMouse * distToMouse * u_mouseFalloff);
      float mouseSoftWave = sin(u_mouseWaveFreq * distToMouse - u_time * 2.2)
        * exp(-distToMouse * u_mouseWaveFalloff)
        * u_mouseWaveStrength;

      mist += mouseBloom * u_mouseStrength;
      mist += mouseSoftWave;
      mist = clamp(mist, 0.0, 1.25);

      vec3 color = mix(u_colorDeep, u_colorMauve, smoothstep(0.05, 0.70, mist));
      color = mix(color, u_colorPink, smoothstep(0.35, 0.95, mist + uv.y * 0.04));
      color = mix(color, u_colorPale, smoothstep(0.58, 1.08, mist));

      vec2 colorDriftA = uv * u_accentScaleA + vec2(-t * u_accentSpeedA.x, t * u_accentSpeedA.y) + swirl * 0.45;
      vec2 colorDriftB = uv * u_accentScaleB + vec2(t * u_accentSpeedB.x, -t * u_accentSpeedB.y);
      float colorLayer = noise(colorDriftA) * 0.65 + noise(colorDriftB) * 0.35;
      colorLayer = smoothstep(0.28, 0.86, colorLayer);

      vec3 movingAccent = mix(u_colorOrchid, u_colorPeriwinkle, colorLayer);
      color = mix(color, movingAccent, colorLayer * u_accentStrength);

      float hueDrift = sin((uv.x + uv.y) * 2.0 + t) * u_hueDriftStrength;
      color += vec3(0.03, -0.01, 0.04) * hueDrift;

      float bloom = smoothstep(u_bloomLow, u_bloomHigh, mist);
      color += u_bloomTint * bloom * u_bloomStrength * u_enableBloom;
      color += vec3(0.05, 0.02, 0.08) * mouseBloom * u_mouseGlowStrength * u_enableMouseGlow;

      float vignette = smoothstep(u_vignetteOuter, u_vignetteInner, length(uv));
      float vignetteFactor = mix(1.0, mix(u_vignetteMin, 1.0, vignette), u_enableVignette);
      color *= vignetteFactor;

      vec2 postMaskUv = uv * u_postNoiseMaskScale + vec2(t * u_postNoiseMaskFlow.x, -t * u_postNoiseMaskFlow.y);
      float postMask = noise(postMaskUv);
      postMask = smoothstep(u_postNoiseMaskLow, u_postNoiseMaskHigh, postMask);

      float fineScale = 2.0 + u_postNoiseScale * 6.0;
      vec2 grainUv = gl_FragCoord.xy * fineScale;
      float grainA = hash(grainUv + vec2(t * (71.0 + 19.0 * u_postNoiseSpeed), -t * (113.0 + 23.0 * u_postNoiseSpeed)));
      float grainB = hash(grainUv.yx + vec2(-t * (89.0 + 17.0 * u_postNoiseSpeed), t * (137.0 + 29.0 * u_postNoiseSpeed)));
      float grain = grainA - grainB;

      float luma = dot(color, vec3(0.299, 0.587, 0.114));
      float midMask = 1.0 - abs(luma * 2.0 - 1.0);
      float grainStrength = u_enablePostNoise * u_postNoiseAmount * postMask * (0.5 + 0.5 * midMask);
      color += vec3(grain * grainStrength);

      gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
    }
  `,
});

const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
scene.add(mesh);

const mouseTarget = new THREE.Vector2(0.5, 0.5);
const mouseCurrent = new THREE.Vector2(0.5, 0.5);
let lastPointerTime = performance.now();

const pane = new Pane({
  title: "mist controls",
  expanded: false,
});

const presetFolder = pane.addFolder({ title: "preset" });
presetFolder.addButton({ title: "capture" }).on("click", () => {
  persistCapturedPreset();
});
presetFolder.addButton({ title: "load capture" }).on("click", () => {
  void runPresetAction(loadCapturedPreset);
});
presetFolder.addButton({ title: "reset defaults" }).on("click", () => {
  void runPresetAction(resetToDefaults);
});
presetFolder.addButton({ title: "export json" }).on("click", () => {
  void exportPreset();
});

const randomFolder = pane.addFolder({ title: "randomize" });
randomFolder.addButton({ title: "all" }).on("click", () => {
  runPresetAction(randomizeAll);
});
randomFolder.addButton({ title: "performance" }).on("click", () => {
  runPresetAction(randomizePerformance);
});
randomFolder.addButton({ title: "motion" }).on("click", () => {
  runPresetAction(randomizeMotion);
});
randomFolder.addButton({ title: "noise" }).on("click", () => {
  runPresetAction(randomizeNoise);
});
randomFolder.addButton({ title: "mouse" }).on("click", () => {
  runPresetAction(randomizeMouse);
});
randomFolder.addButton({ title: "accent layer" }).on("click", () => {
  runPresetAction(randomizeAccentLayer);
});
randomFolder.addButton({ title: "glow/vignette" }).on("click", () => {
  runPresetAction(randomizePost);
});
randomFolder.addButton({ title: "colors" }).on("click", () => {
  runPresetAction(randomizeColors);
});

const perfFolder = pane.addFolder({ title: "performance" });
perfFolder.addBinding(params, "renderScale", {
  min: 0.4,
  max: 1,
  step: 0.01,
  label: "render scale",
});
perfFolder.addBinding(params, "maxDpr", {
  min: 0.75,
  max: 2,
  step: 0.05,
  label: "max dpr",
});

const motionFolder = pane.addFolder({ title: "motion" });
motionFolder.addBinding(params, "timeScale", {
  min: 0.05,
  max: 0.5,
  step: 0.005,
});
motionFolder.addBinding(params, "flowX", { min: 0, max: 0.5, step: 0.005 });
motionFolder.addBinding(params, "flowY", { min: 0, max: 0.5, step: 0.005 });
motionFolder.addBinding(params, "swirlFreqX", { min: 0, max: 1.2, step: 0.01 });
motionFolder.addBinding(params, "swirlFreqY", { min: 0, max: 1.2, step: 0.01 });
motionFolder.addBinding(params, "swirlStrength", {
  min: 0,
  max: 0.2,
  step: 0.002,
});

const noiseFolder = pane.addFolder({ title: "noise" });
noiseFolder.addBinding(params, "mistScaleA", {
  min: 0.4,
  max: 2.5,
  step: 0.02,
});
noiseFolder.addBinding(params, "mistScaleB", {
  min: 0.4,
  max: 2.5,
  step: 0.02,
});
noiseFolder.addBinding(params, "waterScale", { min: 0.5, max: 5, step: 0.05 });
noiseFolder.addBinding(params, "waterStrength", {
  min: 0,
  max: 0.2,
  step: 0.005,
});
noiseFolder.addBinding(params, "detailScaleA", { min: 1, max: 10, step: 0.1 });
noiseFolder.addBinding(params, "detailStrengthA", {
  min: 0,
  max: 0.12,
  step: 0.002,
});
noiseFolder.addBinding(params, "detailScaleB", { min: 1, max: 12, step: 0.1 });
noiseFolder.addBinding(params, "detailStrengthB", {
  min: 0,
  max: 0.12,
  step: 0.002,
});
noiseFolder.addBinding(params, "mixBase", { min: 0, max: 1, step: 0.01 });
noiseFolder.addBinding(params, "mixDetail", { min: 0, max: 1, step: 0.01 });
noiseFolder.addBinding(params, "mistLow", { min: 0, max: 0.6, step: 0.01 });
noiseFolder.addBinding(params, "mistHigh", { min: 0.5, max: 1.2, step: 0.01 });
noiseFolder.addBinding(params, "mistPow", { min: 0.4, max: 1.4, step: 0.01 });

const mouseFolder = pane.addFolder({ title: "mouse" });
mouseFolder.addBinding(params, "mouseFalloff", { min: 0.5, max: 8, step: 0.1 });
mouseFolder.addBinding(params, "mouseStrength", {
  min: 0,
  max: 0.5,
  step: 0.01,
});
mouseFolder.addBinding(params, "mouseWaveFreq", { min: 0, max: 20, step: 0.1 });
mouseFolder.addBinding(params, "mouseWaveFalloff", {
  min: 0.5,
  max: 8,
  step: 0.1,
});
mouseFolder.addBinding(params, "mouseWaveStrength", {
  min: 0,
  max: 0.08,
  step: 0.002,
});

const colorMotionFolder = pane.addFolder({ title: "accent layer" });
colorMotionFolder.addBinding(params, "accentScaleA", {
  min: 0.5,
  max: 4,
  step: 0.05,
});
colorMotionFolder.addBinding(params, "accentScaleB", {
  min: 0.5,
  max: 5,
  step: 0.05,
});
colorMotionFolder.addBinding(params, "accentSpeedAX", {
  min: 0,
  max: 1,
  step: 0.01,
});
colorMotionFolder.addBinding(params, "accentSpeedAY", {
  min: 0,
  max: 1,
  step: 0.01,
});
colorMotionFolder.addBinding(params, "accentSpeedBX", {
  min: 0,
  max: 1,
  step: 0.01,
});
colorMotionFolder.addBinding(params, "accentSpeedBY", {
  min: 0,
  max: 1,
  step: 0.01,
});
colorMotionFolder.addBinding(params, "accentStrength", {
  min: 0,
  max: 0.6,
  step: 0.01,
});
colorMotionFolder.addBinding(params, "hueDriftStrength", {
  min: 0,
  max: 0.2,
  step: 0.005,
});

const postFolder = pane.addFolder({ title: "glow/vignette" });
postFolder.addBinding(params, "enableBloom", { label: "bloom" });
postFolder.addBinding(params, "enableMouseGlow", { label: "mouse glow" });
postFolder.addBinding(params, "enableVignette", { label: "vignette" });
postFolder.addBinding(params, "enablePostNoise", { label: "post noise" });
postFolder.addBinding(params, "bloomLow", { min: 0, max: 1.2, step: 0.01 });
postFolder.addBinding(params, "bloomHigh", { min: 0.4, max: 1.6, step: 0.01 });
postFolder.addBinding(params, "bloomStrength", {
  min: 0,
  max: 0.6,
  step: 0.01,
});
postFolder.addBinding(params, "mouseGlowStrength", {
  min: 0,
  max: 0.8,
  step: 0.01,
});
postFolder.addBinding(params, "vignetteOuter", {
  min: 0.8,
  max: 2.2,
  step: 0.01,
});
postFolder.addBinding(params, "vignetteInner", {
  min: 0,
  max: 0.8,
  step: 0.01,
});
postFolder.addBinding(params, "vignetteMin", { min: 0.5, max: 1, step: 0.01 });
postFolder.addBinding(params, "postNoiseAmount", {
  min: 0,
  max: 0.12,
  step: 0.005,
});
postFolder.addBinding(params, "postNoiseScale", {
  min: 0.8,
  max: 6.0,
  step: 0.05,
});
postFolder.addBinding(params, "postNoiseSpeed", {
  min: 0,
  max: 0.6,
  step: 0.01,
});
postFolder.addBinding(params, "postNoiseMaskScale", {
  min: 0.2,
  max: 4.0,
  step: 0.01,
});
postFolder.addBinding(params, "postNoiseMaskFlowX", {
  min: 0,
  max: 1,
  step: 0.01,
});
postFolder.addBinding(params, "postNoiseMaskFlowY", {
  min: 0,
  max: 1,
  step: 0.01,
});
postFolder.addBinding(params, "postNoiseMaskLow", {
  min: 0,
  max: 0.9,
  step: 0.01,
});
postFolder.addBinding(params, "postNoiseMaskHigh", {
  min: 0.1,
  max: 1,
  step: 0.01,
});

const paletteFolder = pane.addFolder({ title: "colors" });
paletteFolder.addBinding(params, "colorDeep", { view: "color" });
paletteFolder.addBinding(params, "colorMauve", { view: "color" });
paletteFolder.addBinding(params, "colorPink", { view: "color" });
paletteFolder.addBinding(params, "colorPale", { view: "color" });
paletteFolder.addBinding(params, "colorOrchid", { view: "color" });
paletteFolder.addBinding(params, "colorPeriwinkle", { view: "color" });
paletteFolder.addBinding(params, "bloomTint", { view: "color" });

function applyRendererSettings() {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, params.maxDpr));
  renderer.setSize(
    window.innerWidth * params.renderScale,
    window.innerHeight * params.renderScale,
    false,
  );
}

function syncUniforms() {
  uniforms.u_timeScale.value = params.timeScale;
  uniforms.u_flow.value.set(params.flowX, params.flowY);
  uniforms.u_swirlFreq.value.set(params.swirlFreqX, params.swirlFreqY);
  uniforms.u_swirlStrength.value = params.swirlStrength;

  uniforms.u_mistScaleA.value = params.mistScaleA;
  uniforms.u_mistScaleB.value = params.mistScaleB;
  uniforms.u_waterScale.value = params.waterScale;
  uniforms.u_waterStrength.value = params.waterStrength;
  uniforms.u_detailScaleA.value = params.detailScaleA;
  uniforms.u_detailStrengthA.value = params.detailStrengthA;
  uniforms.u_detailScaleB.value = params.detailScaleB;
  uniforms.u_detailStrengthB.value = params.detailStrengthB;
  uniforms.u_mixBase.value = params.mixBase;
  uniforms.u_mixDetail.value = params.mixDetail;
  uniforms.u_mistLow.value = params.mistLow;
  uniforms.u_mistHigh.value = params.mistHigh;
  uniforms.u_mistPow.value = params.mistPow;

  uniforms.u_mouseFalloff.value = params.mouseFalloff;
  uniforms.u_mouseStrength.value = params.mouseStrength;
  uniforms.u_mouseWaveFreq.value = params.mouseWaveFreq;
  uniforms.u_mouseWaveFalloff.value = params.mouseWaveFalloff;
  uniforms.u_mouseWaveStrength.value = params.mouseWaveStrength;

  uniforms.u_accentScaleA.value = params.accentScaleA;
  uniforms.u_accentScaleB.value = params.accentScaleB;
  uniforms.u_accentSpeedA.value.set(params.accentSpeedAX, params.accentSpeedAY);
  uniforms.u_accentSpeedB.value.set(params.accentSpeedBX, params.accentSpeedBY);
  uniforms.u_accentStrength.value = params.accentStrength;
  uniforms.u_hueDriftStrength.value = params.hueDriftStrength;

  uniforms.u_enableBloom.value = params.enableBloom ? 1.0 : 0.0;
  uniforms.u_enableMouseGlow.value = params.enableMouseGlow ? 1.0 : 0.0;
  uniforms.u_enableVignette.value = params.enableVignette ? 1.0 : 0.0;
  uniforms.u_enablePostNoise.value = params.enablePostNoise ? 1.0 : 0.0;
  uniforms.u_bloomLow.value = params.bloomLow;
  uniforms.u_bloomHigh.value = params.bloomHigh;
  uniforms.u_bloomStrength.value = params.bloomStrength;
  uniforms.u_mouseGlowStrength.value = params.mouseGlowStrength;
  uniforms.u_vignetteOuter.value = params.vignetteOuter;
  uniforms.u_vignetteInner.value = params.vignetteInner;
  uniforms.u_vignetteMin.value = params.vignetteMin;
  uniforms.u_postNoiseAmount.value = params.postNoiseAmount;
  uniforms.u_postNoiseScale.value = params.postNoiseScale;
  uniforms.u_postNoiseSpeed.value = params.postNoiseSpeed;
  uniforms.u_postNoiseMaskScale.value = params.postNoiseMaskScale;
  uniforms.u_postNoiseMaskFlow.value.set(
    params.postNoiseMaskFlowX,
    params.postNoiseMaskFlowY,
  );
  uniforms.u_postNoiseMaskLow.value = params.postNoiseMaskLow;
  uniforms.u_postNoiseMaskHigh.value = params.postNoiseMaskHigh;

  uniforms.u_colorDeep.value.set(params.colorDeep);
  uniforms.u_colorMauve.value.set(params.colorMauve);
  uniforms.u_colorPink.value.set(params.colorPink);
  uniforms.u_colorPale.value.set(params.colorPale);
  uniforms.u_colorPeriwinkle.value.set(params.colorPeriwinkle);
  uniforms.u_colorOrchid.value.set(params.colorOrchid);
  uniforms.u_bloomTint.value.set(params.bloomTint);
}

function applyCurrentSettings(refreshPane = false) {
  applyRendererSettings();
  syncUniforms();
  if (refreshPane) {
    pane.refresh();
  }
}

async function runPresetAction(action, options = {}) {
  await action();
  applyCurrentSettings(true);
  if (options.capture) {
    persistCapturedPreset();
  }
}

async function initializePresetState() {
  await loadDefaultsFromJson();
  loadCapturedPreset();
  applyCurrentSettings(true);
}

void initializePresetState();

pane.on("change", () => {
  applyCurrentSettings();
});

window.addEventListener("pointermove", (event) => {
  mouseTarget.set(
    event.clientX / window.innerWidth,
    1 - event.clientY / window.innerHeight,
  );
  lastPointerTime = performance.now();
});

window.addEventListener("resize", () => {
  applyRendererSettings();
  uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();

function animate() {
  const elapsed = clock.getElapsedTime();
  uniforms.u_time.value = elapsed;

  if (performance.now() - lastPointerTime > 2400) {
    mouseTarget.x = 0.5 + Math.sin(elapsed * 0.34) * 0.14;
    mouseTarget.y = 0.5 + Math.cos(elapsed * 0.28) * 0.11;
  }

  mouseCurrent.lerp(mouseTarget, 0.12);
  uniforms.u_mouse.value.copy(mouseCurrent);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
