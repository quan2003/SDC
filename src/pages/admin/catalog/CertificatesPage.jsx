import { useState } from 'react';
import { FiAward } from 'react-icons/fi';
import CrudPage from '../../../components/CrudPage';
import { certificatesApi } from '../../../services/api';
import { formatCurrency } from '../../../utils/helpers';

export default function CertificatesPage() {
  const [data, setData] = useState([]);

  const columns = [
    { key: 'code', label: 'Mã', render: item => <code style={{ color: 'var(--primary-400)', fontWeight: 600 }}>{item.code}</code> },
    { key: 'name', label: 'Tên chứng chỉ', render: item => <strong>{item.name}</strong> },
    {
      key: 'fees',
      label: 'Lệ phí thi',
      render: item => {
        const isAdvanced = (item.name || '').toLowerCase().includes('nâng cao');
        if (isAdvanced) {
          // Đọc giá mô đun từ admin settings
          let modFee = 250000;
          try {
            const s = localStorage.getItem('sdc_settings_payment');
            if (s) modFee = Number(JSON.parse(s).advancedModuleFee) || 250000;
          } catch {}
          return (
            <div style={{ fontSize: '0.8rem', lineHeight: 1.6 }}>
              <div style={{ color: 'var(--primary-400)', fontWeight: 600, marginBottom: 2 }}>
                Tính theo mô đun
              </div>
              <div>• Word: <span style={{ color: 'var(--primary-600)', fontWeight: 600 }}>{formatCurrency(modFee)}</span></div>
              <div>• Excel: <span style={{ color: 'var(--primary-600)', fontWeight: 600 }}>{formatCurrency(modFee)}</span></div>
              <div>• PowerPoint: <span style={{ color: 'var(--primary-600)', fontWeight: 600 }}>{formatCurrency(modFee)}</span></div>
              <div style={{ marginTop: 4, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                *(Cấu hình tại Thiết lập → Thanh toán)
              </div>
            </div>
          );
        }
        return (
          <div style={{ fontSize: '0.8rem', lineHeight: 1.4 }}>
            <div>• Thành viên ĐHĐN: <span style={{ color: 'var(--success-600)', fontWeight: 600 }}>{formatCurrency(item.fee_ud)}</span></div>
            <div>• Ngoài ĐHĐN (SV): <span style={{ color: 'var(--primary-600)', fontWeight: 600 }}>{formatCurrency(item.fee_outside)}</span></div>
            <div>• Thí sinh tự do: <span style={{ color: 'var(--warning-600)', fontWeight: 600 }}>{formatCurrency(item.fee_freelance)}</span></div>
          </div>
        );
      }
    },
    { key: 'status', label: 'Trạng thái', render: item => <span className={`badge ${item.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>{item.status === 'active' ? 'Hoạt động' : 'Ngừng'}</span> },
  ];


  const formFields = [
    { key: 'code', label: 'Mã chứng chỉ', required: true, placeholder: 'VD: CNTTCB' },
    { key: 'name', label: 'Tên chứng chỉ', required: true, placeholder: 'VD: CNTT Cơ bản' },
    { key: 'description', label: 'Mô tả', type: 'textarea' },
    { key: 'fee_ud', label: 'Lệ phí: Thành viên ĐHĐN (VNĐ)', type: 'number', placeholder: 'VD: 300000' },
    { key: 'fee_outside', label: 'Lệ phí: Ngoài ĐHĐN/SV (VNĐ)', type: 'number', placeholder: 'VD: 350000' },
    { key: 'fee_freelance', label: 'Lệ phí: Thí sinh tự do (VNĐ)', type: 'number', placeholder: 'VD: 450000' },
    { key: 'status', label: 'Trạng thái', type: 'select', options: [{ value: 'active', label: 'Hoạt động' }, { value: 'inactive', label: 'Ngừng' }] },
  ];

  return (
    <CrudPage 
      title="Quản lý chứng chỉ" 
      icon={FiAward} 
      onFetch={certificatesApi.getAll}
      onCreate={certificatesApi.create}
      onUpdate={certificatesApi.update}
      onDelete={certificatesApi.delete}
      columns={columns} 
      searchFields={['code', 'name', 'description']} 
      formFields={formFields} 
      getNewItem={() => ({ code: '', name: '', description: '', fee_ud: 0, fee_outside: 0, fee_freelance: 0, status: 'active' })} 
      itemLabel="chứng chỉ" 
    />
  );
}
