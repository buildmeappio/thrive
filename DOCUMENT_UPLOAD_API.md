# Document Upload API - Complete Implementation

This document provides an overview of the newly created document upload API with full S3 integration.

## 📁 Files Created

### 1. API Route
**Location**: `src/app/api/documents/upload/route.ts`
- Main API endpoint handling POST requests for file uploads
- Complete S3 client initialization and configuration
- File validation (type, size, count)
- S3 upload with metadata
- Database storage of document information
- Comprehensive error handling
- GET endpoint for API documentation

### 2. Service Helper
**Location**: `src/services/document.service.ts`
- `uploadDocuments()` - Easy-to-use function for frontend
- `getUploadInfo()` - Fetch API limits and configuration
- TypeScript types for responses
- Automatic form-data handling

### 3. Example Component
**Location**: `src/components/DocumentUploadExample.tsx`
- Complete React component with UI
- File selection with preview
- Upload progress indication
- Success/error display
- Multiple file handling
- Remove files before upload

### 4. Documentation
**Location**: `src/app/api/documents/upload/README.md`
- Complete API documentation
- Usage examples (fetch, cURL, Postman)
- Error handling guide
- Security considerations
- Troubleshooting tips

### 5. Test Script
**Location**: `src/app/api/documents/upload/test-upload.sh`
- Bash script for testing API
- Tests GET and POST endpoints
- Colored output for readability

## 🚀 Features

### API Features
✅ Upload single or multiple files (max 10 per request)
✅ Support for documents (PDF, DOC, DOCX, XLS, XLSX)
✅ Support for images (JPG, PNG, GIF, WEBP)
✅ File size validation (max 10MB per file)
✅ File type validation
✅ Automatic filename sanitization
✅ Unique filename generation (timestamp + random)
✅ S3 upload with metadata
✅ Database storage of document records
✅ CDN URL generation
✅ Partial success handling (some files succeed, others fail)
✅ Detailed error messages
✅ User-based file organization in S3

### Security Features
✅ File type whitelist
✅ File size limits
✅ Filename sanitization (removes special characters)
✅ Unique filenames prevent overwrites
✅ AWS credentials validation
✅ Comprehensive input validation

## 📋 Usage Examples

### 1. Using the Service (Recommended)

```typescript
import { documentService } from '@/services';

// Upload single file
const result = await documentService.uploadDocuments(file, 'user-123');

// Upload multiple files
const result = await documentService.uploadDocuments([file1, file2], 'user-123');

if (result.success) {
  console.log('Uploaded:', result.data?.documents);
} else {
  console.error('Errors:', result.errors);
}
```

### 2. Using Fetch API

```typescript
const formData = new FormData();
formData.append('files', file1);
formData.append('files', file2);
formData.append('userId', 'user-123'); // Optional

const response = await fetch('/api/documents/upload', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
```

### 3. Using the Example Component

```tsx
import DocumentUploadExample from '@/components/DocumentUploadExample';

export default function MyPage() {
  return (
    <div>
      <h1>Upload Documents</h1>
      <DocumentUploadExample />
    </div>
  );
}
```

### 4. Using cURL

```bash
# Upload single file
curl -X POST http://localhost:3000/api/documents/upload \
  -F "files=@./document.pdf"

# Upload with user ID
curl -X POST http://localhost:3000/api/documents/upload \
  -F "files=@./document.pdf" \
  -F "userId=user-123"

# Upload multiple files
curl -X POST http://localhost:3000/api/documents/upload \
  -F "files=@./doc1.pdf" \
  -F "files=@./image.jpg" \
  -F "userId=user-123"
```

### 5. Using Test Script

```bash
# Make script executable
chmod +x src/app/api/documents/upload/test-upload.sh

# Run test
./src/app/api/documents/upload/test-upload.sh ./test-file.pdf user-123
```

## 🔧 Configuration

### Required Environment Variables

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_S3_BUCKET_NAME=your-bucket-name
NEXT_PUBLIC_CDN_URL=https://your-cdn-url.com  # Optional
```

### AWS IAM Permissions Required

The AWS user needs these S3 permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name/documents/examiner/*"
    }
  ]
}
```

