export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-900 text-zinc-400 py-12 px-6">
      <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-3">
          <h2 className="text-zinc-100 font-bold text-lg tracking-tight">주식회사 넥스트인</h2>
          <div className="text-xs md:text-sm leading-relaxed space-y-1.5 text-zinc-400">
            <p>대표자 : 정시훈 ｜ 사업자등록번호 : 280-86-03849 ｜ 법인등록번호 : 180111-0162061</p>
            <p>통신판매업신고번호 : 2026-부산연제-0109호 ｜ 사업장 소재지 : 부산광역시 연제구 연제로 30, 105동 7층 7301호</p>
            <p>대표번호 : 0507-1349-0268 ｜ 대표메일 : info@nextin.ai.kr</p>
            <p>개인정보보호책임자 : 정시훈 ｜ 홈페이지운영담당자 : 허예령</p>
          </div>
        </div>
        <div className="text-left md:text-right">
          <p className="font-mono text-xs text-zinc-500">
            © 2026 주식회사 넥스트인 (NEXTIN Co., Ltd.).<br className="hidden md:block"/> All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
