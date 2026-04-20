import { useState, useEffect } from 'react';
import { FiUsers } from 'react-icons/fi';
import CrudPage from '../../../components/CrudPage';
import { usersApi, rolesApi } from '../../../services/api';

export default function UsersPage() {
  const [data, setData] = useState([]);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    rolesApi.getAll().then(res => setRoles(res));
  }, []);

  const columns = [
    { key: 'username', label: 'Tên đăng nhập', render: item => <strong>{item.username}</strong> },
    { key: 'fullName', label: 'Họ tên' },
    { key: 'email', label: 'Email', style: { color: 'var(--text-secondary)' } },
    { key: 'phone', label: 'Điện thoại', style: { color: 'var(--text-secondary)' } },
    {
      key: 'role', label: 'Vai trò',
      render: item => (
        <span className="badge badge-primary">
          {roles.find(r => r.name === item.role)?.displayName || item.role}
        </span>
      )
    },
    {
      key: 'status', label: 'Trạng thái',
      render: item => (
        <span className={`badge ${item.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
          {item.status === 'active' ? 'Hoạt động' : 'Ngừng KH'}
        </span>
      )
    },
  ];

  const formFields = [
    { key: 'fullName', label: 'Họ tên', required: true, placeholder: 'Nhập họ tên...' },
    { key: 'email', label: 'Email', type: 'email', required: true, placeholder: 'Nhập email (bắt buộc đuôi @sdc.udn.vn)...' },
    { key: 'phone', label: 'Điện thoại', placeholder: 'Nhập số điện thoại...' },
    { key: 'password', label: 'Mật khẩu', type: 'password', placeholder: 'Nhập mật khẩu (nếu rỗng sẽ giữ nguyên)...' },
    {
      key: 'role', label: 'Vai trò', type: 'select',
      options: roles.length > 0 ? roles.map(r => ({ value: r.name, label: r.displayName })) : [
        { value: 'admin', label: 'Quản trị viên' },
        { value: 'staff', label: 'Nhân viên' }
      ]
    },
    {
      key: 'status', label: 'Trạng thái', type: 'select',
      options: [{ value: 'active', label: 'Hoạt động' }, { value: 'inactive', label: 'Ngừng kích hoạt' }]
    },
  ];

  return (
    <CrudPage
      title="Quản lý người dùng"
      icon={FiUsers}
      data={data}
      setData={setData}
      onFetch={usersApi.getAll}
      onCreate={usersApi.create}
      onUpdate={usersApi.update}
      onDelete={usersApi.delete}
      columns={columns}
      searchFields={['username', 'fullName', 'email', 'phone']}
      formFields={formFields}
      getNewItem={() => ({ fullName: '', email: '', phone: '', password: '', role: 'staff', status: 'active' })}
      itemLabel="người dùng"
    />
  );
}
