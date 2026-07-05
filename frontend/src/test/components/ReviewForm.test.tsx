import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import ReviewForm from '../../components/ReviewForm'

describe('ReviewForm', () => {
  const mockSubmit = vi.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    mockSubmit.mockClear()
  })

  it('フォームの各フィールドが表示される', () => {
    render(<ReviewForm onSubmit={mockSubmit} submitLabel="投稿する" />)

    expect(screen.getByText('書籍名 *')).toBeInTheDocument()
    expect(screen.getByText('感想')).toBeInTheDocument()
    expect(screen.getByText('評価')).toBeInTheDocument()
    expect(screen.getByText('ステータス')).toBeInTheDocument()
    expect(screen.getByText('投稿する')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '読書中' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '読了' })).toBeInTheDocument()
  })

  it('送信ボタンのラベルが props で変わる', () => {
    render(<ReviewForm onSubmit={mockSubmit} submitLabel="更新する" />)
    expect(screen.getByRole('button', { name: '更新する' })).toBeInTheDocument()
  })

  it('書籍名を入力して送信すると onSubmit が FormData で呼ばれる', async () => {
    const user = userEvent.setup()
    render(<ReviewForm onSubmit={mockSubmit} submitLabel="投稿する" />)

    // 書籍名 input (type=text, not textarea)
    const bookTitleInput = screen.getByRole<HTMLInputElement>('textbox', { name: '書籍名 *' })
    await user.clear(bookTitleInput)
    await user.type(bookTitleInput, 'テスト書籍')
    await user.click(screen.getByRole('button', { name: '投稿する' }))

    expect(mockSubmit).toHaveBeenCalledOnce()
    const formData: FormData = mockSubmit.mock.calls[0][0]
    expect(formData.get('review[book_title]')).toBe('テスト書籍')
  })

  it('initial props で初期値が設定される', () => {
    render(
      <ReviewForm
        initial={{ book_title: '初期タイトル', rating: 4, status: 'finished' }}
        onSubmit={mockSubmit}
        submitLabel="更新する"
      />
    )
    const input = screen.getByRole<HTMLInputElement>('textbox', { name: '書籍名 *' })
    expect(input.value).toBe('初期タイトル')
  })

  it('現在の画像 URL がある場合はプレビューが表示される', () => {
    render(
      <ReviewForm
        currentImageUrl="http://localhost:3000/test.jpg"
        onSubmit={mockSubmit}
        submitLabel="投稿する"
      />
    )
    const img = screen.getByRole('img', { name: '表紙プレビュー' })
    expect(img).toHaveAttribute('src', 'http://localhost:3000/test.jpg')
  })

  it('送信エラー時にエラーメッセージが表示される', async () => {
    const failingSubmit = vi.fn().mockRejectedValue({
      response: { data: { errors: ['書籍名を入力してください'] } },
    })
    const user = userEvent.setup()
    render(<ReviewForm onSubmit={failingSubmit} submitLabel="投稿する" />)

    await user.type(screen.getByRole('textbox', { name: '書籍名 *' }), 'テスト')
    await user.click(screen.getByRole('button', { name: '投稿する' }))

    expect(await screen.findByText('書籍名を入力してください')).toBeInTheDocument()
  })
})