## 📊 API Response Examples

### Success Response (200)
```json
{
  "success": true,
  "message": "2 file(s) uploaded successfully",
  "data": {
    "documents": [
      {
        "id": "uuid",
        "name": "1640995200000-abc123-document.pdf",
        "originalName": "document.pdf",
        "size": 123456,
        "type": "application/pdf",
        "s3Key": "documents/examiner/user-123/1640995200000-abc123-document.pdf",
        "url": "https://cdn.example.com/documents/examiner/user-123/1640995200000-abc123-document.pdf",
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "totalUploaded": 2
  }
}
```

### Error Response (400)
```json
{
  "success": false,
  "message": "File validation failed",
  "errors": [
    "File \"document.xyz\" has an unsupported file type",
    "File \"large.pdf\" exceeds maximum size of 10MB"
  ]
}
```

### Partial Success (207)
```json
{
  "success": true,
  "message": "1 of 2 file(s) uploaded successfully",
  "data": {
    "documents": [/* successfully uploaded */],
    "totalUploaded": 1,
    "totalFailed": 1
  },
  "warnings": [
    "Failed to upload \"file2.pdf\": File exceeds maximum size"
  ]
}
```

## 🔒 Security Considerations

1. **File Validation**: All files validated before upload
2. **Size Limits**: Prevents large file attacks
3. **Type Checking**: Only whitelisted file types allowed
4. **Sanitization**: Filenames sanitized to prevent injection
5. **Unique Names**: Prevents file overwrites
6. **AWS Credentials**: Never exposed to client
7. **Error Messages**: Generic errors to prevent information leakage

## 🐛 Error Handling

The API handles these error scenarios:

| Error | HTTP Code | Description |
|-------|-----------|-------------|
| No files provided | 400 | Request missing files |
| Too many files | 400 | More than 10 files |
| Invalid file type | 400 | Unsupported file format |
| File too large | 400 | Exceeds 10MB limit |
| S3 not configured | 500 | Missing AWS config |
| AWS credentials invalid | 500 | Invalid AWS setup |
| S3 upload failed | 500 | Network or permission issue |
| Database save failed | 500 | DB connection issue |

## 📁 S3 File Organization

Files are organized in S3 as:

```
s3://your-bucket/
  └── documents/
      └── examiner/
          ├── user-123/
          │   ├── 1640995200000-abc123-document.pdf
          │   └── 1640995200000-def456-image.jpg
          └── user-456/
              └── 1640995200000-ghi789-resume.docx
```

## 🧪 Testing

### 1. Test with Example Component
```bash
npm run dev
# Navigate to page with DocumentUploadExample component
# Upload files through the UI
```

### 2. Test with cURL
```bash
curl -X POST http://localhost:3000/api/documents/upload \
  -F "files=@./test.pdf" \
  -F "userId=test-123"
```

### 3. Test with Script
```bash
chmod +x src/app/api/documents/upload/test-upload.sh
./src/app/api/documents/upload/test-upload.sh ./test.pdf test-user
```

### 4. Test with Postman
1. Create POST request to `/api/documents/upload`
2. Body → form-data
3. Add key "files" (type: File)
4. Add key "userId" (type: Text, optional)
5. Send

## 📚 Additional Resources

- **Full Documentation**: `src/app/api/documents/upload/README.md`
- **API Route**: `src/app/api/documents/upload/route.ts`
- **Service Helper**: `src/services/document.service.ts`
- **Example Component**: `src/components/DocumentUploadExample.tsx`
- **Test Script**: `src/app/api/documents/upload/test-upload.sh`

## 🎯 Next Steps

1. **Configure AWS**: Set up environment variables
2. **Test Locally**: Use the test script or example component
3. **Customize**: Adjust file limits, types, or S3 paths as needed
4. **Deploy**: Deploy to your production environment
5. **Monitor**: Watch logs for any upload errors

## 💡 Tips

- Use the service helper (`documentService`) for cleaner code
- Implement client-side validation to reduce API calls
- Show upload progress for better UX
- Handle errors gracefully with user-friendly messages
- Consider implementing upload retry logic for failed uploads
- Use the example component as a starting point for your UI

---

**Created**: January 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready

