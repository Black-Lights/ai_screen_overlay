import React from 'react';
import { AVAILABLE_MODELS, DEFAULT_MODELS, ModelInfo } from '@/shared/models';

interface ModelSelectorProps {
  provider: 'openai' | 'claude' | 'deepseek';
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  disabled?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  provider,
  selectedModel,
  onModelChange,
  disabled = false
}) => {
  const models = AVAILABLE_MODELS[provider] || [];
  const currentModel = models.find(m => m.id === selectedModel) || models[0];

  if (!models.length) return null;

  return (
    <div className="model-selector">
      <select 
        value={selectedModel || DEFAULT_MODELS[provider]}
        onChange={(e) => onModelChange(e.target.value)}
        disabled={disabled}
        className="model-dropdown"
      >
        {models.map((model: ModelInfo) => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </select>
      
      {currentModel && (
        <div className="model-info">
          <div className="model-description">
            {currentModel.description}
          </div>
          <div className="model-details">
            <span className="pricing">
              In: {currentModel.pricing.input} | Out: {currentModel.pricing.output}
            </span>
            {currentModel.capabilities.vision && (
              <span className="capability">Vision</span>
            )}
            <span className="context">
              {(currentModel.capabilities.maxTokens / 1000).toFixed(0)}K tokens
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
