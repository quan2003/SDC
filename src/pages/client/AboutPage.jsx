import { FiInfo, FiAward, FiUsers, FiCheckCircle, FiTarget, FiBookOpen, FiMapPin, FiTrendingUp, FiMonitor, FiFileText, FiClock, FiShield } from 'react-icons/fi';

export default function AboutPage() {
  return (
    <div className="client-section" style={{ paddingTop: 40 }}>
      <div className="client-container" style={{ maxWidth: 1180 }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: 12 }}>
            Giới thiệu <span className="gradient-text">SDC</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto' }}>
            Trung tâm Phát triển Phần mềm - Đại học Đà Nẵng
          </p>
        </div>

        <div className="about-intro-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.45fr) minmax(280px, 0.9fr)', gap: 24, alignItems: 'stretch', marginBottom: 24 }}>
          <div className="card about-main-card" style={{ padding: 40 }}>
            <h2 style={{ fontSize: '1.35rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <FiInfo /> Về chúng tôi
            </h2>
            <p style={{ lineHeight: 1.85, marginBottom: 16 }}>
              Trung tâm Phát triển Phần mềm (SDC - Software Development Center) trực thuộc Đại học Đà Nẵng, 
              là đơn vị chuyên đào tạo, bồi dưỡng và tổ chức thi cấp chứng chỉ ứng dụng Công nghệ Thông tin 
              theo các quy định hiện hành của Bộ Giáo dục và Đào tạo, Bộ Thông tin và Truyền thông.
            </p>
            <p style={{ lineHeight: 1.85 }}>
              Với đội ngũ giảng viên giàu kinh nghiệm, cơ sở vật chất hiện đại và chương trình đào tạo 
              chuẩn quốc gia, SDC tự hào là đơn vị uy tín hàng đầu tại khu vực miền Trung - Tây Nguyên 
              trong lĩnh vực đào tạo CNTT.
            </p>
          </div>

          <div style={{ display: 'grid', gap: 14 }}>
            {[
              { icon: FiBookOpen, value: '15+', label: 'Năm kinh nghiệm đào tạo' },
              { icon: FiTrendingUp, value: '95%', label: 'Tỉ lệ học viên đạt chứng chỉ' },
              { icon: FiMapPin, value: 'Đà Nẵng', label: 'Trung tâm phục vụ khu vực miền Trung' },
            ].map((item, i) => (
              <div key={i} className="card about-stat-card" style={{ padding: 22, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div className="client-icon-surface" style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <item.icon size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, lineHeight: 1.1 }}>{item.value}</div>
                  <div style={{ fontSize: '0.9rem', marginTop: 4 }}>{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="about-feature-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 20 }}>
          {[
            { icon: FiTarget, title: 'Sứ mệnh', desc: 'Nâng cao trình độ ứng dụng CNTT cho sinh viên, cán bộ và người lao động tại khu vực miền Trung - Tây Nguyên.' },
            { icon: FiAward, title: 'Chứng chỉ uy tín', desc: 'Chứng chỉ được công nhận trên toàn quốc, đáp ứng yêu cầu tuyển dụng của các cơ quan, tổ chức.' },
            { icon: FiUsers, title: 'Đội ngũ chuyên môn', desc: 'Giảng viên là các thạc sĩ, tiến sĩ có kinh nghiệm giảng dạy và nghiên cứu trong lĩnh vực CNTT.' },
            { icon: FiCheckCircle, title: 'Tỉ lệ đậu cao', desc: 'Tỉ lệ đậu chứng chỉ đạt trên 95%, nhờ chương trình đào tạo bài bản và sát với đề thi thực tế.' },
          ].map((item, i) => (
            <div key={i} className="card" style={{ padding: 24 }}>
              <div className="client-icon-surface" style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <item.icon size={20} />
              </div>
              <h3 style={{ fontSize: '1rem', marginBottom: 8 }}>{item.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="card about-process-card" style={{ marginTop: 24, padding: 28 }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: 18 }}>Quy trình hỗ trợ học viên</h2>
          <div className="about-process-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
            {['Tư vấn chứng chỉ phù hợp', 'Đăng ký và theo dõi hồ sơ', 'Thi, tra cứu và nhận kết quả'].map((text, i) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
                <strong>{text}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="about-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
          <div className="card about-detail-card" style={{ padding: 28 }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
              <FiMonitor /> Lĩnh vực đào tạo và sát hạch
            </h2>
            <div style={{ display: 'grid', gap: 14 }}>
              {[
                'Chứng chỉ ứng dụng CNTT cơ bản và nâng cao.',
                'Các mô đun Word, Excel, PowerPoint theo nhu cầu học viên.',
                'Tổ chức đăng ký, quản lý hồ sơ, tra cứu kết quả và hỗ trợ thanh toán trực tuyến.',
              ].map(item => (
                <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <FiCheckCircle style={{ flexShrink: 0, marginTop: 3 }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card about-detail-card about-detail-card-red" style={{ padding: 28 }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
              <FiShield /> Cam kết chất lượng
            </h2>
            <div style={{ display: 'grid', gap: 14 }}>
              {[
                'Thông tin hồ sơ được tiếp nhận minh bạch, đúng quy trình.',
                'Lịch thi, lệ phí và trạng thái hồ sơ được cập nhật rõ ràng.',
                'Đội ngũ hỗ trợ theo sát học viên trước, trong và sau kỳ thi.',
              ].map(item => (
                <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <FiCheckCircle style={{ flexShrink: 0, marginTop: 3 }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="about-timeline-card card" style={{ marginTop: 24, padding: 28 }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: 18 }}>Hành trình đăng ký tại SDC</h2>
          <div className="about-timeline-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16 }}>
            {[
              { icon: FiFileText, title: 'Nộp hồ sơ', desc: 'Học viên điền thông tin đăng ký online.' },
              { icon: FiUsers, title: 'Tư vấn xác nhận', desc: 'Nhân sự trung tâm kiểm tra và liên hệ hỗ trợ.' },
              { icon: FiClock, title: 'Sắp xếp lịch', desc: 'Hồ sơ được phân đợt thi hoặc lớp học phù hợp.' },
              { icon: FiAward, title: 'Nhận kết quả', desc: 'Theo dõi trạng thái, kết quả và chứng chỉ.' },
            ].map(item => (
              <div key={item.title} className="about-timeline-item">
                <div className="client-icon-surface" style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <item.icon size={20} />
                </div>
                <h3 style={{ fontSize: '1rem', marginBottom: 6 }}>{item.title}</h3>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
