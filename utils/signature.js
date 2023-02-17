import chalk from "chalk";
import figlet from "figlet";

/**
 * Function that uses the Figlet library to generate ASCII art for "Git Time Traveler"
 * and outputs it to the console with a signature.
 */
export const showSignature = () => {
  figlet(
    "Git Time Traveler",
    {
      font: "Slant",
      horizontalLayout: "default",
      verticalLayout: "default",
    },
    function (err, data) {
      if (err) {
        console.log("Something went wrong...");
        console.dir(err);
        return;
      }
      console.log(chalk.red.bold(data));
      console.log(
        "                                                              -- Created with ❤️  by Souvik Sen"
      );
    }
  );
};
