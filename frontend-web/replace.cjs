const fs = require('fs');
const path = require('path');

const dir = 'c:/Frontend/smart-travel/frontend-web/src';

function walk(dir, callback) {
    fs.readdir(dir, function(err, list) {
        if (err) return callback(err);
        let pending = list.length;
        if (!pending) return callback(null);
        list.forEach(function(file) {
            file = path.resolve(dir, file);
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function(err) {
                        if (!--pending) callback(null);
                    });
                } else {
                    if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.css')) {
                        let content = fs.readFileSync(file, 'utf8');
                        let changed = false;
                        
                        // "Điểm đến" -> "Địa điểm"
                        const regex1 = /Điểm đến/g;
                        if (regex1.test(content)) {
                            content = content.replace(regex1, 'Địa điểm');
                            changed = true;
                        }
                        
                        // "điểm đến" -> "địa điểm"
                        const regex2 = /điểm đến/g;
                        if (regex2.test(content)) {
                            content = content.replace(regex2, 'địa điểm');
                            changed = true;
                        }
                        
                        // "ĐIỂM ĐẾN" -> "ĐỊA ĐIỂM"
                        const regex3 = /ĐIỂM ĐẾN/g;
                        if (regex3.test(content)) {
                            content = content.replace(regex3, 'ĐỊA ĐIỂM');
                            changed = true;
                        }

                        if (changed) {
                            fs.writeFileSync(file, content, 'utf8');
                            console.log('Updated:', file);
                        }
                    }
                    if (!--pending) callback(null);
                }
            });
        });
    });
}

walk(dir, function(err) {
    if (err) throw err;
    console.log('Done!');
});
