import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiActivity, FiUsers, FiPlusCircle, FiX, FiCheck, FiSearch } from 'react-icons/fi';
import { useToast } from '../../../contexts/ToastContext';
import CrudPage from '../../../components/CrudPage';
import { formatDate, formatCurrency } from '../../../utils/helpers';
import { certificateClassesApi, registrationsApi } from '../../../services/api';

// SpecializedClassesPage (Lớp chuyên đề) mangaging classes WITHOUT certificate_id
const toDbPayload = (formData) => ({
  code: formData.code,
  name: formData.name,
  certificate_id: null, // Always null for specialized classes
  start_date: formData.start_date || formData.startDate || null,
  end_date: formData.end_date || formData.endDate || null,
  max_students: formData.max_students || formData.maxStudents || 40,
  current_students: formData.current_students || formData.currentStudents || 0,
  fee: formData.fee || 0,
  status: formData.status || 'upcoming',
});

export default function SpecializedClassesPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [assignModal, setAssignModal] = useState(null);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const columns = useMemo(() => [
    { key: 'code', label: 'Mã lớp', render: item => <code style={{ color: 'var(--primary-400)' }}>{item.code}</code> },
    { key: 'name', label: 'Tên chuyên đề', render: item => <strong>{item.name}</strong> },
    { key: 'start_date', label: 'Ngày KG', render: item => formatDate(item.start_date || item.startDate) },
    { key: 'current_students', label: 'Sỉ số', render: item => {
      const cur = item.current_students ?? item.currentStudents ?? 0;
      const max = item.max_students ?? item.maxStudents ?? 0;
      return (
        <span style={{ fontWeight: 600 }}>
          <span style={{ color: cur >= max ? 'var(--danger-400)' : 'var(--success-400)' }}>{cur}</span>
          <span style={{ color: 'var(--text-tertiary)' }}>/{max}</span>
        </span>
      );
    }},
    { key: 'fee', label: 'Học phí', render: item => <span style={{ color: 'var(--warning-400)' }}>{formatCurrency(item.fee)}</span> },
    { key: 'status', label: 'Trạng thái', render: item => {
      const statusMap = { active: ['Đang học', 'badge-active'], upcoming: ['Sắp KG', 'badge-pending'], completed: ['Hoàn thành', 'badge-info'] };
      const [label, cls] = statusMap[item.status] || ['', 'badge-info'];
      return <span className={`badge ${cls}`}>{label}</span>;
    }},
    { key: 'students', label: 'Học viên', render: item => (
      <button 
        className="btn btn-ghost btn-sm" 
        onClick={() => navigate(`/admin/class-students/${item.id}`)}
        style={{ color: 'var(--primary-600)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
      >
        <FiUsers size={14} /> Danh sách
      </button>
    )},
  ], [navigate]);

  const formFields = useMemo(() => [
    { key: 'code', label: 'Mã lớp', required: true },
    { key: 'name', label: 'Tên chuyên đề', required: true },
    { key: 'start_date', label: 'Ngày khai giảng', type: 'date' },
    { key: 'end_date', label: 'Ngày kết thúc', type: 'date' },
    { key: 'max_students', label: 'Sỉ số tối đa', type: 'number' },
    { key: 'fee', label: 'Học phí', type: 'number' },
    { key: 'status', label: 'Trạng thái', type: 'select', options: [
      { value: 'active', label: 'Đang học' },
      { value: 'upcoming', label: 'Sắp khai giảng' },
      { value: 'completed', label: 'Hoàn thành' }
    ]},
  ], []);

  const fetchSpecialized = async () => {
    const all = await certificateClassesApi.getAll();
    // Filter out classes that have a certificate_id
    return (all || []).filter(c => !c.certificate_id && !c.certificateId);
  };

  const handleOpenAssign = async (cls) => {
    try {
      const allRegs = await registrationsApi.getAll();
      // Filter students who:
      // 1. Registered for a COURSE (not exam)
      // 2. Registered for a subject/course that is NOT a certificate
      // 3. Are not yet assigned to any class
      const filtered = (allRegs || []).filter(r => 
        (r.type === 'course' || r.type === 'course_registration') &&
        !r.certificateId && 
        !r.activityClassId && !r.classId
      );
      setPendingStudents(filtered);
      setAssignModal(cls);
      setSelectedStudents([]);
      setSearchTerm('');
    } catch (e) {
      toast.error('Lỗi', 'Không thể tải danh sách học viên');
    }
  };

  const handleBulkAssign = async () => {
    if (!assignModal || selectedStudents.length === 0) return;
    setIsProcessing(true);
    try {
      const classId = assignModal.id;
      for (const studentId of selectedStudents) {
        const student = pendingStudents.find(s => s.id === studentId);
        await registrationsApi.update(studentId, {
          ...student,
          classId: classId,
          activityClassId: classId,
          status: 'approved'
        });
      }

      // Update class count
      const newCount = (assignModal.current_students || assignModal.currentStudents || 0) + selectedStudents.length;
      await certificateClassesApi.update(assignModal.id, { current_students: newCount });

      toast.success('Thành công', `Đã thêm ${selectedStudents.length} học viên vào lớp ${assignModal.name}`);
      setAssignModal(null);
      setRefreshKey(prev => prev + 1);
    } catch (e) {
      toast.error('Lỗi', 'Có lỗi xảy ra khi xếp lớp');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredPending = useMemo(() => {
    if (!searchTerm) return pendingStudents;
    const s = searchTerm.toLowerCase();
    return pendingStudents.filter(p => 
      p.fullName?.toLowerCase().includes(s) || 
      p.phone?.includes(s) || 
      p.cccd?.includes(s)
    );
  }, [pendingStudents, searchTerm]);

  return (
    <>
    <CrudPage
      key={refreshKey}
      title="Quản lý lớp chuyên đề"
      icon={FiActivity}
      onFetch={fetchSpecialized}
      onCreate={(formData) => certificateClassesApi.create(toDbPayload(formData))}
      onUpdate={(id, formData) => certificateClassesApi.update(id, toDbPayload(formData))}
      onDelete={certificateClassesApi.delete}
      columns={columns}
      searchFields={['code', 'name']}
      formFields={formFields}
      getNewItem={() => ({ code: '', name: '', start_date: '', end_date: '', max_students: 40, current_students: 0, fee: 0, status: 'upcoming' })}
      itemLabel="lớp chuyên đề"
      extraActions={(item) => (
        <button 
            className="btn btn-ghost btn-icon-sm" 
            title="Xếp học viên nhanh" 
            onClick={() => handleOpenAssign(item)}
            style={{ color: 'var(--accent-500)' }}
        >
            <FiPlusCircle size={14} />
        </button>
      )}
    />

    {/* Quick Assign Modal */}
    {assignModal && (
        <div className="modal-overlay" onClick={() => setAssignModal(null)}>
            <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 700 }}>
                <div className="modal-header">
                    <h3 className="modal-title">Xếp học viên vào lớp chuyên đề: {assignModal.name}</h3>
                    <button className="modal-close" onClick={() => setAssignModal(null)}><FiX /></button>
                </div>
                <div className="modal-body">
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <p style={{ margin: 0 }}>Danh sách đăng ký <b>Học môn lẻ / Chuyên đề</b> chưa có lớp:</p>
                            <div className="search-bar" style={{ width: 250, margin: 0 }}>
                                <FiSearch className="search-icon" />
                                <input className="form-input" placeholder="Tìm tên, SĐT..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: 36, height: 32, fontSize: '0.85rem' }} />
                            </div>
                        </div>
                        
                        <div style={{ maxHeight: 350, overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 8 }}>
                            <table className="data-table" style={{ fontSize: '0.85rem' }}>
                                <thead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: 'var(--bg-card)' }}>
                                    <tr>
                                        <th style={{ width: 40 }}>
                                            <input 
                                                type="checkbox" 
                                                checked={selectedStudents.length === filteredPending.length && filteredPending.length > 0} 
                                                onChange={() => {
                                                    if (selectedStudents.length === filteredPending.length) setSelectedStudents([]);
                                                    else setSelectedStudents(filteredPending.map(p => p.id));
                                                }}
                                            />
                                        </th>
                                        <th>Học viên</th>
                                        <th>Môn học đăng ký</th>
                                        <th>SĐT</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPending.length === 0 ? (
                                        <tr><td colSpan={4} style={{ textAlign: 'center', padding: 20 }}>Không có học viên chuyên đề nào đang chờ xếp lớp.</td></tr>
                                    ) : (
                                        filteredPending.map(p => (
                                            <tr key={p.id}>
                                                <td>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={selectedStudents.includes(p.id)} 
                                                        onChange={() => {
                                                            setSelectedStudents(prev => 
                                                                prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id]
                                                            );
                                                        }}
                                                    />
                                                </td>
                                                <td><strong>{p.fullName}</strong></td>
                                                <td>{p.certificateName}</td>
                                                <td>{p.phone}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <div style={{ flex: 1, fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                        Đã chọn: <strong style={{ color: 'var(--primary-600)' }}>{selectedStudents.length}</strong> học viên
                    </div>
                    <button className="btn btn-ghost" onClick={() => setAssignModal(null)}>Đóng</button>
                    <button 
                        className="btn btn-primary" 
                        disabled={selectedStudents.length === 0 || isProcessing}
                        onClick={handleBulkAssign}
                    >
                        {isProcessing ? 'Đang xử lý...' : <><FiCheck /> Xếp vào lớp</>}
                    </button>
                </div>
            </div>
        </div>
    )}
    </>
  );
}
