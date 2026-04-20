import { FiInfo, FiAward, FiUsers, FiCheckCircle, FiTarget } from 'react-icons/fi';

export default function AboutPage() {
  return (
    <div className="client-section" style={{ paddingTop: 40 }}>
      <div className="client-container" style={{ maxWidth: 900 }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: 12 }}>
            Giới thiệu <span className="gradient-text">SDC</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto' }}>
            Trung tâm Phát triển Phần mềm - Đại học Đà Nẵng
          </p>
        </div>

        <div className="card" style={{ padding: 36, marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <FiInfo style={{ color: 'var(--primary-400)' }} /> Về chúng tôi
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
            Trung tâm Phát triển Phần mềm (SDC - Software Development Center) trực thuộc Đại học Đà Nẵng, 
            là đơn vị chuyên đào tạo, bồi dưỡng và tổ chức thi cấp chứng chỉ ứng dụng Công nghệ Thông tin 
            theo các quy định hiện hành của Bộ Giáo dục và Đào tạo, Bộ Thông tin và Truyền thông.
          </p>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            Với đội ngũ giảng viên giàu kinh nghiệm, cơ sở vật chất hiện đại và chương trình đào tạo 
            chuẩn quốc gia, SDC tự hào là đơn vị uy tín hàng đầu tại khu vực miền Trung - Tây Nguyên 
            trong lĩnh vực đào tạo CNTT.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
          {[
            { icon: FiTarget, title: 'Sứ mệnh', desc: 'Nâng cao trình độ ứng dụng CNTT cho sinh viên, cán bộ và người lao động tại khu vực miền Trung - Tây Nguyên.' },
            { icon: FiAward, title: 'Chứng chỉ uy tín', desc: 'Chứng chỉ được công nhận trên toàn quốc, đáp ứng yêu cầu tuyển dụng của các cơ quan, tổ chức.' },
            { icon: FiUsers, title: 'Đội ngũ chuyên môn', desc: 'Giảng viên là các thạc sĩ, tiến sĩ có kinh nghiệm giảng dạy và nghiên cứu trong lĩnh vực CNTT.' },
            { icon: FiCheckCircle, title: 'Tỉ lệ đậu cao', desc: 'Tỉ lệ đậu chứng chỉ đạt trên 95%, nhờ chương trình đào tạo bài bản và sát với đề thi thực tế.' },
          ].map((item, i) => (
            <div key={i} className="card" style={{ padding: 24 }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(59, 130, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <item.icon size={20} style={{ color: 'var(--primary-400)' }} />
              </div>
              <h3 style={{ fontSize: '1rem', marginBottom: 8 }}>{item.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
