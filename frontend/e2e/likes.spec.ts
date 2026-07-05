import { test, expect, type Page } from '@playwright/test'

const t = Date.now()
const email = `like_e2e_${t}@example.com`
const password = 'password123'
const username = `liker_${t}`

async function login(page: Page) {
  await page.goto('/login')
  await page.getByPlaceholder('メールアドレス').fill(email)
  await page.getByPlaceholder('パスワード').fill(password)
  await page.getByRole('button', { name: 'ログイン' }).click()
  await expect(page).toHaveURL('/')
}

async function postAndOpenReview(page: Page, title: string) {
  await page.getByRole('link', { name: '+ 投稿' }).click()
  await page.getByRole('textbox', { name: '書籍名 *' }).fill(title)
  await page.getByRole('button', { name: '投稿する' }).click()
  await expect(page).toHaveURL('/')
  await page.getByText(title).first().click()
  await expect(page.getByRole('heading', { name: title })).toBeVisible()
}

test.describe('いいね', () => {
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

  test('レビューにいいねができる', async ({ page }) => {
    const title = `いいねテスト本_${t}a`
    await postAndOpenReview(page, title)

    const likeButton = page.getByRole('button', { name: /♥/ })
    await expect(likeButton).toContainText('0')

    await likeButton.click()
    await expect(likeButton).toContainText('1')
  })

  test('いいねを取り消せる', async ({ page }) => {
    const title = `いいね取り消しテスト本_${t}b`
    await postAndOpenReview(page, title)

    const likeButton = page.getByRole('button', { name: /♥/ })
    await likeButton.click()
    await expect(likeButton).toContainText('1')

    await likeButton.click()
    await expect(likeButton).toContainText('0')
  })
})
