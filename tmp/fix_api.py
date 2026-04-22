
import os

file_path = r'd:\Web_SDC\src\services\api.js'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    new_lines.append(line)
    if 'activityClassId: parsed.activityClassId || parsed.classId,' in line:
        indent = line[:line.find('activityClassId')]
        new_lines.append(f'{indent}subjectId: parsed.subjectId,\n')

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
print("Done")
