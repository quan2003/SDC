
import os

file_path = r'd:\Web_SDC\src\services\api.js'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# REVERT everything and fix intelligently
import re

# Fix Create logic
create_block = r"\} else if \(tableName === 'certificate_classes'\) \{(.*?)\s+cur"
def fix_create(m):
    return """} else if (tableName === 'certificate_classes') {
      // Vì DB không có cột instructor_id, ta lưu vào trường name bằng separator |
      const instructorId = payload.instructor_id || payload.instructorId || '';
      dbPayload = {
        code: payload.code,
        name: instructorId ? `${payload.name}|${instructorId}` : payload.name,
        certificate_id: payload.subject_id || payload.subjectId || payload.certificate_id || payload.certificateId || null,
        start_date: payload.start_date || payload.startDate || null,
        end_date: payload.end_date || payload.endDate || null,
        max_students: payload.max_students || payload.maxStudents || 40,
        current_students: payload.current_students || payload.currentStudents || 0,
        fee: payload.fee || 0,
        status: payload.status || 'upcoming'
      };
      """

text = re.sub(r"\} else if \(tableName === 'certificate_classes'\) \{.*?dbPayload = \{.*?certificate_id:.*?\};", fix_create, text, flags=re.DOTALL)

# Fix Update logic
update_block = r"\} else if \(tableName === 'certificate_classes'\) \{(.*?)\s+const \{ data"
def fix_update(m):
    return """} else if (tableName === 'certificate_classes') {
      // Fix: DB không có instructor_id, lồng vào trường name nếu có thay đổi
      dbPayload = {};
      const map = {
        code: 'code', name: 'name', 
        startDate: 'start_date', start_date: 'start_date',
        endDate: 'end_date', end_date: 'end_date',
        maxStudents: 'max_students', max_students: 'max_students',
        currentStudents: 'current_students', current_students: 'current_students',
        fee: 'fee', status: 'status'
      };
      
      Object.keys(payload).forEach(key => {
        if (map[key]) dbPayload[map[key]] = payload[key];
      });
      
      // Map Subject -> Certificate
      const subId = payload.subject_id || payload.subjectId || payload.certificate_id || payload.certificateId;
      if (subId) dbPayload.certificate_id = subId;
      
      // Handle virtual Instructor mapping into name
      if (payload.name || payload.instructor_id || payload.instructorId) {
          const finalName = payload.name || '';
          const finalIns = payload.instructor_id || payload.instructorId || '';
          dbPayload.name = finalIns ? `${finalName}|${finalIns}` : finalName;
      }
      """

text = re.sub(r"\} else if \(tableName === 'certificate_classes'\) \{.*?Object.keys\(payload\).forEach\(key => \{.*?\}\);(.*?)?\}", fix_update, text, flags=re.DOTALL)

# Fix getAll logic to PARSE virtual fields
get_all_block = r"return data \|\| \[\];"
def fix_get_all(m):
    return """const results = data || [];
      if (tableName === 'certificate_classes') {
          return results.map(item => {
              const [realName, insId] = (item.name || '').split('|');
              return { 
                  ...item, 
                  name: realName, 
                  instructor_id: insId || '', 
                  instructorId: insId || '',
                  subject_id: item.certificate_id,
                  subjectId: item.certificate_id
              };
          });
      }
      return results;"""

text = re.sub(r"return data \|\| \[\];", fix_get_all, text)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)
print("Done")
