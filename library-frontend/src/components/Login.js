import { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client'
import { LOGIN } from '../queries'

const Login = (props) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [login, result] = useMutation(LOGIN, {
    onError: (error) => {
        console.log(error.graphQLErrors[0].message)
    }
  })

  useEffect(() => {
    if(result.data){
        const token = result.data.login.value
        props.setToken(token)
        localStorage.setItem('books-user-token', token)
    }
  }, [result.data])

  if (!props.show) {
    return null
  }

  const submit = async (event) => {
    event.preventDefault()

    login({variables:{username, password}})
    console.log('login...')

    setUsername('')
    setPassword('')
  }


  return (
    <div>
      <form onSubmit={submit}>
        <div>
          Username
          <input
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          Password
          <input
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  )
}

export default Login