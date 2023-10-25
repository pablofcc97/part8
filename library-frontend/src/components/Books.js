import { useLazyQuery } from '@apollo/client'
import { ALL_BOOKS, BOOKS_GENRE } from '../queries'
import { useEffect, useState } from 'react'

const Books = (props) => {
  const [books, setBooks] = useState([])
  const genres = [...new Set(books.reduce((accu, current) => accu.concat(current.genres),[]))]

  const [getGenreBooks, response] = useLazyQuery(BOOKS_GENRE, {
    onCompleted: () => {
      setBooks(response.data.allBooks)
    }
  })

  const [getBooks, {loading, error, data}] = useLazyQuery(ALL_BOOKS, {
    onCompleted: () => {
      setBooks(data.allBooks)
    }
  })

  useEffect(()=>{
    getBooks()
  },[data])
  

  if(loading){
    return(<div>Loading</div>)
  }

  if (!props.show) {
    return null
  }

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <button onClick={() => setBooks(data.allBooks)}>All genres</button>
        {genres.map((g, i) => <button key={i} onClick={() => getGenreBooks({variables:{genre:g}})}>{g}</button>)}
      </div>
    </div>
  )
}

export default Books