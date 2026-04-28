import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiBarChart2, FiCalendar, FiCheckCircle, FiFileText, FiUpload } from 'react-icons/fi';
import { useToast } from '../../../contexts/ToastContext';
import { notificationsApi } from '../../../services/api';
import supabase from '../../../services/supabaseClient';
import { fileToBase64, formatDate, slugify } from '../../../utils/helpers';
import {
  buildNotificationContent,
  formatFileSize,
  parseNotificationContent,
} from '../../../utils/notificationAttachments';
import NotificationAttachmentLink from '../../../components/NotificationAttachmentLink';

const SCORE_BUCKET = 'score-files';
const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['pdf', 'xlsx', 'xls'];

const today = () => new Date().toISOString().split('T')[0];

const getExtension = (fileName = '') => fileName.split('.').pop()?.toLowerCase() || '';

const isValidScoreFile = (file) => ALLOWED_EXTENSIONS.includes(getExtension(file.name));

async function uploadFileToStorage(file) {
  if (!supabase) return null;

  const safeName = slugify(file.name.replace(/\.[^.]+$/, '')) || 'bang-diem';
  const extension = getExtension(file.name);
  const path = `exam-scores/${Date.now()}-${safeName}.${extension}`;

  const { error } = await supabase.storage
    .from(SCORE_BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      contentType: file.type || undefined,
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage.from(SCORE_BUCKET).getPublicUrl(path);
  return data?.publicUrl ? { url: data.publicUrl, path, bucket: SCORE_BUCKET } : null;
}

async function buildAttachment(file) {
  const base = {
    name: file.name,
    size: file.size,
    type: file.type || getExtension(file.name),
    createdAt: new Date().toISOString(),
  };

  const dataUrl = await fileToBase64(file);

  try {
    const uploaded = await uploadFileToStorage(file);
    if (uploaded?.url) return { ...base, source: 'storage', dataUrl, ...uploaded };
  } catch (error) {
    console.warn('Falling back to embedded score file:', error.message);
  }

  return { ...base, source: 'embedded', dataUrl };
}

export default function ExamScoresPage() {
  const toast = useToast();
  const [title, setTitle] = useState('Thông báo điểm thi');
  const [content, setContent] = useState('Trung tâm thông báo file điểm thi. Sinh viên vui lòng mở file đính kèm để xem kết quả.');
  const [date, setDate] = useState(today());
  const [selectedFile, setSelectedFile] = useState(null);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  const scoreNotices = useMemo(
    () => notices.filter(n => n.type === 'score' || parseNotificationContent(n.content).attachment),
    [notices]
  );

  const loadNotices = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationsApi.getAll();
      setNotices(data || []);
    } catch (error) {
      toast.error('Lỗi tải thông báo', error.message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadNotices();
  }, [loadNotices]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!isValidScoreFile(file)) {
      toast.error('File không hợp lệ', 'Chỉ hỗ trợ PDF, XLS hoặc XLSX.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('File quá lớn', `Vui lòng chọn file không quá ${formatFileSize(MAX_FILE_SIZE)}.`);
      return;
    }

    setSelectedFile(file);
    if (title === 'Thông báo điểm thi') {
      setTitle(`Thông báo điểm thi - ${file.name.replace(/\.[^.]+$/, '')}`);
    }
  };

  const handlePublish = async () => {
    if (!selectedFile) {
      toast.error('Chưa chọn file', 'Vui lòng chọn file PDF hoặc Excel chứa điểm thi.');
      return;
    }

    setPublishing(true);
    try {
      const attachment = await buildAttachment(selectedFile);
      await notificationsApi.create({
        title: title.trim() || 'Thông báo điểm thi',
        content: buildNotificationContent(content, attachment),
        type: 'score',
        date,
        status: 'active',
      });

      toast.success('Đã công bố điểm', 'Sinh viên có thể xem file trong mục Thông báo.');
      setSelectedFile(null);
      setTitle('Thông báo điểm thi');
      setContent('Trung tâm thông báo file điểm thi. Sinh viên vui lòng mở file đính kèm để xem kết quả.');
      setDate(today());
      await loadNotices();
    } catch (error) {
      toast.error('Không thể công bố điểm', error.message);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <h1 className="page-title"><FiBarChart2 /> Công bố điểm thi</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(300px, 0.85fr)', gap: 20 }}>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'rgba(59, 130, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiUpload size={20} style={{ color: 'var(--primary-400)' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Upload file điểm</h2>
              <p style={{ margin: '4px 0 0', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                Hỗ trợ PDF, XLS, XLSX. Sau khi công bố, file sẽ hiện trong thông báo sinh viên.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Tiêu đề thông báo</label>
              <input
                className="form-input"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ví dụ: Thông báo điểm thi CNTT đợt tháng 4/2026"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Ngày thông báo</label>
              <div style={{ position: 'relative' }}>
                <FiCalendar size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input
                  className="form-input"
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  style={{ paddingLeft: 38 }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Nội dung hiển thị</label>
              <textarea
                className="form-textarea"
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Nhập nội dung thông báo ngắn gọn cho sinh viên"
                style={{ minHeight: 110 }}
              />
            </div>

            <label className="file-upload" style={{ margin: 0, cursor: 'pointer' }}>
              <input type="file" accept=".pdf,.xlsx,.xls" onChange={handleFileChange} style={{ display: 'none' }} />
              <FiFileText className="file-upload-icon" />
              <div className="file-upload-text">
                {selectedFile ? selectedFile.name : 'Chọn file điểm PDF hoặc Excel'}
              </div>
              <div className="file-upload-hint">
                {selectedFile ? `${formatFileSize(selectedFile.size)} · bấm để chọn file khác` : `Dung lượng tối đa ${formatFileSize(MAX_FILE_SIZE)}`}
              </div>
            </label>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button className="btn btn-primary" onClick={handlePublish} disabled={publishing}>
                {publishing ? <span className="loading-spinner" /> : <FiCheckCircle size={16} />}
                {publishing ? 'Đang công bố...' : 'Công bố cho sinh viên'}
              </button>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: '1.05rem', marginBottom: 14 }}>Thông báo điểm đã công bố</h2>
          {loading ? (
            <div style={{ color: 'var(--text-tertiary)', padding: '16px 0' }}>
              <span className="loading-spinner" style={{ marginRight: 8 }} />
              Đang tải...
            </div>
          ) : scoreNotices.length === 0 ? (
            <div style={{ color: 'var(--text-tertiary)', padding: '16px 0' }}>
              Chưa có thông báo điểm nào.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {scoreNotices.slice(0, 6).map(notice => {
                const parsed = parseNotificationContent(notice.content);
                return (
                  <div key={notice.id} style={{ paddingBottom: 14, borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: 700, lineHeight: 1.4 }}>{notice.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
                      {formatDate(notice.date)} · {notice.status === 'active' ? 'Đang hiển thị' : 'Đã ẩn'}
                    </div>
                    <NotificationAttachmentLink attachment={parsed.attachment} compact />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
