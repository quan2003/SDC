import { useState } from 'react';
import { FiDollarSign, FiInfo } from 'react-icons/fi';
import CrudPage from '../../../components/CrudPage';
import { createCrudApi } from '../../../services/api';
import { USE_MOCK } from '../../../services/supabaseClient';
import { formatCurrency } from '../../../utils/helpers';

const mockRates = [
  { id: 1, type: 'Lý thuyết', level: 'Giảng viên', unit: 'tiết', rate: 100000, notes: 'Áp dụng cho giờ lý thuyết thông thường', status: 'active' },
  { id: 2, type: 'Thực hành', level: 'Giảng viên', unit: 'tiết', rate: 120000, notes: 'Áp dụng cho giờ thực hành máy tính', status: 'active' },
  { id: 3, type: 'Lý thuyết', level: 'Giảng viên ngoài', unit: 'tiết', rate: 130000, notes: 'Giảng viên mời từ đơn vị khác', status: 'active' },
  { id: 4, type: 'Chấm thi', level: 'Tất cả', unit: 'bài', rate: 15000, notes: 'Chấm thi chứng chỉ', status: 'active' },
  { id: 5, type: 'Coi thi', level: 'Tất cả', unit: 'buổi', rate: 150000, notes: 'Coi thi theo buổi', status: 'active' },
];

const ratesApi = USE_MOCK ? {
  getAll: async () => mockRates,
  create: async (p) => ({ ...p, id: Date.now() }),
  update: async (id, p) => ({ id, ...p }),
  delete: async () => true,
} : createCrudApi('payment_rates');

export default function PaymentRatesPage() {
  const columns = [
    { key: 'type', label: 'Loại công việc', render: item => <strong>{item.type}</strong> },
    { key: 'level', label: 'Đối tượng', style: { color: 'var(--text-secondary)' } },
    { key: 'unit', label: 'Đơn vị tính', render: item => <span style={{ color: 'var(--accent-400)' }}>{item.unit}</span> },
    {
      key: 'rate', label: 'Mức thanh toán', render: item =>
        <span style={{ fontWeight: 700, color: 'var(--success-500)' }}>{formatCurrency(item.rate)}</span>
    },
    { key: 'notes', label: 'Ghi chú', style: { color: 'var(--text-tertiary)', fontSize: '0.85rem' } },
    {
      key: 'status', label: 'Trạng thái', render: item =>
        <span className={`badge ${item.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
          {item.status === 'active' ? 'Đang áp dụng' : 'Ngừng áp dụng'}
        </span>
    },
  ];

  const formFields = [
    { key: 'type', label: 'Loại công việc', required: true, placeholder: 'VD: Lý thuyết, Thực hành, Coi thi...' },
    {
      key: 'level', label: 'Đối tượng', type: 'select', options: [
        { value: 'Giảng viên', label: 'Giảng viên cơ hữu' },
        { value: 'Giảng viên ngoài', label: 'Giảng viên thỉnh giảng' },
        { value: 'Tất cả', label: 'Tất cả' },
      ]
    },
    { key: 'unit', label: 'Đơn vị tính', placeholder: 'VD: tiết, buổi, bài...' },
    { key: 'rate', label: 'Mức thanh toán (VNĐ)', type: 'number', required: true, placeholder: '100000' },
    { key: 'notes', label: 'Ghi chú', type: 'textarea' },
    {
      key: 'status', label: 'Trạng thái', type: 'select', options: [
        { value: 'active', label: 'Đang áp dụng' },
        { value: 'inactive', label: 'Ngừng áp dụng' },
      ]
    },
  ];

  return (
    <CrudPage
      title="Thiết lập mức thanh toán"
      icon={FiDollarSign}
      columns={columns}
      searchFields={['type', 'level', 'unit', 'notes']}
      formFields={formFields}
      onFetch={ratesApi.getAll}
      onCreate={ratesApi.create}
      onUpdate={ratesApi.update}
      onDelete={ratesApi.delete}
      getNewItem={() => ({ type: '', level: 'Giảng viên', unit: 'tiết', rate: 100000, notes: '', status: 'active' })}
      itemLabel="mức thanh toán"
      renderExtraToolbar={() => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'rgba(59,130,246,0.08)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', color: 'var(--primary-400)' }}>
          <FiInfo size={14} /> Mức thanh toán sẽ dùng khi tính hợp đồng giảng viên
        </div>
      )}
    />
  );
}
