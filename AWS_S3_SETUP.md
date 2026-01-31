# AWS S3 Setup Guide for Tails & Tales

## Overview
This guide will help you set up AWS S3 for storing images (species icons, profile photos, etc.) in the Tails & Tales admin dashboard.

---

## Step 1: Create AWS Account
If you don't have an AWS account:
1. Go to [aws.amazon.com](https://aws.amazon.com)
2. Click "Create an AWS Account"
3. Follow the registration process

---

## Step 2: Create S3 Bucket

1. **Go to S3 Console**: [https://s3.console.aws.amazon.com/](https://s3.console.aws.amazon.com/)

2. **Click "Create bucket"**

3. **Configure Bucket**:
   - **Bucket name**: `tails-and-tales-assets` (must be globally unique, try adding your name if taken)
   - **AWS Region**: `ap-south-1` (Mumbai) - closest to India
   - **Object Ownership**: ACLs enabled
   - **Block Public Access**: UNCHECK "Block all public access"
   - **Bucket Versioning**: Enable (optional, for backup)
   - **Tags**: Add `Project: TailsAndTales`

4. **Click "Create bucket"**

---

## Step 3: Configure Bucket for Public Read

1. **Go to your bucket** → **Permissions** tab

2. **Bucket Policy** → Click "Edit"

3. **Paste this policy** (replace `tails-and-tales-assets` with your bucket name):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::tails-and-tales-assets/*"
    }
  ]
}
```

4. **Click "Save changes"**

---

## Step 4: Create IAM User for Uploads

1. **Go to IAM Console**: [https://console.aws.amazon.com/iam/](https://console.aws.amazon.com/iam/)

2. **Users** → **Add users**

3. **User details**:
   - **User name**: `tails-and-tales-uploader`
   - **Access type**: Select "Programmatic access"

4. **Permissions**:
   - Click "Attach existing policies directly"
   - Search for `AmazonS3FullAccess`
   - Check the box next to it

5. **Tags** (optional):
   - Key: `Project`, Value: `TailsAndTales`

6. **Review and create user**

7. **IMPORTANT**: Save the credentials shown:
   - **Access Key ID**: `AKIA...`
   - **Secret Access Key**: `wJalr...`
   
   ⚠️ **You won't be able to see the Secret Access Key again!**

---

## Step 5: Install Required Packages

```bash
cd backend
npm install aws-sdk multer multer-s3
```

---

## Step 6: Add Environment Variables

Add to `backend/.env`:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
AWS_REGION=ap-south-1
AWS_S3_BUCKET=tails-and-tales-assets
```

**Replace** `your_access_key_id_here` and `your_secret_access_key_here` with the credentials from Step 4.

---

## Step 7: Test the Upload

1. **Restart backend server**:
   ```bash
   cd backend
   npm start
   ```

2. **Go to Species Management** in admin dashboard

3. **Click "Add Species"**

4. **Upload an icon** - you should see it upload to S3!

---

## Folder Structure in S3

Files will be organized like this:

```
tails-and-tales-assets/
├── icons/              # Species icons, category icons
├── profiles/           # User profile photos
├── pets/              # Pet photos
├── caregivers/        # Caregiver photos
└── uploads/           # General uploads
```

---

## API Endpoints Created

### Upload Single Image
```
POST /api/v1/upload/image
Headers: Authorization: Bearer {token}
Body: FormData with 'file' and 'folder' fields

Response:
{
  "success": true,
  "data": {
    "url": "https://tails-and-tales-assets.s3.ap-south-1.amazonaws.com/icons/uuid.png",
    "key": "icons/uuid.png",
    "size": 12345,
    "mimetype": "image/png"
  }
}
```

### Upload Multiple Images
```
POST /api/v1/upload/images
Headers: Authorization: Bearer {token}
Body: FormData with 'files[]' and 'folder' fields
```

---

## Security Best Practices

1. **Never commit AWS credentials** to Git
2. **Use IAM roles** in production (EC2, Lambda)
3. **Enable versioning** for backup
4. **Set up lifecycle policies** to delete old files
5. **Monitor costs** in AWS Billing Dashboard

---

## Cost Estimation

**Free Tier** (first 12 months):
- 5GB storage
- 20,000 GET requests
- 2,000 PUT requests

**After Free Tier**:
- Storage: ~$0.023/GB/month
- Requests: ~$0.005 per 1,000 requests

**Estimated monthly cost** for small app: **$1-5/month**

---

## Troubleshooting

### Error: "Access Denied"
- Check bucket policy is correct
- Verify IAM user has S3 permissions
- Ensure bucket name matches in `.env`

### Error: "File too large"
- Current limit: 5MB
- Increase in `backend/services/s3-upload.service.js`

### Error: "Invalid credentials"
- Verify AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
- Check for extra spaces in `.env`

---

## Files Created

**Backend**:
- `backend/services/s3-upload.service.js` - S3 upload logic
- `backend/controllers/upload.controller.js` - Upload endpoints
- `backend/routes/v1/upload.routes.js` - Upload routes

**Frontend**:
- `admin-dashboard/components/forms/file-upload.tsx` - File upload component

---

## Next Steps

1. Set up AWS account and S3 bucket
2. Create IAM user and save credentials
3. Add credentials to `backend/.env`
4. Install npm packages
5. Restart backend
6. Test upload in Species Management

**Ready to upload images to the cloud!** 🚀
