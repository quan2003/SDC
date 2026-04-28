import { FiBell } from 'react-icons/fi';
import CrudPage from '../../../components/CrudPage';
import { notificationsApi } from '../../../services/api';
import { formatDate } from '../../../utils/helpers';
import { buildNotificationContent, parseNotificationContent } from '../../../utils/notificationAttachments';

const normalizeNotification = (item) => {
  const parsed = parseNotificationContent(item.content);
  return { ...item, content: parsed.text, _attachment: parsed.attachment };
};

export default function NotificationsPage() {
  const columns = [
    { key: 'title', label: 'Tiêu đề', render: item => <strong style={{ maxWidth: 300, display: 'block', whiteSpace: 'normal' }}>{item.title}</strong> },
    { key: 'type', label: 'Loại', render: item => {
      const types = { exam: 'Thi', class: 'Lớp', guide: 'Hướng dẫn', general: 'Chung', score: 'Điểm thi' };
      return <span className="badge badge-info">{types[item.type] || item.type}</span>;
    }},
    { key: 'date', label: 'Ngày', render: item => formatDate(item.date), style: { color: 'var(--text-secondary)' } },
    { key: 'status', label: 'Trạng thái', render: item => <span className={`badge ${item.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>{item.status === 'active' ? 'Hiển thị' : 'Ẩn'}</span> },
  ];

  const formFields = [
    { key: 'title', label: 'Tiêu đề', required: true },
    { key: 'content', label: 'Nội dung', type: 'textarea' },
    { key: 'type', label: 'Loại', type: 'select', options: [{ value: 'exam', label: 'Thi' }, { value: 'class', label: 'Lớp' }, { value: 'guide', label: 'Hướng dẫn' }, { value: 'general', label: 'Chung' }, { value: 'score', label: 'Điểm thi' }] },
    { key: 'date', label: 'Ngày', type: 'date' },
    { key: 'status', label: 'Trạng thái', type: 'select', options: [{ value: 'active', label: 'Hiển thị' }, { value: 'inactive', label: 'Ẩn' }] },
  ];

  return (
    <CrudPage
      title="Quản lý thông báo"
      icon={FiBell}
      columns={columns}
      searchFields={['title', 'content']}
      formFields={formFields}
      getNewItem={() => ({ title: '', content: '', type: 'general', date: new Date().toISOString().split('T')[0], status: 'active' })}
      itemLabel="thông báo"
      onFetch={async () => (await notificationsApi.getAll()).map(normalizeNotification)}
      onCreate={notificationsApi.create}
      onUpdate={(id, payload) => {
        const { _attachment, ...cleanPayload } = payload;
        return notificationsApi.update(id, {
          ...cleanPayload,
          content: buildNotificationContent(payload.content, _attachment),
        });
      }}
      onDelete={notificationsApi.delete}
    />
  );
}

