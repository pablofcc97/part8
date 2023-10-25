import { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Login from './components/Login'
import { useApolloClient, useSubscription } from "@apollo/client";
import { BOOK_ADDED, ALL_BOOKS } from './queries'



const App = () => {
  const client = useApolloClient();
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(localStorage.getItem('books-user-token'))
  //const client = useApolloClient

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const addedBook = data.data.bookAdded
      alert(`a new book ${addedBook.title} was added`)

      client.cache.updateQuery({ query: ALL_BOOKS }, ({ allBooks }) => {
        return {
          allBooks: allBooks.concat(addedBook),
        }
      })
    },
    onError: (error) => console.log(error)
  })


  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token ?<button onClick={() => setPage('add')}>add book</button> :null}
        <button onClick={token ?() => logout() :() => setPage('login')}>{token ?"Logout" :"Login"}</button>
      </div>

      <Authors show={page === 'authors'} logged={token ?true :false}/>

      <Books show={page === 'books'} />

      <NewBook show={page === 'add'} />

      <Login show={page === 'login'} setToken={setToken} />
    </div>
  )
}

export default App
