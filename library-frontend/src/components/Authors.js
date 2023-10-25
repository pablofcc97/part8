import { useQuery } from '@apollo/client'
import { ALL_AUTHORS, EDIT_AUTHOR } from '../queries'
import { useState } from 'react'
import { useMutation } from '@apollo/client'


const Authors = (props) => {
  const result = useQuery(ALL_AUTHORS)
  const [name, setName] = useState('')
  const [born, setBorn] = useState(0)

  const [editAuthor] = useMutation( EDIT_AUTHOR, {
    refetchQueries: [{query: ALL_AUTHORS}]
  })

  if(result.loading){
    return(<div>Loading</div>)
  }

  const authors = result.data.allAuthors

  const submit = async (event) => {
    event.preventDefault()

    editAuthor( {variables: {name:name, setBornTo:born}})

    setName('')
    setBorn(0)
  }

  if (!props.show) {
    return null
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {props.logged 
      ? <>
          <h2>Set Birth year</h2>
          <form onSubmit={submit}>
            <div>
              name
              <select value={name} onChange={({ target }) => setName(target.value)}>
                <option></option>
                {authors.map((a, i) => <option key={i} value={a.name}>{a.name}</option>)}
              </select>
            </div>
            <div>
              born
              <input
                value={born}
                onChange={({ target }) => setBorn(Number(target.value))}
                type='number'
              />
            </div>
            <button type="submit">update Author</button>
          </form>
        </>
      :null}
    </div>
  )
}

export default Authors