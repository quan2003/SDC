import { useState } from 'react';
import { FiCalendar } from 'react-icons/fi';
import CrudPage from '../../../components/CrudPage';
import { examSessionsApi } from '../../../services/api';
import { formatDate } from '../../../utils/helpers';

export default function ExamSessionsPage() {
  const [data, setData] = useState([]);

  const columns = [
    { key: 'code', label: 'Mã đợt', render: item => <code style={{ color: 'var(--primary-400)' }}>{item.code}</code> },
    { key: 'name', label: 'Tên đợt thi', render: item => <strong>{item.name}</strong> },
    { key: 'exam_date', label: 'Ngày thi', render: item => formatDate(item.exam_date) || '—' },
    { key: 'location', label: 'Địa điểm', style: { color: 'var(--text-secondary)' } },
    { key: 'status', label: 'Trạng thái', render: item =>
      <span className={`badge ${item.status === 'active' ? 'badge-active' : item.status === 'completed' ? 'badge-success' : 'badge-pending'}`}>
        {item.status === 'active' ? 'Đang mở' : item.status === 'completed' ? 'Hoàn tất' : 'Chuẩn bị'}
      </span>
    },
  ];

  const formFields = [
    { key: 'code', label: 'Mã đợt thi', required: true, placeholder: 'VD: DT2024-01' },
    { key: 'name', label: 'Tên đợt thi', required: true, placeholder: 'VD: Đợt thi tháng 6/2024' },
    { key: 'exam_date', label: 'Ngày thi', type: 'date' },
    { key: 'location', label: 'Địa điểm thi' },
    { key: 'description', label: 'Ghi chú', type: 'textarea' },
    { key: 'status', label: 'Trạng thái', type: 'select', options: [
      { value: 'upcoming', label: 'Chuẩn bị' },
      { value: 'active', label: 'Đang mở' },
      { value: 'completed', label: 'Hoàn tất' },
    ]},
  ];

  return (
    <CrudPage
      title="Quản lý đợt thi"
      icon={FiCalendar}
      data={data} setData={setData}
      onFetch={examSessionsApi.getAll}
      onCreate={examSessionsApi.create}
      onUpdate={examSessionsApi.update}
      onDelete={examSessionsApi.delete}
      columns={columns}
      searchFields={['code', 'name', 'location']}
      formFields={formFields}
      getNewItem={() => ({ code: '', name: '', exam_date: '', location: '', description: '', status: 'upcoming' })}
      itemLabel="đợt thi"
    />
  );
}
