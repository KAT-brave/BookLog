import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import axios from 'axios'
import { AuthProvider, useAuth } from '../../contexts/AuthContext'

vi.mock('axios')
const mockedAxios = vi.mocked(axios, true)

function TestComponent() {
  const { user, token, login, logout } = useAuth()
  return (
    <div>
      <p data-testid="user">{user ? user.username : 'null'}</p>
      <p data-testid="token">{token ?? 'null'}</p>
      <button onClick={() => login('test@example.com', 'pass')}>ログイン</button>
      <button onClick={() => logout()}>ログアウト</button>
    </div>
  )
}

const renderWithAuth = () =>
  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  )

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('初期状態では user と token が null', () => {
    renderWithAuth()
    expect(screen.getByTestId('user').textContent).toBe('null')
    expect(screen.getByTestId('token').textContent).toBe('null')
  })

  it('login 成功後に user と token がセットされる', async () => {
    mockedAxios.post = vi.fn().mockResolvedValue({
      headers: { authorization: 'Bearer test-token' },
      data: { user: { id: 1, username: 'testuser', email: 'test@example.com' } },
    })

    const user = userEvent.setup()
    renderWithAuth()

    await user.click(screen.getByRole('button', { name: 'ログイン' }))

    expect(await screen.findByText('testuser')).toBeInTheDocument()
    expect(screen.getByTestId('token').textContent).toBe('Bearer test-token')
    expect(localStorage.getItem('token')).toBe('Bearer test-token')
  })

  it('logout 後に user と token が null になる', async () => {
    mockedAxios.post = vi.fn().mockResolvedValue({
      headers: { authorization: 'Bearer test-token' },
      data: { user: { id: 1, username: 'testuser', email: 'test@example.com' } },
    })
    mockedAxios.delete = vi.fn().mockResolvedValue({})

    const user = userEvent.setup()
    renderWithAuth()

    await user.click(screen.getByRole('button', { name: 'ログイン' }))
    await screen.findByText('testuser')

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'ログアウト' }))
    })

    expect(screen.getByTestId('user').textContent).toBe('null')
    expect(screen.getByTestId('token').textContent).toBe('null')
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('localStorage にトークンがあれば初期 token にセットされる', () => {
    localStorage.setItem('token', 'Bearer stored-token')
    renderWithAuth()
    expect(screen.getByTestId('token').textContent).toBe('Bearer stored-token')
  })
})
