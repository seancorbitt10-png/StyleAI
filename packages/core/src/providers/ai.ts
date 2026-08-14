import { NotConfiguredError } from '../errors';
import type { ClothingAnalysis } from '../validation';

export type VisionTask = 'clothing.analyze' | 'closet.detect_items';

export type VisionRequest = {
  task: VisionTask;
  imageBytes: Uint8Array;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  hint?: string;
};

export type VisionResult = {
  analysis?: ClothingAnalysis;
  detections?: ClothingAnalysis[];
  provider: string;
  model: string;
  inputTokens: number | null;
  outputTokens: number | null;
  durationMs: number;
};

export interface VisionProvider {
  readonly name: string;
  analyze(request: VisionRequest): Promise<VisionResult>;
}

export type ReasoningTask = 'outfit.parse_request' | 'outfit.critique' | 'product.search_intent';

export type ReasoningRequest = {
  task: ReasoningTask;
  input: unknown;
};

export type ReasoningResult<T> = {
  data: T;
  provider: string;
  model: string;
  inputTokens: number | null;
  outputTokens: number | null;
  durationMs: number;
};

export interface ReasoningProvider {
  readonly name: string;
  complete<T>(request: ReasoningRequest, parse: (raw: unknown) => T): Promise<ReasoningResult<T>>;
}

/** Fail-closed stand-in. Never returns fabricated analysis. */
export class UnconfiguredVisionProvider implements VisionProvider {
  readonly name = 'unconfigured';
  async analyze(): Promise<VisionResult> {
    throw new NotConfiguredError('VisionProvider');
  }
}

export class UnconfiguredReasoningProvider implements ReasoningProvider {
  readonly name = 'unconfigured';
  async complete<T>(): Promise<ReasoningResult<T>> {
    throw new NotConfiguredError('ReasoningProvider');
  }
}
