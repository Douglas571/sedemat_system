function parseError(error) {
  if (error.name === "SequelizeUniqueConstraintError") {

      let fields = Object.keys(error.fields)

      if (fields.includes('username')) {
          return {
              message: "The contact is already taken by other user",
              name: "UsernameAlreadyTaken",
              statusCode: 400
          }
      }

      if (fields.includes('personId')) {
          return {
              message: "The contact is already taken by other user",
              name: "ContactAlreadyTaken",
              statusCode: 400
          }
      }

      if (fields.includes('email')) {
          return {
              message: "The email is already taken by other user",
              name: "EmailAlreadyTaken",
              statusCode: 400
          }
      }

  }

  if (error.name === 'SequelizeValidationError') {
      let details = []

      if (error.message.includes("notNull")) {
          if (error.message.includes("roleId")) {
              details.push({
                  field: 'roleId',
                  issue: "roleId can't be null"
              })
          }

          if (error.message.includes("password")) {
              details.push({
                  field: 'password',
                  issue: "password can't be null"
              })
          }
      }

      let errorResponse = {
          message: error.message,
          name: 'ValidationError',
          details,
          statusCode: 400
      }

      return errorResponse
  }

  return {
      message: error.message,
      name: error.name,
      statusCode: 500
  }
}

module.exports = parseError