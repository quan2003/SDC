import { FiShield } from 'react-icons/fi';
import CrudPage from '../../../components/CrudPage';
import { rolesApi } from '../../../services/api';

export default function RolesPage() {
  const columns = [
    { key: 'name', label: 'Tên hệ thống', render: item => <code style={{ color: 'var(--accent-400)' }}>{item.name}</code> },
    { key: 'display_name', label: 'Tên hiển thị', render: item => <strong>{item.display_name || item.displayName}</strong> },
    { key: 'description', label: 'Mô tả', style: { color: 'var(--text-secondary)', fontSize: '0.88rem' } },
    {
      key: 'status', label: 'Trạng thái',
      render: item => <span className={`badge ${item.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>{item.status === 'active' ? 'Hoạt động' : 'Ngừng'}</span>
    },
  ];

  const formFields = [
    { key: 'name', label: 'Tên hệ thống (vd: admin)', required: true },
    { key: 'display_name', label: 'Tên hiển thị', required: true },
    { key: 'description', label: 'Mô tả' },
    { key: 'status', label: 'Trạng thái', type: 'select', options: [{ value: 'active', label: 'Hoạt động' }, { value: 'inactive', label: 'Ngừng hoạt động' }] },
  ];

  return (
    <CrudPage
      title="Quản lý vai trò"
      icon={FiShield}
      columns={columns}
      searchFields={['name', 'display_name', 'description']}
      formFields={formFields}
      getNewItem={() => ({ name: '', display_name: '', description: '', status: 'active' })}
      itemLabel="vai trò"
      onFetch={rolesApi.getAll}
      onCreate={rolesApi.create}
      onUpdate={rolesApi.update}
      onDelete={rolesApi.delete}
    />
  );
}

