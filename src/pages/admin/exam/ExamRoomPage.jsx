import { useState, useEffect } from 'react';
import { FiMap } from 'react-icons/fi';
import CrudPage from '../../../components/CrudPage';
import { examRoomsApi, examSessionsApi } from '../../../services/api';
import DateInput from '../../../components/DateInput';

export default function ExamRoomPage() {
  const [data, setData] = useState([]);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    examSessionsApi.getAll().then(s => setSessions(s || []));
  }, []);

  const handleToggleVisible = async (item) => {
    try {
      const info = parseSupervisor(item.supervisor);
      const newVisible = !(info.visible !== false); // default visible = true
      const newSupervisor = JSON.stringify({ ...info, visible: newVisible });
      await examRoomsApi.update(item.id, { supervisor: newSupervisor });
      setData(prev => prev.map(r => r.id === item.id
        ? { ...r, supervisor: newSupervisor }
        : r
      ));
    } catch (e) {
      console.error(e);
    }
  };

  const parseSupervisor = (supervisor) => {
    try {
       return JSON.parse(supervisor || '{}');
    } catch {
       return { roomName: 'Chưa cấu hình', capacity: 0 };
    }
  };

  const columns = [
    { 
      key: 'session_id', 
      label: 'Đợt thi', 
      render: item => sessions.find(s => s.id === Number(item.session_id))?.name || item.session_id 
    },
    { 
      key: 'supervisor',
      label: 'Phòng thi & Sức chứa', 
      render: item => {
        const info = parseSupervisor(item.supervisor);
        return (
          <div>
            <div style={{ fontWeight: 600 }}>{info.roomName || 'N/A'}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Sức chứa: {info.capacity || 0} HV</div>
          </div>
        );
      }
    },
    { key: 'shift', label: 'Giờ thi (Ca thi)' },
    { 
      key: 'exam_date', 
      label: 'Ngày thi',
      render: item => {
        if (!item.exam_date) return '';
        const [yyyy, mm, dd] = item.exam_date.split('-');
        return `${dd}/${mm}/${yyyy}`;
      }
    },
    {
      key: 'visible',
      label: 'Hiển thị client',
      render: item => {
        const info = parseSupervisor(item.supervisor);
        const isVisible = info.visible !== false;
        return (
          <button
            onClick={() => handleToggleVisible(item)}
            style={{
              padding: '4px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.78rem',
              background: isVisible ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.12)',
              color: isVisible ? 'var(--success-600)' : 'var(--danger-500)'
            }}
            title={isVisible ? 'Đang hiển thị với thí sinh — Nhấn để ẩn' : 'Đang ẩn với thí sinh — Nhấn để hiển thị'}
          >
            {isVisible ? '✅ Hiển thị' : '🔴 Đã ẩn'}
          </button>
        );
      }
    },
  ];

  const renderForm = (formData, setFormData, editItem) => {
    // Tự động phân tách dữ liệu khi click "Edit"
    if (editItem && !formData._extracted) {
      const info = parseSupervisor(formData.supervisor);
      const shiftParts = formData.shift ? formData.shift.split(' - ') : ['', ''];
      
      setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          roomName: info.roomName || '',
          capacity: info.capacity || 40,
          start_time: shiftParts[0] ? shiftParts[0].trim() : '',
          end_time: shiftParts[1] ? shiftParts[1].trim() : '',
          _extracted: true
        }));
      }, 0);
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="form-group">
          <label className="form-label">Đợt thi <span className="required">*</span></label>
          <select 
            className="form-select" 
            value={formData.session_id || ''} 
            onChange={e => setFormData(prev => ({ ...prev, session_id: e.target.value }))}
          >
            <option value="">-- Chọn đợt thi --</option>
            {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Tên phòng thi <span className="required">*</span></label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="VD: Phòng máy 1"
              value={formData.roomName || ''} 
              onChange={e => setFormData(prev => ({ ...prev, roomName: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Sức chứa <span className="required">*</span></label>
            <input 
              type="number" 
              className="form-input" 
              placeholder="VD: 40"
              value={formData.capacity || ''} 
              onChange={e => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Giờ bắt đầu <span className="required">*</span></label>
            <input 
              type="time" 
              className="form-input" 
              value={formData.start_time || ''} 
              onChange={e => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Giờ kết thúc <span className="required">*</span></label>
            <input 
              type="time" 
              className="form-input" 
              value={formData.end_time || ''} 
              onChange={e => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Ngày thi</label>
          <DateInput 
            className="form-input" 
            value={formData.exam_date || ''} 
            onChange={val => setFormData(prev => ({ ...prev, exam_date: val }))}
          />
        </div>
      </div>
    );
  };

  const wrapPayload = (formData) => {
    return {
      session_id: formData.session_id,
      exam_date: formData.exam_date,
      shift: [formData.start_time, formData.end_time].filter(x => x).join(' - '),
      supervisor: JSON.stringify({ roomName: formData.roomName, capacity: Number(formData.capacity), visible: formData.visible !== false })
    };
  };

  const handleCreate = async (formData) => {
    return await examRoomsApi.create(wrapPayload(formData));
  };

  const handleUpdate = async (id, formData) => {
    if (Object.keys(formData).length === 1 && formData.status) {
       return await examRoomsApi.update(id, formData);
    }
    return await examRoomsApi.update(id, wrapPayload(formData));
  };

  return (
    <CrudPage
      title="Cấu hình Phòng/Giờ thi (Đăng ký)"
      icon={FiMap}
      data={data} setData={setData}
      onFetch={examRoomsApi.getAll}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onDelete={examRoomsApi.delete}
      renderForm={renderForm}
      columns={columns}
      searchFields={['shift']}
      getNewItem={() => ({ session_id: sessions[0]?.id || '', roomName: '', capacity: 40, start_time: '', end_time: '', exam_date: '', _extracted: true })}
      itemLabel="cấu hình"
    />
  );
}
