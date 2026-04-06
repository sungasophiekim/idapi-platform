import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center px-6">
        <div className="w-16 h-16 bg-green-deep rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-6">ID</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <p className="text-lg text-gray-500 mb-8">페이지를 찾을 수 없습니다</p>
        <Link href="/" className="inline-block px-6 py-3 bg-green-deep text-white rounded-lg font-semibold hover:opacity-90 transition">
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
