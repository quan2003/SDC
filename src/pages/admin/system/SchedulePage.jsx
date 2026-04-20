import { useState } from 'react';
import { FiCalendar } from 'react-icons/fi';
import CrudPage from '../../../components/CrudPage';
import { scheduleApi } from '../../../services/api';
import { dayOfWeekVi } from '../../../utils/helpers';

export default function SchedulePage() {
  const [data, setData] = useState([]);

  const columns = [
    { key: 'className', label: 'Lớp', render: item => <strong>{item.className}</strong> },
    { key: 'subjectName', label: 'Môn học' },
    { key: 'roomName', label: 'Phòng', render: item => <span className="badge badge-info">{item.roomName}</span> },
    { key: 'instructor', label: 'Giảng viên', style: { color: 'var(--text-secondary)' } },
    { key: 'dayOfWeek', label: 'Thứ', render: item => dayOfWeekVi(item.dayOfWeek) },
    { key: 'startTime', label: 'Giờ học', render: item => `${item.startTime} - ${item.endTime}` },
  ];

  const formFields = [
    { key: 'className', label: 'Tên lớp', required: true },
    { key: 'subjectName', label: 'Môn học', required: true },
    { key: 'roomName', label: 'Phòng học', required: true },
    { key: 'instructor', label: 'Giảng viên' },
    { key: 'dayOfWeek', label: 'Thứ', type: 'select', options: [2,3,4,5,6,7,1].map(d => ({ value: d, label: dayOfWeekVi(d) })) },
    { key: 'startTime', label: 'Giờ bắt đầu', type: 'time' },
    { key: 'endTime', label: 'Giờ kết thúc', type: 'time' },
    { key: 'startDate', label: 'Từ ngày', type: 'date' },
    { key: 'endDate', label: 'Đến ngày', type: 'date' },
  ];

  return (
    <CrudPage 
      title="Quản lý thời khóa biểu" 
      icon={FiCalendar} 
      data={data} 
      setData={setData} 
      onFetch={scheduleApi.getAll}
      onCreate={scheduleApi.create}
      onUpdate={scheduleApi.update}
      onDelete={scheduleApi.delete}
      columns={columns} 
      searchFields={['className', 'subjectName', 'instructor', 'roomName']} 
      formFields={formFields} 
      getNewItem={() => ({ className: '', subjectName: '', roomName: '', instructor: '', dayOfWeek: 2, startTime: '07:30', endTime: '09:30', startDate: '', endDate: '' })} 
      itemLabel="lịch học" 
    />
  );
}
