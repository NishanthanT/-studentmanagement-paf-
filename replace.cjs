const fs = require('fs');
const path = require('path');
const dir = 'src/services';
fs.readdirSync(dir).forEach(file => {
  if (!file.endsWith('.js')) return;
  const p = path.join(dir, file);
  let content = fs.readFileSync(p, 'utf8');
  // It transformed: `http://${window.location.hostname}:8080/api/v1/auth/';
  // We need to replace the last quote with a backtick if it starts with a backtick
  content = content.replace(/(`http:\/\/\$\{window\.location\.hostname\}:8080[^'"]*)['"]/g, '$1`');
  fs.writeFileSync(p, content);
  console.log('Fixed quotes in', p);
});
