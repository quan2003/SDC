const fs = require('fs');
const path = require('path');

const directory = 'd:\\Web_SDC\\src\\pages\\admin';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.jsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(directory);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Remove direct mock passing to useState: useState(mockData), useState([...mockData])
    content = content.replace(/useState\(\s*mock[A-Za-z0-9_]+\s*\)/g, 'useState([])');
    content = content.replace(/useState\(\s*\[\s*\.\.\.mock[A-Za-z0-9_]+\s*\]\s*\)/g, 'useState([])');
    
    // Specifically for ExamRoomPage selectedBatch
    content = content.replace(/useState\(mockExamSessions\[0\]\?\.id \|\| 1\)/g, 'useState(1)');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed ' + file);
    }
});
