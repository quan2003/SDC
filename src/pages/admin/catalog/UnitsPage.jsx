import { useState } from 'react';
import { FiBriefcase } from 'react-icons/fi';
import CrudPage from '../../../components/CrudPage';
import { unitsApi } from '../../../services/api';

export default function UnitsPage() {
  const [data, setData] = useState([]);

  const columns = [
    { key: 'code', label: 'Mã đơn vị', render: item => <code style={{ color: 'var(--primary-400)' }}>{item.code}</code> },
    { key: 'name', label: 'Tên đơn vị', render: item => <strong>{item.name}</strong> },
    { key: 'status', label: 'Trạng thái', render: item => <span className={`badge ${item.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>{item.status === 'active' ? 'Hoạt động' : 'Ngừng'}</span> },
  ];

  const formFields = [
    { key: 'code', label: 'Mã đơn vị', required: true },
    { key: 'name', label: 'Tên đơn vị', required: true },
    { key: 'status', label: 'Trạng thái', type: 'select', options: [{ value: 'active', label: 'Hoạt động' }, { value: 'inactive', label: 'Ngừng' }] },
  ];

  return (
    <CrudPage 
      title="Quản lý đơn vị" 
      icon={FiBriefcase} 
      data={data} 
      setData={setData} 
      onFetch={unitsApi.getAll}
      onCreate={unitsApi.create}
      onUpdate={unitsApi.update}
      onDelete={unitsApi.delete}
      columns={columns} 
      searchFields={['code', 'name']} 
      formFields={formFields} 
      getNewItem={() => ({ code: '', name: '', status: 'active' })} 
      itemLabel="đơn vị" 
    />
  );
}
