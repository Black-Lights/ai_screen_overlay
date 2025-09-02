/**
 * Background Detection Service
 * Detects the dominant background color/brightness behind the overlay window
 */

export interface BackgroundInfo {
  brightness: 'light' | 'dark';
  dominantColor: string;
  recommendedOpacity: number;
}

export class BackgroundDetectionService {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  /**
   * Analyze the background behind the current window position
   * Note: In Electron, we can't directly capture the screen from renderer process
   * So we'll use a simpler approach based on system theme detection
   */
  async detectBackground(): Promise<BackgroundInfo> {
    try {
      // Check if system prefers dark mode
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // For now, use system theme as primary indicator
      // In the future, this could be enhanced with actual screen capture
      const brightness = prefersDark ? 'dark' : 'light';
      
      // Calculate recommended opacity based on detected brightness
      const recommendedOpacity = brightness === 'light' ? 0.95 : 0.85;
      
      return {
        brightness,
        dominantColor: brightness === 'light' ? '#ffffff' : '#000000',
        recommendedOpacity
      };
    } catch (error) {
      console.error('Background detection failed:', error);
      // Fallback to medium opacity
      return {
        brightness: 'dark',
        dominantColor: '#000000',
        recommendedOpacity: 0.85
      };
    }
  }

  /**
   * Get theme styles based on background and user preferences
   */
  getThemeStyles(theme: 'glassmorphism' | 'dark' | 'light', backgroundInfo?: BackgroundInfo) {
    const adaptiveOpacity = backgroundInfo?.recommendedOpacity || 0.85;

    switch (theme) {
      case 'light':
        return {
          background: `rgba(255, 255, 255, ${Math.max(0.95, adaptiveOpacity)})`,
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          textColor: 'text-gray-800',
          secondaryText: 'text-gray-600',
          accent: 'bg-blue-500',
          hover: 'hover:bg-gray-100'
        };
      
      case 'dark':
        return {
          background: `rgba(0, 0, 0, ${Math.max(0.9, adaptiveOpacity)})`,
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          textColor: 'text-white',
          secondaryText: 'text-gray-300',
          accent: 'bg-blue-600',
          hover: 'hover:bg-gray-800'
        };
      
      case 'glassmorphism':
      default:
        // Enhanced glassmorphism with adaptive opacity
        const glassOpacity = backgroundInfo?.brightness === 'light' 
          ? Math.max(0.9, adaptiveOpacity) 
          : Math.max(0.8, adaptiveOpacity);
        
        return {
          background: `linear-gradient(135deg, 
            rgba(59, 130, 246, ${glassOpacity * 0.15}) 0%, 
            rgba(147, 51, 234, ${glassOpacity * 0.15}) 100%)`,
          backdropFilter: `blur(${backgroundInfo?.brightness === 'light' ? 15 : 20}px)`,
          border: `1px solid rgba(255, 255, 255, ${backgroundInfo?.brightness === 'light' ? 0.2 : 0.1})`,
          textColor: 'text-white',
          secondaryText: 'text-white/70',
          accent: 'bg-purple-500',
          hover: 'hover:bg-white/10'
        };
    }
  }
}

export const backgroundDetection = new BackgroundDetectionService();
