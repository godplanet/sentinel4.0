import { OpenAIProvider } from './openai-provider';

export class LocalLLMProvider extends OpenAIProvider {
  constructor(baseUrl: string, model: string) {
    super('not-needed', model, baseUrl);
  }
}
