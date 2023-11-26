// Import Necessary Modules: Express, Axios and Body-Parser
import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import 'dotenv/config';

// Constants:
const app = express();  // Create app
const port = 3000;
const API_URL = "https://api.unsplash.com";  // Request to the domain "https://api.unsplash.com".

// Authorization Constants:
const clientID = process.env.CLI_ID;
const config = {
  headers: { Authorization: `Client-ID ${clientID}` },
};

function choice(array) {   // Function to choose a random item in an array
  return array[Math.floor(Math.random() * array.length)];
}

function showError (error, res) {  // Function responsible for showing errors to a user
  if (error.response && error.response.data) {  // If the error is request-related, it will show an error data via a JSON.
    res.render("index.ejs", { error: JSON.stringify(error.response.data) });
  } else {  // Otherwise, if it is an internal problem, it would just show the error as it is.
    res.render("index.ejs", { error: error });
  }
}

app.use(express.static("public"));  // Use the public folder for in-server linking in index.ejs
app.use(bodyParser.urlencoded({ extended: true }));  // Use the Body-Parser middleware


// When the user visits the "/" path (i.e the homepage), render index.ejs
app.get("/", (req, res) => {
    res.render("index.ejs");
});


// When the user hits the "/random" path (manually or via a button in index.ejs)...
app.post("/random", async (req, res) => {
  try {  // If possible...
    const result = await axios.get(API_URL + "/photos/random", config);  // Request to "https://api.unsplash.com/photos/random" and store the response.
    res.render("index.ejs", { url: result.data.urls.regular, desc: result.data.alt_description });  // Render index.ejs and put the specified values of the variables 'url' and 'desc' in place.
  } catch (error) {  // If something went wrong...
    showError(error, res);  // Call the function 'showError' and provide it with the error.
  }
});

// When the user hits the "/search" path (via a button in index.ejs)...
app.post("/search", async (req, res) => {
  const query = req.body.search;  // Store the user's inquiry inside a veriable.
  try {
    const result = await axios.get(API_URL + `/search/photos?query=${query}`, config);  // Request to "https://api.unsplash.com/search/photos?query=[THE USER'S INQUIRY]" and store the response (which contains the search results).
    if (result.data.total === 0) {  // If there are no search results, show it as an error to the user.
      showError(`No search results found for "${query}".`, res)
    } else {  // However, if there are search results...
      var picData = choice(result.data.results)  // Choose a random picture and store its data inside a variable.
      res.render("index.ejs", { url: picData.urls.regular, desc: picData.alt_description });  // Render index.ejs and put the specified values of the variables 'url' and 'desc' in place.
    }
  } catch (error) {  // If something went wrong...
    showError(error, res);  // Call the function 'showError' and provide it with the error.
  }
});


// Listen on port 3000 and log it down in the console.
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});