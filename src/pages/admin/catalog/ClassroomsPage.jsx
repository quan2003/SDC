import { useState } from 'react';
import { FiMap } from 'react-icons/fi';
import CrudPage from '../../../components/CrudPage';
import { classroomsApi } from '../../../services/api';

export default function ClassroomsPage() {
  const [data, setData] = useState([]);

  const columns = [
    { key: 'code', label: 'Mã phòng', render: item => <code style={{ color: 'var(--primary-400)' }}>{item.code}</code> },
    { key: 'name', label: 'Tên phòng', render: item => <strong>{item.name}</strong> },
    { key: 'building', label: 'Tòa nhà' },
    { key: 'capacity', label: 'Sức chứa', style: { textAlign: 'center' } },
    { key: 'type', label: 'Loại', render: item => {
      const types = { computer: 'Phòng máy', lecture: 'Phòng học', exam: 'Phòng thi' };
      return <span className="badge badge-info">{types[item.type] || item.type}</span>;
    }},
    { key: 'status', label: 'Trạng thái', render: item => <span className={`badge ${item.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>{item.status === 'active' ? 'Hoạt động' : 'Ngừng'}</span> },
  ];

  const formFields = [
    { key: 'code', label: 'Mã phòng', required: true },
    { key: 'name', label: 'Tên phòng', required: true },
    { key: 'building', label: 'Tòa nhà' },
    { key: 'capacity', label: 'Sức chứa', type: 'number' },
    { key: 'type', label: 'Loại phòng', type: 'select', options: [{ value: 'computer', label: 'Phòng máy' }, { value: 'lecture', label: 'Phòng học' }, { value: 'exam', label: 'Phòng thi' }] },
    { key: 'status', label: 'Trạng thái', type: 'select', options: [{ value: 'active', label: 'Hoạt động' }, { value: 'inactive', label: 'Ngừng' }] },
  ];

  return (
    <CrudPage 
      title="Quản lý phòng học" 
      icon={FiMap} 
      data={data} 
      setData={setData} 
      onFetch={classroomsApi.getAll}
      onCreate={classroomsApi.create}
      onUpdate={classroomsApi.update}
      onDelete={classroomsApi.delete}
      columns={columns} 
      searchFields={['code', 'name', 'building']} 
      formFields={formFields} 
      getNewItem={() => ({ code: '', name: '', building: '', capacity: 0, type: 'lecture', status: 'active' })} 
      itemLabel="phòng học" 
    />
  );
}
