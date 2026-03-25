// 📦 Node.js 기본 모듈
const path = require('path'); // 파일 경로 처리 (OS별 경로 대응)
const fs = require('fs'); // 파일 읽기/쓰기

// 📊 Allure 리포트 라이브러리
const allure = require('@wdio/allure-reporter').default;

exports.config = {

    // ==============================
    // 1. Appium 서버 접속 정보
    // ==============================
    hostname: '127.0.0.1', // Appium 서버 주소 (로컬)
    port: 4723,            // Appium 서버 포트
    path: '/',             // Appium 2.x 기본 경로

    // ==============================
    // 2. 테스트 실행 대상
    // ==============================
    specs: ['./test/specs/**/*.js'], // 실행할 테스트 파일 경로
    maxInstances: 1, // 동시에 실행할 인스턴스 수 (모바일은 보통 1)

    // ==============================
    // 3. 디바이스 & 앱 설정
    // ==============================
    capabilities: [
        {
            platformName: 'Android', // 플랫폼

            // 디바이스 정보
            'appium:deviceName': 'Pixel_3a_API_34',
            'appium:udid': 'emulator-5554',
            'appium:platformVersion': '14',

            // 자동화 엔진
            'appium:automationName': 'UiAutomator2',

            // 실행할 앱 정보
            'appium:appPackage': 'com.google.android.contacts',
            'appium:appActivity': 'com.android.contacts.activities.PeopleActivity',

            // 옵션
            'appium:noReset': true, // 앱 데이터 유지 (재설치 X)
            'appium:autoGrantPermissions': true, // 권한 자동 허용
        },
    ],

    // ==============================
    // 4. 실행 설정
    // ==============================
    logLevel: 'info', // 로그 레벨
    framework: 'mocha', // 테스트 프레임워크

    // ==============================
    // 5. 리포터 설정 (Allure 포함)
    // ==============================
    reporters: [
        'spec', // 콘솔 출력용

        [
            'allure',
            {
                outputDir: 'allure-results', // 결과 저장 폴더

                // webdriver step 상세 기록
                disableWebdriverStepsReporting: false,

                // webdriver 자동 스크린샷 기록
                disableWebdriverScreenshotsReporting: false,
            },
        ],
    ],

    // ==============================
    // 6. 서비스 설정 (Appium 실행)
    // ==============================
    services: [
        [
            'appium',
            {
                args: {
                    address: '127.0.0.1',
                    port: 4723,
                },
                command: 'appium', // Appium 실행 명령어
            },
        ],

        // ❌ visual 테스트는 현재 비활성화 (충돌 방지)
        /*
        [
            'visual',
            {
                baselineFolder: path.join(process.cwd(), 'test', 'baseline'),
                formatImageName: '{tag}-{logName}-{width}x{height}',
                autoSaveBaseline: true,
                blockOutStatusBar: true,
                blockOutNavigationBar: true,
            },
        ],
        */
    ],

    // ==============================
    // 7. Mocha 옵션
    // ==============================
    mochaOpts: {
        ui: 'bdd',       // describe / it 스타일
        timeout: 120000,  // 테스트 타임아웃 (120초)
    },

    // ==============================
    // 8. 테스트 후 처리 (핵심 로직🔥)
    // ==============================
    afterTest: async function (test, context, { passed }) {

        // ❌ 테스트 실패한 경우만 실행
        if (!passed) {

            const timestamp = Date.now();

            // 저장 파일명 생성
            const fileName = `./errorShots/${test.title}_${timestamp}.png`;

            // 👉 UI 안정화 대기 (캡처 타이밍 문제 방지)
            await driver.pause(500);

            // 👉 현재 화면 스크린샷 (base64 문자열로 반환)
            const screenshot = await driver.takeScreenshot();

            // 👉 디버깅용 로그 (길이 확인)
            console.log('screenshot length:', screenshot?.length);

            // 👉 로컬 파일로 저장
            fs.writeFileSync(fileName, screenshot, 'base64');

            console.log('❌ 테스트 실패 - 스크린샷 저장:', fileName);

            // 👉 Allure 리포트에 첨부 (이게 핵심🔥)
            allure.addAttachment(
                'Failure Screenshot',                // 첨부 이름
                Buffer.from(screenshot, 'base64'),   // 이미지 데이터
                'image/png'                          // MIME 타입
            );
        }
    },
};