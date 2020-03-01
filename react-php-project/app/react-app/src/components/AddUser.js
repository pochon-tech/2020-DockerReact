import React from 'react'
import { AppContext } from '../Context'

class AddUser extends React.Component {
  static contextType = AppContext

  insertUser = (event) => {
    this.context.insertUser(event, this.username.value, this.useremail.value)
  }

  render() {
    return (
      <form onSubmit={this.insertUser}>
        <div className="form-row">
          <div className="form-group col-sm-6">
            <label className="font-weight-bold">Name</label>
            <input type="text" name="username" ref={(val) => this.username = val} className="form-control" placeholder="Name" />
          </div>
          <div className="form-group col-sm-6">
            <label className="font-weight-bold">Email</label>
            <input type="email" name="useremail" ref={(val) => this.useremail = val} className="form-control" placeholder="Email" />
          </div>
          <div className="form-group col-sm-12 text-right">
            <button type="submit" className="btn btn-primary">Add user</button>
          </div>
        </div>
      </form>
    )
  }
}
export default AddUser