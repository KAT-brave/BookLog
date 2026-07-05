import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from '../../pages/LoginPage'

const mockLogin = vi.fn()
const mockNavigate = vi.fn()

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}))

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

describe('LoginPage', () => {
  beforeEach(() => {
    mockLogin.mockClear()
    mockNavigate.mockClear()
  })

  const renderLoginPage = () =>
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

  it('ログインフォームが表示される', () => {
    renderLoginPage()
    expect(screen.getByRole('heading', { name: 'ログイン' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('メールアドレス')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('パスワード')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument()
  })

  it('新規登録リンクが表示される', () => {
    renderLoginPage()
    expect(screen.getByRole('link', { name: '新規登録' })).toBeInTheDocument()
  })

  it('フォーム送信時に login が呼ばれ、成功するとトップへ遷移する', async () => {
    mockLogin.mockResolvedValue(undefined)
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByPlaceholderText('メールアドレス'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('パスワード'), 'password123')
    await user.click(screen.getByRole('button', { name: 'ログイン' }))

    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('ログイン失敗時にエラーメッセージが表示される', async () => {
    mockLogin.mockRejectedValue(new Error('Unauthorized'))
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByPlaceholderText('メールアドレス'), 'wrong@example.com')
    await user.type(screen.getByPlaceholderText('パスワード'), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: 'ログイン' }))

    expect(
      await screen.findByText('メールアドレスまたはパスワードが正しくありません')
    ).toBeInTheDocument()
  })
})
