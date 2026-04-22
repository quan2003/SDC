
import os

file_path = r'd:\Web_SDC\src\services\api.js'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    new_lines.append(line)
    if "certificateId: 'certificate_id', certificate_id: 'certificate_id'," in line:
        indent = line[:line.find('certificateId')]
        new_lines.append(f"{indent}subject_id: 'subject_id', subjectId: 'subject_id',\n")
        new_lines.append(f"{indent}instructor_id: 'instructor_id', instructorId: 'instructor_id',\n")

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
print("Done")
