# Changelog

All notable changes to AI Screen Overlay will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-09-03

### 🚀 Major Features Added

#### **Comprehensive Cost Tracking System**
- **Accurate Model Pricing**: Implemented precise pricing for 40+ AI models across all providers
  - OpenAI: Standard, Batch, Flex, and Priority tiers (GPT-3.5, GPT-4, GPT-4o, GPT-4o-mini variants)
  - Claude: Sonnet, Haiku, and Opus models with tier-based pricing
  - DeepSeek: V2, V2.5, Chat, and Coder models
- **Mixed-Model Cost Calculation**: Track costs accurately when switching between different models in the same conversation
- **Real-time Cost Display**: Live cost updates in chat interface and history
- **Optimization Method Tracking**: Records which token optimization strategy was used for each message

#### **Enhanced Token Optimization**
- **Smart Cost Estimation**: Comprehensive cost disclaimers and estimation accuracy improvements
- **Dynamic Token Counter**: Auto-updating token counter with real-time cost calculations
- **Optimization Strategy Tracking**: Database tracking of optimization methods used per message

#### **Professional User Interface**
- **SVG Icon System**: Replaced all emojis with professional SVG icons throughout the application
- **Enhanced About Section**: Comprehensive app information with dynamic version display
- **Improved Settings UI**: Professional icons for all settings tabs (API Keys, Appearance, Optimization, About)
- **Status Indicators**: Green "Stable" badge and professional color-coded feature icons

### 🛠️ Technical Improvements

#### **Windows Compatibility**
- **Fixed API Key Storage**: Replaced file-based storage with database-based storage for Windows installer compatibility
- **Cross-platform Path Handling**: Improved file path resolution for packaged applications

#### **Database Enhancements**
- **Cost Tracking Schema**: Added comprehensive cost tracking columns to chats and messages tables
- **Optimization Metadata**: Added columns for tracking optimization methods and actual token usage
- **Performance Improvements**: Enhanced database indexes and query optimization

#### **Build System & Deployment**
- **Asset Bundling**: Improved webpack configuration for proper asset handling
- **TypeScript Declarations**: Added proper type declarations for image assets
- **Error Handling**: Enhanced error handling for production builds

### 🐛 Bug Fixes

#### **Settings & UI Fixes**
- Fixed non-working toggle buttons in optimization settings
- Fixed token counter not auto-updating after messages
- Fixed missing cost display in chat history
- Fixed wrong model display in UI components
- Fixed settings preview showing zero values

#### **Application Stability**
- Fixed package.json path resolution for version display
- Fixed compilation errors in TokenCounter and App.tsx components
- Fixed dynamic cost calculation updates
- Improved error handling for missing assets

### 📊 Performance & UX

#### **Cost Transparency**
- **Accurate Billing**: Users now see exactly what each message costs based on the actual model used
- **Cost History**: Complete cost tracking across all conversations
- **Optimization Insights**: Clear indication of which optimization strategy was applied

#### **Professional Appearance**
- **Enterprise-Ready UI**: Professional appearance suitable for business use
- **Consistent Iconography**: Scalable SVG icons that work across all screen resolutions
- **Semantic Color Coding**: Color-coded features for better user experience

### 🔧 Developer Experience
- **Enhanced Type Safety**: Improved TypeScript declarations and interfaces
- **Better Error Messages**: More descriptive error handling and logging
- **Modular Architecture**: Improved code organization and maintainability

## [1.0.2] - 2025-08-15

### Added
- Initial multi-LLM support
- Basic token optimization
- Screen capture functionality
- Chat history management

### Fixed
- Initial bug fixes and stability improvements

## [1.0.1] - 2025-08-01

### Added
- Core screen overlay functionality
- Basic AI chat integration

## [1.0.0] - 2025-07-15

### Added
- Initial release
- Basic screen capture
- OpenAI integration
