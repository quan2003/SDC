import { FiGrid } from 'react-icons/fi';
import CrudPage from '../../../components/CrudPage';
import { categoriesApi } from '../../../services/api';

export default function CategoriesPage() {
  const columns = [
    { key: 'code', label: 'Mã danh mục', render: item => <code style={{ color: 'var(--primary-400)' }}>{item.code}</code> },
    { key: 'name', label: 'Tên danh mục', render: item => <strong>{item.name}</strong> },
    { key: 'order', label: 'Thứ tự', style: { textAlign: 'center' } },
    {
      key: 'status', label: 'Trạng thái',
      render: item => <span className={`badge ${item.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>{item.status === 'active' ? 'Hoạt động' : 'Ngừng KH'}</span>
    },
  ];

  const formFields = [
    { key: 'code', label: 'Mã danh mục', required: true },
    { key: 'name', label: 'Tên danh mục', required: true },
    { key: 'order', label: 'Thứ tự', type: 'number' },
    { key: 'status', label: 'Trạng thái', type: 'select', options: [{ value: 'active', label: 'Hoạt động' }, { value: 'inactive', label: 'Ngừng KH' }] },
  ];

  return (
    <CrudPage
      title="Quản lý danh mục hệ thống"
      icon={FiGrid}
      columns={columns}
      searchFields={['code', 'name']}
      formFields={formFields}
      getNewItem={() => ({ code: '', name: '', order: 1, status: 'active' })}
      itemLabel="danh mục"
      onFetch={categoriesApi.getAll}
      onCreate={categoriesApi.create}
      onUpdate={categoriesApi.update}
      onDelete={categoriesApi.delete}
    />
  );
}

