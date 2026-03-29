"use client";

// Upload page is now deprecated. Please upload files from inside a folder in the dashboard.
export default function UploadPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Upload from Dashboard</h2>
        <p className="text-lg">Please go to the dashboard, open a folder, and use the upload button there to add files directly to that folder.</p>
      </div>
    </div>
  );
}
