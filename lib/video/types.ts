export type GenerateVideoInput = {
  prompt: string;
  durationSec: number;
  aspectRatio?: string;
  variantIndex?: number;
};

export type GenerateVideoResult = {
  url: string;
  provider: string;
  meta?: Record<string, unknown>;
};

export interface VideoProvider {
  readonly name: string;
  generate(input: GenerateVideoInput): Promise<GenerateVideoResult>;
}
