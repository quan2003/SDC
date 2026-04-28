import { FiExternalLink, FiFileText } from 'react-icons/fi';
import { formatFileSize } from '../utils/notificationAttachments';

const dataUrlToBlob = (dataUrl) => {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/data:([^;]+)/)?.[1] || 'application/octet-stream';
  const binary = atob(base64 || '');
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new Blob([bytes], { type: mime });
};

export default function NotificationAttachmentLink({ attachment, compact = false }) {
  const href = attachment?.url;
  const hasEmbeddedFile = Boolean(attachment?.dataUrl);
  if (!href && !hasEmbeddedFile) return null;

  const content = (
    <>
      <FiFileText size={14} />
      {compact ? 'Xem file' : `Xem file điểm${attachment.name ? `: ${attachment.name}` : ''}`}
      {!compact && attachment.size ? (
        <span style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}>
          ({formatFileSize(attachment.size)})
        </span>
      ) : null}
      <FiExternalLink size={13} />
    </>
  );

  const openEmbeddedFile = () => {
    const blobUrl = URL.createObjectURL(dataUrlToBlob(attachment.dataUrl));
    window.open(blobUrl, '_blank', 'noopener,noreferrer');
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 10 * 60 * 1000);
  };

  if (hasEmbeddedFile) {
    return (
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={openEmbeddedFile}
        style={{ width: 'fit-content', marginTop: compact ? 8 : 14 }}
      >
        {content}
      </button>
    );
  }

  return (
    <a
      className="btn btn-ghost btn-sm"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ width: 'fit-content', marginTop: compact ? 8 : 14 }}
    >
      {content}
    </a>
  );
}
