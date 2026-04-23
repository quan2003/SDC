import { useState, useMemo, useEffect } from 'react';
import { FiUserCheck, FiSearch, FiPlus, FiEdit2, FiTrash2, FiDownload, FiPrinter, FiDollarSign, FiUpload, FiCopy, FiChevronLeft, FiChevronRight, FiX, FiCheck, FiMail, FiRepeat } from 'react-icons/fi';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { registrationsApi, activityClassesApi } from '../../../services/api';
import { FiFolder, FiFolderPlus, FiFolderMinus, FiFileText } from 'react-icons/fi';
import { filterBySearch, paginate, formatDate, formatCurrency, fileToBase64, exportToExcel, parseDate } from '../../../utils/helpers';
import EmailModal from '../../../components/EmailModal';

export default function ActivityClassPage() {
  const toast = useToast();
  const { isAdmin } = useAuth();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);
  const [emailModalData, setEmailModalData] = useState(null);
  const [moveModal, setMoveModal] = useState(null); 
  const [targetClassId, setTargetClassId] = useState('');

  useEffect(() => {
    Promise.all([
      registrationsApi.getAll(),
      activityClassesApi.getAll()
    ]).then(([regs, clsArr]) => {
      // Lớp sinh hoạt học viên chỉ hiển thị hồ sơ đăng ký học
      setStudents((regs || []).filter(r => r.type === 'course' || r.type === 'course_registration'));
      setClasses(clsArr || []);
      if (clsArr && clsArr.length > 0 && !selectedClassId) {
        setSelectedClassId(clsArr[0].id);
      }
    });
  }, []);

  const groupedClasses = useMemo(() => {
    const groups = {};
    classes.forEach(c => {
      let year = 'Khác';
      if (c.startDate) year = new Date(c.startDate).getFullYear();
      else if (c.code && /^\d{2}/.test(c.code)) year = '20' + c.code.substring(0, 2);
      
      let program = 'Chương trình khác';
      if (c.code) {
        if (c.code.includes('CB')) program = 'CNTT-CB';
        else if (c.code.includes('NC') || c.code.includes('TD')) program = 'CNTT-TD';
        else if (c.code.includes('MOS')) program = 'MOSFULL';
        else if (c.code.includes('THVP')) program = 'THVP';
        else if (c.code.includes('TTDN')) program = 'TTDN';
        else if (c.code.toUpperCase().includes('IT')) program = 'IT_Kids';
      }

      if (!groups[year]) groups[year] = {};
      if (!groups[year][program]) groups[year][program] = [];
      groups[year][program].push(c);
    });

    return Object.keys(groups).sort((a,b) => b - a).map(year => ({
      year,
      programs: Object.keys(groups[year]).sort().map(program => ({
        program,
        classes: groups[year][program]
      }))
    }));
  }, [classes]);

  const classStudents = useMemo(() => students.filter(s => s.activityClassId === selectedClassId || s.classId === selectedClassId), [students, selectedClassId]);
  const filtered = useMemo(() => filterBySearch(classStudents, search, ['fullName', 'code', 'phone', 'email', 'school']), [classStudents, search]);
  const paged = useMemo(() => paginate(filtered, currentPage, 10), [filtered, currentPage]);
  const selectedClass = classes.find(c => c.id === selectedClassId);

  const getStudentCount = (cId) => students.filter(s => s.activityClassId === cId || s.classId === cId).length;

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  const toggleAll = () => {
    if (selectedIds.length === paged.data.length) setSelectedIds([]);
    else setSelectedIds(paged.data.map(s => s.id));
  };

  const openAdd = () => {
    setEditItem(null);
    setFormData({ fullName: '', dob: '', gender: 'Nam', phone: '', email: '', cccd: '', school: '', classGroup: '', classId: selectedClassId, photo: '', registrationDate: new Date().toISOString().split('T')[0], tuitionPaid: false, feePaid: false, status: 'active' });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setFormData({ 
      ...item, 
      dob: parseDate(item.dob) || '', 
      cccdDate: parseDate(item.cccdDate) || '' 
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editItem) {
        await registrationsApi.update(editItem.id, formData);
        setStudents(prev => prev.map(s => s.id === editItem.id ? { ...s, ...formData } : s));
        toast.success('Cập nhật thành công');
      } else {
        const res = await registrationsApi.create(formData);
        setStudents(prev => [...prev, { ...res, fullName: res.full_name, dob: formatDate(res.dob) }]);
        toast.success('Thêm học viên thành công');
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

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(selectedIds.map(id => registrationsApi.delete(id)));
      setStudents(prev => prev.filter(s => !selectedIds.includes(s.id)));
      setSelectedIds([]);
      toast.success(`Đã xóa ${selectedIds.length} học viên`);
    } catch (e) {
      toast.error('Lỗi', 'Không thể xóa một số học viên');
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

  const handlePayFee = async (item) => {
    try {
      await registrationsApi.update(item.id, { ...item, feePaid: true });
      setStudents(prev => prev.map(s => s.id === item.id ? { ...s, feePaid: true } : s));
      toast.success('Đã nộp lệ phí', item.fullName);
    } catch (e) {
      toast.error('Lỗi', 'Không thể cập nhật nộp lệ phí');
    }
  };

  const handleExportExcel = () => {
    if (filtered.length === 0) {
      toast.error('Không có dữ liệu', 'Danh sách hiện tại đang trống, không thể xuất Excel.');
      return;
    }
    const success = exportToExcel(filtered, `DanhBach_Lop_${selectedClass?.code || 'SinhHoat'}`);
    if (success) toast.success('Xuất file thành công');
  };

  const handleConfirmMove = async () => {
    if (!moveModal || !targetClassId) return;
    try {
      await registrationsApi.update(moveModal.id, { ...moveModal, activityClassId: targetClassId });
      setStudents(prev => prev.map(s => s.id === moveModal.id ? { ...s, activityClassId: targetClassId } : s));
      toast.success('Chuyển lớp thành công', `${moveModal.fullName} đã được chuyển sang lớp mới.`);
      setMoveModal(null);
    } catch (e) {
      toast.error('Lỗi chuyển lớp', e.message);
    }
  };

  const handlePrint = async () => {
    if (!selectedClass) return;
    if (filtered.length === 0) {
      toast.error('Không có học viên', 'Lớp học hiện chưa có học viên nào để in danh sách.');
      return;
    }
    const html = `
      <div style="font-family: 'Times New Roman', serif; padding: 40px; color: #000;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px;">
          <div style="text-align: center;">
            <p style="margin: 0; font-size: 11pt;">TRUNG TÂM PHÁT TRIỂN PHẦN MỀM</p>
            <p style="margin: 0; font-size: 11pt; font-weight: bold;">ĐẠI HỌC ĐÀ NẴNG</p>
            <p style="margin: 5px 0; border-top: 1px solid #000; width: 80px; margin-left: auto; margin-right: auto;"></p>
          </div>
          <div style="text-align: center;">
            <p style="margin: 0; font-size: 11pt; font-weight: bold;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
            <p style="margin: 0; font-size: 11pt; font-weight: bold;">Độc lập - Tự do - Hạnh phúc</p>
            <p style="margin: 5px 0; border-top: 1px solid #000; width: 120px; margin-left: auto; margin-right: auto;"></p>
          </div>
        </div>

        <h1 style="text-align: center; font-size: 16pt; margin-bottom: 5px;">DANH SÁCH HỌC VIÊN LỚP SINH HOẠT</h1>
        <p style="text-align: center; font-size: 12pt; font-weight: bold; margin-bottom: 25px;">Lớp: ${selectedClass.name} (${selectedClass.code})</p>

        <table border="1" cellpadding="5" style="width: 100%; border-collapse: collapse; font-size: 11pt;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="width: 40px;">STT</th>
              <th style="width: 100px;">Mã HV</th>
              <th>Họ và tên</th>
              <th style="width: 90px;">Ngày sinh</th>
              <th style="width: 100px;">Điện thoại</th>
              <th>Trường/Đơn vị</th>
              <th style="width: 80px;">Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.length === 0 ? '<tr><td colspan="7" align="center">Chưa có học viên nào</td></tr>' : 
              filtered.map((s, i) => `
                <tr>
                  <td align="center">${i + 1}</td>
                  <td align="center">${s.code || ''}</td>
                  <td><strong>${s.fullName}</strong></td>
                  <td align="center">${formatDate(s.dob)}</td>
                  <td align="center">${s.phone || ''}</td>
                  <td>${s.school || ''}</td>
                  <td align="center">${s.tuitionPaid ? 'Đã nộp HP' : ''}</td>
                </tr>
              `).join('')
            }
          </tbody>
        </table>

        <div style="margin-top: 40px; display: flex; justify-content: space-between;">
          <div style="text-align: center; width: 50%;">
            <p><i>Ngày .... tháng .... năm 20...</i></p>
            <p><strong>Người lập biểu</strong></p>
            <p style="margin-top: 60px;">(Ký và ghi rõ họ tên)</p>
          </div>
          <div style="text-align: center; width: 50%;">
            <p><i>Đà Nẵng, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}</i></p>
            <p><strong>GIÁM ĐỐC</strong></p>
            <p style="margin-top: 60px;">(Ký tên và đóng dấu)</p>
          </div>
        </div>
      </div>
    `;
    const { printPDF } = await import('../../../utils/pdfGenerator');
    printPDF(html);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setFormData(prev => ({ ...prev, photo: base64 }));
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <h1 className="page-title"><FiUserCheck /> Lớp sinh hoạt học viên</h1>
        <div className="page-actions">
          <button className="btn btn-ghost btn-sm" onClick={handleExportExcel}><FiDownload size={14} /> Xuất Excel</button>
          <button className="btn btn-ghost btn-sm" onClick={handlePrint}><FiPrinter size={14} /> In PDF</button>
          <button className="btn btn-primary" onClick={openAdd}><FiPlus size={14} /> Thêm học viên</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* Left Tree Sidebar */}
        <div className="card" style={{ width: 260, flexShrink: 0, padding: '16px 8px', overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
          <h3 style={{ padding: '0 8px 12px', borderBottom: '1px solid var(--border-color)', marginBottom: 12, fontSize: '0.95rem' }}>THƯ MỤC LỚP HỌC</h3>
          {classes.length === 0 ? (
            <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
              Database đang trống.<br/>Hãy <strong>Thêm học viên</strong> để tạo dữ liệu thực tế!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {groupedClasses.map(gYear => (
                <details key={gYear.year} open style={{ padding: '0 8px' }}>
                  <summary style={{ fontWeight: 700, cursor: 'pointer', padding: '6px 0', userSelect: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FiFolderMinus size={14} style={{ color: 'var(--text-tertiary)' }} /> {gYear.year}
                  </summary>
                  <div style={{ paddingLeft: 12, marginTop: 4, display: 'flex', flexDirection: 'column', gap: 6, borderLeft: '1px dashed var(--border-color)', marginLeft: 6 }}>
                    {gYear.programs.map(gProg => (
                      <details key={gProg.program} open>
                        <summary style={{ fontWeight: 600, color: 'var(--primary-600)', cursor: 'pointer', padding: '4px 0', fontSize: '0.85rem', userSelect: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                           <FiFolder size={12} /> {gProg.program}
                        </summary>
                        <div style={{ paddingLeft: 12, marginTop: 2, display: 'flex', flexDirection: 'column', gap: 2, borderLeft: '1px dashed var(--border-color)', marginLeft: 5 }}>
                          {gProg.classes.map(c => {
                            const sc = getStudentCount(c.id);
                            const isSel = selectedClassId === c.id;
                            return (
                              <div
                                key={c.id}
                                onClick={() => { setSelectedClassId(c.id); setCurrentPage(1); setSearch(''); setSelectedIds([]); }}
                                style={{
                                  padding: '6px 8px', borderRadius: 4, cursor: 'pointer', fontSize: '0.85rem',
                                  display: 'flex', alignItems: 'center', gap: 6,
                                  background: isSel ? 'var(--primary-50)' : 'transparent',
                                  color: isSel ? 'var(--primary-600)' : 'var(--text-secondary)',
                                  fontWeight: isSel ? 600 : 400
                                }}
                              >
                                └─ {c.code || c.name} <span style={{ color: isSel ? 'var(--primary-600)' : 'var(--info-500)', fontWeight: 600, fontSize: '0.75rem' }}>({sc} HS)</span>
                              </div>
                            );
                          })}
                        </div>
                      </details>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          )}
        </div>

        {/* Right Content */}
        <div style={{ flex: 1, minWidth: 0 }}>


      {/* Class info */}
      {selectedClass && (
        <div className="card" style={{ marginBottom: 20, padding: 16, display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <div><span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>Lớp:</span> <strong>{selectedClass.name}</strong></div>
          <div><span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>Sỉ số:</span> <strong style={{ color: 'var(--primary-400)' }}>{classStudents.length}/{selectedClass.maxStudents}</strong></div>
          <div><span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>Khai giảng:</span> {formatDate(selectedClass.startDate)}</div>
          <div><span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>Học phí:</span> <span style={{ color: 'var(--warning-400)' }}>{formatCurrency(selectedClass.fee)}</span></div>
        </div>
      )}

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-bar" style={{ minWidth: 300 }}>
            <FiSearch className="search-icon" />
            <input className="form-input" placeholder="Tìm học viên..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} style={{ paddingLeft: 42 }} />
          </div>
          {isAdmin && selectedIds.length > 0 && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setEmailModalData(students.filter(s => selectedIds.includes(s.id)))}>
                <FiMail size={12} style={{ color: 'var(--info-500)' }} /> Gửi Email {selectedIds.length} người
              </button>
              <button className="btn btn-danger btn-sm" onClick={handleDeleteSelected}>
                <FiTrash2 size={12} /> Xóa {selectedIds.length} mục
              </button>
            </div>
          )}
        </div>
        <div className="toolbar-right">
          <button className="btn btn-ghost btn-sm"><FiUpload size={12} /> Import</button>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Tổng: <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong></span>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-container" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}><input type="checkbox" checked={selectedIds.length === paged.data.length && paged.data.length > 0} onChange={toggleAll} style={{ accentColor: 'var(--primary-500)' }} /></th>
                <th>Mã HV</th>
                <th>Họ tên</th>
                <th>Ngày sinh</th>
                <th>Giới tính</th>
                <th>Điện thoại</th>
                <th>Trường</th>
                <th>Học phí</th>
                <th style={{ textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paged.data.length === 0 ?
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>Không có học viên</td></tr>
              : paged.data.map(s => (
                <tr key={s.id} className={selectedIds.includes(s.id) ? 'selected' : ''}>
                  <td><input type="checkbox" checked={selectedIds.includes(s.id)} onChange={() => toggleSelect(s.id)} style={{ accentColor: 'var(--primary-500)' }} /></td>
                  <td><code style={{ color: 'var(--primary-400)' }}>{s.code}</code></td>
                  <td><strong>{s.fullName}</strong></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{formatDate(s.dob)}</td>
                  <td>{s.gender}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{s.phone}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{s.school}</td>
                  <td>
                    {s.tuitionPaid ?
                      <span className="badge badge-active">Đã nộp</span> :
                      <button className="btn btn-warning btn-sm" style={{ padding: '2px 8px', fontSize: '0.7rem' }} onClick={() => handlePayTuition(s)}>
                        <FiDollarSign size={10} /> Nộp HP
                      </button>
                    }
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                      <button className="btn btn-ghost btn-icon-sm" title="Gửi Email" onClick={() => setEmailModalData(s)}><FiMail size={13} style={{ color: 'var(--info-400)' }} /></button>
                      <button className="btn btn-ghost btn-icon-sm" title="Chuyển lớp" onClick={() => { setMoveModal(s); setTargetClassId(''); }}><FiRepeat size={13} style={{ color: 'var(--warning-400)' }} /></button>
                      <button className="btn btn-ghost btn-icon-sm" title="Sửa" onClick={() => openEdit(s)}><FiEdit2 size={13} style={{ color: 'var(--primary-400)' }} /></button>
                      {isAdmin && <button className="btn btn-ghost btn-icon-sm" title="Xóa" onClick={() => handleDelete(s.id)}><FiTrash2 size={13} style={{ color: 'var(--danger-400)' }} /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {paged.totalPages > 1 && (
          <div className="pagination" style={{ padding: '12px 16px' }}>
            <div className="pagination-info">Hiển thị {(currentPage - 1) * 10 + 1} - {Math.min(currentPage * 10, paged.total)} / {paged.total}</div>
            <div className="pagination-controls">
              <button className="pagination-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><FiChevronLeft size={16} /></button>
              {Array.from({ length: paged.totalPages }, (_, i) => (
                <button key={i + 1} className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
              ))}
              <button className="pagination-btn" disabled={currentPage === paged.totalPages} onClick={() => setCurrentPage(p => p + 1)}><FiChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
      </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editItem ? 'Cập nhật học viên' : 'Thêm học viên mới'}</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}><FiX /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: 24 }}>
                {/* Photo */}
                <div style={{ flexShrink: 0 }}>
                  <label className="form-label" style={{ marginBottom: 8 }}>Ảnh thẻ 3x4</label>
                  <label className="image-preview" style={{ cursor: 'pointer' }}>
                    {formData.photo ? <img src={formData.photo} alt="" /> : (
                      <div className="image-preview-placeholder"><FiUpload size={20} style={{ marginBottom: 4 }} /><br />3x4</div>
                    )}
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                  </label>
                </div>
                {/* Form */}
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group"><label className="form-label">Họ tên <span className="required">*</span></label><input className="form-input" value={formData.fullName || ''} onChange={e => setFormData(p => ({ ...p, fullName: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label">Ngày sinh</label><input className="form-input" type="date" value={formData.dob || ''} onChange={e => setFormData(p => ({ ...p, dob: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label">Giới tính</label><select className="form-select" value={formData.gender || ''} onChange={e => setFormData(p => ({ ...p, gender: e.target.value }))}><option value="Nam">Nam</option><option value="Nữ">Nữ</option></select></div>
                  <div className="form-group"><label className="form-label">Điện thoại</label><input className="form-input" value={formData.phone || ''} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={formData.email || ''} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label">Số CCCD</label><input className="form-input" value={formData.cccd || ''} onChange={e => setFormData(p => ({ ...p, cccd: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label">Trường</label><input className="form-input" value={formData.school || ''} onChange={e => setFormData(p => ({ ...p, school: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label">Lớp</label><input className="form-input" value={formData.classGroup || ''} onChange={e => setFormData(p => ({ ...p, classGroup: e.target.value }))} /></div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleSave}><FiCheck size={16} /> {editItem ? 'Cập nhật' : 'Thêm'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Move Class Modal */}
      {moveModal && (
        <div className="modal-overlay" onClick={() => setMoveModal(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Chuyển lớp học viên</h3>
              <button className="modal-close" onClick={() => setMoveModal(null)}><FiX /></button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: 16 }}>Chuyển học viên <strong>{moveModal.fullName}</strong> sang lớp khác:</p>
              <div className="form-group">
                <label className="form-label">Chọn lớp đích</label>
                <select className="form-select" value={targetClassId} onChange={e => setTargetClassId(e.target.value)}>
                  <option value="">-- Chọn lớp --</option>
                  {classes.filter(c => c.id !== selectedClassId).map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setMoveModal(null)}>Hủy</button>
              <button className="btn btn-primary" disabled={!targetClassId} onClick={handleConfirmMove}>Xác nhận chuyển</button>
            </div>
          </div>
        </div>
      )}

      <EmailModal 
        isOpen={emailModalData !== null} 
        onClose={() => setEmailModalData(null)} 
        recipients={Array.isArray(emailModalData) ? emailModalData : (emailModalData ? [emailModalData] : [])} 
        extraData={{ 
          className: selectedClass?.name
        }}
      />
    </div>
  );
}
