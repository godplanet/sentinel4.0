# Module 11: Sentinel Voice - Incident Reporting (Whistleblowing)

## Overview

Sentinel Voice is a secure, anonymous incident reporting system (whistleblowing portal) that allows employees and stakeholders to report unethical behavior, fraud, security incidents, and HR violations in a safe and confidential manner.

## Architecture

### Database Schema

#### `incidents` Table
Stores all incident reports:
- **id**: Unique identifier
- **title**: Incident title (brief description)
- **description**: Detailed description of the incident
- **category**: Dolandırıcılık | Etik | IT | İK
- **reporter_id**: User ID (NULL if anonymous)
- **is_anonymous**: Boolean flag for anonymous reporting
- **status**: NEW | INVESTIGATING | CLOSED | RESOLVED
- **tenant_id**: Multi-tenant isolation
- **created_at**: Report timestamp
- **updated_at**: Last update timestamp

### Entity Layer (`src/entities/incident/`)

**Types** (`model/types.ts`):
- `IncidentCategory`: 'Dolandırıcılık' | 'Etik' | 'IT' | 'İK'
- `IncidentStatus`: 'NEW' | 'INVESTIGATING' | 'CLOSED' | 'RESOLVED'
- `Incident`: Main incident interface
- `CreateIncidentInput`: Input for creating incidents

**API** (`api/index.ts`):
- `fetchIncidents()`: Get all incidents
- `fetchIncident(id)`: Get single incident
- `createIncident(input)`: Create new incident report
- `updateIncident(id, updates)`: Update incident status
- `deleteIncident(id)`: Remove incident
- `getIncidentStats()`: Get statistics by status and category

## Features

### 1. Public Reporting Portal (`/portal/report`)

**Widget**: `IncidentPortal` (`src/widgets/IncidentPortal/`)

**Visual Design:**
- Clean, trustworthy white/blue color scheme
- Gradient header (blue-600 to blue-700)
- Shield icon for security emphasis
- Encrypted communication messaging
- Professional, non-threatening interface

**Form Fields:**
1. **Olay Başlığı** (Title)
   - Short, descriptive title
   - Required field
   - Plain text input

2. **Detaylı Açıklama** (Description)
   - 6-row textarea
   - Minimum 50 characters recommended
   - Placeholder with guidance questions
   - Required field

3. **Kategori** (Category)
   - Dropdown select
   - Options:
     - Dolandırıcılık (Fraud)
     - Etik İhlal (Ethics Violation)
     - Bilgi Teknolojileri (IT Security)
     - İnsan Kaynakları (HR Issues)

4. **Anonim Gönder** (Anonymous Toggle)
   - Toggle switch (Default: ON)
   - Visual icons (EyeOff/Eye)
   - Clear explanation of anonymity
   - When ON: reporter_id is NULL

**Security Features:**
- Blue information banner highlighting privacy protection
- "Gizliliğiniz Korunur" (Your privacy is protected)
- Encrypted transmission messaging
- Lock icon for trust indication
- Footer disclaimer about data security

**User Experience:**
- "Güvenli Gönder" (Secure Send) button
- Loading state during submission
- Success screen with:
  - Green checkmark animation
  - "Bildiriminiz Alındı" confirmation
  - Random reference number for tracking
  - Auto-dismiss after 5 seconds
- Error handling with clear messages
- Form validation

### 2. Admin Management Portal (`/admin/incidents`)

**Page**: `IncidentsManagementPage` (`src/pages/admin/incidents/`)

**Dashboard Metrics:**
- Total incidents count
- New incidents (blue)
- Under investigation (amber)
- Resolved incidents (green)

**Filtering & Search:**
- Full-text search (title and description)
- Status filter dropdown (All/New/Investigating/Resolved/Closed)
- Real-time filtering

**Incident Cards:**
- Title and category badge
- Anonymous indicator (Shield icon)
- Full description
- Creation timestamp (Turkish locale)
- Status badge with color coding:
  - NEW: Blue
  - INVESTIGATING: Amber
  - CLOSED: Grey
  - RESOLVED: Green

**Status Management:**
- NEW → "İncele" button → INVESTIGATING
- INVESTIGATING → "Çözüldü" button → RESOLVED
- INVESTIGATING → "Kapat" button → CLOSED
- Color-coded action buttons

**Category Color Coding:**
- Dolandırıcılık: Red
- Etik: Purple
- IT: Blue
- İK: Green

### 3. Informational Content

**Reporting Guide** (Bottom of portal):
Four-card grid explaining when to report:

1. **Dolandırıcılık** (Fraud)
   - Mali usulsüzlükler (Financial irregularities)
   - Zimmet (Embezzlement)
   - Sahtecilik (Forgery)

2. **Etik İhlaller** (Ethics Violations)
   - Çıkar çatışması (Conflict of interest)
   - Rüşvet (Bribery)
   - Ayrımcılık (Discrimination)

3. **IT Güvenliği** (IT Security)
   - Veri ihlalleri (Data breaches)
   - Yetkisiz erişim (Unauthorized access)
   - Siber güvenlik (Cybersecurity incidents)

4. **İK Sorunları** (HR Issues)
   - Taciz (Harassment)
   - Mobbing (Workplace bullying)
   - İş güvenliği ihlalleri (Safety violations)

