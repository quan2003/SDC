import { useState, useEffect, useMemo } from 'react';
import { FiLayers } from 'react-icons/fi';
import CrudPage from '../../../components/CrudPage';
import { formatDate, formatCurrency } from '../../../utils/helpers';
import { certificateClassesApi, certificatesApi } from '../../../services/api';

export default function CertificateClassesPage() {
  const [certs, setCerts] = useState([]);

  useEffect(() => {
    certificatesApi.getAll().then(res => setCerts(res || []));
  }, []);

  const columns = useMemo(() => [
    { key: 'code', label: 'Mã lớp', render: item => <code style={{ color: 'var(--primary-400)' }}>{item.code}</code> },
    { key: 'name', label: 'Tên lớp', render: item => <strong>{item.name}</strong> },
    { key: 'certificateId', label: 'Chứng chỉ', render: item => {
      const cert = certs.find(c => c.id === item.certificateId);
      return <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{cert?.code || '-'}</span>;
    }},
    { key: 'startDate', label: 'Ngày KG', render: item => formatDate(item.startDate) },
    { key: 'currentStudents', label: 'Sỉ số', render: item => (
      <span style={{ fontWeight: 600 }}>
        <span style={{ color: item.currentStudents >= item.maxStudents ? 'var(--danger-400)' : 'var(--success-400)' }}>{item.currentStudents}</span>
        <span style={{ color: 'var(--text-tertiary)' }}>/{item.maxStudents}</span>
      </span>
    )},
    { key: 'fee', label: 'Học phí', render: item => <span style={{ color: 'var(--warning-400)' }}>{formatCurrency(item.fee)}</span> },
    { key: 'status', label: 'Trạng thái', render: item => {
      const statusMap = { active: ['Đang học', 'badge-active'], upcoming: ['Sắp KG', 'badge-pending'], completed: ['Hoàn thành', 'badge-info'] };
      const [label, cls] = statusMap[item.status] || ['', 'badge-info'];
      return <span className={`badge ${cls}`}>{label}</span>;
    }},
  ], [certs]);

  const formFields = useMemo(() => [
    { key: 'code', label: 'Mã lớp', required: true },
    { key: 'name', label: 'Tên lớp', required: true },
    { key: 'certificateId', label: 'Chứng chỉ', type: 'select', options: certs.map(c => ({ value: c.id, label: c.name })) },
    { key: 'startDate', label: 'Ngày khai giảng', type: 'date' },
    { key: 'endDate', label: 'Ngày kết thúc', type: 'date' },
    { key: 'maxStudents', label: 'Sỉ số tối đa', type: 'number' },
    { key: 'fee', label: 'Học phí', type: 'number' },
    { key: 'status', label: 'Trạng thái', type: 'select', options: [{ value: 'active', label: 'Đang học' }, { value: 'upcoming', label: 'Sắp khai giảng' }, { value: 'completed', label: 'Hoàn thành' }] },
  ], [certs]);

  return (
    <CrudPage 
      title="Quản lý lớp chứng chỉ" 
      icon={FiLayers} 
      onFetch={certificateClassesApi.getAll}
      onCreate={certificateClassesApi.create}
      onUpdate={certificateClassesApi.update}
      onDelete={certificateClassesApi.delete}
      columns={columns} 
      searchFields={['code', 'name']} 
      formFields={formFields} 
      getNewItem={() => ({ code: '', name: '', certificateId: '', startDate: '', endDate: '', maxStudents: 40, currentStudents: 0, fee: 0, status: 'upcoming' })} 
      itemLabel="lớp" 
    />
  );
}
