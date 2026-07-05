import { test, expect, type Page } from '@playwright/test'

const t = Date.now()
const email = `review_e2e_${t}@example.com`
const password = 'password123'
const username = `reviewer_${t}`

async function login(page: Page) {
  await page.goto('/login')
  await page.getByPlaceholder('メールアドレス').fill(email)
  await page.getByPlaceholder('パスワード').fill(password)
  await page.getByRole('button', { name: 'ログイン' }).click()
  await expect(page).toHaveURL('/')
}

async function postReview(page: Page, title: string) {
  await page.getByRole('link', { name: '+ 投稿' }).click()
  await page.getByRole('textbox', { name: '書籍名 *' }).fill(title)
  await page.getByRole('button', { name: '投稿する' }).click()
  await expect(page).toHaveURL('/')
}

test.describe('レビュー', () => {
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage()
    await page.goto('/signup')
    await page.getByPlaceholder('ユーザー名').fill(username)
    await page.getByPlaceholder('メールアドレス').fill(email)
    await page.getByPlaceholder('パスワード', { exact: true }).fill(password)
    await page.getByPlaceholder('パスワード（確認）').fill(password)
    await page.getByRole('button', { name: '登録' }).click()
    await expect(page).toHaveURL('/')
    await page.close()
  })

  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('レビューを投稿できる', async ({ page }) => {
    const title = `テスト駆動開発_${t}`
    await postReview(page, title)
    await expect(page.getByText(title).first()).toBeVisible()
  })

  test('レビュー詳細ページを開ける', async ({ page }) => {
    const title = `詳細テスト本_${t}`
    await postReview(page, title)

    await page.getByText(title).first().click()
    await expect(page.getByRole('heading', { name: title })).toBeVisible()
  })

  test('投稿したレビューを編集できる', async ({ page }) => {
    const title = `編集前タイトル_${t}`
    const updatedTitle = `編集後タイトル_${t}`
    await postReview(page, title)

    await page.getByText(title).first().click()
    await expect(page.getByRole('heading', { name: title })).toBeVisible()

    await page.getByRole('link', { name: '編集', exact: true }).click()

    await page.getByRole('textbox', { name: '書籍名 *' }).fill(updatedTitle)
    await page.getByRole('button', { name: '更新する' }).click()

    await expect(page.getByRole('heading', { name: updatedTitle })).toBeVisible()
  })

  test('投稿したレビューを削除できる', async ({ page }) => {
    const title = `削除するレビュー_${t}`
    await postReview(page, title)

    await page.getByText(title).first().click()
    await expect(page.getByRole('heading', { name: title })).toBeVisible()

    page.once('dialog', (dialog) => dialog.accept())
    await page.getByRole('button', { name: '削除' }).click()

    await expect(page).toHaveURL('/')
    await expect(page.getByText(title)).not.toBeVisible()
  })
})
