import { useState, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  FiHome, FiUsers, FiShield, FiLock, FiGrid, FiImage, FiBell, FiCalendar,
  FiAward, FiBookOpen, FiMap, FiBriefcase, FiLayers, FiUserCheck,
  FiClipboard, FiFileText, FiEdit3, FiDollarSign, FiBarChart2, FiSettings,
  FiGlobe, FiChevronDown, FiChevronRight, FiMenu
} from 'react-icons/fi';

const menuItems = [
  { type: 'item', path: '/admin', icon: FiHome, label: 'Dashboard', exact: true },
  {
    type: 'group', label: 'Quản trị hệ thống', icon: FiSettings,
    children: [
      { path: '/admin/users', icon: FiUsers, label: 'Người dùng' },
      { path: '/admin/roles', icon: FiShield, label: 'Vai trò' },
      { path: '/admin/permissions', icon: FiLock, label: 'Quyền' },
      { path: '/admin/categories', icon: FiGrid, label: 'Danh mục hệ thống' },
      { path: '/admin/banners', icon: FiImage, label: 'Banners' },
      { path: '/admin/notifications', icon: FiBell, label: 'Thông báo' },
      { path: '/admin/schedule', icon: FiCalendar, label: 'Thời khóa biểu' },
    ]
  },
  {
    type: 'group', label: 'Quản lý danh mục', icon: FiLayers,
    children: [
      { path: '/admin/certificates', icon: FiAward, label: 'Chứng chỉ' },
      { path: '/admin/subjects', icon: FiBookOpen, label: 'Môn học' },
      { path: '/admin/classrooms', icon: FiMap, label: 'Phòng học' },
      { path: '/admin/units', icon: FiBriefcase, label: 'Đơn vị' },
    ]
  },
  {
    type: 'group', label: 'Quản lý lớp', icon: FiUserCheck,
    children: [
      { path: '/admin/certificate-classes', icon: FiLayers, label: 'Lớp chứng chỉ' },
      { path: '/admin/activity-class', icon: FiUserCheck, label: 'Lớp sinh hoạt' },
      { path: '/admin/course-classes', icon: FiClipboard, label: 'Lớp học phần' },
    ]
  },
  {
    type: 'group', label: 'Quản lý thi', icon: FiEdit3,
    children: [
      { path: '/admin/exam-sessions', icon: FiCalendar, label: 'Đợt thi' },
      { path: '/admin/exam-registration', icon: FiFileText, label: 'DS đăng ký thi' },
      { path: '/admin/exam-paid', icon: FiDollarSign, label: 'DS đã đóng lệ phí' },
      { path: '/admin/exam-rooms', icon: FiMap, label: 'DS thi theo phòng' },
      { path: '/admin/exam-scores', icon: FiBarChart2, label: 'Upload điểm' },
    ]
  },
  {
    type: 'group', label: 'Thanh toán', icon: FiDollarSign,
    children: [
      { path: '/admin/instructors', icon: FiUsers, label: 'Giảng viên' },
      { path: '/admin/payment-rates', icon: FiDollarSign, label: 'Mức thanh toán' },
      { path: '/admin/contracts', icon: FiFileText, label: 'Hợp đồng TT' },
      { path: '/admin/payment-sessions', icon: FiCalendar, label: 'Đợt thanh toán' },
      { path: '/admin/tuition-payment', icon: FiDollarSign, label: 'Thu học phí (Kế toán)' },
    ]
  },
  {
    type: 'group', label: 'Báo cáo', icon: FiBarChart2,
    children: [
      { path: '/admin/report-registration', icon: FiFileText, label: 'Thống kê đăng ký' },
      { path: '/admin/report-fees', icon: FiDollarSign, label: 'BC học phí - lệ phí' },
      { path: '/admin/report-deleted-tuition', icon: FiFileText, label: 'Phiếu thu HP đã xóa' },
      { path: '/admin/report-deleted-fees', icon: FiFileText, label: 'Phiếu thu LP đã xóa' },
      { path: '/admin/report-tuition-session', icon: FiBarChart2, label: 'Học phí theo đợt' },
      { path: '/admin/report-exam-list', icon: FiUsers, label: 'BC danh sách dự thi' },
    ]
  },
  {
    type: 'item', path: '/admin/settings', icon: FiSettings, label: 'Thiết lập'
  },
  {
    type: 'group', label: 'Đăng ký online', icon: FiGlobe,
    children: [
      { path: '/admin/online-registration', icon: FiFileText, label: 'ĐK học online' },
      { path: '/admin/online-exam', icon: FiEdit3, label: 'ĐK thi online' },
    ]
  },
];

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState(() => {
    // Auto-expand group containing current path
    const groups = {};
    menuItems.forEach((item, idx) => {
      if (item.type === 'group') {
        const isActive = item.children.some(c => location.pathname.startsWith(c.path));
        if (isActive) groups[idx] = true;
      }
    });
    return groups;
  });

  const toggleGroup = (idx) => {
    setExpandedGroups(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`} style={{
      width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
      background: 'var(--bg-sidebar)',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      transition: 'width var(--transition-slow)',
      borderRight: '1px solid var(--border-color)',
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? '16px 8px' : '20px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        borderBottom: '1px solid var(--border-color)',
        minHeight: 'var(--header-height)',
        flexShrink: 0,
      }}>
        <img src="/Logo-SDC.xanh.png" alt="SDC" style={{ width: 40, height: 'auto', objectFit: 'contain', flexShrink: 0 }} />
        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap' }}>SDC - ĐHĐN</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>Quản lý đào tạo</div>
          </div>
        )}
      </div>

      {/* Menu */}
      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '12px 8px' }}>
        {menuItems.map((item, idx) => {
          if (item.type === 'item') {
            return (
              <NavLink
                key={idx}
                to={item.path}
                end={item.exact}
                className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: collapsed ? '10px 0' : '10px 14px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? 'var(--primary-400)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--primary-50)' : 'transparent',
                  transition: 'all var(--transition-fast)',
                  marginBottom: 2,
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 400,
                  textDecoration: 'none',
                })}
                data-tooltip={collapsed ? item.label : undefined}
              >
                <item.icon size={18} style={{ flexShrink: 0 }} />
                {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
              </NavLink>
            );
          }

          // Group
          const isExpanded = expandedGroups[idx];
          const hasActiveChild = item.children.some(c => location.pathname.startsWith(c.path));

          return (
            <div key={idx} style={{ marginBottom: 4 }}>
              <button
                onClick={() => !collapsed && toggleGroup(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: collapsed ? '10px 0' : '10px 14px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: 'var(--radius-md)',
                  color: hasActiveChild ? 'var(--primary-400)' : 'var(--text-tertiary)',
                  background: 'transparent',
                  width: '100%',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  transition: 'all var(--transition-fast)',
                  cursor: 'pointer',
                }}
                data-tooltip={collapsed ? item.label : undefined}
              >
                <item.icon size={16} style={{ flexShrink: 0 }} />
                {!collapsed && (
                  <>
                    <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap' }}>{item.label}</span>
                    {isExpanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
                  </>
                )}
              </button>
              {!collapsed && isExpanded && (
                <div style={{ paddingLeft: 16, animation: 'fadeInDown 200ms ease-out' }}>
                  {item.children.map((child, cidx) => (
                    <NavLink
                      key={cidx}
                      to={child.path}
                      className={({ isActive }) => `sidebar-child ${isActive ? 'active' : ''}`}
                      style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 14px',
                        borderRadius: 'var(--radius-sm)',
                        color: isActive ? 'var(--primary-400)' : 'var(--text-secondary)',
                        background: isActive ? 'var(--primary-50)' : 'transparent',
                        transition: 'all var(--transition-fast)',
                        marginBottom: 1,
                        fontSize: '0.84rem',
                        fontWeight: isActive ? 500 : 400,
                        textDecoration: 'none',
                        borderLeft: isActive ? '2px solid var(--primary-500)' : '2px solid transparent',
                      })}
                    >
                      <child.icon size={15} style={{ flexShrink: 0 }} />
                      <span style={{ whiteSpace: 'nowrap' }}>{child.label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Toggle button */}
      <button
        onClick={onToggle}
        style={{
          padding: 14,
          background: 'transparent',
          color: 'var(--text-tertiary)',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all var(--transition-fast)',
          flexShrink: 0,
        }}
      >
        <FiMenu size={18} />
      </button>
    </aside>
  );
}
