const fs = require('fs');
const files = ['src/pages/roles/manager/Manager.jsx', 'src/pages/roles/client/Client.jsx', 'src/pages/roles/employee/Employee.jsx', 'src/pages/roles/admin/Admin.jsx'];
files.forEach(path => {
  let content = fs.readFileSync(path, 'utf8');
  let lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('function Stat(')) {
      if (lines[i].includes('export function')) {
        lines[i] = 'export function Stat({ icon, label, value, note, tone = "", onClick }) { return <div className={`stat-card ${onClick ? "actionable" : ""}`} onClick={onClick}><span className={`stat-icon ${tone}`}>{icon || "✦"}</span><div><span className="stat-label">{label}</span><strong>{value}</strong><small>{note}</small></div></div> }';
      } else {
        lines[i] = 'function Stat({ icon, label, value, note, tone = "", onClick }) { return <div className={`stat-card ${onClick ? "actionable" : ""}`} onClick={onClick}><span className={`stat-icon ${tone}`}>{icon || "✦"}</span><div><span className="stat-label">{label}</span><strong>{value}</strong><small>{note}</small></div></div> }';
      }
    }
  }
  fs.writeFileSync(path, lines.join('\n'));
});
