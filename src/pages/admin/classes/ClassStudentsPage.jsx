import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiUsers, FiSearch, FiPlus, FiEdit2, FiTrash2, FiDownload, FiPrinter, FiDollarSign, FiUpload, FiX, FiCheck, FiMail, FiRepeat, FiChevronLeft, FiRefreshCw } from 'react-icons/fi';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { registrationsApi, certificateClassesApi, subjectsApi } from '../../../services/api';
import { filterBySearch, paginate, formatDate, formatCurrency, fileToBase64, exportToExcel } from '../../../utils/helpers';
import EmailModal from '../../../components/EmailModal';
import PageLoader from '../../../components/PageLoader';

export default function ClassStudentsPage() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isAdmin } = useAuth();
  
  const [students, setStudents] = useState([]);
  const [targetClass, setTargetClass] = useState(null);
  const [allClasses, setAllClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);
  const [emailModalData, setEmailModalData] = useState(null);
  const [moveModal, setMoveModal] = useState(null); 
  const [targetMvId, setTargetMvId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      registrationsApi.getAll(),
      certificateClassesApi.getAll(),
      subjectsApi.getAll()
    ]).then(([regs, clsArr, subArr]) => {
      // Find current class
      let foundClass = clsArr.find(c => String(c.id) === String(classId));
      if (!foundClass) {
          toast.error('Lỗi', 'Không tìm thấy thông tin lớp học');
          navigate(-1);
          return;
      }
      
      // Compute fallback fee from subject if class fee is 0
      if (!foundClass.fee || foundClass.fee === 0) {
        const subId = foundClass.subject_id || foundClass.subjectId || foundClass.certificate_id || foundClass.certificateId;
        const sub = subArr.find(s => String(s.id) === String(subId));
        if (sub) {
          foundClass = { ...foundClass, fee: sub.tuition };
        }
      }

      setTargetClass(foundClass);
      setAllClasses(clsArr || []);
      
      // Filter students for this class
      const classStudents = (regs || []).filter(r => 
        String(r.activityClassId) === String(classId) || 
        String(r.classId) === String(classId)
      );
      setStudents(classStudents);
    }).finally(() => setLoading(false));
  }, [classId]);

  const filtered = useMemo(() => filterBySearch(students, search, ['fullName', 'code', 'phone', 'email', 'school']), [students, search]);
  const paged = useMemo(() => paginate(filtered, currentPage, 15), [filtered, currentPage]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  const toggleAll = () => {
    if (selectedIds.length === paged.data.length && paged.data.length > 0) setSelectedIds([]);
    else setSelectedIds(paged.data.map(s => s.id));
  };

  const openAdd = () => {
    setEditItem(null);
    setFormData({ 
        fullName: '', dob: '', gender: 'Nam', phone: '', email: '', cccd: '', school: '', 
        classGroup: '', classId: classId, photo: '', 
        registrationDate: new Date().toISOString().split('T')[0], 
        tuitionPaid: false, feePaid: false, status: 'active',
        type: targetClass?.certificate_id ? 'certificate_registration' : 'course_registration'
    });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setFormData({ ...item });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editItem) {
        await registrationsApi.update(editItem.id, formData);
        setStudents(prev => prev.map(s => s.id === editItem.id ? { ...s, ...formData } : s));
        toast.success('Cập nhật thành công');
      } else {
        // Tự động tạo mã học viên theo định dạng MãLớp.STT
        const nextNumber = students.length + 1;
        const generatedCode = `${targetClass?.code || 'HV'}.${String(nextNumber).padStart(2, '0')}`;
        const payload = { ...formData, code: generatedCode };
        
        const res = await registrationsApi.create(payload);
        setStudents(prev => [...prev, { ...res, fullName: res.full_name, dob: formatDate(res.dob) }]);
        toast.success('Thêm học viên thành công', `Mã HV: ${generatedCode}`);
      }
      setModalOpen(false);
    } catch (e) {
      toast.error('Lỗi', 'Không thể lưu thông tin học viên');
    }
  };

  const handleDelete = async (id) => {
    try {
      await registrationsApi.delete(id);
      setStudents(prev => prev.filter(s => s.id !== id));
      toast.success('Đã xóa học viên');
    } catch (e) {
      toast.error('Lỗi', 'Không thể xóa học viên này');
    }
  };

  const handlePayTuition = async (item) => {
    try {
      await registrationsApi.update(item.id, { ...item, tuitionPaid: true });
      setStudents(prev => prev.map(s => s.id === item.id ? { ...s, tuitionPaid: true } : s));
      toast.success('Đã nộp học phí', item.fullName);
    } catch (e) {
      toast.error('Lỗi', 'Không thể cập nhật nộp học phí');
    }
  };

  const handleExportExcel = () => {
    if (filtered.length === 0) return toast.error('Không có dữ liệu', 'Danh sách hiện tại đang trống.');
    exportToExcel(filtered, `DanhBach_Lop_${targetClass?.code || 'HocVien'}`);
  };

  const handleConfirmMove = async () => {
    if (!moveModal || !targetMvId) return;
    try {
      // 1. Update registration in DB
      await registrationsApi.update(moveModal.id, { 
        ...moveModal, 
        classId: targetMvId, 
        activityClassId: targetMvId 
      });

      // 2. Decrement current_students in OLD class
      const oldClassCount = (targetClass.current_students || targetClass.currentStudents || 0) - 1;
      await certificateClassesApi.update(classId, { current_students: Math.max(0, oldClassCount) });

      // 3. Increment current_students in NEW class
      const targetCls = allClasses.find(c => String(c.id) === String(targetMvId));
      if (targetCls) {
          const newClassCount = (targetCls.current_students || targetCls.currentStudents || 0) + 1;
          await certificateClassesApi.update(targetMvId, { current_students: newClassCount });
      }

      setStudents(prev => prev.filter(s => s.id !== moveModal.id));
      toast.success('Chuyển lớp thành công');
      setMoveModal(null);
    } catch (e) {
      toast.error('Lỗi', e.message);
    }
  };

  const handleReorderCodes = async () => {
    if (!students.length) return;
    if (!window.confirm(`Bạn có chắc chắn muốn đánh lại toàn bộ Mã HV của ${students.length} học viên trong lớp này theo định dạng ${targetClass?.code}.xx?`)) return;
    
    setIsProcessing(true);
    setLoading(true);
    try {
        const classCode = targetClass?.code || 'HV';
        for (let i = 0; i < students.length; i++) {
            const student = students[i];
            const newCode = `${classCode}.${String(i + 1).padStart(2, '0')}`;
            await registrationsApi.update(student.id, { ...student, code: newCode });
        }
        // Reload data
        const res = await registrationsApi.getAll();
        const classStudents = (res || []).filter(r => 
            String(r.activityClassId) === String(classId) || 
            String(r.classId) === String(classId)
        );
        setStudents(classStudents);
        toast.success('Thành công', 'Đã chuẩn hóa toàn bộ Mã HV trong lớp');
    } catch (e) {
        toast.error('Lỗi', 'Không thể đánh lại mã học viên: ' + e.message);
    } finally {
        setLoading(false);
        setIsProcessing(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setFormData(prev => ({ ...prev, photo: base64 }));
    }
  };

  if (loading) return <PageLoader loading />;

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn btn-ghost btn-icon-sm" onClick={() => navigate(-1)}><FiChevronLeft /></button>
            <h1 className="page-title"><FiUsers /> Danh sách học viên</h1>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost btn-sm" onClick={handleExportExcel}><FiDownload size={14} /> Xuất Excel</button>
          <button className="btn btn-primary" onClick={openAdd}><FiPlus size={14} /> Thêm học viên</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20, padding: '16px 20px', background: 'var(--primary-50)', borderColor: 'var(--primary-100)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'block' }}>Lớp học</label>
                <strong style={{ color: 'var(--primary-700)' }}>{targetClass?.name} ({targetClass?.code})</strong>
            </div>
            <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'block' }}>Sỉ số thực tế</label>
                <strong style={{ color: 'var(--success-600)' }}>{students.length} / {targetClass?.max_students || targetClass?.maxStudents}</strong>
            </div>
            <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'block' }}>Khai giảng</label>
                <strong>{formatDate(targetClass?.start_date || targetClass?.startDate)}</strong>
            </div>
            <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'block' }}>Tổng học phí lớp</label>
                <strong style={{ color: 'var(--warning-600)' }}>
                    {formatCurrency(students.filter(s => s.tuitionPaid).length * (targetClass?.fee || 0))}
                </strong>
            </div>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-bar" style={{ minWidth: 300 }}>
            <FiSearch className="search-icon" />
            <input className="form-input" placeholder="Tìm tên, mã, SĐT, trường..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} style={{ paddingLeft: 42 }} />
          </div>
        </div>
        <div className="toolbar-right" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
           <button className="btn btn-ghost btn-sm" onClick={handleReorderCodes} title="Cập nhật lại Mã HV cho toàn bộ hồ sơ trong lớp">
             <FiRefreshCw size={14} style={{ marginRight: 6 }} /> Đánh lại mã HV
           </button>
           {selectedIds.length > 0 && (
            <button className="btn btn-primary btn-sm" onClick={() => setEmailModalData(students.filter(s => selectedIds.includes(s.id)))}>
              <FiMail size={14} /> Gửi Email ({selectedIds.length})
            </button>
           )}
           <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Hiển thị {filtered.length} học viên</span>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}><input type="checkbox" checked={selectedIds.length === paged.data.length && paged.data.length > 0} onChange={toggleAll} style={{ accentColor: 'var(--primary-500)' }} /></th>
                <th>Mã HV</th>
                <th>Họ tên</th>
                <th>Dữ liệu</th>
                <th>Học phí</th>
                <th style={{ textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paged.data.length === 0 ?
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>Chưa có học viên nào trong lớp này</td></tr>
              : paged.data.map(s => (
                <tr key={s.id}>
                  <td><input type="checkbox" checked={selectedIds.includes(s.id)} onChange={() => toggleSelect(s.id)} style={{ accentColor: 'var(--primary-500)' }} /></td>
                  <td><code style={{ color: 'var(--primary-400)' }}>{s.code}</code></td>
                  <td>
                    <div><strong>{s.fullName}</strong></div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{formatDate(s.dob)} • {s.phone}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem' }}>{s.school}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{s.email}</div>
                  </td>
                  <td>
                    {s.tuitionPaid ?
                      <span className="badge badge-active">Đã nộp</span> :
                      <button className="btn btn-warning btn-sm" onClick={() => handlePayTuition(s)}>Nộp HP</button>
                    }
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                      <button className="btn btn-ghost btn-icon-sm" title="Gửi Email" onClick={() => setEmailModalData(s)}><FiMail size={13} style={{ color: 'var(--info-400)' }} /></button>
                      <button className="btn btn-ghost btn-icon-sm" title="Chuyển lớp" onClick={() => { setMoveModal(s); setTargetMvId(''); }}><FiRepeat size={13} style={{ color: 'var(--warning-400)' }} /></button>
                      <button className="btn btn-ghost btn-icon-sm" title="Sửa" onClick={() => openEdit(s)}><FiEdit2 size={13} style={{ color: 'var(--primary-400)' }} /></button>
                      {isAdmin && <button className="btn btn-ghost btn-icon-sm" title="Xóa" onClick={() => handleDelete(s.id)}><FiTrash2 size={13} style={{ color: 'var(--danger-400)' }} /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editItem ? 'Cập nhật học viên' : 'Thêm học viên mới'}</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}><FiX /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: 24 }}>
                <div style={{ flexShrink: 0 }}>
                  <label className="image-preview" style={{ cursor: 'pointer' }}>
                    {formData.photo ? <img src={formData.photo} alt="" /> : (
                      <div className="image-preview-placeholder"><FiUpload size={20} /><br />3x4</div>
                    )}
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                  </label>
                </div>
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group"><label className="form-label">Họ tên *</label><input className="form-input" value={formData.fullName || ''} onChange={e => setFormData(p => ({ ...p, fullName: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label">Ngày sinh</label><input className="form-input" type="date" value={formData.dob || ''} onChange={e => setFormData(p => ({ ...p, dob: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label">Điện thoại</label><input className="form-input" value={formData.phone || ''} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={formData.email || ''} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label">Trường</label><input className="form-input" value={formData.school || ''} onChange={e => setFormData(p => ({ ...p, school: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label">Lớp sinh viên</label><input className="form-input" value={formData.classGroup || ''} onChange={e => setFormData(p => ({ ...p, classGroup: e.target.value }))} /></div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleSave}><FiCheck size={16} /> Lưu</button>
            </div>
          </div>
        </div>
      )}

      <EmailModal 
        isOpen={emailModalData !== null} 
        onClose={() => setEmailModalData(null)} 
        recipients={Array.isArray(emailModalData) ? emailModalData : (emailModalData ? [emailModalData] : [])} 
        extraData={{ 
          className: targetClass?.name,
          amount: targetClass?.fee || 0 
        }}
      />

      {moveModal && (
        <div className="modal-overlay" onClick={() => setMoveModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 450 }}>
            <div className="modal-header">
              <h3 className="modal-title">Chuyển lớp học viên</h3>
              <button className="modal-close" onClick={() => setMoveModal(null)}><FiX /></button>
            </div>
            <div className="modal-body">
              <p>Chuyển học viên <strong>{moveModal.fullName}</strong> sang lớp khác:</p>
              <div className="form-group">
                <label className="form-label">Chọn lớp mới</label>
                <select 
                    className="form-select" 
                    value={targetMvId} 
                    onChange={e => setTargetMvId(e.target.value)}
                >
                  <option value="">-- Chọn lớp học --</option>
                  {allClasses
                    .filter(c => String(c.id) !== String(classId))
                    .map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>
              <div style={{ marginTop: 12, padding: 12, background: 'var(--warning-50)', borderRadius: 8, fontSize: '0.85rem', color: 'var(--warning-700)' }}>
                Lưu ý: Sỉ số lớp cũ và lớp mới sẽ tự động cập nhật.
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setMoveModal(null)}>Hủy</button>
              <button className="btn btn-warning" disabled={!targetMvId} onClick={handleConfirmMove}>
                <FiCheck /> Xác nhận chuyển
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
