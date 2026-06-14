type NetworkInformation = {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
};

type NavigatorWithHints = Navigator & {
  connection?: NetworkInformation;
  deviceMemory?: number;
};

export function getClientMetadata(): Record<string, unknown> {
  const navigatorWithHints = window.navigator as NavigatorWithHints;
  const connection = navigatorWithHints.connection;

  return {
    page_url: window.location.href,
    referrer: document.referrer || null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    locale: navigator.language,
    languages: navigator.languages,
    platform: navigator.platform,
    user_agent: navigator.userAgent,
    do_not_track: navigator.doNotTrack,
    hardware_concurrency: navigator.hardwareConcurrency,
    device_memory_gb: navigatorWithHints.deviceMemory,
    max_touch_points: navigator.maxTouchPoints,
    color_scheme: window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light",
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    screen: {
      width: window.screen.width,
      height: window.screen.height,
      pixel_depth: window.screen.pixelDepth,
      device_pixel_ratio: window.devicePixelRatio,
    },
    connection: connection
      ? {
          effective_type: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          save_data: connection.saveData,
        }
      : null,
  };
}
