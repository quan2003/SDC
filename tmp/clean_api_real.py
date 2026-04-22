
import os

file_path = r'd:\Web_SDC\src\services\api.js'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

import re

# Clean up getAll
text = re.sub(r"// Standardize certificate_classes response & Decode Instructor.*?if \(tableName === 'certificate_classes'\) \{.*?results = results.map\(item => \{.*?return \{.*?\};\s+\}\);", 
r"""// Standardize certificate_classes response
      if (tableName === 'certificate_classes') {
        results = results.map(item => ({
          ...item,
          subjectId: item.subject_id || item.certificate_id,
          subject_id: item.subject_id || item.certificate_id,
          instructorId: item.instructor_id,
          certificateId: item.certificate_id,
          startDate: item.start_date,
          endDate: item.end_date,
          maxStudents: item.max_students,
          currentStudents: item.current_students
        }));
      }""", text, flags=re.DOTALL)

# Clean up Create
text = re.sub(r"\} else if \(tableName === 'certificate_classes'\) \{.*?// Vì DB không có cột instructor_id.*?dbPayload = \{.*?\};\s+\}", 
r"""} else if (tableName === 'certificate_classes') {
      dbPayload = {
        code: payload.code,
        name: payload.name,
        subject_id: payload.subject_id || payload.subjectId || payload.certificate_id || payload.certificateId || null,
        instructor_id: payload.instructor_id || payload.instructorId || null,
        start_date: payload.start_date || payload.startDate || null,
        end_date: payload.end_date || payload.endDate || null,
        max_students: payload.max_students || payload.maxStudents || 40,
        current_students: payload.current_students || payload.currentStudents || 0,
        fee: payload.fee || 0,
        status: payload.status || 'upcoming'
      };
    }""", text, flags=re.DOTALL)

# Clean up Update
text = re.sub(r"\} else if \(tableName === 'certificate_classes'\) \{.*?// Fix: DB không có instructor_id.*?\}\s+const \{ data", 
r"""} else if (tableName === 'certificate_classes') {
      dbPayload = {};
      const map = {
        code: 'code', name: 'name', 
        subject_id: 'subject_id', subjectId: 'subject_id',
        instructor_id: 'instructor_id', instructorId: 'instructor_id',
        certificateId: 'certificate_id', certificate_id: 'certificate_id',
        startDate: 'start_date', start_date: 'start_date',
        endDate: 'end_date', end_date: 'end_date',
        maxStudents: 'max_students', max_students: 'max_students',
        currentStudents: 'current_students', current_students: 'current_students',
        fee: 'fee', status: 'status'
      };
      
      Object.keys(payload).forEach(key => {
        if (map[key]) dbPayload[map[key]] = payload[key];
      });
    }

    const { data, error } = await supabase.from(tableName).update(dbPayload).eq('id', id).select();""", text, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)
print("Done")
