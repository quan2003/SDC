import { useState, useMemo, useCallback, useEffect } from 'react';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiChevronLeft, FiChevronRight, FiDownload, FiMoreVertical } from 'react-icons/fi';
import { useToast } from '../contexts/ToastContext';
import { filterBySearch, paginate, sortItems, translateError } from '../utils/helpers';
import DateInput from './DateInput';
import PageLoader from './PageLoader';

/**
 * Generic CRUD page component for admin management pages
 * Provides search, table with sort/pagination, add/edit/delete modal
 */
export default function CrudPage({
  title,
  icon: Icon,
  iconColor = 'blue',
  data,
  setData,
  columns,
  searchFields,
  formFields,
  renderForm,
  getNewItem,
  itemLabel = 'mục',
  extraActions,
  renderExtraToolbar,
  pageSize = 10,
  onFetch,
  onCreate,
  onUpdate,
  onDelete,
}) {
  const toast = useToast();
  const [internalData, setInternalData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Determine data source
  const currentData = onFetch ? internalData : data;

  // Initial load
  useEffect(() => {
    if (onFetch) {
      loadData();
    }
  }, [onFetch]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await onFetch();
      setInternalData(res || []);
    } catch (e) {
      toast.error('Lỗi tải dữ liệu', e.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter, sort, paginate
  const filtered = useMemo(() => filterBySearch(currentData, search, searchFields), [currentData, search, searchFields]);
  const sorted = useMemo(() => sortItems(filtered, sortKey, sortDir), [filtered, sortKey, sortDir]);
  const paged = useMemo(() => paginate(sorted, currentPage, pageSize), [sorted, currentPage, pageSize]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const openAdd = () => {
    setEditItem(null);
    setFormData(getNewItem ? getNewItem() : {});
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setFormData({ ...item });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (editItem) {
        if (onUpdate) {
          await onUpdate(editItem.id, formData);
          await loadData();
        } else {
          setData(prev => prev.map(item => item.id === editItem.id ? { ...item, ...formData } : item));
        }
        toast.success('Cập nhật thành công', `Đã cập nhật ${itemLabel}`);
      } else {
        if (onCreate) {
          await onCreate(formData);
          await loadData();
        } else {
          const newId = data.length > 0 ? Math.max(...data.map(i => i.id)) + 1 : 1;
          setData(prev => [...prev, { ...formData, id: newId }]);
        }
        toast.success('Thêm thành công', `Đã thêm ${itemLabel} mới`);
      }
      setModalOpen(false);
    } catch (err) {
      toast.error('Lỗi', translateError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (item) => {
    setDeleteConfirm(item);
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    try {
      if (onDelete) {
        await onDelete(deleteConfirm.id);
        await loadData();
      } else {
        setData(prev => prev.filter(i => i.id !== deleteConfirm.id));
      }
      toast.success('Xóa thành công', `Đã xóa ${itemLabel}`);
      setDeleteConfirm(null);
    } catch (err) {
      toast.error('Lỗi xóa dữ liệu', translateError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = async (item) => {
    const newStatus = item.status === 'active' ? 'inactive' : 'active';
    if (onUpdate) {
      setIsLoading(true);
      try {
        await onUpdate(item.id, { status: newStatus });
        await loadData();
        toast.success('Cập nhật trạng thái', `${newStatus === 'active' ? 'Kích hoạt' : 'Ngừng kích hoạt'} thành công`);
      } catch (err) {
         toast.error('Lỗi cập nhật', err.message);
      } finally {
         setIsLoading(false);
      }
    } else {
      setData(prev => prev.map(i => i.id === item.id ? { ...i, status: newStatus } : i));
      toast.success('Cập nhật trạng thái', `${newStatus === 'active' ? 'Kích hoạt' : 'Ngừng kích hoạt'} thành công`);
    }
  };

  if (isLoading && (currentData?.length === 0 || !currentData)) {
    return <PageLoader loading={true} />;
  }

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">
          {Icon && <Icon />} {title}
        </h1>
        <div className="page-actions">
          {renderExtraToolbar && renderExtraToolbar()}
          <button className="btn btn-primary" onClick={openAdd}>
            <FiPlus size={16} /> Thêm {itemLabel}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-bar" style={{ minWidth: 300 }}>
            <FiSearch className="search-icon" />
            <input
              className="form-input"
              placeholder="Tìm kiếm..."
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              style={{ paddingLeft: 42 }}
            />
          </div>
        </div>
        <div className="toolbar-right">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
            Tổng: <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> {itemLabel}
          </span>
        </div>
      </div>

      {/* Table Section */}
      <div className="card" style={{ position: 'relative', minHeight: 180 }}>
        {isLoading && currentData?.length > 0 && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.6)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'inherit' }}>
            <span className="loading-spinner"></span> <span style={{ marginLeft: 8, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Đang cập nhật...</span>
          </div>
        )}
        <div style={{ overflowX: 'auto' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 50 }}>STT</th>
                {columns.map(col => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                    className={sortKey === col.key ? 'sorted' : ''}
                    style={{ cursor: col.sortable !== false ? 'pointer' : 'default', ...col.headerStyle }}
                  >
                    {col.label}
                    {sortKey === col.key && (sortDir === 'asc' ? ' ↑' : ' ↓')}
                  </th>
                ))}
                <th style={{ width: 140, textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paged.data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 2} style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>
                    Không tìm thấy dữ liệu
                  </td>
                </tr>
              ) : (
                paged.data.map((item, idx) => (
                  <tr key={item.id}>
                    <td style={{ color: 'var(--text-tertiary)' }}>{(currentPage - 1) * pageSize + idx + 1}</td>
                    {columns.map(col => (
                      <td key={col.key} style={col.style}>
                        {col.render ? col.render(item) : item[col.key]}
                      </td>
                    ))}
                    <td>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                        <button className="btn btn-ghost btn-icon-sm" data-tooltip="Sửa" onClick={() => openEdit(item)}>
                          <FiEdit2 size={14} style={{ color: 'var(--primary-400)' }} />
                        </button>
                        {item.status !== undefined && (
                          <button
                            className="btn btn-ghost btn-icon-sm"
                            data-tooltip={item.status === 'active' ? 'Ngừng kích hoạt' : 'Kích hoạt'}
                            onClick={() => toggleStatus(item)}
                          >
                            {item.status === 'active' ?
                              <FiX size={14} style={{ color: 'var(--warning-400)' }} /> :
                              <FiCheck size={14} style={{ color: 'var(--success-400)' }} />
                            }
                          </button>
                        )}
                        <button className="btn btn-ghost btn-icon-sm" data-tooltip="Xóa" onClick={() => handleDelete(item)}>
                          <FiTrash2 size={14} style={{ color: 'var(--danger-400)' }} />
                        </button>
                        {extraActions && extraActions(item)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        </div>

        {/* Pagination */}
        {paged.totalPages > 1 && (
          <div className="pagination" style={{ padding: '12px 16px' }}>
            <div className="pagination-info">
              Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, paged.total)} / {paged.total}
            </div>
            <div className="pagination-controls">
              <button
                className="pagination-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                <FiChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(paged.totalPages, 5) }, (_, i) => {
                let page;
                if (paged.totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= paged.totalPages - 2) {
                  page = paged.totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                return (
                  <button
                    key={page}
                    className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                className="pagination-btn"
                disabled={currentPage === paged.totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editItem ? `Cập nhật ${itemLabel}` : `Thêm ${itemLabel} mới`}
              </h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              {renderForm ? renderForm(formData, setFormData, editItem) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {formFields?.map(field => (
                    <div className="form-group" key={field.key}>
                      <label className="form-label">
                        {field.label} {field.required && <span className="required">*</span>}
                      </label>
                      {field.type === 'select' ? (
                        <select
                          className="form-select"
                          value={formData[field.key] || ''}
                          onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                        >
                          <option value="">-- Chọn --</option>
                          {field.options?.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : field.type === 'textarea' ? (
                        <textarea
                          className="form-textarea"
                          value={formData[field.key] || ''}
                          onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                          placeholder={field.placeholder}
                        />
                      ) : field.type === 'date' ? (
                        <DateInput
                          className="form-input"
                          value={formData[field.key] || ''}
                          onChange={val => setFormData(prev => ({ ...prev, [field.key]: val }))}
                          placeholder={field.placeholder}
                        />
                      ) : (
                        <input
                          className="form-input"
                          type={field.type || 'text'}
                          value={formData[field.key] || ''}
                          onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                          placeholder={field.placeholder}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleSave}>
                <FiCheck size={16} /> {editItem ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-body">
              <div className="confirm-dialog">
                <div className="confirm-icon danger">
                  <FiTrash2 />
                </div>
                <div className="confirm-title">Xác nhận xóa</div>
                <div className="confirm-message">
                  Bạn có chắc chắn muốn xóa {itemLabel} này? Hành động này không thể hoàn tác.
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Hủy</button>
                  <button className="btn btn-danger" onClick={confirmDelete}>
                    <FiTrash2 size={14} /> Xóa
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
