# Where Do Generated Reports Go? 📍

## Overview

When an examiner clicks "Print Now", the system generates reports in multiple locations for different purposes.

---

## 🗂️ Storage Locations

### 1. **Google Drive** (Permanent Storage)

**Location**: Google Drive folder specified by `GOOGLE_REPORT_FOLDER_ID`

**File Format**: Google Docs (.gdoc)

**Naming Convention**: `Report_[CaseNumber]_[Timestamp]`

Example: `Report_CASE-2025-001_1737340800000`

**Code Reference**: [src/lib/google-docs.ts:515-519](src/lib/google-docs.ts#L515-L519)

```typescript
const documentId = await copyTemplate(
  templateId,
  `Report_${data.caseNumber.replace(/\s+/g, "_")}_${Date.now()}`,
  folderId  // GOOGLE_REPORT_FOLDER_ID
);
```

**Purpose**:
- Permanent record keeping
- Audit trail
- Can be accessed/edited later via Google Drive
- Tracked by `googleDocId` in database

---

### 2. **Database** (Metadata Only)

**Location**: PostgreSQL database → `Report` table

**What's Stored**:
- `googleDocId` - Link to the Google Drive document
- All form field data (examiner name, dates, sections, etc.)
- Signature data
- Status flags (consent, acknowledgment, etc.)

**Code Reference**: [src/domains/reports/server/services/report.service.ts:349-354](src/domains/reports/server/services/report.service.ts#L349-L354)

```typescript
if (googleDocId) {
  await prisma.report.update({
    where: { bookingId },
    data: { googleDocId },
  });
}
```

**Purpose**:
- Quick lookup of report metadata
- Links to the actual Google Doc
- Form data persistence

---

### 3. **Client Browser** (Temporary - For PDF Print)

**Location**: Browser's print preview window

**File Format**: HTML (converted from Google Docs export)

**Lifetime**: Temporary - exists only during print dialog

**Code Flow**:
1. Server exports Google Doc as HTML
2. HTML sent to client browser
3. Client opens print window with styled HTML
4. User prints to PDF or physical printer
5. HTML window closes

**Code Reference**: [src/utils/pdfGenerator.ts:294-361](src/utils/pdfGenerator.ts#L294-L361)

```typescript
export function printReportFromHTML(htmlContent: string): void {
  const printWindow = window.open("", "_blank");
  // ... adds styling and opens print dialog
}
```

**Purpose**:
- Generate PDF for immediate use
- Physical printing if needed
- No permanent storage on client

---

## 📊 Complete Flow Diagram

```
User Clicks "Print Now"
        ↓
┌───────────────────────────────────────────────┐
│ 1. Server: Generate Google Doc               │
│    - Copy template from Drive                 │
│    - Replace placeholders with data           │
│    - Save to GOOGLE_REPORT_FOLDER_ID         │
│    - Returns: documentId + htmlContent       │
└───────────────────────────────────────────────┘
        ↓
┌───────────────────────────────────────────────┐
│ 2. Database: Save metadata                    │
│    - Save all form data                       │
│    - Link googleDocId to booking              │
└───────────────────────────────────────────────┘
        ↓
┌───────────────────────────────────────────────┐
│ 3. Client: Open print dialog                  │
│    - Receive HTML from server                 │
│    - Add print-friendly CSS                   │
│    - Open in new window                       │
│    - User prints to PDF/printer               │
└───────────────────────────────────────────────┘
```

---

## 🔑 Environment Variables Required

Add these to your `.env` file:

```env
# Google Drive folder to store generated reports (Google Docs)
GOOGLE_REPORT_FOLDER_ID=your_folder_id_here

# Template ID for report generation
GOOGLE_REPORT_TEMPLATE_ID=your_template_id_here

# CDN URL for logo
NEXT_PUBLIC_CDN_URL=https://your-cdn-url.com
```

### How to Get Folder IDs:

1. **Create a folder in Google Drive** for reports
2. **Open the folder**
3. **Copy the folder ID from the URL**:
   ```
   https://drive.google.com/drive/folders/1AbC-dEfG-123456
                                          ↑
                                   This is your folder ID
   ```

---

## 📂 Example Google Drive Structure

```
📁 Thrive Reports (GOOGLE_REPORT_FOLDER_ID)
  ├── 📄 Report_CASE-2025-001_1737340800000
  ├── 📄 Report_CASE-2025-002_1737341200000
  ├── 📄 Report_CASE-2025-003_1737341600000
  └── ...
```

Each file is a **Google Doc** that can be:
- Opened in Google Docs
- Edited if needed
- Shared with others
- Downloaded as PDF, Word, etc.

---

## 🗃️ Database Structure

```sql
Report Table:
┌─────────────┬──────────────┬─────────────────────────┐
│ Field       │ Type         │ Description             │
├─────────────┼──────────────┼─────────────────────────┤
│ bookingId   │ String       │ Primary key             │
│ googleDocId │ String?      │ Drive document ID       │
│ examinerName│ String       │ Examiner's full name    │
│ reportData  │ JSON         │ All form field data     │
│ createdAt   │ DateTime     │ Creation timestamp      │
│ ...         │ ...          │ Other fields            │
└─────────────┴──────────────┴─────────────────────────┘
```

---

## 💡 Key Points

### ✅ What Gets Saved Permanently:
1. **Google Docs** → Saved to Drive (permanent, editable)
2. **Database records** → PostgreSQL (metadata + googleDocId link)

### ⏳ What's Temporary:
1. **PDF/Print preview** → Only in browser during print (not saved automatically)
2. **HTML export** → Generated on-demand, sent to client

### 📥 Where PDFs Go (After User Prints):
- **User's choice!** They can:
  - Save to their local computer
  - Print to physical printer
  - Save to cloud storage (Dropbox, etc.)
  - Email directly (if browser supports it)

---

## 🔍 How to Find Generated Reports

### Option 1: Via Google Drive
1. Go to your Drive folder (using `GOOGLE_REPORT_FOLDER_ID`)
2. Find report by name/date
3. Open and view/edit in Google Docs

### Option 2: Via Database
```typescript
// Find report by booking ID
const report = await prisma.report.findUnique({
  where: { bookingId: "booking-123" }
});

// Get the Google Doc ID
console.log(report.googleDocId); // "1AbC-dEfG-123456"

// Construct Google Docs URL
const docUrl = `https://docs.google.com/document/d/${report.googleDocId}/edit`;
```

### Option 3: Via Application
- Navigate to the booking/case
- View report details
- Click link to open Google Doc (if you implement this)

---

## 🚀 Future Enhancements (Optional)

You could add:
1. **Direct PDF storage to S3/CDN** after generation
2. **Auto-email PDF** to relevant parties
3. **Download button** to get PDF directly from app
4. **Report history view** showing all generated reports
5. **Version tracking** for report edits

Let me know if you want to implement any of these!
