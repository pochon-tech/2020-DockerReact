import React from "react"
import Axios from "axios"

class Actions extends React.Component {
  state = { users: [] }

  // Select Users 
  /** ユーザを全件取得する */
  fetchUsers = () => {
    Axios.get('http://localhost/all-users.php')
      .then(({ data }) => {
        if(data.success === 1) { 
          this.setState({
            users:data.users.reverse()
          })
        }
      })
      .catch (e => { console.log(e) })
  }

  // Create User

  // Update User

  // Delete User
}