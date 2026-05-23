import type { Locale } from "./locales";

export type Messages = {
  meta: { title: string; description: string };
  brand: string;
  hint: { withTitles: string; noTitles: string };
  badge: { primary: string };
  drag: { panel: string };
  resize: { vertical: string; horizontal: string; side: string };
  settings: {
    open: string;
    title: string;
    close: string;
    showTitles: string;
    showTitlesHint: string;
    streamSources: string;
    streamNote: string;
    displayName: string;
    youtubeUrl: string;
    urlPlaceholder: string;
    fetchTitle: string;
    fetching: string;
    cancel: string;
    saveApply: string;
    errors: {
      invalidUrl: string;
      fetchFailed: string;
      network: string;
      invalidYoutube: string;
    };
  };
  slot: {
    main: string;
    "top-right": string;
    "mid-right": string;
    "bottom-left": string;
    "bottom-center": string;
    "bottom-right": string;
  };
  lang: { switch: string; tr: string; en: string };
  header: {
    collapse: string;
    expand: string;
  };
  geo: {
    suggestTitle: string;
    suggestBody: string;
    switchEn: string;
    stayTr: string;
    dismiss: string;
  };
};

const tr: Messages = {
  meta: {
    title: "ADTV — Haber Duvarı",
    description: "Çok kanallı canlı haber izleme duvarı",
  },
  brand: "ADTV",
  hint: {
    withTitles: "Yer değiştirmek için başlık çubuğunu sürükleyin · Boyutlandırmak için ayırıcıları sürükleyin",
    noTitles: "Yer değiştirmek için panelin üzerindeki hareketli tutamacı sürükleyin",
  },
  badge: {
    primary: "Ana",
  },
  drag: {
    panel: "{title} panelini sürükleyerek yer değiştir",
  },
  resize: {
    vertical: "Ana ve yan sütunları yeniden boyutlandır",
    horizontal: "Üst ve alt satırları yeniden boyutlandır",
    side: "Ana yayının yanındaki panelleri yeniden boyutlandır",
  },
  settings: {
    open: "Ayarları aç",
    title: "Ayarlar",
    close: "Ayarları kapat",
    showTitles: "Panel başlık çubuklarını göster",
    showTitlesHint:
      "Kapalıyken videonun üzerinde beliren hareketli tutamacı sürükleyerek yer değiştirin",
    streamSources: "Yayın kaynakları",
    streamNote:
      "Başlıklar YouTube'dan alınır (iframe'den okunamaz — tarayıcı engeller). İzleme veya gömme bağlantısı yapıştırın, ardından başlığı getir'e tıklayın.",
    displayName: "Görünen ad",
    youtubeUrl: "YouTube bağlantısı",
    urlPlaceholder: "https://youtube.com/watch?v=…",
    fetchTitle: "YouTube'dan başlık getir",
    fetching: "Getiriliyor…",
    cancel: "İptal",
    saveApply: "Kaydet ve uygula",
    errors: {
      invalidUrl: "Geçerli bir YouTube bağlantısı veya video kimliği girin",
      fetchFailed: "Başlık alınamadı",
      network: "Ağ hatası",
      invalidYoutube: "Geçersiz YouTube bağlantısı",
    },
  },
  slot: {
    main: "Ana (büyük)",
    "top-right": "Sağ üst",
    "mid-right": "Sağ orta",
    "bottom-left": "Sol alt",
    "bottom-center": "Orta alt",
    "bottom-right": "Sağ alt",
  },
  lang: {
    switch: "Dil",
    tr: "TR",
    en: "EN",
  },
  header: {
    collapse: "Üst çubuğu gizle",
    expand: "Üst çubuğu göster",
  },
  geo: {
    suggestTitle: "Do you wanna switch to English?",
    suggestBody:
      "We noticed that you're launching from another region. Wanna use UI as English?",
    switchEn: "Switch to English",
    stayTr: "Keep it Turkish",
    dismiss: "Close",
  },
};

const en: Messages = {
  meta: {
    title: "ADTV — News Wall",
    description: "Multi-channel live news viewing grid",
  },
  brand: "ADTV",
  hint: {
    withTitles: "Drag title bar to swap · Drag splitters to resize all panels",
    noTitles: "Drag the moving handle over a panel to swap",
  },
  badge: {
    primary: "Primary",
  },
  drag: {
    panel: "Drag {title} to swap",
  },
  resize: {
    vertical: "Resize main and side columns",
    horizontal: "Resize top and bottom rows",
    side: "Resize side panels next to primary",
  },
  settings: {
    open: "Open settings",
    title: "Settings",
    close: "Close settings",
    showTitles: "Show panel title bars",
    showTitlesHint:
      "When off, drag the moving handle that appears over each video to swap",
    streamSources: "Stream sources",
    streamNote:
      "Titles are fetched from YouTube (not from the iframe — browsers block that). Paste a watch or embed link, then use Fetch title.",
    displayName: "Display name",
    youtubeUrl: "YouTube URL",
    urlPlaceholder: "https://youtube.com/watch?v=…",
    fetchTitle: "Fetch title from YouTube",
    fetching: "Fetching…",
    cancel: "Cancel",
    saveApply: "Save & apply",
    errors: {
      invalidUrl: "Enter a valid YouTube URL or video ID",
      fetchFailed: "Could not fetch title",
      network: "Network error",
      invalidYoutube: "Invalid YouTube URL",
    },
  },
  slot: {
    main: "Primary (large)",
    "top-right": "Top right",
    "mid-right": "Middle right",
    "bottom-left": "Bottom left",
    "bottom-center": "Bottom center",
    "bottom-right": "Bottom right",
  },
  lang: {
    switch: "Language",
    tr: "TR",
    en: "EN",
  },
  header: {
    collapse: "Hide header",
    expand: "Show header",
  },
  geo: {
    suggestTitle: "Prefer English?",
    suggestBody:
      "You appear to be connecting from outside Turkey. Would you like to use the English interface?",
    switchEn: "Switch to English",
    stayTr: "Keep Turkish",
    dismiss: "Close",
  },
};

export const messages: Record<Locale, Messages> = { tr, en };

function getByPath(obj: Record<string, unknown>, path: string): string | undefined {
  const val = path.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
  return typeof val === "string" ? val : undefined;
}

export function translate(
  locale: Locale,
  key: string,
  vars?: Record<string, string>
): string {
  const text = getByPath(messages[locale] as Record<string, unknown>, key) ?? key;
  if (!vars) return text;
  return Object.entries(vars).reduce(
    (s, [k, v]) => s.replaceAll(`{${k}}`, v),
    text
  );
}
