import { useState, useEffect, useMemo } from 'react';
import { FiBookOpen } from 'react-icons/fi';
import CrudPage from '../../../components/CrudPage';
import { subjectsApi, certificatesApi } from '../../../services/api';
import { formatCurrency } from '../../../utils/helpers';

export default function SubjectsPage() {
  const [certs, setCerts] = useState([]);

  useEffect(() => {
    certificatesApi.getAll().then(res => setCerts(res || []));
  }, []);

  const columns = useMemo(() => [
    { key: 'code', label: 'Mã', render: item => <code style={{ color: 'var(--primary-400)' }}>{item.code}</code> },
    { key: 'name', label: 'Tên môn học', render: item => <strong>{item.name}</strong> },
    { key: 'credits', label: 'Số tiết', style: { textAlign: 'center' } },
    { key: 'tuition', label: 'Học phí', render: item => <span style={{ color: 'var(--success-400)', fontWeight: 600 }}>{formatCurrency(item.tuition || 0)}</span> },
    { key: 'certificate_id', label: 'Chứng chỉ', render: item => {
      const cert = certs.find(c => String(c.id) === String(item.certificate_id));
      return <span className="badge badge-info">{cert?.name || '-'}</span>;
    }},
    { key: 'status', label: 'Trạng thái', render: item => <span className={`badge ${item.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>{item.status === 'active' ? 'Hoạt động' : 'Ngừng'}</span> },
  ], [certs]);

  const formFields = useMemo(() => [
    { key: 'code', label: 'Mã môn học', required: true },
    { key: 'name', label: 'Tên môn học', required: true },
    { key: 'credits', label: 'Số tiết', type: 'number' },
    { key: 'tuition', label: 'Học phí tham chiếu (VNĐ)', type: 'number', help: 'Lưu ý: Học phí này sẽ được dùng khi đăng ký học online.' },
    { key: 'certificate_id', label: 'Thuộc chứng chỉ', type: 'select', options: certs.map(c => ({ value: c.id, label: c.name })) },
    { key: 'status', label: 'Trạng thái', type: 'select', options: [{ value: 'active', label: 'Hoạt động' }, { value: 'inactive', label: 'Ngừng' }] },
  ], [certs]);

  return (
    <CrudPage 
      title="Quản lý môn học" 
      icon={FiBookOpen} 
      onFetch={subjectsApi.getAll}
      onCreate={subjectsApi.create}
      onUpdate={subjectsApi.update}
      onDelete={subjectsApi.delete}
      columns={columns} 
      searchFields={['code', 'name']} 
      formFields={formFields} 
      getNewItem={() => ({ code: '', name: '', credits: 0, tuition: 0, certificate_id: '', status: 'active' })} 
      itemLabel="môn học" 
    />
  );
}
