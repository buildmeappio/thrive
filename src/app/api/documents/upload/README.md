# Document Upload API

A robust API endpoint for uploading documents and images to AWS S3 with comprehensive validation and error handling.

## Endpoint

```
POST /api/documents/upload
GET  /api/documents/upload (API info)
```

## Features

- ✅ Upload single or multiple files
- ✅ All S3 operations contained within the API
- ✅ Comprehensive file validation (type, size, format)
- ✅ Automatic file naming with timestamps
- ✅ Database metadata storage
- ✅ Detailed error messages
- ✅ Support for documents and images
- ✅ CDN URL generation
- ✅ Partial success handling

## Supported File Types

### Documents
- PDF (`.pdf`)
- Word (`.doc`, `.docx`)
- Excel (`.xls`, `.xlsx`)

### Images
- JPEG/JPG (`.jpg`, `.jpeg`)
- PNG (`.png`)
- GIF (`.gif`)
- WebP (`.webp`)

## Limits

- **Max File Size**: 10MB per file
- **Max Files**: 10 files per request
- **Total Request Size**: Limited by your server configuration

## Request Format

### Using Form Data (Recommended)

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

### Using the Service (Easier)

```typescript
import { documentService } from '@/services';

// Single file
const result = await documentService.uploadDocuments(file, 'user-123');

// Multiple files
const result = await documentService.uploadDocuments([file1, file2], 'user-123');
```

### Using React Component

```tsx
import DocumentUploadExample from '@/components/DocumentUploadExample';

export default function MyPage() {
  return <DocumentUploadExample />;
}
```

## Response Format

### Success Response (200)

```json
{
  "success": true,
  "message": "2 file(s) uploaded successfully",
  "data": {
    "documents": [
      {
        "id": "uuid-string",
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

### Partial Success Response (207)

```json
{
  "success": true,
  "message": "1 of 2 file(s) uploaded successfully",
  "data": {
    "documents": [{ /* uploaded document */ }],
    "totalUploaded": 1,
    "totalFailed": 1
  },
  "warnings": [
    "Failed to upload \"large-file.pdf\": File exceeds maximum size of 10MB"
  ]
}
```

### Error Response (400/500)

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

## Error Handling

### Common Errors

| Error Code | Description | Solution |
|------------|-------------|----------|
| 400 | No files provided | Include at least one file in the request |
| 400 | File validation failed | Check file type and size |
| 400 | Too many files | Reduce number of files to 10 or less |
| 500 | S3 configuration error | Check AWS environment variables |
| 500 | Upload failed | Check S3 permissions and network |

### Validation Errors

The API validates:
1. **File presence**: At least one file must be provided
2. **File count**: Maximum 10 files per request
3. **File size**: Each file must be ≤10MB
4. **File type**: Must be in allowed types list
5. **File extension**: Must match allowed extensions

## Environment Variables Required

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=your-bucket-name
NEXT_PUBLIC_CDN_URL=https://cdn.example.com (optional)
```

## S3 Bucket Structure

Files are organized in S3 as follows:

```
s3://your-bucket/
  └── documents/
      └── examiner/
          ├── user-123/
          │   ├── 1640995200000-abc123-document.pdf
          │   └── 1640995200000-def456-image.jpg
          └── user-456/
              └── 1640995200000-ghi789-file.docx
```

## Security Considerations

1. **File Validation**: All files are validated before upload
2. **Filename Sanitization**: Special characters are removed
3. **Unique Filenames**: Timestamps and random strings prevent overwrites
4. **Size Limits**: Prevents large file uploads
5. **Type Checking**: Only allowed file types can be uploaded
6. **S3 Permissions**: Use IAM roles with minimal required permissions

## Examples

### Example 1: Upload Single File

```typescript
async function uploadSingleFile(file: File) {
  const formData = new FormData();
  formData.append('files', file);

  const response = await fetch('/api/documents/upload', {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();
  
  if (result.success) {
    console.log('Uploaded:', result.data.documents[0]);
  } else {
    console.error('Errors:', result.errors);
  }
}
```

### Example 2: Upload Multiple Files with User ID

```typescript
async function uploadMultipleFiles(files: File[], userId: string) {
  const formData = new FormData();
  
  files.forEach(file => {
    formData.append('files', file);
  });
  
  formData.append('userId', userId);

  const response = await fetch('/api/documents/upload', {
    method: 'POST',
    body: formData,
  });

  return await response.json();
}
```

### Example 3: Using the Service Helper

```typescript
import { documentService } from '@/services';

async function handleUpload(files: File[]) {
  try {
    const result = await documentService.uploadDocuments(files, 'user-123');
    
    if (result.success) {
      console.log(`Uploaded ${result.data?.totalUploaded} files`);
      result.data?.documents.forEach(doc => {
        console.log(`- ${doc.originalName} (${doc.id})`);
      });
    } else {
      console.error('Upload failed:', result.errors);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}
```

## Testing

### Using cURL

```bash
# Upload single file
curl -X POST http://localhost:3000/api/documents/upload \
  -F "files=@/path/to/document.pdf"

# Upload multiple files with user ID
curl -X POST http://localhost:3000/api/documents/upload \
  -F "files=@/path/to/doc1.pdf" \
  -F "files=@/path/to/image.jpg" \
  -F "userId=user-123"

# Get API info
curl http://localhost:3000/api/documents/upload
```

### Using Postman

1. Create a new POST request to `/api/documents/upload`
2. Go to "Body" tab
3. Select "form-data"
4. Add key "files" with type "File" and select file(s)
5. Optionally add key "userId" with type "Text"
6. Send request

## Best Practices

1. **Client-side validation**: Validate files before uploading to save bandwidth
2. **Progress tracking**: Implement upload progress for large files
3. **Error handling**: Always handle both success and error cases
4. **User feedback**: Show clear messages about upload status
5. **Retry logic**: Implement retry for failed uploads
6. **Batch uploads**: For many files, upload in batches of 10

## Troubleshooting

### Upload Fails Silently
- Check browser console for errors
- Verify file size is within limits
- Ensure correct form-data key name ("files")

### "S3 bucket is not configured" Error
- Verify `AWS_S3_BUCKET_NAME` environment variable is set
- Restart the application after adding env vars

### "Failed to initialize S3 client" Error
- Check AWS credentials are correctly set
- Verify AWS region is valid
- Ensure IAM user has S3 permissions

### Files Upload but Don't Save to Database
- Check Prisma schema has `documents` model
- Verify database connection
- Check server logs for database errors

