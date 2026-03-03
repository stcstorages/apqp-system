export default function ControlPlanPrintPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded shadow">
        <h1 className="text-xl font-bold text-gray-800 mb-2">PDF Generation Paused</h1>
        <p className="text-gray-600">
          We are rebuilding the PDF engine to ensure stability. <br/>
          Please check back later.
        </p>
      </div>
    </div>
  )
}