## Security & Privacy

### Row Level Security (RLS)

**Public Access:**
```sql
CREATE POLICY "Anyone can create incidents"
  ON public.incidents FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
```

**Admin Access:**
- Authenticated users can view all incidents in their tenant
- Full CRUD permissions for incident management
- Tenant isolation enforced

### Anonymous Reporting

When `is_anonymous = true`:
- `reporter_id` is set to NULL
- No user identification stored
- Display "Anonim" badge in admin portal
- Shield icon indicator

### Data Protection

- All submissions encrypted in transit (HTTPS)
- Database-level encryption at rest
- Multi-tenant isolation via `tenant_id`
- Audit trail via `created_at` and `updated_at`

## Navigation

**Public Portal:**
- Sidebar → Yönetim (Management) → Olay Bildirimi (İhbar)
- Route: `/portal/report`
- Icon: ⚠️ AlertCircle

**Admin Management:**
- Sidebar → Yönetim (Management) → Bildirim Yönetimi
- Route: `/admin/incidents`
- Icon: 💬 MessageSquare

## Workflow

### Reporting Flow
1. User navigates to `/portal/report`
2. Reads information about types of incidents
3. Fills out form with incident details
4. Selects category (Dolandırıcılık/Etik/IT/İK)
5. Toggles anonymous mode (default ON)
6. Clicks "Güvenli Gönder"
7. Receives confirmation with reference number
8. Incident created with status "NEW"

### Investigation Flow
1. Admin navigates to `/admin/incidents`
2. Reviews dashboard metrics
3. Filters by status or searches
4. Clicks "İncele" on NEW incidents → Status: INVESTIGATING
5. Conducts investigation (external to system)
6. Clicks "Çözüldü" → Status: RESOLVED
7. Or clicks "Kapat" → Status: CLOSED

## UI Components

### Color Palette

**Portal (Public):**
- Background: Gradient from blue-50 to white to slate-50
- Primary: Blue-600, Blue-700 (trust, security)
- Header: Gradient blue-600 to blue-700
- Success: Green-100, Green-600
- Info: Blue-50, Blue-200

**Admin Panel:**
- Background: Gradient slate-50 to slate-100
- Cards: White with slate-200 borders
- Status badges: Color-coded by status
- Category badges: Color-coded by category

### Animation

**Success Screen:**
```typescript
<motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
/>
```

**Incident Cards:**
```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.05 }}
/>
```

## Best Practices

### For Users (Reporters)
1. Be specific and detailed in descriptions
2. Include dates, times, locations, and people involved
3. Use anonymous mode if concerned about retaliation
4. Save reference number for tracking
5. Provide evidence if available (future enhancement)

### For Administrators
1. Review NEW incidents within 24 hours
2. Change status to INVESTIGATING immediately when reviewing
3. Maintain confidentiality, especially for anonymous reports
4. Document investigation steps (external to system)
5. Close incidents with appropriate resolution status
6. Regular monitoring of dashboard metrics

## Related Modules

### Module 12: Policy Guardian
- Link incidents to policy violations
- Reference policies in incident descriptions
- Track policy attestations

### Module 13: Risk Quant
- Use incident data for risk scenarios
- Calculate incident-based losses
- Feed into VaR calculations

## Future Enhancements

1. **Email Notifications**
   - Alert compliance team on NEW incidents
   - Send reference number to reporter (if not anonymous)

2. **File Attachments**
   - Upload evidence (screenshots, documents)
   - Secure file storage

3. **Reference Number Tracking**
   - Public status check page
   - Track incident progress without login

4. **Multi-language Support**
   - English and Turkish interface
   - Language selector

5. **Advanced Search**
   - Date range filtering
   - Category grouping
   - Keyword tagging

6. **Integration with Findings**
   - Auto-create audit findings from incidents
   - Link incidents to audit engagements

7. **Analytics Dashboard**
   - Trend analysis
   - Category distribution charts
   - Time-to-resolution metrics
   - Heat map by department

8. **Two-Way Communication**
   - Secure messaging between reporter and investigator
   - Follow-up questions
   - Anonymous chat

## Compliance

Aligns with:
- BDDK Whistleblowing Requirements
- SOX Section 301 (Audit Committee)
- Dodd-Frank Whistleblower Protection
- EU Whistleblowing Directive (2019/1937)
- ISO 37002 Whistleblowing Management Systems

## Technical Stack

- **Frontend**: React + TypeScript + Framer Motion
- **Backend**: Supabase (PostgreSQL)
- **Security**: Row Level Security (RLS)
- **Encryption**: HTTPS (in transit), Database encryption (at rest)
- **Multi-tenant**: Tenant ID isolation

## Testing Checklist

- [ ] Anonymous submission works (reporter_id is NULL)
- [ ] Non-anonymous submission stores user ID
- [ ] Form validation works correctly
- [ ] Success screen displays reference number
- [ ] Admin can view all incidents
- [ ] Status transitions work correctly
- [ ] Search and filters function properly
- [ ] Category and status badges display correctly
- [ ] Responsive design on mobile devices
- [ ] Turkish language displays correctly
- [ ] RLS policies prevent cross-tenant access
