export const TEMPLATES = {
  talking_hook: {
    id: "talking_hook",
    name: "Talking Hook",
    description: "Face-forward hook with punchy opener text energy.",
    defaultPrompt:
      "A creator speaking to camera with energetic body language, bold hook energy, vertical 9:16 framing",
  },
  product_spin: {
    id: "product_spin",
    name: "Product Spin",
    description: "Hero product reveal with clean studio lighting.",
    defaultPrompt:
      "A sleek product hero shot spinning slowly on a clean pedestal, soft studio lights, vertical 9:16",
  },
  cinematic_broll: {
    id: "cinematic_broll",
    name: "Cinematic B-roll",
    description: "Moody atmospheric B-roll for storytelling cuts.",
    defaultPrompt:
      "Cinematic atmospheric B-roll, shallow depth of field, dramatic lighting, vertical 9:16",
  },
} as const;

export type TemplateId = keyof typeof TEMPLATES;

export const CAMERA_PRESETS = {
  static: {
    id: "static",
    name: "Static",
    promptSuffix: ", locked-off static camera, stable framing",
  },
  push_in: {
    id: "push_in",
    name: "Push In",
    promptSuffix: ", slow cinematic push-in toward subject",
  },
  orbit: {
    id: "orbit",
    name: "Orbit",
    promptSuffix: ", gentle orbital camera move around subject",
  },
  pan: {
    id: "pan",
    name: "Pan",
    promptSuffix: ", smooth horizontal pan revealing the scene",
  },
} as const;

export type CameraPresetId = keyof typeof CAMERA_PRESETS;

export function buildPrompt(base: string, preset: CameraPresetId): string {
  const suffix = CAMERA_PRESETS[preset]?.promptSuffix ?? "";
  return `${base.trim()}${suffix}`.trim();
}
