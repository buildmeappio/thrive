# Logo Setup Instructions for Report Template

## ✅ Code Changes Complete

I've successfully added logo support to your report generation system. Here's what was updated:

### Files Modified:
1. **src/lib/google-docs.ts** - Added `logoUrl` field to `ReportDocData` type and placeholder mapping
2. **src/domains/reports/server/services/report.service.ts** - Added logo URL from CDN to report data
3. **src/utils/pdfGenerator.ts** - Added CSS styling for logo in PDF
4. **template-structure.md** - Added `{{logo_url}}` placeholder to template

---

## 📝 How to Add Logo to Google Doc Template

### Option 1: Using Image URL Placeholder (Recommended)

1. **Open your Google Doc template**
2. **At the top of the document** (before "INDEPENDENT MEDICAL EXAMINATION REPORT"), add:
   - Type: `{{logo_url}}`
   - The system will automatically replace this with the actual logo image when generating reports

### Option 2: Insert Logo Directly in Template

1. **Open your Google Doc template**
2. **Click Insert → Image → Insert image from URL**
3. **Paste this URL**: `${ENV.NEXT_PUBLIC_CDN_URL}/images/thriveLogo.png`
   - Replace `${ENV.NEXT_PUBLIC_CDN_URL}` with your actual CDN URL
4. **Resize the logo** to an appropriate size (recommended: 200px width)
5. **Position it** at the top center of the document

---

## 🎨 Logo Styling

The logo will automatically be styled with:
- **Max width**: 200px
- **Maintains aspect ratio**: Height adjusts automatically
- **Margin**: 20px bottom spacing
- **Print-optimized**: Looks good both on screen and in PDF

---

## 📋 Updated Template Structure

Your template should now look like this:

```
{{logo_url}}

**INDEPENDENT MEDICAL EXAMINATION REPORT**

---

**CLAIMANT INFORMATION**

Name: {{claimant_name}}
Date of Birth: {{date_of_birth}}
Gender: {{gender}}

... (rest of template)
```

---

## 🔧 Technical Details

### Logo URL Construction
The logo URL is automatically constructed from your CDN URL:
```typescript
const logoUrl = ENV.NEXT_PUBLIC_CDN_URL
  ? `${ENV.NEXT_PUBLIC_CDN_URL}/images/thriveLogo.png`
  : undefined;
```

### Placeholder Mapping
The `{{logo_url}}` placeholder gets replaced with the actual URL during report generation.

### PDF Styling
The PDF generator includes special CSS for the logo:
```css
.report-logo {
  max-width: 200px;
  height: auto;
  margin-bottom: 20px;
}
```

---

## ✅ Next Steps

1. **Update your Google Doc template** with the `{{logo_url}}` placeholder or insert the logo directly
2. **Test the report generation** to ensure the logo appears correctly
3. **Adjust logo size** in the template if needed

---

## 📌 Important Notes

- The logo will appear in both the Google Doc and the exported PDF
- If the CDN URL is not set, the logo placeholder will be replaced with an empty string
- The logo maintains its aspect ratio automatically
- For best results, use a high-quality PNG or SVG logo file

---

## 🐛 Troubleshooting

**Logo not showing?**
- Check that `NEXT_PUBLIC_CDN_URL` is set in your `.env` file
- Verify the logo file exists at `/images/thriveLogo.png` on your CDN
- Ensure the image URL is publicly accessible

**Logo too large/small?**
- Adjust the `max-width` in the PDF CSS (currently 200px)
- Or resize the image directly in the Google Doc template
