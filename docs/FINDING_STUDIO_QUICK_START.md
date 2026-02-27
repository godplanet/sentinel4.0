# Finding Studio - Quick Start Guide

**5-Minute Setup for Developers**

---

## What is Finding Studio?

The **Finding Studio** is a premium document editing experience for audit findings. Think of it as:
- **Notion** (for document editing)
- **+** **Linear** (for workflow states)
- **+** **Figma** (for glassmorphism UI)
- **=** Finding Studio

---

## Quick Access

**URL:** `http://localhost:5173/execution/findings/1`

**Navigation Path:**
1. Dashboard → Execution → Finding Hub
2. Click any finding card
3. Opens in Finding Studio

---

## File Locations

```
src/
├── pages/execution/
│   └── FindingStudioPage.tsx          # 🎯 Main route
└── widgets/FindingStudio/
    ├── FindingPaper.tsx               # 📄 The document
    ├── FindingSidebar.tsx             # 🔧 The context panel
    └── WorkflowStepper.tsx            # ⚡ The progress bar
```

**Want to modify?**
- **Layout** → `FindingStudioPage.tsx`
- **Document content** → `FindingPaper.tsx`
- **Sidebar tabs** → `FindingSidebar.tsx`
- **Workflow stages** → `WorkflowStepper.tsx`

---

## The 3 Main Components

### 1. The Paper (Center)

```tsx
<FindingPaper finding={mockData} />
```

**What it shows:**
- Title + metadata
- AI Executive Summary (purple banner)
- 5C sections: Kriter, Tespit, Risk, Kök Neden, Öneri
- Action plan with assignees
- Evidence attachments

**Styling:**
- `bg-white rounded-2xl shadow-2xl`
- Max width: `max-w-4xl`
- Deep shadows for "paper" effect

### 2. The Sidebar (Right)

```tsx
<FindingSidebar
  finding={mockData}
  activeTab="detay"
  onTabChange={setActiveTab}
/>
```

**4 Tabs:**
1. **Detay** - Auditor, status, metadata
2. **Tarihçe** - Timeline of events
3. **AI** - 85% similarity analysis
4. **Yorum** - Comments (empty state)

**Styling:**
- `bg-white/90 backdrop-blur-xl`
- Sticky position: `sticky top-32`
- Glass effect with blur

### 3. The Stepper (Top)

```tsx
<WorkflowStepper currentStatus="draft" />
```

**5 Stages:**
1. TASLAK → Draft
2. GÖZDEN GEÇİRME → Review
3. MUTABAKAT → Negotiation
4. TAKİP → Tracking
5. KAPANIŞ → Closure

**Colors:**
- Completed: Blue-600 ✓
- Active: Blue→Purple gradient ⏰
- Pending: Slate-200 ○

---

## Mock Data Structure

```typescript
const MOCK_FINDING = {
  id: 'AUD-2025-BR-64',
  title: 'Kasa İşlemlerinde Çift Anahtar Kuralı İhlali',
  status: 'draft',
  risk_level: 'critical',
  financial_impact: '1.250.000 TL',

  sections: {
    ai_summary: '...',
    criteria: { ... },
    finding: { ... },
    risk: { ... },
    recommendation: { ... }
  },

  action_plan: {
    assignee: { name: 'Mehmet Yılmaz', ... },
    steps: [ ... ]
  },

  related_findings: [ ... ],
  timeline: [ ... ],
  ai_similarity: { percentage: 85, ... }
};
```

**Where to find it:**
- Location: `FindingStudioPage.tsx` (lines 11-99)
- Matches screenshot data exactly

---

## Customization Guide

### Change Background Color

**File:** `FindingStudioPage.tsx`

```tsx
// Current
<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">

// Warmer tone
<div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/30 to-slate-100">
```

### Add a New Section

**File:** `FindingPaper.tsx`

```tsx
<Section
  icon={YourIcon}
  title="YENİ BÖLÜM"
  iconColor="text-blue-600"
>
  <p>Your content here</p>
</Section>
```

