import { FiLock } from 'react-icons/fi';
import CrudPage from '../../../components/CrudPage';
import { permissionsApi } from '../../../services/api';

export default function PermissionsPage() {
  const columns = [
    { key: 'code', label: 'Mã quyền', render: item => <code style={{ color: 'var(--accent-400)', fontSize: '0.8rem' }}>{item.code}</code> },
    { key: 'name', label: 'Tên quyền', render: item => <strong>{item.name}</strong> },
    { key: 'module', label: 'Module', render: item => <span className="badge badge-info">{item.module}</span> },
  ];

  const formFields = [
    { key: 'code', label: 'Mã quyền', required: true, placeholder: 'vd: MANAGE_USERS' },
    { key: 'name', label: 'Tên quyền', required: true, placeholder: 'vd: Quản lý người dùng' },
    { key: 'module', label: 'Module', required: true, placeholder: 'vd: Hệ thống' },
  ];

  return (
    <CrudPage
      title="Quản lý quyền"
      icon={FiLock}
      columns={columns}
      searchFields={['code', 'name', 'module']}
      formFields={formFields}
      getNewItem={() => ({ code: '', name: '', module: '' })}
      itemLabel="quyền"
      onFetch={permissionsApi.getAll}
      onCreate={permissionsApi.create}
      onUpdate={permissionsApi.update}
      onDelete={permissionsApi.delete}
    />
  );
}

