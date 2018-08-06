class UserAccount {
  constructor(userName, groups, password) {
    this.user_name = userName;
    this.groups = groups;
    this.password = password;
  }

  toJson() {
    return {
      'user_name': this.user_name,
      'groups': this.groups,
      'password': this.password
    }
  }
}

module.exports = UserAccount;