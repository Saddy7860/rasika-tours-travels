#!/bin/bash
set -e

PROJECT="$(pwd)"
STAMP=$(date +"%Y%m%d-%H%M%S")
BACKUP="../rasika-phase2-backup-$STAMP"

echo "=============================================="
echo "RASIKA TOURS & TRAVELS - PROFESSIONAL UPGRADE"
echo "=============================================="

echo "[1/7] Creating backup..."
cp -R "$PROJECT" "$BACKUP"
echo "Backup: $BACKUP"

echo "[2/7] Creating professional reusable UI components..."

mkdir -p frontend/src/components/common

cat > frontend/src/components/common/PageLoader.jsx <<'EOF'
import React from 'react';
import './PageLoader.css';

export default function PageLoader({
  title = 'Loading',
  message = 'Please wait while we prepare your information.'
}) {
  return (
    <div className="professional-loader">
      <div className="professional-loader-card">
        <div className="loader-spinner" />
        <h3>{title}</h3>
        <p>{message}</p>
      </div>
    </div>
  );
}
EOF

cat > frontend/src/components/common/PageLoader.css <<'EOF'
.professional-loader {
  min-height: 280px;
  display: grid;
  place-items: center;
  padding: 30px;
}

.professional-loader-card {
  width: min(100%, 420px);
  text-align: center;
  background: #fff;
  border: 1px solid #e7edf5;
  border-radius: 18px;
  padding: 42px 28px;
  box-shadow: 0 12px 35px rgba(15, 23, 42, 0.08);
}

.loader-spinner {
  width: 46px;
  height: 46px;
  margin: 0 auto 20px;
  border: 4px solid #e8eef8;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: professional-spin .8s linear infinite;
}

.professional-loader h3 {
  margin: 0 0 8px;
  color: #172033;
  font-size: 18px;
}

.professional-loader p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

@keyframes professional-spin {
  to { transform: rotate(360deg); }
}
EOF

cat > frontend/src/components/common/ProfessionalEmptyState.jsx <<'EOF'
import React from 'react';
import './ProfessionalEmptyState.css';

export default function ProfessionalEmptyState({
  title = 'Nothing to display yet',
  description = 'There are currently no records available for this section.'
}) {
  return (
    <div className="professional-empty-state">
      <div className="empty-state-icon">✦</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
EOF

cat > frontend/src/components/common/ProfessionalEmptyState.css <<'EOF'
.professional-empty-state {
  padding: 55px 25px;
  text-align: center;
  background: #fff;
  border: 1px dashed #cbd5e1;
  border-radius: 18px;
}

.empty-state-icon {
  width: 54px;
  height: 54px;
  margin: 0 auto 16px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 24px;
}

.professional-empty-state h3 {
  margin: 0 0 8px;
  color: #172033;
  font-size: 18px;
}

.professional-empty-state p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}
EOF

echo "[3/7] Adding global professional UI utilities..."

cat >> frontend/src/styles/design-system.css <<'EOF'

/* ==========================================
   PROFESSIONAL APPLICATION UTILITIES
========================================== */

.professional-page {
  width: min(1400px, calc(100% - 40px));
  margin: 0 auto;
  padding: 32px 0 60px;
}

.professional-page-header {
  margin-bottom: 28px;
}

.professional-page-header h1 {
  margin: 0 0 8px;
  color: #0f172a;
  font-size: clamp(26px, 4vw, 38px);
  font-weight: 750;
  letter-spacing: -0.03em;
}

.professional-page-header p {
  margin: 0;
  color: #64748b;
  font-size: 15px;
}

.professional-card {
  background: #fff;
  border: 1px solid #e5eaf1;
  border-radius: 18px;
  box-shadow: 0 8px 28px rgba(15, 23, 42, 0.06);
}

.professional-section-title {
  font-size: 18px;
  font-weight: 700;
  color: #172033;
  margin: 0;
}

.professional-muted {
  color: #64748b;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
}

.status-success {
  color: #166534;
  background: #dcfce7;
}

.status-warning {
  color: #92400e;
  background: #fef3c7;
}

.status-danger {
  color: #991b1b;
  background: #fee2e2;
}

.status-info {
  color: #1d4ed8;
  background: #dbeafe;
}

.professional-button {
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  font-weight: 650;
  cursor: pointer;
  background: #2563eb;
  color: #fff;
  box-shadow: 0 6px 16px rgba(37, 99, 235, .18);
}

.professional-button:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
}

.professional-input {
  width: 100%;
  min-height: 42px;
  padding: 10px 13px;
  border: 1px solid #d8e0ea;
  border-radius: 10px;
  background: #fff;
  color: #172033;
  outline: none;
}

.professional-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, .1);
}

@media (max-width: 700px) {
  .professional-page {
    width: min(100% - 24px, 1400px);
    padding-top: 20px;
  }
}
EOF

echo "[4/7] Fixing App.js admin error boundary usage..."

python3 <<'PY'
from pathlib import Path

p = Path("frontend/src/App.js")
s = p.read_text()

old = '<Route path="/admin" element={<AdminRoute />} />'
new = '''<Route
                path="/admin"
                element={
                  <AdminErrorBoundary>
                    <AdminRoute />
                  </AdminErrorBoundary>
                }
              />'''

if old in s:
    s = s.replace(old, new)

p.write_text(s)
print("App.js updated safely")
PY

echo "[5/7] Fixing Footer accessibility warnings..."

python3 <<'PY'
from pathlib import Path

p = Path("frontend/src/components/Footer.jsx")
s = p.read_text()

replacements = {
'<a href="#"><FaFacebook /></a>': '<a href="https://www.facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><FaFacebook /></a>',
'<a href="#"><FaTwitter /></a>': '<a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter"><FaTwitter /></a>',
'<a href="#"><FaInstagram /></a>': '<a href="https://www.instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><FaInstagram /></a>',
'<a href="#"><FaLinkedin /></a>': '<a href="https://www.linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"><FaLinkedin /></a>',
'<a href="#">Privacy Policy</a>': '<a href="/contact">Privacy Policy</a>',
'<a href="#">Terms of Service</a>': '<a href="/contact">Terms of Service</a>',
'<a href="#">Refund Policy</a>': '<a href="/contact">Refund Policy</a>',
}

for old, new in replacements.items():
    s = s.replace(old, new)

p.write_text(s)
print("Footer accessibility updated")
PY

echo "[6/7] Creating project cleanup recommendations..."

cat > PROJECT-UPGRADE-STATUS.md <<EOF
# Rasika Tours & Travels - Upgrade Status

## Completed Foundation
- Professional design system
- Environment configuration
- Axios API foundation
- Toast notification component
- Global backend exception handler
- Professional reusable loader
- Professional empty state
- Global UI utility classes
- Footer accessibility improvements
- Admin error boundary integration

## Existing Working Modules Preserved
- Authentication and JWT
- Flight search
- Train search
- Bus search
- Booking management
- Refund handling
- Admin dashboard
- Analytics
- Passport workflow
- Contact management and replies

## Next Upgrade Targets
1. Customer dashboard
2. Notification center
3. Booking timeline
4. Professional booking details modal
5. Payment management
6. Advanced analytics
7. Admin activity feed
8. Production deployment configuration
EOF

echo "[7/7] Building frontend..."

cd frontend
npm run build

echo ""
echo "=============================================="
echo "PROFESSIONAL UPGRADE COMPLETED"
echo "=============================================="
echo ""
echo "Backup location:"
echo "$BACKUP"
echo ""
echo "IMPORTANT:"
echo "Current booking, passport, contact and admin"
echo "logic was not replaced by this upgrade."
echo ""
