describe('연락처 10개 유지 자동화 (최종 해결사 버전)', () => {

    function generateRandomNumber() {
        return '010' + Math.floor(10000000 + Math.random() * 90000000);
    }

    // -----------------------------
    // Step 2: 현재 수량 식별
    // - 상단 카운트 텍스트 추출 및 정규식 파싱
    // - "X contacts" 텍스트에서 숫자값(X) 추출
    // -----------------------------
    async function getRealContactCount() {
        try {
            const elements = await $$('//*[contains(@text, "contacts")]');
            
            for (const el of elements) {
                const text = await el.getText();
                const match = text.match(/(\d+)\s*contacts/i) || text.match(/(\d+)/);
                
                if (match) {
                    const count = parseInt(match[1], 10);
                    if (!text.includes("Search") && !isNaN(count)) {
                        console.log(`[분석 성공] 찾은 텍스트: "${text}" -> 현재 개수: ${count}`);
                        return count;
                    }
                }
            }
            
            // fallback: 리스트 아이템 개수로 판단
            const listItems = await $$('android=new UiSelector().resourceId("com.google.android.contacts:id/cliv_name_textview")');
            return listItems.length;

        } catch (e) {
            console.log('[오류] 개수 파악 중 에러 발생');
            return 0;
        }
    }

    // -----------------------------
    // Step 4~5: 신규 생성 진입 + 데이터 입력 및 저장
    // - Floating Action Button(+) 클릭
    // - 전화번호 입력 후 Save 버튼 클릭
    // -----------------------------
    async function createContact(phoneNumber) {
        const plusBtn = await $('android=new UiSelector().resourceId("com.google.android.contacts:id/floating_action_button")');
        await plusBtn.waitForDisplayed({ timeout: 5000 }); // Step 4: FAB 버튼 표시 확인
        await plusBtn.click();

        const phoneInput = await $('android=new UiSelector().textContains("Phone")');
        await phoneInput.waitForDisplayed({ timeout: 5000 }); // Step 4: 편집 화면 전환 확인
        await phoneInput.setValue(phoneNumber); // Step 5: 데이터 입력

        const saveBtn = await $('android=new UiSelector().textContains("Save")');
        if (await saveBtn.isExisting()) {
            await saveBtn.click(); // Step 5: Save 클릭
        } else {
            await $('android=new UiSelector().textContains("저장")').click(); // Step 5: Save 클릭
        }

        await browser.pause(2500); // Step 5: 상세 화면 로딩 대기
    }

    // -----------------------------
    // Step 6: 목록 복귀 및 갱신
    // - 뒤로 가기(driver.back) 수행
    // - 메인 리스트 화면 복귀 확인
    // -----------------------------
    async function goBackToList() {
        console.log('[작업] 목록으로 복귀');
        await driver.back();
        await browser.pause(2000); // 목록 복귀 대기
    }

    it('연락처가 10개가 되면 즉시 종료', async () => {
        // -----------------------------
        // Step 1: 앱 진입 및 초기화
        // - 연락처 앱 활성화 및 2초 대기
        // -----------------------------
        await driver.activateApp('com.google.android.contacts');
        await browser.pause(2000); // Step 1: 앱 메인 리스트 화면 확인
        

        // -----------------------------
        // Step 2: 초기 카운트 확인
        // -----------------------------
        let contactCount = await getRealContactCount();
        console.log(`>>> 현재 시스템 인식 연락처: ${contactCount}개`);

        // -----------------------------
        // Step 3: 비즈니스 로직 판단
        // - 추출된 수량과 목표 수량(10개) 비교
        // -----------------------------
        while (contactCount < 10) { // Step 3: count < 10 → Step 4~7 반복
            console.log(`[진행] 현재 ${contactCount}개입니다. 10개까지 추가 생성을 진행합니다.`);
            
            const oldCount = contactCount;
            // Step 4~5: 신규 생성 + 입력/저장
            const phone = generateRandomNumber();
            await createContact(phone);
            // Step 6: 목록 복귀
            await goBackToList();

            // -----------------------------
            // Step 7: 수량 증분 검증
            // - 카운트 재추출 및 이전 값과 비교
            // -----------------------------
            let retry = 0;
            while (retry < 3) {
                const newCount = await getRealContactCount();
                if (newCount > contactCount) { // Step 7: 이전 대비 증분 확인
                    contactCount = newCount;
                    break;
                }
                await browser.pause(1000);
                retry++;
            }
            
            console.log(`[확인] 갱신된 연락처 수: ${contactCount}`);
            if (contactCount >= 10) break;
        }

        // -----------------------------
        // Step 8: 최종 상태 확인 및 종료
        // - 10개 달성 확인 후 앱 종료
        // -----------------------------
        if (contactCount >= 10) {
            console.log(`✅ 목표 달성 (${contactCount}개). 테스트를 종료합니다.`);
            await browser.pause(1000);
            await driver.terminateApp('com.google.android.contacts');
        } else {
            console.log('❌ 10개 달성 실패');
        }
    });
});