import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.albertomorini.geomedia',
  appName: 'GeoMedia',
  webDir: 'dist',
  server: {
    androidScheme: 'http'
  }
};

export default config;
