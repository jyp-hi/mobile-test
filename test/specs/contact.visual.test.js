// test/specs/contact.visual.test.js
describe('연락처 앱 시각 테스트', () => {
    it('연락처 첫 화면 비교', async () => {
        await browser.pause(3000); // 앱 로딩 대기
        
        // 공식 서비스 명령어 사용
        const result = await browser.checkScreen('contact-home');
        
        console.log(`Diff: ${result}%`);
        expect(result).toBeLessThan(1);
    });
});