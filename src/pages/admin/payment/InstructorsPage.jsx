import { FiUsers } from 'react-icons/fi';
import CrudPage from '../../../components/CrudPage';
import { instructorsApi } from '../../../services/api';

export default function InstructorsPage() {
  const columns = [
    { key: 'code', label: 'Mã GV', render: item => <code style={{ color: 'var(--primary-400)', fontWeight: 600 }}>{item.code}</code> },
    { key: 'fullName', label: 'Họ và tên', render: item => <strong>{item.fullName}</strong> },
    { key: 'specialization', label: 'Chuyên môn', style: { color: 'var(--text-secondary)' } },
    { key: 'phone', label: 'Điện thoại' },
    { key: 'email', label: 'Email', style: { color: 'var(--text-secondary)', fontSize: '0.85rem' } },
    {
      key: 'status', label: 'Trạng thái', render: item =>
        <span className={`badge ${item.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
          {item.status === 'active' ? 'Đang giảng dạy' : 'Ngừng hoạt động'}
        </span>
    },
  ];

  const formFields = [
    { key: 'code', label: 'Mã giảng viên', required: true, placeholder: 'VD: GV001' },
    { key: 'fullName', label: 'Họ và tên', required: true, placeholder: 'VD: ThS. Nguyễn Văn A' },
    { key: 'specialization', label: 'Chuyên môn', placeholder: 'VD: Tin học, Ngoại ngữ...' },
    { key: 'phone', label: 'Số điện thoại', type: 'tel', placeholder: '0901234567' },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'gv@sdc.edu.vn' },
    {
      key: 'status', label: 'Trạng thái', type: 'select', options: [
        { value: 'active', label: 'Đang giảng dạy' },
        { value: 'inactive', label: 'Ngừng hoạt động' },
      ]
    },
  ];

  return (
    <CrudPage
      title="Quản lý giảng viên"
      icon={FiUsers}
      columns={columns}
      searchFields={['code', 'fullName', 'specialization', 'phone', 'email']}
      formFields={formFields}
      onFetch={instructorsApi.getAll}
      onCreate={instructorsApi.create}
      onUpdate={instructorsApi.update}
      onDelete={instructorsApi.delete}
      getNewItem={() => ({ code: '', fullName: '', specialization: '', phone: '', email: '', status: 'active' })}
      itemLabel="giảng viên"
    />
  );
}
