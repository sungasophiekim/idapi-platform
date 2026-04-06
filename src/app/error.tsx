'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center px-6">
        <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center text-red-600 font-bold text-xl mx-auto mb-6">!</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">오류가 발생했습니다</h1>
        <p className="text-gray-500 mb-8">잠시 후 다시 시도해 주세요.</p>
        <button onClick={reset} className="px-6 py-3 bg-green-deep text-white rounded-lg font-semibold hover:opacity-90 transition">
          다시 시도
        </button>
      </div>
    </div>
  );
}
