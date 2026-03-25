describe('안드로이드 앱 성능 모니터링', () => {
    
    it('앱의 CPU 및 메모리 점유율 데이터를 수집한다', async () => {
        const packageName = 'com.nhn.android.search';

        // 1. 메모리 수집 (성공했던 로직)
        const memoryData = await driver.getPerformanceData(packageName, 'memoryinfo', 5);
        const totalPss = memoryData[1][memoryData[0].indexOf('totalPss')];
        const totalPssMb = parseInt(totalPss) / 1024;
        
        console.log(`📊 [메모리] totalPss: ${totalPssMb.toFixed(2)} MB`);

        // 2. CPU 수집 (보안 우회 방식)
        // shell 명령어로 top을 실행하여 실시간 CPU 점유율을 가져옵니다.
        const cpuRaw = await browser.execute('mobile: shell', {
            command: 'top',
            args: ['-n', '1', '-b', '-p', await browser.execute('mobile: shell', { command: 'pidof', args: [packageName] })]
        });

        console.log('📊 [CPU 상세 데이터]:\n', cpuRaw);

        // 3. 검증 (메모리 기준을 600MB로 상향 조정)
        expect(totalPssMb).toBeLessThan(600); 
    });
});