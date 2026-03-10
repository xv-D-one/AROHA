# Aroha v2 Local Setup & Configuration Guide

The Aroha v2 application code is fully written, configured, and ready to go! However, it requires a couple of external services to be running before it can successfully start up.

Here is what you need to do to complete the local setup and run the app:

## 1. Database Configuration (MongoDB)

The FastAPI application and the background worker both rely on MongoDB to store user accounts, patient records, and report metadata. The application is currently configured to look for a local MongoDB instance at `mongodb://localhost:27017`.

**To resolve the connection error:**

*   **Option A: Run MongoDB Locally (macOS)**
    If you have installed MongoDB using Homebrew, you can start the service in the background:
    ```bash
    brew services start mongodb-community
    ```

*   **Option B: Use a Cloud Database (MongoDB Atlas)**
    If you prefer to use a hosted database:
    1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
    2. Get your connection string (it will look something like `mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/?retryWrites=true&w=majority`).
    3. Open the `.env` file in the root of your project (`aroha_v2/.env`).
    4. Update the `MONGO_URI` variable with your Atlas connection string.

## 2. File Storage Configuration (AWS S3)

The application uploads medical reports to AWS S3 before analysis. Currently, the `.env` file contains mock AWS credentials (e.g., `AWS_ACCESS_KEY_ID=mock-access-key`). If you try to upload a patient report with these mock keys, the upload will fail.

**To enable file uploads:**

*   **Option A: Use Real AWS S3**
    1. Create an AWS account and an S3 bucket (e.g., `aroha-reports-bucket`).
    2. Create an IAM User with programmatic access and permissions to read/write to that bucket.
    3. Open the `.env` file and update the following variables with your actual credentials:
        *   `AWS_ACCESS_KEY_ID`
        *   `AWS_SECRET_ACCESS_KEY`
        *   `S3_BUCKET`
        *   `AWS_REGION`

*   **Option B: Use a Local S3 Alternative (MinIO / LocalStack)**
    If you prefer to test file uploads entirely locally without an AWS account:
    1. Install and run a local S3-compatible service like [MinIO](https://min.io/).
    2. Open the `.env` file and add the endpoint URL:
        *   `S3_ENDPOINT_URL=http://127.0.0.1:9000` (or whatever URL MinIO provides).
    3. Update the `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` to the ones provided by your local MinIO instance.

## 3. Running the Application

Once your database is running and your S3 credentials are configured in the `.env` file, you can start the application.

You need to run two separate processes in your terminal:

**Process 1: Start the Background Worker (Processes the reports)**
```bash
source venv/bin/activate
arq worker.WorkerSettings
```

**Process 2: Start the FastAPI Web Server**
In a new terminal window/tab:
```bash
cd path/to/aroha_v2
source venv/bin/activate
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```
