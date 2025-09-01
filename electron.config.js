module.exports = {
  "appId": "com.aioverlay.app",
  "productName": "AI Screen Overlay",
  "directories": {
    "output": "release",
    "buildResources": "build"
  },
  "files": [
    "dist/**/*",
    "package.json",
    "node_modules/**/*"
  ],
  "extraResources": [
    {
      "from": "data",
      "to": "data",
      "filter": ["**/*"]
    }
  ],
  "linux": {
    "target": [
      {
        "target": "AppImage",
        "arch": ["x64"]
      },
      {
        "target": "snap",
        "arch": ["x64"]
      },
      {
        "target": "deb",
        "arch": ["x64"]
      }
    ],
    "category": "Utility",
    "icon": "build/icon.png",
    "description": "AI-powered screen capture and analysis tool",
    "vendor": "AI Screen Overlay Team",
    "maintainer": "AI Screen Overlay Team"
  },
  "snap": {
    "grade": "stable",
    "confinement": "classic",
    "summary": "AI Screen Overlay - Capture and analyze your screen with AI"
  },
  "deb": {
    "depends": [
      "libgtk-3-0",
      "libnotify4",
      "libnss3",
      "libxss1",
      "libxtst6",
      "xdg-utils",
      "libatspi2.0-0",
      "libdrm2",
      "libxcomposite1",
      "libxdamage1",
      "libxrandr2",
      "libgbm1",
      "libxkbcommon0",
      "libasound2"
    ]
  },
  "publish": {
    "provider": "github",
    "releaseType": "release"
  }
};
