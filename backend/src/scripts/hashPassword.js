const bcrypt = require("bcrypt");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Please enter the password to hash: ", (password) => {
  if (!password) {
    console.error("Password cannot be empty.");
    rl.close();
    return;
  }

  const saltRounds = 10;
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      console.error("Error hashing password:", err);
    } else {
      console.log("\nPassword hashing complete!");
      console.log("Copy this hash into your SQL script:");
      console.log(hash);
    }
    rl.close();
  });
});
