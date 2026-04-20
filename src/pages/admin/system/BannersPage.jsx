import { FiImage } from 'react-icons/fi';
import CrudPage from '../../../components/CrudPage';
import { bannersApi } from '../../../services/api';

export default function BannersPage() {
  const columns = [
    { key: 'title', label: 'Tiêu đề', render: item => <strong>{item.title}</strong> },
    { key: 'link', label: 'Link', style: { color: 'var(--text-secondary)' } },
    { key: 'order', label: 'Thứ tự', style: { textAlign: 'center' } },
    {
      key: 'status', label: 'Trạng thái',
      render: item => <span className={`badge ${item.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>{item.status === 'active' ? 'Hiển thị' : 'Ẩn'}</span>
    },
  ];

  const formFields = [
    { key: 'title', label: 'Tiêu đề', required: true },
    { key: 'link', label: 'Link' },
    { key: 'order', label: 'Thứ tự', type: 'number' },
    { key: 'status', label: 'Trạng thái', type: 'select', options: [{ value: 'active', label: 'Hiển thị' }, { value: 'inactive', label: 'Ẩn' }] },
  ];

  return (
    <CrudPage
      title="Quản lý Banners"
      icon={FiImage}
      columns={columns}
      searchFields={['title']}
      formFields={formFields}
      getNewItem={() => ({ title: '', link: '', order: 1, status: 'active' })}
      itemLabel="banner"
      onFetch={bannersApi.getAll}
      onCreate={bannersApi.create}
      onUpdate={bannersApi.update}
      onDelete={bannersApi.delete}
    />
  );
}