### Add a New Tab

**File:** `FindingSidebar.tsx`

```tsx
// 1. Add to TABS array
const TABS = [
  { key: 'detay', label: 'Detay', icon: FileText },
  { key: 'dosyalar', label: 'Dosyalar', icon: Paperclip }, // New!
];

// 2. Add tab content
{activeTab === 'dosyalar' && <DosyalarTab finding={finding} />}
```

### Change Workflow Stages

**File:** `WorkflowStepper.tsx`

```tsx
const WORKFLOW_STAGES = [
  { key: 'draft', label: 'TASLAK' },
  { key: 'review', label: 'GÖZDEN GEÇİRME' },
  // Add your custom stage here
  { key: 'approval', label: 'ONAY' },
];
```

---

## Common Tasks

### Task 1: Connect to Real Data

**Replace mock data with Supabase query:**

```tsx
// FindingStudioPage.tsx
import { supabase } from '@/shared/api/supabase';

export default function FindingStudioPage() {
  const { id } = useParams();
  const [finding, setFinding] = useState(null);

  useEffect(() => {
    async function loadFinding() {
      const { data } = await supabase
        .from('audit_findings')
        .select('*')
        .eq('id', id)
        .single();

      setFinding(data);
    }
    loadFinding();
  }, [id]);

  if (!finding) return <div>Loading...</div>;

  return <FindingPaper finding={finding} />;
}
```

### Task 2: Implement Save

```tsx
const handleSave = async () => {
  const { error } = await supabase
    .from('audit_findings')
    .update({
      title: finding.title,
      sections: finding.sections
    })
    .eq('id', finding.id);

  if (!error) {
    toast.success('Kaydedildi!');
  }
};

<button onClick={handleSave}>Kaydet</button>
```

### Task 3: Add Rich Text Editor

```tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

function RichTextSection() {
  const editor = useEditor({
    extensions: [StarterKit],
    content: finding.sections.finding.content
  });

  return <EditorContent editor={editor} />;
}
```

### Task 4: Add Comments

```tsx
// In FindingSidebar.tsx -> YorumTab
function YorumTab({ finding }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const addComment = async () => {
    const { data } = await supabase
      .from('finding_comments')
      .insert({
        finding_id: finding.id,
        comment: newComment
      })
      .select();

    setComments([...comments, data[0]]);
    setNewComment('');
  };

  return (
    <div>
      {comments.map(c => (
        <div key={c.id}>{c.comment}</div>
      ))}
      <textarea value={newComment} onChange={e => setNewComment(e.target.value)} />
      <button onClick={addComment}>Ekle</button>
    </div>
  );
}
```

---

## Styling Tips

### Paper Shadow Effect

```css
/* Current */
shadow-2xl

/* More dramatic */
shadow-2xl shadow-slate-300/50

/* Softer */
shadow-xl shadow-slate-200/80
```

### Glassmorphism Sidebar

```css
/* Current */
bg-white/90 backdrop-blur-xl

/* More transparent */
bg-white/70 backdrop-blur-2xl

/* Less blur (better for VDI) */
bg-white/95 backdrop-blur-md
```

### Risk Badge Colors

```tsx
// Current
<span className="bg-red-600 text-white">KRİTİK</span>

// With glow effect
<span className="bg-red-600 text-white shadow-lg shadow-red-500/50">
  KRİTİK
</span>
```

---

## Keyboard Shortcuts (Future)

**Planned shortcuts:**

| Key           | Action                |
|---------------|-----------------------|
| `Cmd + S`     | Save finding          |
| `Cmd + K`     | Open command palette  |
| `Cmd + /`     | Toggle comments       |
| `Esc`         | Exit to Finding Hub   |
| `Tab`         | Next section          |
| `Shift + Tab` | Previous section      |

**Implementation:**

```tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

---

## Debugging

### Problem: Sidebar not sticking

**Check:**
```tsx
// FindingSidebar.tsx
<div className="sticky top-32"> {/* ← Must have this */}
```

**Parent must allow scrolling:**
```tsx
// FindingStudioPage.tsx
<div className="overflow-auto"> {/* ← Parent container */}
```

### Problem: Workflow stepper not updating

**Check status mapping:**
```tsx
// WorkflowStepper.tsx
const WORKFLOW_STAGES = [
  { key: 'draft', label: 'TASLAK' }, // ← 'draft' must match finding.status
];
```

### Problem: Glass effect not working

**Browser support:**
- Chrome/Edge: ✅ Works
- Firefox: ✅ Works (v103+)
- Safari: ✅ Works (needs -webkit prefix, Tailwind handles this)

**Fallback for old browsers:**
```tsx
// Add solid background fallback
className="bg-white backdrop-blur-xl
           supports-[backdrop-filter]:bg-white/90"
```

---

## Performance Tips

### 1. Lazy Load Tabs

```tsx
const DetayTab = lazy(() => import('./tabs/DetayTab'));
const AITab = lazy(() => import('./tabs/AITab'));

// In render
{activeTab === 'detay' && (
  <Suspense fallback={<Spinner />}>
    <DetayTab />
  </Suspense>
)}
```

### 2. Debounce Auto-Save

```tsx
import { useDebouncedCallback } from 'use-debounce';

const debouncedSave = useDebouncedCallback(
  (data) => {
    supabase.from('audit_findings').update(data);
  },
  1000 // Save after 1 second of no changes
);
```

### 3. Optimize Images

```tsx
// Use next-gen formats
<img
  src="/avatar.webp"
  loading="lazy"
  decoding="async"
/>
```

---

## Testing

### Unit Tests

```tsx
// FindingPaper.test.tsx
import { render } from '@testing-library/react';

test('renders finding title', () => {
  const finding = { title: 'Test Finding' };
  const { getByText } = render(<FindingPaper finding={finding} />);
  expect(getByText('Test Finding')).toBeInTheDocument();
});
```

### Visual Regression

```tsx
// Use Storybook
export const Default = () => (
  <FindingStudioPage />
);

export const WithCriticalRisk = () => (
  <FindingStudioPage finding={{ ...mock, risk_level: 'critical' }} />
);
```

---

## Deployment

### Build Check

```bash
npm run build
```

**Expected output:**
```
✓ 4501 modules transformed
dist/assets/index-XXX.js   4,113.93 KB
```

### Environment Variables

```env
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

---

## Resources

### Documentation
- `FINDING_STUDIO_DESIGN.md` - Complete design spec
- `MODULE_5_FINAL_UPDATE.md` - Feature requirements
- `FINDING_LIFECYCLE_WORKFLOW.md` - Workflow states

### UI Libraries Used
- Tailwind CSS 3.4.1
- Lucide React 0.344.0
- Framer Motion 12.29.2 (for animations)

### Inspiration
- [Notion](https://notion.so) - Document editing
- [Linear](https://linear.app) - Workflow states
- [Figma](https://figma.com) - Glassmorphism UI

---

## FAQ

**Q: Can I change the workflow stages?**
A: Yes! Edit `WORKFLOW_STAGES` in `WorkflowStepper.tsx`

**Q: How do I add a new tab?**
A: Add to `TABS` array in `FindingSidebar.tsx` and create the tab component

**Q: Where's the data stored?**
A: Currently mock data. Connect to `audit_findings` table in Supabase

**Q: Can I use this for other document types?**
A: Yes! It's a generic document layout. Just pass different data structure

**Q: Why glassmorphism?**
A: Creates visual hierarchy, separates context from content, modern aesthetic

**Q: Will it work on mobile?**
A: Responsive layout planned for Phase 2. Currently optimized for desktop (1800px+)

---

## Next Steps

1. **Try it:** Visit `/execution/findings/1`
2. **Customize:** Change colors, add sections
3. **Connect:** Hook up to Supabase
4. **Extend:** Add editing, comments, AI features

---

**Happy coding!** 🚀

**Questions?** Check `FINDING_STUDIO_DESIGN.md` or the component source code.
