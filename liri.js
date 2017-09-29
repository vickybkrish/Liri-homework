var fs = require("fs");							//NPM package for reading and writing files

var keys = require("./keys.js");				//Twitter keys and access tokens
var Twitter = require("twitter");				//NPM package for twitter
var client = new Twitter(keys.twitterKeys);		//New instance of a twitter client

var request = require("request");				//NPM package for making ajax-like calls
var Spotify = require("node-spotify-api"); 
var spotify = new Spotify(keys.spotifykeys);			//NPM package for spotify

var userCommand = process.argv[2];
var artName = process.argv[3];

doNext(userCommand,artName);

function doNext(uC, aN){
	switch(uC){
	case "my-tweets":
		fetchTwitter();
	break;

	case "spotify-this-song":
		fetchSpotify(aN);
	break;

	case "movie-this":
		fetchOMDB(aN);
	break;

	case "do-what-it-says":
		fetchRandom();
	break;

	default:
	break;
	}
}

function fetchTwitter(){
	var tweetsLength;

	//From twitter's NPM documentation, grab the most recent tweets
	var params = {screen_name: 'vickkrish'};
	client.get('statuses/user_timeline', function(error, tweets, response) {
		if(error) throw error;

		//Loop through the number of tweets that were returned to get the number of tweets returned.
		//If the number of tweets exceeds 20, make it 20.
		//Then loop through the length of tweets and return the tweets date and text.
		tweetsLength = 0;

		for(var i=0; i<tweets.length; i++){
			tweetsLength ++;
		}
		if (tweetsLength > 20){
			tweetsLength = 20;
		}
		for (var i=0; i<tweetsLength; i++){
			console.log("Tweet " + (i+1) + " created on: " + tweets[i].created_at);
			console.log("Tweet " + (i+1) + " text: " + tweets[i].text);
			console.log("--------------------------------------------------------------");

			appendFile("Tweet " + (i+1) + " created on: " + tweets[i].created_at);
			appendFile("Tweet " + (i+1) + " text: " + tweets[i].text);
			appendFile("--------------------------------------------------------------");
		}
	});
}

function upperCase (string){
	//Capitalize first letter of each part of song name
	return string.toUpperCase();
}
function titleCase(string){
	var firstLetter = /(^|\s)[a-z]/g;
	return string.replace(firstLetter, upperCase);
}

function fetchSpotify(song){
	var songName;

	//If a song WAS chosen, make it title case so spotify can find it in its database
	//If a song was not typed it, default to the song The Sign
	if (song != null){
		songName = titleCase(song);
	}
	else {
		songName = "The Sign";
	}
	console.log("Searching for: " + songName);
	console.log("------------------------");

	appendFile("Searching for: " + songName);
	appendFile("---------------------------------");

	//Get data from spotify API based on the query term (song name) typed in by the user
	spotify.search({ type: 'track', query: songName}, function(err, data) {
	    if ( err ) {
	        console.log('Error occurred: ' + err);
	        return;
	    }

	    var matchedTracks = [];
	    var dataItems = data.tracks.items;
	    for (var i=0; i<20; i++){
	    	if (data.tracks.items[i].name == songName){
	    		matchedTracks.push(i);
	    	}
	    }

	    console.log(matchedTracks.length + " tracks found that match your query.");
	    appendFile(matchedTracks.length + " tracks found that match your query.");

	    if (matchedTracks.length > 0){
    		console.log("Track: " + dataItems[matchedTracks[0]].name);	
			console.log("Artist: " + dataItems[matchedTracks[0]].artists[0].name);
			console.log("Album: " + dataItems[matchedTracks[0]].album.name);
			console.log("Spotify link: " + dataItems[matchedTracks[0]].external_urls.spotify);

			appendFile("Track: " + dataItems[matchedTracks[0]].name);
			appendFile("Artist: " + dataItems[matchedTracks[0]].artists[0].name);
			appendFile("Album: " + dataItems[matchedTracks[0]].album.name);
			appendFile("Spotify link: " + dataItems[matchedTracks[0]].external_urls.spotify);
		}
		else if (matchedTracks.length == 0){
			console.log("Sorry, but spotify does not contain that song in their database :(");
			appendFile("Sorry, but spotify does not contain that song in their database :(");
		}
		
	});
}

function fetchOMDB(movieName){
	//If a movie was not typed it, default to the movie Mr. Nobody
	if (artName == null){
		movieName = "Mr. Nobody";
	}


	var requestURL = "http://www.omdbapi.com/?apikey=40e9cece &t=" + movieName + "&tomatoes=true&y=&plot=short&r=json";
	console.log (requestURL);
	request(requestURL, function (error, response, data){

		//200 response means that the page has been found and a response was received.
		if (!error && response.statusCode == 200){
			console.log("Everything working fine.");
		}

		console.log(data);

		console.log("---------------------------------------------");
		console.log("The movie's title is: " + JSON.parse(data)["Title"]);
		console.log("The movie's release year is: " + JSON.parse(data)["Year"]);		
		console.log("The movie's rating is: " + JSON.parse(data)["imdbRating"]);
		console.log("The movie's was produced in: " + JSON.parse(data)["Country"]);
		console.log("The movie's language is: " + JSON.parse(data)["Language"]);
		console.log("The movie's plot: " + JSON.parse(data)["Plot"]);
		console.log("The movie's actors: " + JSON.parse(data)["Actors"]);
		console.log("The movie's Rotten Tomatoes Rating: " + JSON.parse(data)["tomatoRating"]);
		console.log("The movie's Rotten Tomatoes URL: " + JSON.parse(data)["tomatoURL"]);

		appendFile("---------------------------------------------");
		appendFile("The movie's title is: " + JSON.parse(data)["Title"]);
		appendFile("The movie's release year is: " + JSON.parse(data)["Year"]);		
		appendFile("The movie's rating is: " + JSON.parse(data)["imdbRating"]);
		appendFile("The movie's was produced in: " + JSON.parse(data)["Country"]);
		appendFile("The movie's language is: " + JSON.parse(data)["Language"]);
		appendFile("The movie's plot: " + JSON.parse(data)["Plot"]);
		appendFile("The movie's actors: " + JSON.parse(data)["Actors"]);
		appendFile("The movie's Rotten Tomatoes Rating: " + JSON.parse(data)["tomatoRating"]);
		appendFile("The movie's Rotten Tomatoes URL: " + JSON.parse(data)["tomatoURL"]);											
	});
}

function fetchRandom(){
	//LIRI will take the text inside of random.txt and then use it to call one of LIRI's commands.
	//Runs `spotify-this-song` for "I Want it That Way," as follows the text in `random.txt`.
	fs.readFile("random.txt", 'utf8', function(err, data){

		// console.log(data);

		//Creating an array from a string with split()
		//Every comma, push the element into the array
		var dataArr = data.split(',');

		// console.log(dataArr);

		var randomUserCommand = dataArr[0];
		var randomArtName = dataArr[1];

		console.log("You requested to " + "<" + randomUserCommand + "> with " + randomArtName);
		appendFile("You requested to " + "<" + randomUserCommand + "> with " + randomArtName);

		//Remove the quotes before making a request
		randomArtName = randomArtName.replace(/^"(.*)"$/, '$1');

		doNext(randomUserCommand, randomArtName);
	});
}

function appendFile(dataToAppend){

	//Output all that happens into a log.txt file
	fs.appendFile("log.txt", dataToAppend , function(err){

		//If an error happens while trying to write to the file
		if (err){
			return console.log(err);
		}
	});
}