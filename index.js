const Bcrypt = require("bcryptjs");
const BodyParser = require("body-parser");
const Express = require("express");
const Sequelize = require("sequelize");
const Validator = require("validator");

// Set variables
const App = Express();
const Port = 3000;
const Database = new Sequelize(
  "postgres://postgres:postgres@postgres:5432/postgres"
);
const SaltRounds = 12;

// Set schemas
const User = Database.define(
  "user",
  {
    email: {
      type: Sequelize.STRING,
      unique: true
    },
    email_valid: {
      type: Sequelize.BOOLEAN
    },
    enabled: {
      type: Sequelize.BOOLEAN
    },
    password: {
      type: Sequelize.STRING
    }
  },
  { freezeTableName: true }
);

async function Main() {
  // Setup database tables
  await User.sync({ force: true });

  // Setup HTTP routes
  App.get("/", function(req, res) {
    return res.send("Hello, Bob Dole!");
  });

  // Create endpoint
  App.post("/create", BodyParser.json(), async (req, res) => {
    // Parse the body
    const { email, password } = req.body;

    // Check if is valid email
    const validEmail = Validator.isEmail(email);
    if (!validEmail) {
      return res.json({ error: "invalid_email" });
    }

    // Check if is valid password
    const validPassword = Validator.isLength(password, {
      min: 8
    });
    if (!validPassword) {
      return res.json({ error: "invalid_password" });
    }

    // Hash the password
    const salt = Bcrypt.genSaltSync(SaltRounds);
    const hash = Bcrypt.hashSync(password, salt);

    // Create new user
    try {
      const newUser = await User.create({
        email,
        email_valid: true,
        enabled: true,
        password: hash
      });
      return res.json({ password: newUser.password });
    } catch (e) {
      return res.json(e);
    }
  });
  App.listen(Port, () => console.log(`Listening on port ${Port}!`));
}

Main().catch(e => {
  console.error(e);
  process.exit(1);
});
