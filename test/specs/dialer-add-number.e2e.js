describe('전화번호 저장 자동화 (저장까지만)', () => {

    it('연락처 탭 선택 → 새 번호 입력 → 저장 후 종료', async () => {

        // 1️⃣ 다이얼러 앱 실행
        await driver.activateApp('com.google.android.dialer');
        await driver.pause(3000);

        // 2️⃣ Contacts 탭 클릭
        const contactsTab = await $('android=new UiSelector().text("Contacts")');
        await contactsTab.waitForDisplayed({ timeout: 10000 });
        await contactsTab.click();

        await driver.pause(2000);

        // 3️⃣ 새 연락처 추가 버튼
        const addContactBtn = await $('android=new UiSelector().text("Create new contact")');
        await addContactBtn.waitForDisplayed({ timeout: 10000 });
        await addContactBtn.click();

        await driver.pause(2000);

        // 4️⃣ 전화번호 입력 필드
        const phoneInput = await $('android=new UiSelector().textContains("Phone")');
        await phoneInput.waitForDisplayed({ timeout: 10000 });
        await phoneInput.click();

        // 5️⃣ 번호 입력
        await phoneInput.setValue('1234');

        // 6️⃣ 저장 버튼 클릭
        const saveButton = await $('android=new UiSelector().resourceId("com.google.android.contacts:id/toolbar_button")');
        await saveButton.waitForDisplayed({ timeout: 10000 });
        await saveButton.click();

        // 7️⃣ 저장 후 안정화 대기
        await driver.pause(2000);

        // 8️⃣ 앱 종료
        await driver.terminateApp('com.google.android.dialer');
    });

});