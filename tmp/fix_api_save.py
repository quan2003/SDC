
import os

file_path = r'd:\Web_SDC\src\services\api.js'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    new_lines.append(line)
    if "certificate_id: payload.certificate_id || payload.certificateId || null," in line:
        indent = line[:line.find('certificate_id')]
        new_lines.append(f"{indent}subject_id: payload.subject_id || payload.subjectId || null,\n")
        new_lines.append(f"{indent}instructor_id: payload.instructor_id || payload.instructorId || null,\n")

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
print("Done")
