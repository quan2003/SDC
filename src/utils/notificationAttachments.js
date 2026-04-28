const ATTACHMENT_START = '\n\n---SDC_ATTACHMENT_JSON---\n';
const ATTACHMENT_END = '\n---/SDC_ATTACHMENT_JSON---';

export const buildNotificationContent = (text, attachment) => {
  const cleanText = (text || '').trim();
  if (!attachment) return cleanText;
  return `${cleanText}${ATTACHMENT_START}${JSON.stringify(attachment)}${ATTACHMENT_END}`;
};

export const parseNotificationContent = (content) => {
  const raw = content || '';
  const start = raw.indexOf(ATTACHMENT_START);

  if (start === -1) {
    return { text: raw, attachment: null };
  }

  const end = raw.indexOf(ATTACHMENT_END, start + ATTACHMENT_START.length);
  if (end === -1) {
    return { text: raw, attachment: null };
  }

  const text = raw.slice(0, start).trim();
  const encoded = raw.slice(start + ATTACHMENT_START.length, end);

  try {
    return { text, attachment: JSON.parse(encoded) };
  } catch {
    return { text: raw, attachment: null };
  }
};

export const formatFileSize = (bytes = 0) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
