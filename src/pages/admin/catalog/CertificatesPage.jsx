import { useState } from 'react';
import { FiAward } from 'react-icons/fi';
import CrudPage from '../../../components/CrudPage';
import { certificatesApi } from '../../../services/api';
import { formatCurrency } from '../../../utils/helpers';

export default function CertificatesPage() {
  const [data, setData] = useState([]); // Will just be fallback

  const columns = [
    { key: 'code', label: 'Mã', render: item => <code style={{ color: 'var(--primary-400)' }}>{item.code}</code> },
    { key: 'name', label: 'Tên chứng chỉ', render: item => <strong>{item.name}</strong> },
    { key: 'description', label: 'Mô tả', style: { color: 'var(--text-secondary)', maxWidth: 250 } },
    { key: 'fee', label: 'Lệ phí', render: item => <span style={{ color: 'var(--warning-400)', fontWeight: 600 }}>{formatCurrency(item.fee)}</span> },
    { key: 'status', label: 'Trạng thái', render: item => <span className={`badge ${item.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>{item.status === 'active' ? 'Hoạt động' : 'Ngừng'}</span> },
  ];

  const formFields = [
    { key: 'code', label: 'Mã chứng chỉ', required: true },
    { key: 'name', label: 'Tên chứng chỉ', required: true },
    { key: 'description', label: 'Mô tả', type: 'textarea' },
    { key: 'fee', label: 'Lệ phí (VNĐ)', type: 'number' },
    { key: 'status', label: 'Trạng thái', type: 'select', options: [{ value: 'active', label: 'Hoạt động' }, { value: 'inactive', label: 'Ngừng' }] },
  ];

  return (
    <CrudPage 
      title="Quản lý chứng chỉ" 
      icon={FiAward} 
      data={data} 
      setData={setData} 
      onFetch={certificatesApi.getAll}
      onCreate={certificatesApi.create}
      onUpdate={certificatesApi.update}
      onDelete={certificatesApi.delete}
      columns={columns} 
      searchFields={['code', 'name', 'description']} 
      formFields={formFields} 
      getNewItem={() => ({ code: '', name: '', description: '', fee: 0, status: 'active' })} 
      itemLabel="chứng chỉ" 
    />
  );
}
