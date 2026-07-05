import { test, expect } from '@playwright/test'

const t = Date.now()
const email = `e2e_auth_${t}@example.com`
const password = 'password123'
const username = `auth_user_${t}`

test.describe('認証', () => {
  test('新規登録するとトップページにリダイレクトされる', async ({ page }) => {
    await page.goto('/signup')

    await expect(page.getByRole('heading', { name: 'アカウント作成' })).toBeVisible()

    await page.getByPlaceholder('ユーザー名').fill(username)
    await page.getByPlaceholder('メールアドレス').fill(email)
    await page.getByPlaceholder('パスワード', { exact: true }).fill(password)
    await page.getByPlaceholder('パスワード（確認）').fill(password)
    await page.getByRole('button', { name: '登録' }).click()

    await expect(page).toHaveURL('/')
    await expect(page.getByText(username)).toBeVisible()
  })

  test('ログアウトするとログインページに遷移する', async ({ page }) => {
    // 別ユーザーで登録
    const t2 = Date.now() + 1
    await page.goto('/signup')
    await page.getByPlaceholder('ユーザー名').fill(`logout_user_${t2}`)
    await page.getByPlaceholder('メールアドレス').fill(`logout_${t2}@example.com`)
    await page.getByPlaceholder('パスワード', { exact: true }).fill(password)
    await page.getByPlaceholder('パスワード（確認）').fill(password)
    await page.getByRole('button', { name: '登録' }).click()
    await expect(page).toHaveURL('/')

    await page.getByRole('button', { name: 'ログアウト' }).click()
    await expect(page).toHaveURL('/login')
  })

  test('誤ったパスワードでログインするとエラーが表示される', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder('メールアドレス').fill(email)
    await page.getByPlaceholder('パスワード').fill('wrongpassword')
    await page.getByRole('button', { name: 'ログイン' }).click()

    await expect(page.getByText('メールアドレスまたはパスワードが正しくありません')).toBeVisible()
  })

  test('未ログイン状態でトップにアクセスするとログインページにリダイレクト', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/login')
  })
})
