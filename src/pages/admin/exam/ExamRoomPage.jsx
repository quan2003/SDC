import { useState } from 'react';
import { FiMap, FiPlus, FiX, FiCheck, FiTrash2, FiPrinter, FiUser } from 'react-icons/fi';
import { useToast } from '../../../contexts/ToastContext';
import { mockStudents, mockClassrooms, mockCertificateClasses, mockExamSessions } from '../../../utils/mockData';
import { exportToExcel } from '../../../utils/helpers';
import { printPDF } from '../../../utils/pdfGenerator';

const mockRooms = [
  {
    id: 1, examDate: '2026-05-15', shift: 'Ca sáng (7:30 - 9:30)', roomId: 1, roomName: 'Phòng máy 101', capacity: 40,
    students: mockStudents.slice(0, 3).map(s => ({ id: s.id, fullName: s.fullName, code: s.code, cccd: s.cccd, seat: '' })),
  },
  {
    id: 2, examDate: '2026-05-15', shift: 'Ca chiều (13:30 - 15:30)', roomId: 2, roomName: 'Phòng máy 102', capacity: 35,
    students: mockStudents.slice(3).map(s => ({ id: s.id, fullName: s.fullName, code: s.code, cccd: s.cccd, seat: '' })),
  },
];

export default function ExamRoomPage() {
  const toast = useToast();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(1);

  const handleAutoAssign = () => {
    const batch = mockExamSessions.find(b => b.id === Number(selectedBatch));
    toast.success('Xếp phòng thành công', `Đã hệ thống hóa toàn bộ sinh viên vào đợt thi ${batch.date}`);
  };

  const handlePrint = (room) => {
    // Standard basic print logic mimicking table
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="text-align: center;">DANH SÁCH THÍ SINH DỰ THI</h2>
        <h3 style="text-align: center;">${room.roomName} - ${room.examDate} - ${room.shift}</h3>
        <table border="1" cellpadding="8" style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr><th>STT</th><th>Số báo danh</th><th>Họ và tên</th><th>CCCD</th></tr>
          </thead>
          <tbody>
            ${room.students.map((s, i) => `<tr><td align="center">${i + 1}</td><td align="center">${String(i + 1).padStart(3, '0')}</td><td>${s.fullName}</td><td align="center">${s.cccd}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
    `;
    printPDF(html);
  };

  const handlePrintAll = () => {
    exportToExcel(rooms.flatMap(r => r.students.map(s => ({ "Phòng": r.roomName, "Ca thi": r.shift, "Ngày thi": r.examDate, "Họ Tên": s.fullName, "CCCD": s.cccd }))), 'DanhSachThi_Full');
    toast.success('Đã xuất toàn bộ danh sách phòng thi', '');
  };

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <h1 className="page-title"><FiMap /> Danh sách thi theo phòng</h1>
        <div className="page-actions">
          <button className="btn btn-ghost" onClick={handlePrintAll}><FiPrinter size={16} /> Xuất DS tổng</button>
          <button className="btn btn-primary" onClick={handleAutoAssign}><FiPlus size={16} /> Xếp phòng tự động</button>
        </div>
      </div>

      {/* Batch selector toolbar */}
      <div className="toolbar" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontWeight: 600 }}>Khóa thi / Đợt thi:</span>
          <select 
            className="form-select" 
            value={selectedBatch} 
            onChange={(e) => setSelectedBatch(Number(e.target.value))}
            style={{ minWidth: 300 }}
          >
            {mockExamSessions.map(b => (
              <option key={b.id} value={b.id}>{b.name} (Hạn ĐK: {b.deadline})</option>
            ))}
          </select>
        </div>
        <div>
          <span className="badge badge-warning">Đợi xếp: 45 HV</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24 }}>
        {/* Room List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>
            Tổng: <strong style={{ color: 'var(--text-primary)' }}>{rooms.length}</strong> phòng — <strong style={{ color: 'var(--primary-400)' }}>{rooms.reduce((s, r) => s + r.students.length, 0)}</strong> thí sinh
          </div>
          {rooms.map(room => (
            <div
              key={room.id}
              className="card"
              style={{
                padding: '16px 18px', cursor: 'pointer',
                border: selectedRoom?.id === room.id ? '2px solid var(--primary-400)' : '2px solid transparent',
                transition: 'border-color 0.2s',
              }}
              onClick={() => setSelectedRoom(room)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 4, color: selectedRoom?.id === room.id ? 'var(--primary-400)' : 'var(--text-primary)' }}>
                    {room.roomName}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: 6 }}>{room.examDate} — {room.shift}</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className="badge badge-active"><FiUser size={11} /> {room.students.length} thí sinh</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>/ {room.capacity} chỗ</span>
                  </div>
                </div>
                <button className="btn btn-ghost btn-icon-sm" title="In DS phòng" onClick={e => { e.stopPropagation(); handlePrint(room); }}>
                  <FiPrinter size={14} style={{ color: 'var(--accent-400)' }} />
                </button>
              </div>
              {/* Progress bar */}
              <div style={{ marginTop: 10, height: 4, background: 'var(--border-color)', borderRadius: 999 }}>
                <div style={{ height: '100%', width: `${Math.min(100, (room.students.length / room.capacity) * 100)}%`, background: room.students.length >= room.capacity ? 'var(--danger-400)' : 'var(--primary-400)', borderRadius: 999 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Room Detail */}
        {selectedRoom ? (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-glass)' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{selectedRoom.roomName}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>{selectedRoom.examDate} — {selectedRoom.shift}</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => handlePrint(selectedRoom)}><FiPrinter size={14} /> In DS</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 44 }}>STT</th>
                    <th>Số BD</th>
                    <th>Mã HV</th>
                    <th>Họ và tên</th>
                    <th>CCCD</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRoom.students.map((s, i) => (
                    <tr key={s.id}>
                      <td style={{ color: 'var(--text-tertiary)' }}>{i + 1}</td>
                      <td><strong style={{ color: 'var(--primary-400)' }}>{String(i + 1).padStart(3, '0')}</strong></td>
                      <td><code style={{ fontSize: '0.82rem' }}>{s.code}</code></td>
                      <td>{s.fullName}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{s.cccd}</td>
                    </tr>
                  ))}
                  {selectedRoom.students.length === 0 && (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>Phòng thi trống</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
            <div style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>
              <FiMap size={48} style={{ opacity: 0.2, marginBottom: 12 }} />
              <div>Chọn một phòng thi ở bên trái để xem danh sách thí sinh</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
