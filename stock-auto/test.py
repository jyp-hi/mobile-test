import re
from playwright.sync_api import Playwright, sync_playwright, expect


def run(playwright: Playwright) -> None:
    browser = playwright.chromium.launch(headless=False)
    context = browser.new_context()
    page = context.new_page()
    page.goto("https://www.google.com/")
    page.get_by_role("combobox", name="검색").click()
    page.get_by_role("combobox", name="검색").click()
    page.get_by_role("combobox", name="검색").fill("네이버")
    page.locator("body").click()
    page.goto("https://www.naver.com/")
    page.get_by_role("link", name="NAVER 로그인").click()
    page.get_by_role("textbox", name="아이디 또는 전화번호").fill("hi")
    page.get_by_role("textbox", name="비밀번호").click()
    page.get_by_role("textbox", name="비밀번호").fill("test")
    page.get_by_role("button", name="로그인").click()

    # ---------------------
    context.close()
    browser.close()


with sync_playwright() as playwright:
    run(playwright)