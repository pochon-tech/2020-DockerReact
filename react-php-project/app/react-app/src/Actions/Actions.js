import React from "react"
import Axios from "axios"

class Actions extends React.Component {
  state = { users: [] }

  // Select Users 
  /** ユーザを全件取得する */
  fetchUsers = () => {
    Axios.get('http://localhost/all-users.php')
      .then(({ data }) => {
        if (data.success === 1) this.setState({ users: data.users.reverse() })
      })
      .catch(e => { console.log(e) })
  }

  // Create User
  insertUser = (event, user_name, user_email) => {
    event.preventDefault()
    event.persist() // 非同期にeventオブジェクトを参照
    Axios.post('http://localhost/add-user.php', {
      user_name: user_name,
      user_email: user_email
    })
      .then(function ({ data }) {
        if (data.success === 1) {
          this.setState({
            users: [
              ...this.state.users,
              { 'id': data.id, 'user_name:': user_name, 'user_mail': user_email }
            ]
          })
          event.target.reset()
        } else {
          alert(data.msg)
        }
      }.bind(this))
      .catch(function (e) { console.log(e) })
  }

  // Update User
  editMode = (id) => {
    let users = this.state.users.map((user) => {
      user.isEditing = (user.id === id) ? true : false
      return user
    })
    this.setState({ users })
  }

  handleUpdate = (id, user_name, user_email) => {
    Axios.post('http://localhost/update-user.php', {
      id: id,
      user_name: user_name,
      user_email: user_email
    })
      .then(({ data }) => {
        if (data.success === 1) {
          let users = this.state.users.map((user) => {
            user.isEditing = (user.id !== id) ? true : false
            return user
          })
          this.setState({ users })
        } else {
          alert(data.msg)
        }
      })
      .catch(e => { console.log(e) })
  }

  // Delete User
  cancelEdit = (id) => {
    let users = this.state.users.map((user) => {
      user.isEditing = (user.id === id) ? true : false
      return user
    })
    this.setState({ users })
  }

  handleDelete = (id) => {
    let deleteUser = this.state.users.filter(user => {
      return user.id !== id
    });
    Axios.post('http://localhost/update-user.php', {
      id: id
    })
      .then(({ data }) => {
        if (data.success === 1) {
          this.setState({ deleteUser })
        } else {
          alert(data.msg)
        }
      })
      .catch(e => { console.log(e) })
  }
}
export default Actions